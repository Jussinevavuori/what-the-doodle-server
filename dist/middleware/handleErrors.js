"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleErrors = void 0;
var Failures_1 = require("../lib/result/Failures");
var Result_1 = require("../lib/result/Result");
/**
 * Error handler middleware which converts all errors to failures before
 * the failure handler middleware.
 */
function handleErrors(error, req, res, next) {
    /**
     * Pass failures directly
     */
    if (error instanceof Result_1.Failure) {
        return next(error);
    }
    /**
     * Handle syntax errors as invalid request data failures
     */
    if (error instanceof SyntaxError) {
        return next(new Failures_1.InvalidRequestDataFailure({
            _root: error.message,
        }));
    }
    /**
     * Everything else is assumed to be an error and is wrapped in an error
     * failure and passed to failure handler.
     */
    return next(new Failures_1.ErrorFailure(error));
}
exports.handleErrors = handleErrors;
