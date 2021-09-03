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
exports.createLogger = void 0;
/**
 * Create a logger which wraps the console.log feature and provides a prefix
 * for the logs.
 *
 * Example:
 * ```
 * const logger = createLogger({name: "TestLogger"})
 *
 * // Logs: [TestLogger]: Hello, world!
 * logger("Hello, world!")
 * ```
 */
function createLogger(options) {
    if (options === void 0) { options = { name: "App" }; }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log.apply(console, __spreadArray(["[" + options.name + "]:"], args, false));
    };
}
exports.createLogger = createLogger;
