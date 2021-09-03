"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = void 0;
var PubSubChannel_1 = require("../pubsub/PubSubChannel");
var generateGameData_1 = require("./generateGameData");
var GameState = /** @class */ (function () {
    function GameState(players, opts) {
        if (opts === void 0) { opts = {}; }
        var _a;
        // Generate rounds and cards.
        var gamedata = (0, generateGameData_1.generateGameData)(players);
        // Assign all properties
        this.players = players;
        this.nRounds = players.length;
        this.rounds = gamedata.rounds;
        this.cards = gamedata.cards;
        this.currentRoundIndex = 0;
        this.drawingTime = (_a = opts.drawingTime) !== null && _a !== void 0 ? _a : 60;
        this.status = "idle";
        this.finalGuesses = {};
        this.stateUpdates = new PubSubChannel_1.PubSubChannel();
        this.drawingTimeUpdates = new PubSubChannel_1.PubSubChannel();
    }
    //----------------------------------------------------------------------------
    // STATIC CONSTRUCTORS
    //----------------------------------------------------------------------------
    /**
     * Creates a new gamestate by copying all settings from the provided gamestate
     * object. If no players are specified, uses players from provided gamestate
     * object instead.
     */
    GameState.From = function (gamestate, players) {
        return new GameState(players !== null && players !== void 0 ? players : gamestate.players, {
            drawingTime: gamestate.drawingTime,
        });
    };
    //----------------------------------------------------------------------------
    // PUBLIC INSTANCE METHODS
    //----------------------------------------------------------------------------
    /**
     * Attempts to start the game
     */
    GameState.prototype.applyStartGame = function () {
        if (this.players.length === 0) {
            return { error: "No players in game" };
        }
        if (this.status !== "idle") {
            return { error: "Can not start inactive game" };
        }
        this.nextPhase();
        return {};
    };
    /**
     * Applies a drawing time
     */
    GameState.prototype.applyDrawingTime = function (args) {
        if (args.drawingTime <= 0 || !Number.isSafeInteger(args.drawingTime)) {
            return { error: "Drwaing time must be a positive integer" };
        }
        this.drawingTime = args.drawingTime;
        this.stateUpdates.publish(this);
        return {};
    };
    /**
     * Applies an initial choice
     */
    GameState.prototype.applyInitialChoice = function (args) {
        var round = this.rounds.find(function (r) { return r.roundNumber === 0 && r.drawerId === args.uid; });
        var card = this.cards.find(function (_) { return _.id === (round === null || round === void 0 ? void 0 : round.cardId); });
        if (!round || !card) {
            return { error: "Could not find current round and card for user" };
        }
        round.topic = args.topic;
        card.topic = args.topic;
        var allChosen = this.rounds.filter(function (r) { return r.roundNumber === 0; }).every(function (_) { return !!_.topic; }) &&
            this.cards.every(function (_) { return !!_.topic; });
        if (allChosen) {
            this.nextPhase();
        }
        else {
            this.stateUpdates.publish(this);
        }
        return {};
    };
    /**
     * Applies a final choicie
     */
    GameState.prototype.applyFinalChoice = function (args) {
        var _this = this;
        if (this.finalGuesses[args.cardId]) {
            return { error: "This card was already picked" };
        }
        this.finalGuesses[args.cardId] = args.uid;
        var allGuessed = this.cards.every(function (c) { return !!_this.finalGuesses[c.id]; });
        if (allGuessed) {
            this.nextPhase();
        }
        else {
            this.stateUpdates.publish(this);
        }
        return {};
    };
    /**
     * Apply drawing action. Do not update game state based on this.
     */
    GameState.prototype.applyDrawingAction = function (args) {
        var round = this.rounds.find(function (_) { return _.id === args.roundId; });
        if (round) {
            round.picture.apply(args.drawingAction);
        }
        else {
            return { error: "No drawing found for round" };
        }
        return {};
    };
    /**
     * Apply a guess
     */
    GameState.prototype.applyGuess = function (args) {
        var _this = this;
        // Apply guess to specified round
        var round = this.rounds.find(function (_) { return _.id === args.roundId; });
        if (round) {
            round.guess = args.guess;
        }
        // Apply guess as topic to next round
        var nextRound = this.rounds.find(function (_) {
            var _a;
            return (_.roundNumber === ((_a = round === null || round === void 0 ? void 0 : round.roundNumber) !== null && _a !== void 0 ? _a : 0) + 1 &&
                _.cardId === (round === null || round === void 0 ? void 0 : round.cardId));
        });
        if (nextRound) {
            nextRound.topic = args.guess;
        }
        // Check whether all rounds on this round have been guessed
        var allGuessed = this.rounds
            .filter(function (_) { return _.roundNumber === _this.currentRoundIndex; })
            .every(function (_) { return _.guess; });
        // If all guessed, move to next phase. Else send update.
        if (allGuessed) {
            this.nextPhase();
        }
        else {
            this.stateUpdates.publish(this);
        }
        return {};
    };
    //----------------------------------------------------------------------------
    // PRIVATE INSTANCE METHODS
    //----------------------------------------------------------------------------
    /**
     * Function to move to next phase (from drawing to guessing, from guessing
     * to drawing next round until last is drawn and game finishes).
     */
    GameState.prototype.nextPhase = function () {
        var _this = this;
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
                var allGuessed = this.rounds
                    .filter(function (_) { return _.roundNumber === _this.currentRoundIndex; })
                    .every(function (_) { return _.guess; });
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
    };
    /**
     * Starts the drawing timer and automatically publishes drawing time updates
     * every second until time is up. When time ends, automatically moves to next
     * phase.
     */
    GameState.prototype.startDrawingTimer = function () {
        var _this = this;
        // Allow drawing timer to only be activated when status is draw
        if (this.status !== "draw")
            return;
        // Counter for seconds left
        var secondsLeft = this.drawingTime;
        // Ensure total time is published at start
        this.drawingTimeUpdates.publish(secondsLeft);
        // Every second countdown and publish update.
        var interval = setInterval(function () {
            secondsLeft--;
            _this.drawingTimeUpdates.publish(secondsLeft);
            // When time over, clear interval and move to guessing phase
            // or finish game
            if (secondsLeft === 0) {
                clearInterval(interval);
                _this.nextPhase();
            }
        }, 1000);
        // Ensure 0 is published
        this.drawingTimeUpdates.publish(0);
    };
    return GameState;
}());
exports.GameState = GameState;
