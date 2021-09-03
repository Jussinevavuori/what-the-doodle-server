"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomItemFromSet = void 0;
function getRandomItemFromSet(set) {
    var items = Array.from(set);
    return items[Math.floor(Math.random() * items.length)];
}
exports.getRandomItemFromSet = getRandomItemFromSet;
