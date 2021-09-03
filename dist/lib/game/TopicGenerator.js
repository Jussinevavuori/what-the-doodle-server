"use strict";
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
exports.TopicGenerator = void 0;
var getRandomItemFromSet_1 = require("../functions/getRandomItemFromSet");
var randomInts_1 = require("../functions/randomInts");
var topics_fi_1 = require("../topics/topics.fi");
var TopicGenerator = /** @class */ (function () {
    function TopicGenerator() {
        // Initialize available topics as having all topics available
        this.availableTopics = new Set(TopicGenerator.getAllTopics());
    }
    //----------------------------------------------------------------------------
    // STATIC METHODS
    //----------------------------------------------------------------------------
    /**
     * Fetches all existing topics
     */
    TopicGenerator.getAllTopics = function () {
        return __spreadArray([], topics_fi_1.fiTopics, true);
    };
    /**
     * Fetches n random topics
     */
    TopicGenerator.getRandomTopics = function (n) {
        var topics = TopicGenerator.getAllTopics();
        return (0, randomInts_1.randomInts)(n, topics.length, true).map(function (i) { return topics[i]; });
    };
    //----------------------------------------------------------------------------
    // INSTANCE METHODS
    //----------------------------------------------------------------------------
    /**
     * Get a random available topic and remove it from random possibilities.
     */
    TopicGenerator.prototype.getNextRandomTopic = function () {
        // When available topics is emptied, refill it.
        if (this.availableTopics.size === 0) {
            this.availableTopics = new Set(TopicGenerator.getAllTopics());
        }
        var topic = (0, getRandomItemFromSet_1.getRandomItemFromSet)(this.availableTopics);
        if (!topic) {
            throw new Error("No next random topic generated");
        }
        this.availableTopics.delete(topic);
        return topic;
    };
    /**
     * Get n random topics. This function will generate unique topics on each run
     * until the list of all available topics is exhausted. When that happens,
     * the list of all available topics is reset to its original state and the
     * list is exhausted again.
     */
    TopicGenerator.prototype.getRandomTopics = function (n) {
        var topics = [];
        while (topics.length < n) {
            topics.push(this.getNextRandomTopic());
        }
        return topics;
    };
    return TopicGenerator;
}());
exports.TopicGenerator = TopicGenerator;
