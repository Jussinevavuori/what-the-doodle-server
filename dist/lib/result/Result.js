"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Failure = exports.Success = void 0;
/**
 * Success implementation
 */
var Success = /** @class */ (function () {
    function Success(value) {
        this.resultType = "success";
        this.value = value;
    }
    /**
     * A success will return the success value and will not consider the
     * fallback value.
     */
    Success.prototype.getOr = function (fallback) {
        return this.value;
    };
    /**
     * A success is always a success.
     */
    Success.prototype.isSuccess = function () {
        return true;
    };
    /**
     * A success is never a failure.
     */
    Success.prototype.isFailure = function () {
        return false;
    };
    /**
     * Shorthand `Success.Empty()` instead of `new Success<void>(undefined)` for
     * signaling successes which do not contain a value.
     */
    Success.Empty = function () {
        return new Success(undefined);
    };
    return Success;
}());
exports.Success = Success;
/**
 * Failure implementation
 */
var Failure = /** @class */ (function () {
    function Failure(details) {
        /**
         * A fialure is always a failure.
         */
        this.resultType = "failure";
        this.details = details;
        this.code = details.code;
        this.message = details.message;
        this.status = details.status;
        this.errors = details.errors;
    }
    /**
     * A failure will always provide the fallback value as it has no real value.
     */
    Failure.prototype.getOr = function (fallbackValue) {
        return fallbackValue;
    };
    /**
     * A failure is never a success.
     */
    Failure.prototype.isSuccess = function () {
        return false;
    };
    /**
     * A failure is always a failure.
     */
    Failure.prototype.isFailure = function () {
        return true;
    };
    /**
     * Chainable method for updating the failure's message.
     */
    Failure.prototype.withMessage = function (message) {
        this.details.message = message;
        this.message = message;
        return this;
    };
    /**
     * Chainable method for updating the failure's status code.
     */
    Failure.prototype.withStatus = function (status) {
        this.details.status = status;
        this.status = status;
        return this;
    };
    return Failure;
}());
exports.Failure = Failure;
