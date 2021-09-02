import { PubSubChannel } from "../pubsub/PubSubChannel";
import { generateGameData } from "./generateGameData";

type GameStateActionResult = { error?: string };

export class GameState {
  //----------------------------------------------------------------------------
  // INSTANCE PROPERTIES
  //----------------------------------------------------------------------------

  /**
   * List of all players. For a gamestate, the amount of players is fixed.
   * Players can be only marked as offline. If the amount of players is to be
   * changed, a new GameState instance should be created.
   */
  players: Player[];

  /**
   * Number of rounds. Will always equal number of players.
   */
  nRounds: number;

  /**
   * Current status indicating the state of the game. For exaple "draw" while
   * the drawing phase is active or "idle" when in game lobby.
   */
  status: GameStatus;

  /**
   * Index of current round.
   */
  currentRoundIndex: number;

  /**
   * All cards. Each card is associated with multiple rounds and represents
   * a group of drawing rounds from first topic to last topic.
   */
  cards: Card[];

  /**
   * All rounds. Each round is associated with a card and represents a single
   * drawing and the guess for that drawing.
   */
  rounds: Round[];

  /**
   * Total drawing time in seconds.
   */
  drawingTime: number;

  /**
   * Final guesses as object. Contains card ids as keys and player ids as
   * values with each key-value pair representing a player who has picked
   * that card as their own.
   */
  finalGuesses: Record<string, string>;

  /**
   * PubSub channel for state updates. Used to publish data in realtime to
   * clients.
   */
  stateUpdates: PubSubChannel<GameState>;

  /**
   * Separate PubSub channel for drawing time updates. Drawing time is not
   * included in the main state updates as it is published more frequently.
   * This is done to save bandwidth.
   */
  drawingTimeUpdates: PubSubChannel<number>;

  constructor(
    players: Player[],
    opts: {
      drawingTime?: number;
    } = {}
  ) {
    // Generate rounds and cards.
    const gamedata = generateGameData(players);

    // Assign all properties
    this.players = players;
    this.nRounds = players.length;
    this.rounds = gamedata.rounds;
    this.cards = gamedata.cards;
    this.currentRoundIndex = 0;
    this.drawingTime = opts.drawingTime ?? 60;
    this.status = "idle";
    this.finalGuesses = {};
    this.stateUpdates = new PubSubChannel();
    this.drawingTimeUpdates = new PubSubChannel();
  }

  //----------------------------------------------------------------------------
  // STATIC CONSTRUCTORS
  //----------------------------------------------------------------------------

  /**
   * Creates a new gamestate by copying all settings from the provided gamestate
   * object. If no players are specified, uses players from provided gamestate
   * object instead.
   */
  static From(gamestate: GameState, players?: Player[]) {
    return new GameState(players ?? gamestate.players, {
      drawingTime: gamestate.drawingTime,
    });
  }

  //----------------------------------------------------------------------------
  // PUBLIC INSTANCE METHODS
  //----------------------------------------------------------------------------

  /**
   * Attempts to start the game
   */
  public applyStartGame(): GameStateActionResult {
    if (this.players.length === 0) {
      return { error: "No players in game" };
    }
    if (this.status !== "idle") {
      return { error: "Can not start inactive game" };
    }
    this.nextPhase();
    return {};
  }

  /**
   * Applies a drawing time
   */
  public applyDrawingTime(args: {
    drawingTime: number;
  }): GameStateActionResult {
    if (args.drawingTime <= 0 || !Number.isSafeInteger(args.drawingTime)) {
      return { error: "Drwaing time must be a positive integer" };
    }

    this.drawingTime = args.drawingTime;
    this.stateUpdates.publish(this);
    return {};
  }

  /**
   * Applies an initial choice
   */
  public applyInitialChoice(args: {
    uid: string;
    topic: string;
  }): GameStateActionResult {
    const round = this.rounds.find(
      (r) => r.roundNumber === 0 && r.drawerId === args.uid
    );
    const card = this.cards.find((_) => _.id === round?.cardId);

    if (!round || !card) {
      return { error: "Could not find current round and card for user" };
    }

    round.topic = args.topic;
    card.topic = args.topic;

    const allChosen =
      this.rounds.filter((r) => r.roundNumber === 0).every((_) => !!_.topic) &&
      this.cards.every((_) => !!_.topic);

    if (allChosen) {
      this.nextPhase();
    } else {
      this.stateUpdates.publish(this);
    }
    return {};
  }

