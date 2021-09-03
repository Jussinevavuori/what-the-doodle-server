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
exports.shuffle = void 0;
var randomInt_1 = require("./randomInt");
function shuffle(arr, shuffles) {
    // If not specified, perform 2*arr.length shuffles
    var n = shuffles !== null && shuffles !== void 0 ? shuffles : arr.length * 2;
    // Copy array
    var a = __spreadArray([], arr, true);
    // Perform n random shuffles
    for (var shuffle_1 = 0; shuffle_1 < n; shuffle_1++) {
        // Pick two inequal random indices
        var i = 0;
        var j = 0;
        while (i === j) {
            i = (0, randomInt_1.randomInt)(a.length);
            j = (0, randomInt_1.randomInt)(a.length);
        }
        // Swap elements at indices
        var temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
    // Return shuffled array
    return a;
}
exports.shuffle = shuffle;
