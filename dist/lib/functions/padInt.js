"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.padInt = void 0;
/**
 * Utility function to pad integers to strings with extra zeroes
 */
function padInt(num, len) {
    return num.toString().padStart(len, "0");
}
exports.padInt = padInt;
