"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFailure = void 0;
var env_1 = require("../env");
var Failures_1 = require("../lib/result/Failures");
var Result_1 = require("../lib/result/Result");
/**
 * Error handler middleware which handles all failures. Assumes an error
 * handler middleware has ran before this middleware and converted all
 * errors into failures.
 */
function handleFailure(failure, req, res, next) {
    /**
     * Pass if response sent
     */
    if (!res.headersSent) {
        /**
         * Act only on failures
         */
        if (failure instanceof Result_1.Failure) {
            /**
             * Log failures in development
             */
            if (env_1.ENV.env === "development") {
                req.on("end", function () {
                    console.error("  > Failure: " + failure.code + " (" + failure.status + ")");
                    console.error("  > " + failure.message);
                    console.error("  > Errors: " + JSON.stringify(failure.errors));
                    console.error("");
                });
            }
            /**
             * Warn on database access failures
             */
            if (failure instanceof Failures_1.DatabaseAccessFailure) {
                console.warn("[HANDLE_FAILURE]:", "Caught database access failure", failure.code, failure.error);
            }
            /**
             * Respond with standard failure data to frontend
             */
            return res.status(failure.status).json({
                data: { errors: failure.errors },
                message: failure.message,
                status: failure.status,
                code: failure.code,
            });
        }
    }
    /**
     * In case of error pass failure
     */
    next(failure);
}
exports.handleFailure = handleFailure;
