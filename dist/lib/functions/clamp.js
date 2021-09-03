"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = void 0;
function clamp(val, min, max) {
    return val < min ? min : val > max ? max : val;
}
exports.clamp = clamp;
