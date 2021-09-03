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
exports.validate = void 0;
var Failures_1 = require("../result/Failures");
var Result_1 = require("../result/Result");
/**
 * Validate data against a schema and return either the parsed / validated
 * value in a success or a validation failure.
 */
function validate(data, schema) {
    var parsed = schema.safeParse(data);
    if (parsed.success) {
        return new Result_1.Success(parsed.data);
    }
    return new Failures_1.ValidationFailure(("error" in parsed ? parsed.error.errors : []).reduce(function (errors, next) {
        var _a;
        var path = next.path.join(".");
        var msg = next.message + " <" + next.code + ">";
        return __assign(__assign({}, errors), (_a = {}, _a[path] = msg, _a));
    }, {}));
}
exports.validate = validate;
