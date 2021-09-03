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
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitSocketError = void 0;
/**
 * Utility function to send socket errors. Provides typing and handles correct
 * shape of error message.
 */
function emitSocketError(socket, message, options) {
    if (options === void 0) { options = {}; }
    socket.emit("error", JSON.stringify(__assign({ message: message }, options)));
}
exports.emitSocketError = emitSocketError;