  /**
   * Applies a final choicie
   */
  public applyFinalChoice(args: {
    uid: string;
    cardId: string;
  }): GameStateActionResult {
    if (this.finalGuesses[args.cardId]) {
      return { error: "This card was already picked" };
    }

    this.finalGuesses[args.cardId] = args.uid;

    const allGuessed = this.cards.every((c) => !!this.finalGuesses[c.id]);
    if (allGuessed) {
      this.nextPhase();
    } else {
      this.stateUpdates.publish(this);
    }
    return {};
  }

  /**
   * Apply drawing action. Do not update game state based on this.
   */
  public applyDrawingAction(args: {
    roundId: string;
    drawingAction: string;
  }): GameStateActionResult {
    const round = this.rounds.find((_) => _.id === args.roundId);
    if (round) {
      round.picture.apply(args.drawingAction);
    } else {
      return { error: "No drawing found for round" };
    }
    return {};
  }

  /**
   * Apply a guess
   */
  public applyGuess(args: {
    roundId: string;
    guess: string;
  }): GameStateActionResult {
    // Apply guess to specified round
    const round = this.rounds.find((_) => _.id === args.roundId);
    if (round) {
      round.guess = args.guess;
    }

    // Apply guess as topic to next round
    const nextRound = this.rounds.find((_) => {
      return (
        _.roundNumber === (round?.roundNumber ?? 0) + 1 &&
        _.cardId === round?.cardId
      );
    });
    if (nextRound) {
      nextRound.topic = args.guess;
    }

    // Check whether all rounds on this round have been guessed
    const allGuessed = this.rounds
      .filter((_) => _.roundNumber === this.currentRoundIndex)
      .every((_) => _.guess);

    // If all guessed, move to next phase. Else send update.
    if (allGuessed) {
      this.nextPhase();
    } else {
      this.stateUpdates.publish(this);
    }
    return {};
  }

  //----------------------------------------------------------------------------
  // PRIVATE INSTANCE METHODS
  //----------------------------------------------------------------------------

  /**
   * Function to move to next phase (from drawing to guessing, from guessing
   * to drawing next round until last is drawn and game finishes).
   */
  private nextPhase() {
    switch (this.status) {
      // After idle go to choosing
      case "idle": {
        this.status = "choose";
        break;
      }

      // After choosing go to first draw
      case "choose": {
        this.status = "draw";
        this.currentRoundIndex = 0;
        this.startDrawingTimer();
        break;
      }

      // After final go to finish
      case "final": {
        this.status = "finish";
        break;
      }

      // Do nothing when finished
      case "finish": {
        break;
      }

      // If currently guessing and all guesses are made, move to next round
      case "guess": {
        const allGuessed = this.rounds
          .filter((_) => _.roundNumber === this.currentRoundIndex)
          .every((_) => _.guess);

        if (allGuessed) {
          this.currentRoundIndex += 1;
          this.status = "draw";
          this.startDrawingTimer();
        }

        break;
      }

      // If drawing, move on to guessing unless this was the last round
      case "draw": {
        this.status =
          this.currentRoundIndex === this.nRounds - 1 ? "final" : "guess";
        break;
      }
    }

    // Send update
    this.stateUpdates.publish(this);
  }

  /**
   * Starts the drawing timer and automatically publishes drawing time updates
   * every second until time is up. When time ends, automatically moves to next
   * phase.
   */
  private startDrawingTimer() {
    // Allow drawing timer to only be activated when status is draw
    if (this.status !== "draw") return;

    // Counter for seconds left
    let secondsLeft = this.drawingTime;

    // Ensure total time is published at start
    this.drawingTimeUpdates.publish(secondsLeft);

    // Every second countdown and publish update.
    const interval = setInterval(() => {
      secondsLeft--;
      this.drawingTimeUpdates.publish(secondsLeft);

      // When time over, clear interval and move to guessing phase
      // or finish game
      if (secondsLeft === 0) {
        clearInterval(interval);
        this.nextPhase();
      }
    }, 1000);

    // Ensure 0 is published
    this.drawingTimeUpdates.publish(0);
  }
}
