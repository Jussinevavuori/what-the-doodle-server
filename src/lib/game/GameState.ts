import { Socket } from "socket.io";
import { emitSocketError } from "../../sockets/emitSocketError";
import { PubSubChannel } from "../pubsub/PubSubChannel";
import { generateGameData } from "./generateGameData";

export class GameState {
  players: Player[];
  nRounds: number;
  status: GameStatus;
  currentRoundIndex: number;
  cards: Card[];
  rounds: Round[];
  drawingTime: number;
  // Card ID to player ID
  finalGuesses: Record<string, string>;

  stateUpdates: PubSubChannel<GameState>;
  drawingTimeUpdates: PubSubChannel<number>;

  constructor(
    players: Player[],
    opts: {
      drawingTime?: number;
    } = {}
  ) {
    const n = players.length;

    // Generate game data
    const gamedata = generateGameData(players);

    // Assign all properties
    this.players = players;
    this.nRounds = n;
    this.rounds = gamedata.rounds;
    this.cards = gamedata.cards;
    this.currentRoundIndex = 0;
    this.drawingTime = opts.drawingTime ?? 60;
    this.status = "idle";
    this.finalGuesses = {};
    this.stateUpdates = new PubSubChannel();
    this.drawingTimeUpdates = new PubSubChannel();
  }

  /**
   * Starts the drawing timer
   */
  startDrawingTimer() {
    if (this.status !== "draw") return;

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

  /**
   * Function to move to next phase (from drawing to guessing, from guessing
   * to drawing next round until last is drawn and game finishes).
   */
  nextPhase() {
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
   * Applies a drawing time
   */
  applyDrawingTime(socket: Socket, args: { drawingTime: number }) {
    if (args.drawingTime <= 0 || !Number.isSafeInteger(args.drawingTime)) {
      emitSocketError(socket, "Drawing time must be a positive integer");
      return;
    }

    this.drawingTime = args.drawingTime;
    this.stateUpdates.publish(this);
  }

  /**
   * Applies an initial choice
   */
  applyInitialChoice(socket: Socket, args: { uid: string; title: string }) {
    const round = this.rounds.find(
      (r) => r.roundNumber === 0 && r.drawerId === args.uid
    );
    const card = this.cards.find((_) => _.id === round?.cardId);

    if (!round || !card) {
      emitSocketError(socket, "Could not find current round and card for user");
      return;
    }

    round.title = args.title;
    card.title = args.title;

    const allChosen =
      this.rounds.filter((r) => r.roundNumber === 0).every((_) => !!_.title) &&
      this.cards.every((_) => !!_.title);

    if (allChosen) {
      this.nextPhase();
    } else {
      this.stateUpdates.publish(this);
    }
  }

  /**
   * Applies a final choicie
   */
  applyFinalChoice(socket: Socket, args: { uid: string; cardId: string }) {
    if (this.finalGuesses[args.cardId]) {
      emitSocketError(socket, "This card was already picked");
      return;
    }

    this.finalGuesses[args.cardId] = args.uid;

    const allGuessed = this.cards.every((c) => !!this.finalGuesses[c.id]);
    if (allGuessed) {
      this.nextPhase();
    } else {
      this.stateUpdates.publish(this);
    }
  }

  /**
   * Apply drawing action. Do not update game state based on this.
   */
  applyDrawingAction(
    socket: Socket,
    args: { roundId: string; drawingAction: string }
  ) {
    const round = this.rounds.find((_) => _.id === args.roundId);
    if (round) {
      round.picture.apply(args.drawingAction);
    } else {
      emitSocketError(socket, "No drawing found for round");
    }
  }

  /**
   * Apply a guess
   */
  applyGuess(socket: Socket, args: { roundId: string; guess: string }) {
    // Apply guess to specified round
    const round = this.rounds.find((_) => _.id === args.roundId);
    if (round) {
      round.guess = args.guess;
    }

    // Apply guess as title to next round
    const nextRound = this.rounds.find((_) => {
      return (
        _.roundNumber === (round?.roundNumber ?? 0) + 1 &&
        _.cardId === round?.cardId
      );
    });
    if (nextRound) {
      nextRound.title = args.guess;
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
  }
}
