"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomInts = void 0;
var randomInt_1 = require("./randomInt");
function randomInts(n, max, unique) {
    var canGenerateUnique = n < max;
    if (unique && !canGenerateUnique) {
        console.warn("Could not generate " + n + " unique numbers between 0 and " + max);
    }
    var nums = [];
    while (nums.length < n) {
        var nextNum = (0, randomInt_1.randomInt)(max);
        if (unique && canGenerateUnique && nums.includes(nextNum)) {
            continue;
        }
        nums.push(nextNum);
    }
    return nums;
}
exports.randomInts = randomInts;
