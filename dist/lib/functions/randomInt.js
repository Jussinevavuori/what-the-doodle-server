"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomInt = void 0;
/**
 * Generate a random integer between 0 and max exclusive.
 */
function randomInt(max) {
    return Math.floor(Math.random() * max);
}
exports.randomInt = randomInt;
