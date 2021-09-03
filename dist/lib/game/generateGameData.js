"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGameData = void 0;
var DrawingState_1 = require("../drawing/DrawingState");
var createIndexArray_1 = require("../functions/createIndexArray");
var padInt_1 = require("../functions/padInt");
var randomInt_1 = require("../functions/randomInt");
var rotateRight_1 = require("../functions/rotateRight");
var shuffle_1 = require("../functions/shuffle");
var TopicGenerator_1 = require("./TopicGenerator");
/**
 * Based on the list of players, generates all cards and rounds for a gamestate
 * object and assigns the given players to those rounds.
 */
function generateGameData(players) {
    // Utility shortcut: a game with n players has n cards and n rounds
    // per cards totaling n*n rounds.
    var n = players.length;
    // Topic generator
    var topicGenerator = new TopicGenerator_1.TopicGenerator();
    // List all cards and rounds
    var cards = [];
    var rounds = [];
    // Current mapping: starts from direct x -> x mapping
    var mapping = (0, createIndexArray_1.createIndexArray)(n);
    // Utility function to rotate or shuffle the mapping
    var nextMapping = function (type) {
        switch (type) {
            case "rotate": {
                mapping = (0, rotateRight_1.rotateRight)(mapping);
                break;
            }
            case "shuffle": {
                var prev = mapping;
                mapping = (0, shuffle_1.shuffle)(mapping);
                while (prev.findIndex(function (v, k) { return mapping[k] === v; }) >= 0) {
                    var i = prev.findIndex(function (v, k) { return mapping[k] === v; });
                    var j = (0, randomInt_1.randomInt)(n);
                    var temp = mapping[i];
                    mapping[i] = mapping[j];
                    mapping[j] = temp;
                }
            }
        }
    };
    // Create all cards
    for (var ci = 0; ci < n; ci++) {
        var card = {
            id: "C#" + (0, padInt_1.padInt)(ci, 2),
            topic: "",
            cardNumber: ci,
            topicOptions: topicGenerator.getRandomTopics(3),
        };
        cards.push(card);
        // Create all rounds for that card
        for (var ri = 0; ri < n; ri++) {
            var round = {
                id: "R#" + (0, padInt_1.padInt)(ci, 2) + "/" + (0, padInt_1.padInt)(ri, 2),
                guess: "",
                picture: new DrawingState_1.DrawingState(),
                cardId: card.id,
                drawerId: "",
                guesserId: "",
                roundNumber: ri,
                cardNumber: ci,
                topic: "",
            };
            rounds.push(round);
        }
    }
    var _loop_1 = function (ri) {
        // Shuffle halfway if n is even and n > 2
        if (n % 2 === 0 && ri === Math.floor(n / 2) && n > 2) {
            nextMapping("shuffle");
        }
        else {
            nextMapping("rotate");
        }
        var _loop_2 = function (ci) {
            var round = rounds.find(function (round) {
                return round.roundNumber === ri && round.cardNumber === ci;
            });
            if (!round) {
                return "continue";
            }
            var pi = mapping[ci];
            var drawer = players[pi];
            round.drawerId = drawer.id;
        };
        // Get all drawers from mapping
        for (var ci = 0; ci < n; ci++) {
            _loop_2(ci);
        }
        // Do not assign guessers for last round
        if (ri === n - 1) {
            return "break";
        }
        // Shuffle halfway if n is odd and n > 2
        // else rotate.
        if (n % 2 === 1 && ri === Math.floor(n / 2) && n > 2) {
            nextMapping("shuffle");
        }
        else {
            nextMapping("rotate");
        }
        var _loop_3 = function (ci) {
            var round = rounds.find(function (round) {
                return round.roundNumber === ri && round.cardNumber === ci;
            });
            if (!round) {
                return "continue";
            }
            var pi = mapping[ci];
            var guesser = players[pi];
            round.guesserId = guesser.id;
        };
        // Get all guessers from mapping
        for (var ci = 0; ci < n; ci++) {
            _loop_3(ci);
        }
    };
    // Assign drawers and guesses for each round
    for (var ri = 0; ri < n; ri++) {
        var state_1 = _loop_1(ri);
        if (state_1 === "break")
            break;
    }
    // logGameState(cards, rounds, players);
    return { cards: cards, rounds: rounds };
}
exports.generateGameData = generateGameData;
