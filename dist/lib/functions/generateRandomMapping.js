"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomMapping = void 0;
var createIndexArray_1 = require("./createIndexArray");
var shuffle_1 = require("./shuffle");
function generateRandomMapping(n, isRestrictedState) {
    var isValidMapping = function (mapping) {
        if (mapping.length !== n) {
            return false;
        }
        for (var i = 0; i < mapping.length; i++) {
            if (isRestrictedState(i, mapping[i])) {
                return false;
            }
        }
        return true;
    };
    var attempt = 0;
    while (true) {
        var mapping = (0, shuffle_1.shuffle)((0, createIndexArray_1.createIndexArray)(n));
        if (isValidMapping(mapping)) {
            return mapping;
        }
    }
}
exports.generateRandomMapping = generateRandomMapping;
