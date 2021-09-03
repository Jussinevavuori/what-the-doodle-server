"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawingState = void 0;
var DrawingState = /** @class */ (function () {
    function DrawingState() {
        this.state = "";
    }
    DrawingState.prototype.apply = function (serial) {
        // Get all actions in serial
        var actions = serial.split("!");
        // Ensure at least some actions exist
        if (actions.length === 0)
            return;
        // Add action delimiter
        if (this.state.length > 0 &&
            this.state.charAt(this.state.length - 1) !== "!") {
            this.state += "!";
        }
        // Add each action separately
        for (var _i = 0, actions_1 = actions; _i < actions_1.length; _i++) {
            var action = actions_1[_i];
            // Clear state on clear action
            if (action[0] === "C") {
                this.state = "";
            }
            this.state += action;
        }
    };
    return DrawingState;
}());
exports.DrawingState = DrawingState;
