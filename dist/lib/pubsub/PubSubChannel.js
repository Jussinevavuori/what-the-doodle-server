"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubChannel = void 0;
var uuid_1 = require("uuid");
var PubSubChannel = /** @class */ (function () {
    function PubSubChannel() {
        this.listeners = {};
    }
    /**
     * Subscribe to all events in this channel. The provided listener callback
     * function is fired every time an event is published and given the event
     * object as the argument.
     *
     * Returns an unsubscriber function, calling which will stop events from
     * being published to the listener function.
     */
    PubSubChannel.prototype.subscribe = function (listener) {
        var _this = this;
        var id = (0, uuid_1.v4)();
        this.listeners[id] = listener;
        return function () {
            _this.listeners[id] = undefined;
        };
    };
    /**
     * Publish an event that fires each subscribed listener function with the
     * provided event as the callback.
     *
     * @param event The event object to provide as the argument for each listener
     */
    PubSubChannel.prototype.publish = function (event) {
        Object.values(this.listeners).forEach(function (listener) {
            if (listener) {
                listener(event);
            }
        });
    };
    return PubSubChannel;
}());
exports.PubSubChannel = PubSubChannel;
