"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.CorsFailure = exports.UnknownFailure = exports.ErrorFailure = exports.UnimplementedFailure = exports.ValidationFailure = exports.DatabaseAccessFailure = exports.MailErrorFailure = exports.EmailAlreadyConfirmedFailure = exports.EmailNotConfirmedFailure = exports.UserAlreadyExistsFailure = exports.UserNotFoundFailure = exports.UnauthorizedFailure = exports.UnauthenticatedFailure = exports.InvalidCredentialsFailure = exports.UserHasNoPasswordFailure = exports.TokenFailure = exports.InvalidTokenFailure = exports.MissingTokenFailure = exports.MissingQueryParametersFailure = exports.MissingUrlParametersFailure = exports.TooManyRequestsFailure = exports.InvalidRequestDataFailure = exports.ServerInitializationFailure = void 0;
var Result_1 = require("./Result");
var ServerInitializationFailure = /** @class */ (function (_super) {
    __extends(ServerInitializationFailure, _super);
    function ServerInitializationFailure(message) {
        if (message === void 0) { message = "Failed to properly initialize server"; }
        return _super.call(this, {
            code: "server/initialization-failure",
            message: message,
            status: 500,
        }) || this;
    }
    return ServerInitializationFailure;
}(Result_1.Failure));
exports.ServerInitializationFailure = ServerInitializationFailure;
var InvalidRequestDataFailure = /** @class */ (function (_super) {
    __extends(InvalidRequestDataFailure, _super);
    function InvalidRequestDataFailure(errors) {
        return _super.call(this, {
            code: "request/invalid-request-data",
            message: "Invalid request data",
            status: 400,
            errors: errors,
        }) || this;
    }
    return InvalidRequestDataFailure;
}(Result_1.Failure));
exports.InvalidRequestDataFailure = InvalidRequestDataFailure;
var TooManyRequestsFailure = /** @class */ (function (_super) {
    __extends(TooManyRequestsFailure, _super);
    function TooManyRequestsFailure() {
        return _super.call(this, {
            code: "request/too-many-requests",
            status: 529,
            message: "Too many requests, please try again later.",
        }) || this;
    }
    return TooManyRequestsFailure;
}(Result_1.Failure));
exports.TooManyRequestsFailure = TooManyRequestsFailure;
var MissingUrlParametersFailure = /** @class */ (function (_super) {
    __extends(MissingUrlParametersFailure, _super);
    function MissingUrlParametersFailure(missingValues) {
        var _this = _super.call(this, {
            code: "request/missing-url-parameters",
            message: "Missing url parameters: " + missingValues.join(", "),
            status: 400,
            errors: missingValues.reduce(function (e, v) {
                var _a;
                return (__assign(__assign({}, e), (_a = {}, _a[v] = "missing", _a)));
            }, {}),
        }) || this;
        _this.missingValues = missingValues;
        return _this;
    }
    return MissingUrlParametersFailure;
}(Result_1.Failure));
exports.MissingUrlParametersFailure = MissingUrlParametersFailure;
var MissingQueryParametersFailure = /** @class */ (function (_super) {
    __extends(MissingQueryParametersFailure, _super);
    function MissingQueryParametersFailure(missingValues) {
        var _this = _super.call(this, {
            code: "request/missing-query-parameters",
            message: "Missing query parameters: " + missingValues.join(", "),
            status: 400,
            errors: missingValues.reduce(function (e, v) {
                var _a;
                return (__assign(__assign({}, e), (_a = {}, _a[v] = "missing", _a)));
            }, {}),
        }) || this;
        _this.missingValues = missingValues;
        return _this;
    }
    return MissingQueryParametersFailure;
}(Result_1.Failure));
exports.MissingQueryParametersFailure = MissingQueryParametersFailure;
var MissingTokenFailure = /** @class */ (function (_super) {
    __extends(MissingTokenFailure, _super);
    function MissingTokenFailure() {
        return _super.call(this, {
            code: "auth/missing-token",
            status: 401,
            message: "Token is missing in request",
        }) || this;
    }
    return MissingTokenFailure;
}(Result_1.Failure));
exports.MissingTokenFailure = MissingTokenFailure;
var InvalidTokenFailure = /** @class */ (function (_super) {
    __extends(InvalidTokenFailure, _super);
    function InvalidTokenFailure() {
        return _super.call(this, {
            code: "auth/invalid-token",
            status: 400,
            message: "Token is invalid",
        }) || this;
    }
    return InvalidTokenFailure;
}(Result_1.Failure));
exports.InvalidTokenFailure = InvalidTokenFailure;
var TokenFailure = /** @class */ (function (_super) {
    __extends(TokenFailure, _super);
    function TokenFailure() {
        return _super.call(this, {
            code: "auth/token",
            status: 400,
            message: "Token failure",
        }) || this;
    }
    return TokenFailure;
}(Result_1.Failure));
exports.TokenFailure = TokenFailure;
var UserHasNoPasswordFailure = /** @class */ (function (_super) {
    __extends(UserHasNoPasswordFailure, _super);
    function UserHasNoPasswordFailure() {
        return _super.call(this, {
            code: "auth/user-has-no-password",
            status: 400,
            message: "User has no password",
        }) || this;
    }
    return UserHasNoPasswordFailure;
}(Result_1.Failure));
exports.UserHasNoPasswordFailure = UserHasNoPasswordFailure;
var InvalidCredentialsFailure = /** @class */ (function (_super) {
    __extends(InvalidCredentialsFailure, _super);
    function InvalidCredentialsFailure() {
        return _super.call(this, {
            code: "auth/invalid-credentials",
            status: 400,
            message: "Invalid credentials",
        }) || this;
    }
    return InvalidCredentialsFailure;
}(Result_1.Failure));
exports.InvalidCredentialsFailure = InvalidCredentialsFailure;
var UnauthenticatedFailure = /** @class */ (function (_super) {
    __extends(UnauthenticatedFailure, _super);
    function UnauthenticatedFailure() {
        return _super.call(this, {
            code: "auth/unauthenticated",
            status: 401,
            message: "Unauthenticated request",
        }) || this;
    }
    return UnauthenticatedFailure;
}(Result_1.Failure));
exports.UnauthenticatedFailure = UnauthenticatedFailure;
var UnauthorizedFailure = /** @class */ (function (_super) {
    __extends(UnauthorizedFailure, _super);
    function UnauthorizedFailure() {
        return _super.call(this, {
            code: "auth/unauthorized",
            status: 401,
            message: "Unauthorized request",
        }) || this;
    }
    return UnauthorizedFailure;
}(Result_1.Failure));
exports.UnauthorizedFailure = UnauthorizedFailure;
var UserNotFoundFailure = /** @class */ (function (_super) {
    __extends(UserNotFoundFailure, _super);
    function UserNotFoundFailure() {
        return _super.call(this, {
            code: "auth/user-not-found",
            status: 404,
            message: "User not found",
        }) || this;
    }
    return UserNotFoundFailure;
}(Result_1.Failure));
exports.UserNotFoundFailure = UserNotFoundFailure;
var UserAlreadyExistsFailure = /** @class */ (function (_super) {
    __extends(UserAlreadyExistsFailure, _super);
    function UserAlreadyExistsFailure() {
        return _super.call(this, {
            code: "auth/user-already-exists",
            status: 400,
            message: "User already exists",
        }) || this;
    }
    return UserAlreadyExistsFailure;
}(Result_1.Failure));
exports.UserAlreadyExistsFailure = UserAlreadyExistsFailure;
var EmailNotConfirmedFailure = /** @class */ (function (_super) {
    __extends(EmailNotConfirmedFailure, _super);
    function EmailNotConfirmedFailure() {
        return _super.call(this, {
            code: "auth/email-not-confirmed",
            status: 400,
            message: "Email not confirmed",
        }) || this;
    }
    return EmailNotConfirmedFailure;
}(Result_1.Failure));
exports.EmailNotConfirmedFailure = EmailNotConfirmedFailure;
var EmailAlreadyConfirmedFailure = /** @class */ (function (_super) {
    __extends(EmailAlreadyConfirmedFailure, _super);
    function EmailAlreadyConfirmedFailure() {
        return _super.call(this, {
            code: "auth/email-already-confirmed",
            status: 400,
            message: "Email not confirmed",
        }) || this;
    }
    return EmailAlreadyConfirmedFailure;
}(Result_1.Failure));
exports.EmailAlreadyConfirmedFailure = EmailAlreadyConfirmedFailure;
var MailErrorFailure = /** @class */ (function (_super) {
    __extends(MailErrorFailure, _super);
    function MailErrorFailure() {
        return _super.call(this, { code: "mail/error", status: 500, message: "Mail error" }) || this;
    }
    return MailErrorFailure;
}(Result_1.Failure));
exports.MailErrorFailure = MailErrorFailure;
var DatabaseAccessFailure = /** @class */ (function (_super) {
    __extends(DatabaseAccessFailure, _super);
    function DatabaseAccessFailure(error) {
        var _this = _super.call(this, {
            code: "database/access-failure",
            status: 500,
            message: "Database access failure",
        }) || this;
        _this.error = error;
        return _this;
    }
    return DatabaseAccessFailure;
}(Result_1.Failure));
exports.DatabaseAccessFailure = DatabaseAccessFailure;
var ValidationFailure = /** @class */ (function (_super) {
    __extends(ValidationFailure, _super);
    function ValidationFailure(errors) {
        return _super.call(this, {
            code: "failure/validation",
            status: 500,
            message: "Unknown validation failure",
            errors: errors,
        }) || this;
    }
    return ValidationFailure;
}(Result_1.Failure));
exports.ValidationFailure = ValidationFailure;
var UnimplementedFailure = /** @class */ (function (_super) {
    __extends(UnimplementedFailure, _super);
    function UnimplementedFailure() {
        return _super.call(this, {
            code: "failure/unimplemented",
            status: 500,
            message: "Unimplemented feature",
        }) || this;
    }
    return UnimplementedFailure;
}(Result_1.Failure));
exports.UnimplementedFailure = UnimplementedFailure;
var ErrorFailure = /** @class */ (function (_super) {
    __extends(ErrorFailure, _super);
    function ErrorFailure(error) {
        var _this = _super.call(this, {
            code: "failure/error",
            message: error.message,
            status: 500,
        }) || this;
        _this.error = error;
        return _this;
    }
    return ErrorFailure;
}(Result_1.Failure));
exports.ErrorFailure = ErrorFailure;
var UnknownFailure = /** @class */ (function (_super) {
    __extends(UnknownFailure, _super);
    function UnknownFailure() {
        return _super.call(this, { code: "failure/unknown", status: 500, message: "Unknown failure" }) || this;
    }
    return UnknownFailure;
}(Result_1.Failure));
exports.UnknownFailure = UnknownFailure;
var CorsFailure = /** @class */ (function (_super) {
    __extends(CorsFailure, _super);
    function CorsFailure() {
        return _super.call(this, { code: "failure/cors", status: 400, message: "Cors failure" }) || this;
    }
    return CorsFailure;
}(Result_1.Failure));
exports.CorsFailure = CorsFailure;
