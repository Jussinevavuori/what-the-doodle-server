"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiters = void 0;
var express_rate_limit_1 = __importDefault(require("express-rate-limit"));
var Failures_1 = require("../lib/result/Failures");
/**
 * Utility function for converting minutes to milliseconds
 */
function minutesToMs(minutes) {
    return minutes * 60 * 1000;
}
/**
 * The test rate limiter is an empty middleware which is used instead of
 * the default rate limiters when testing. It effectively disables rate
 * limiting.
 */
var testRateLimiter = function (req, res, next) { return next(); };
/**
 * Utility function for when the rate limit is exceeded. Passes a failure.
 */
var rateLimitExceededHandler = function (req, res, next) {
    next(new Failures_1.TooManyRequestsFailure());
};
/**
 * Utility function to create a rate limiter. Automatically applies the
 * test rate limiter in test mode.
 */
function createRateLimiter() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (process.env.NODE_ENV === "test")
        return testRateLimiter;
    return express_rate_limit_1.default.apply(void 0, args);
}
/**
 * The default rate limiter key generator.
 */
function generateKey(request) {
    return "<" + request.ip + ">" + request.method + "@" + request.path + "#general";
}
/**
 * Application rate limiters
 */
exports.rateLimiters = {
    /**
     * The general rate limiter for most endpoints. Allows max 500 requests
     * in a one minute window.
     */
    general: function () {
        return createRateLimiter({
            keyGenerator: generateKey,
            windowMs: minutesToMs(1),
            max: 500,
            handler: rateLimitExceededHandler,
        });
    },
    /**
     * The strict rate limiter for more vulnerable endpoints. Allows max 5
     * requests in a five minute window.
     */
    strict: function () {
        return createRateLimiter({
            keyGenerator: generateKey,
            windowMs: minutesToMs(5),
            max: 5,
            handler: rateLimitExceededHandler,
        });
    },
};
