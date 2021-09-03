"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = void 0;
var cors_1 = __importDefault(require("cors"));
/**
 * Cors middleware
 */
function corsMiddleware() {
    return (0, cors_1.default)({
        credentials: true,
        origin: true,
    });
}
exports.corsMiddleware = corsMiddleware;
