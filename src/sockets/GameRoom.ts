import { BroadcastOperator, Server as SocketIoServer, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { z } from "zod";
import { unique } from "../lib/functions/unique";
import { GameState } from "../lib/game/GameState";
import { createSocketEventHandler } from "./createSocketEventHandler";
import { emitSocketError } from "./emitSocketError";

export class GameRoom {
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

  /**
   * List a player ID into this game room
   */
  addPlayer(
    socket: Socket,
    player: { id: string; name: string; avatar: string }
  ) {
    // Rejoining: copy new details in case they changed.
    const existingPlayer = this.game.players.find((_) => _.id === player.id);
    if (existingPlayer) {
      console.log(`${player.name} re-joined room ${this.id}`);
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
      console.log(
        `${player.name} attempted to join active game room ${this.id}`
      );
      return;
    }

    // Ensure max players
    if (this.game.players.length >= this.maxPlayers) {
      const max = this.maxPlayers;
      const n = this.game.players.length;
      console.log(`${player.name} attempted to join full room ${this.id}`);
      emitSocketError(socket, `Room full (${n} / ${max} players)`, {
        redirectPath: "/",
      });
      return;
    }

    // On new user joined, reset game for n players
    console.log(`${player.name} joined room ${this.id}`);

    const newPlayer: Player = {
      ...player,
      isOnline: true,
    };

    // Get new gamestate by adding player to gamestate
    this.initializeGame(
      new GameState(
        unique([newPlayer, ...this.game.players], (a, b) => a.id === b.id),
        { drawingTime: this.game.drawingTime }
      )
    );
  }

  /**
   * Get JSON object to send to player as update
   */
  getJsonGameState(g: GameState = this.game) {
    return {
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
    };
  }

  /**
   * Get JSON.stringified version to send to player as update
   */
  getJsonGameStateString(g: GameState = this.game) {
    return JSON.stringify(this.getJsonGameState(g));
  }

  /**
   * Reset game and subscribe to state and drawing time updates
   */
  initializeGame(g?: GameState) {
    // Unsubscribe
    this.updatesUnsubscriber?.();

    // Initialize new game and copy settings
    this.game =
      g ??
      new GameState(this.game.players, {
        drawingTime: this.game.drawingTime,
      });

    // Subscribe to state and drawing time updates
    // in order to broadcast them to players
    const unsubscribeState = this.game.stateUpdates.subscribe((g) => {
      this.updateStateToAll(g);
    });
    const unsubscribeDrawTime = this.game.drawingTimeUpdates.subscribe((t) => {
      this.room.emit("@game/drawingTimeLeft", t);
    });

    // Set unsubscriber
    this.updatesUnsubscriber = () => {
      unsubscribeState();
      unsubscribeDrawTime();
    };
  }

  /**
   * Helper method to send a full state update to everyone
   */
  updateStateToAll(g: GameState = this.game) {
    this.room.emit("@game/state", this.getJsonGameStateString(g));
  }

  /**
   * Helper method to send a full state update to a single socket
   */
  updateStateToSocket(socket: Socket, g: GameState = this.game) {
    socket.emit("@game/state", this.getJsonGameStateString(g));
  }

  /**
   * Initialize a player into this room
   */
  connectSocket(socket: Socket, uid: string) {
    // Reset and broadcast game state
    socket.on("@game/reset", () => {
      this.initializeGame();
      this.updateStateToAll();
    });

    // Start game
    socket.on("@game/start", () => {
      if (this.game.players.length === 0) {
        emitSocketError(socket, "No players in game");
        return;
      }

      if (this.game.status !== "idle") {
        emitSocketError(socket, "Game already active");
        return;
      }

      this.initializeGame();
      this.game.nextPhase();
      this.updateStateToAll();
    });

    // Listen to disconnections
    socket.on("disconnect", () => {
      const player = this.game.players.find((_) => _.id === uid);

      // In lobby remove player, during gameplay mark as offline
      if (this.game.status === "idle") {
        this.initializeGame(
          new GameState(
            this.game.players.filter((_) => _.id !== uid),
            { drawingTime: this.game.drawingTime }
          )
        );
        console.log(`Disconnected (left) (${player?.name ?? socket.id})`);
      } else {
        if (player) player.isOnline = false;
        console.log(`Disconnected (offline) (${player?.name ?? socket.id})`);
      }
      this.updateStateToAll();
    });

    // Listen to drawings and apply them to the round pictures
    socket.on(
      "@game/draw",
      createSocketEventHandler({
        schema: z.object({ drawingAction: z.string(), roundId: z.string() }),
        onData: (data) => {
          this.game.applyDrawingAction(socket, data);
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
          this.game.applyGuess(socket, data);
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
          this.game.applyDrawingTime(socket, { drawingTime: data.drawingTime });
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
        schema: z.object({ uid: z.string(), title: z.string() }),
        onData: (data) => {
          this.game.applyInitialChoice(socket, data);
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
          this.game.applyFinalChoice(socket, data);
        },
        onError: (e: any) => {
          console.error("err:@game/finalChoice", e);
          emitSocketError(socket, "Invalid final choice");
        },
      })
    );
  }
}
