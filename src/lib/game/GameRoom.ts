import { BroadcastOperator, Server as SocketIoServer, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { z } from "zod";
import { unique } from "../functions/unique";
import { GameState } from "./GameState";
import { createSocketEventHandler } from "../../sockets/createSocketEventHandler";
import { emitSocketError } from "../../sockets/emitSocketError";

/**
 * Connects players and sockets to a gamestate.
 */
export class GameRoom {
  //----------------------------------------------------------------------------
  // STATIC METHODS
  //----------------------------------------------------------------------------

  /**
   * All game rooms
   */
  static rooms: Record<string, GameRoom> = {};

  static clearEmptyRooms() {
    Object.values(GameRoom.rooms)
      .filter((_) => _.game.players.length === 0)
      .forEach((_) => {
        delete GameRoom.rooms[_.id];
      });
  }

  /**
   * Get a game room or create one if it doesn't yet exist
   */
  static getRoom(io: SocketIoServer, id: string) {
    // Clear empty rooms
    GameRoom.clearEmptyRooms();

    // Create room if none exists
    if (!GameRoom.rooms[id]) {
      GameRoom.rooms[id] = new GameRoom(io, id);
    }

    return GameRoom.rooms[id];
  }

  //----------------------------------------------------------------------------
  // INSTANCE PROPERTIES
  //----------------------------------------------------------------------------

  /**
   * Current room ID
   */
  id: string;

  /**
   * Current game state in room
   */
  game: GameState;

  /**
   * Socket room for broadcasting messages
   */
  room: BroadcastOperator<DefaultEventsMap>;

  /**
   * Max players
   */
  maxPlayers: number;

  /**
   * Store here the unsubscriber function for game state updates
   */
  updatesUnsubscriber?: () => void;

  constructor(io: SocketIoServer, id: string) {
    this.id = id;
    this.room = io.to(this.id);
    this.maxPlayers = 8;
    this.game = new GameState([]);
  }

  //----------------------------------------------------------------------------
  // PRIVATE INSTANCE METHODS
  //----------------------------------------------------------------------------

  /**
   * Automatically updates current gamestate to everyone. Can be provided an
   */
  private updateStateToAll() {
    this.room.emit("@game/state", this.getJsonGameStateString(this.game));
  }

  /**
   * List a player ID into this game room
   */
  private addPlayer(
    socket: Socket,
    player: { id: string; name: string; avatar: string }
  ) {
    // Rejoining: copy new details in case they changed.
    const existingPlayer = this.game.players.find((_) => _.id === player.id);
    if (existingPlayer) {
      existingPlayer.name = player.name;
      existingPlayer.avatar = player.avatar;
      existingPlayer.isOnline = true;
      this.updateStateToAll();
      return;
    }

    // Ensure game not active
    if (this.game.status !== "idle") {
      emitSocketError(socket, `A game is already active in room ${this.id}`, {
        redirectPath: "/",
      });
      return;
    }

    // Ensure max players
    if (this.game.players.length >= this.maxPlayers) {
      const max = this.maxPlayers;
      const n = this.game.players.length;
      emitSocketError(socket, `Room full (${n} / ${max} players)`, {
        redirectPath: "/",
      });
      return;
    }

    // On new user joined, reset game for n players
    const newPlayer: Player = {
      ...player,
      isOnline: true,
    };

    // Get new gamestate by adding player to gamestate
    const newPlayers = unique(
      [newPlayer, ...this.game.players],
      (a, b) => a.id === b.id
    );
    this.initializeGame(GameState.From(this.game, newPlayers));

    this.updateStateToAll();
  }

  /**
   * Removes a player while in lobby. During game marks them as offline.
   */
  private removePlayer(socket: Socket, args: { uid: string }) {
    const player = this.game.players.find((_) => _.id === args.uid);

    switch (this.game.status) {
      // In lobby, remove disconnected players and reinitialize the game.
      case "idle": {
        const newPlayers = this.game.players.filter((_) => _.id !== args.uid);
        this.initializeGame(GameState.From(this.game, newPlayers));
        break;
      }

      // During gameplay remove no players and mark them as offline. Assume
      // disconnection and attempt to reconnect.
      default: {
        if (player) {
          player.isOnline = false;
        }
        break;
      }
    }

    // Update state to all
    this.updateStateToAll();
  }

  /**
   * Get JSON.stringified version to send to player as update
   */
  private getJsonGameStateString(g: GameState = this.game) {
    return JSON.stringify({
      roomId: this.id,
      players: g.players,
      nRounds: g.nRounds,
      currentRoundIndex: g.currentRoundIndex,
      cards: g.cards,
      rounds: g.rounds.map((r) => ({ ...r, picture: r.picture.state })),
      status: g.status,
      drawingTime: g.drawingTime,
      finalGuesses: g.finalGuesses,
      maxPlayers: this.maxPlayers,
    });
  }

  /**
   * Set provided gamestate object as new gamestate object for this gameroom.
   * Unsubscribe previous gamestate object and subscribe to new gamestate
   * object's state updats.
   */
  private initializeGame(newGame: GameState) {
    // Unsubscribe previous game and assign new game
    this.updatesUnsubscriber?.();
    this.game = newGame;

    // Subscribe to state and drawing time updates
    // in order to broadcast them to players
    const unsubscribeState = this.game.stateUpdates.subscribe(() => {
      this.updateStateToAll();
    });
    const unsubscribeDrawTime = this.game.drawingTimeUpdates.subscribe((t) => {
      this.room.emit("@game/drawingTimeLeft", t);
    });

    // Update state to all after new game is initialized
    this.updateStateToAll();

    // New unsubscriber
    this.updatesUnsubscriber = () => {
      unsubscribeState();
      unsubscribeDrawTime();
    };
  }

  //----------------------------------------------------------------------------
  // PUBLIC INSTANCE METHODS
  //----------------------------------------------------------------------------

  /**
   * Adds a player to the game room by connecting a socket into the correct
   * channel, updating the gamestate and setting up all event handlers for
   * socket events.
   */
  public connectSocket(
    socket: Socket,
    player: { id: string; name: string; avatar: string }
  ) {
    // Connect socket to room and add player into game, update state to all
    socket.join(this.id);
    this.addPlayer(socket, player);
    this.updateStateToAll();

    // SET UP SOCKET EVENTS

    // On disconnection remove player (marks them as offline during an active
    // game)
    socket.on("disconnect", () => {
      this.removePlayer(socket, { uid: player.id });
    });

    // On reset command reset current game.
    socket.on("@game/reset", () => {
      this.initializeGame(GameState.From(this.game));
    });

    // On start game command start game from lobby.
    socket.on("@game/start", () => {
      const res = this.game.applyStartGame();
      if (res.error) emitSocketError(socket, res.error);
    });

    // On drawing, update drawing to correct round's picture. DO NOT send state
    // updates on drawings as other players do not see each others' drawings
    // in realtime.
    socket.on(
      "@game/draw",
      createSocketEventHandler({
        schema: z.object({ drawingAction: z.string(), roundId: z.string() }),
        onData: (data) => {
          const res = this.game.applyDrawingAction(data);
          if (res.error) emitSocketError(socket, res.error);
        },
        onError: (e: any) => {
          console.error("err:@game/draw", e);
        },
      })
    );

    // Listen to guesses
    socket.on(
      "@game/guess",
      createSocketEventHandler({
        schema: z.object({ guess: z.string(), roundId: z.string() }),
        onData: (data) => {
          const res = this.game.applyGuess(data);
          if (res.error) emitSocketError(socket, res.error);
        },
        onError: (e: any) => {
          console.error("err:@game/guess", e);
          emitSocketError(socket, "Invalid guess");
        },
      })
    );

    // Listen to updates to drawing time
    socket.on(
      "@game/setDrawingTime",
      createSocketEventHandler({
        schema: z.object({ drawingTime: z.number().positive().int() }),
        onData: (data) => {
          const res = this.game.applyDrawingTime(data);
          if (res.error) emitSocketError(socket, res.error);
        },
        onError: (e: any) => {
          console.error("err:@game/setDrawingTime", e);
          emitSocketError(socket, "Invalid drawing time");
        },
      })
    );

    // Listen to initial choices
    socket.on(
      "@game/initialChoice",
      createSocketEventHandler({
        schema: z.object({ uid: z.string(), topic: z.string() }),
        onData: (data) => {
          const res = this.game.applyInitialChoice(data);
          if (res.error) emitSocketError(socket, res.error);
        },
        onError: (e: any) => {
          console.error("err:@game/initialChoice", e);
          emitSocketError(socket, "Invalid initial choice");
        },
      })
    );

    // Listen to final choices
    socket.on(
      "@game/finalChoice",
      createSocketEventHandler({
        schema: z.object({ uid: z.string(), cardId: z.string() }),
        onData: (data) => {
          const res = this.game.applyFinalChoice(data);
          if (res.error) emitSocketError(socket, res.error);
        },
        onError: (e: any) => {
          console.error("err:@game/finalChoice", e);
          emitSocketError(socket, "Invalid final choice");
        },
      })
    );
  }
}
