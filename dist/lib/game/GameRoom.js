"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoom = void 0;
var zod_1 = require("zod");
var unique_1 = require("../functions/unique");
var GameState_1 = require("./GameState");
var createSocketEventHandler_1 = require("../../sockets/createSocketEventHandler");
var emitSocketError_1 = require("../../sockets/emitSocketError");
/**
 * Connects players and sockets to a gamestate.
 */
var GameRoom = /** @class */ (function () {
    function GameRoom(io, id) {
        this.id = id;
        this.room = io.to(this.id);
        this.maxPlayers = 8;
        this.game = new GameState_1.GameState([]);
    }
    GameRoom.clearEmptyRooms = function () {
        Object.values(GameRoom.rooms)
            .filter(function (_) { return _.game.players.length === 0; })
            .forEach(function (_) {
            delete GameRoom.rooms[_.id];
        });
    };
    /**
     * Get a game room or create one if it doesn't yet exist
     */
    GameRoom.getRoom = function (io, id) {
        // Clear empty rooms
        GameRoom.clearEmptyRooms();
        // Create room if none exists
        if (!GameRoom.rooms[id]) {
            GameRoom.rooms[id] = new GameRoom(io, id);
        }
        return GameRoom.rooms[id];
    };
    //----------------------------------------------------------------------------
    // PRIVATE INSTANCE METHODS
    //----------------------------------------------------------------------------
    /**
     * Automatically updates current gamestate to everyone. Can be provided an
     */
    GameRoom.prototype.updateStateToAll = function () {
        this.room.emit("@game/state", this.getJsonGameStateString(this.game));
    };
    /**
     * List a player ID into this game room
     */
    GameRoom.prototype.addPlayer = function (socket, player) {
        // Rejoining: copy new details in case they changed.
        var existingPlayer = this.game.players.find(function (_) { return _.id === player.id; });
        if (existingPlayer) {
            existingPlayer.name = player.name;
            existingPlayer.avatar = player.avatar;
            existingPlayer.isOnline = true;
            this.updateStateToAll();
            return;
        }
        // Ensure game not active
        if (this.game.status !== "idle") {
            (0, emitSocketError_1.emitSocketError)(socket, "A game is already active in room " + this.id, {
                redirectPath: "/",
            });
            return;
        }
        // Ensure max players
        if (this.game.players.length >= this.maxPlayers) {
            var max = this.maxPlayers;
            var n = this.game.players.length;
            (0, emitSocketError_1.emitSocketError)(socket, "Room full (" + n + " / " + max + " players)", {
                redirectPath: "/",
            });
            return;
        }
        // On new user joined, reset game for n players
        var newPlayer = __assign(__assign({}, player), { isOnline: true });
        // Get new gamestate by adding player to gamestate
        var newPlayers = (0, unique_1.unique)(__spreadArray([newPlayer], this.game.players, true), function (a, b) { return a.id === b.id; });
        this.initializeGame(GameState_1.GameState.From(this.game, newPlayers));
        this.updateStateToAll();
    };
    /**
     * Removes a player while in lobby. During game marks them as offline.
     */
    GameRoom.prototype.removePlayer = function (socket, args) {
        var player = this.game.players.find(function (_) { return _.id === args.uid; });
        switch (this.game.status) {
            // In lobby, remove disconnected players and reinitialize the game.
            case "idle": {
                var newPlayers = this.game.players.filter(function (_) { return _.id !== args.uid; });
                this.initializeGame(GameState_1.GameState.From(this.game, newPlayers));
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
    };
    /**
     * Get JSON.stringified version to send to player as update
     */
    GameRoom.prototype.getJsonGameStateString = function (g) {
        if (g === void 0) { g = this.game; }
        return JSON.stringify({
            roomId: this.id,
            players: g.players,
            nRounds: g.nRounds,
            currentRoundIndex: g.currentRoundIndex,
            cards: g.cards,
            rounds: g.rounds.map(function (r) { return (__assign(__assign({}, r), { picture: r.picture.state })); }),
            status: g.status,
            drawingTime: g.drawingTime,
            finalGuesses: g.finalGuesses,
            maxPlayers: this.maxPlayers,
        });
    };
    /**
     * Set provided gamestate object as new gamestate object for this gameroom.
     * Unsubscribe previous gamestate object and subscribe to new gamestate
     * object's state updats.
     */
    GameRoom.prototype.initializeGame = function (newGame) {
        var _this = this;
        var _a;
        // Unsubscribe previous game and assign new game
        (_a = this.updatesUnsubscriber) === null || _a === void 0 ? void 0 : _a.call(this);
        this.game = newGame;
        // Subscribe to state and drawing time updates
        // in order to broadcast them to players
        var unsubscribeState = this.game.stateUpdates.subscribe(function () {
            _this.updateStateToAll();
        });
        var unsubscribeDrawTime = this.game.drawingTimeUpdates.subscribe(function (t) {
            _this.room.emit("@game/drawingTimeLeft", t);
        });
        // New unsubscriber
        this.updatesUnsubscriber = function () {
            unsubscribeState();
            unsubscribeDrawTime();
        };
    };
    //----------------------------------------------------------------------------
    // PUBLIC INSTANCE METHODS
    //----------------------------------------------------------------------------
    /**
     * Adds a player to the game room by connecting a socket into the correct
     * channel, updating the gamestate and setting up all event handlers for
     * socket events.
     */
    GameRoom.prototype.connectSocket = function (socket, player) {
        var _this = this;
        // Connect socket to room and add player into game, update state to all
        socket.join(this.id);
        this.addPlayer(socket, player);
        this.updateStateToAll();
        // SET UP SOCKET EVENTS
        // On disconnection remove player (marks them as offline during an active
        // game)
        socket.on("disconnect", function () {
            _this.removePlayer(socket, { uid: player.id });
        });
        // On reset command reset current game.
        socket.on("@game/reset", function () {
            _this.initializeGame(GameState_1.GameState.From(_this.game));
        });
        // On start game command start game from lobby.
        socket.on("@game/start", function () {
            var res = _this.game.applyStartGame();
            if (res.error)
                (0, emitSocketError_1.emitSocketError)(socket, res.error);
        });
        // On drawing, update drawing to correct round's picture. DO NOT send state
        // updates on drawings as other players do not see each others' drawings
        // in realtime.
        socket.on("@game/draw", (0, createSocketEventHandler_1.createSocketEventHandler)({
            schema: zod_1.z.object({ drawingAction: zod_1.z.string(), roundId: zod_1.z.string() }),
            onData: function (data) {
                var res = _this.game.applyDrawingAction(data);
                if (res.error)
                    (0, emitSocketError_1.emitSocketError)(socket, res.error);
            },
            onError: function (e) {
                console.error("err:@game/draw", e);
            },
        }));
        // Listen to guesses
        socket.on("@game/guess", (0, createSocketEventHandler_1.createSocketEventHandler)({
            schema: zod_1.z.object({ guess: zod_1.z.string(), roundId: zod_1.z.string() }),
            onData: function (data) {
                var res = _this.game.applyGuess(data);
                if (res.error)
                    (0, emitSocketError_1.emitSocketError)(socket, res.error);
            },
            onError: function (e) {
                console.error("err:@game/guess", e);
                (0, emitSocketError_1.emitSocketError)(socket, "Invalid guess");
            },
        }));
        // Listen to updates to drawing time
        socket.on("@game/setDrawingTime", (0, createSocketEventHandler_1.createSocketEventHandler)({
            schema: zod_1.z.object({ drawingTime: zod_1.z.number().positive().int() }),
            onData: function (data) {
                var res = _this.game.applyDrawingTime(data);
                if (res.error)
                    (0, emitSocketError_1.emitSocketError)(socket, res.error);
            },
            onError: function (e) {
                console.error("err:@game/setDrawingTime", e);
                (0, emitSocketError_1.emitSocketError)(socket, "Invalid drawing time");
            },
        }));
        // Listen to initial choices
        socket.on("@game/initialChoice", (0, createSocketEventHandler_1.createSocketEventHandler)({
            schema: zod_1.z.object({ uid: zod_1.z.string(), topic: zod_1.z.string() }),
            onData: function (data) {
                var res = _this.game.applyInitialChoice(data);
                if (res.error)
                    (0, emitSocketError_1.emitSocketError)(socket, res.error);
            },
            onError: function (e) {
                console.error("err:@game/initialChoice", e);
                (0, emitSocketError_1.emitSocketError)(socket, "Invalid initial choice");
            },
        }));
        // Listen to final choices
        socket.on("@game/finalChoice", (0, createSocketEventHandler_1.createSocketEventHandler)({
            schema: zod_1.z.object({ uid: zod_1.z.string(), cardId: zod_1.z.string() }),
            onData: function (data) {
                var res = _this.game.applyFinalChoice(data);
                if (res.error)
                    (0, emitSocketError_1.emitSocketError)(socket, res.error);
            },
            onError: function (e) {
                console.error("err:@game/finalChoice", e);
                (0, emitSocketError_1.emitSocketError)(socket, "Invalid final choice");
            },
        }));
    };
    //----------------------------------------------------------------------------
    // STATIC METHODS
    //----------------------------------------------------------------------------
    /**
     * All game rooms
     */
    GameRoom.rooms = {};
    return GameRoom;
}());
exports.GameRoom = GameRoom;
