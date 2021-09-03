"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOr = void 0;
var validate_1 = require("./validate");
/**
 * Validate data against a schema and upon failure return the provided
 * default value.
 */
function validateOr(data, schema, defaultValue) {
    var validated = (0, validate_1.validate)(data, schema);
    if (validated.isSuccess()) {
        return validated.value;
    }
    else {
        return defaultValue;
    }
}
exports.validateOr = validateOr;
