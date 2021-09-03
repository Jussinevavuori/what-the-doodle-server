"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unique = void 0;
/**
 * Return array with only unique values. The function can be provided a custom
 * equality function to determine which items are considered equal. Defaults to
 * the "===" comparison.
 */
function unique(arr, eq) {
    if (eq === void 0) { eq = function (a, b) { return a === b; }; }
    return arr.filter(function (a, i) { return arr.findIndex(function (b) { return eq(a, b); }) === i; });
}
exports.unique = unique;
