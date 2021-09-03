"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuery = void 0;
var validateOr_1 = require("../validation/validateOr");
/**
 * Utility function for getting all query parameters from a request and
 * validating them against a schema. All query parameters should be marked
 * as optional in the schema.
 */
function getQuery(request, schema) {
    return (0, validateOr_1.validateOr)(request.query, schema, {});
}
exports.getQuery = getQuery;
