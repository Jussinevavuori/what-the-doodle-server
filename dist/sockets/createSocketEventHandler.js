"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSocketEventHandler = void 0;
/**
 * Utility function to create an event handler for a socket which validates data
 * according to a zod schema and fires the onData function with correct typing
 * on valid data and onError function on invalid data.
 */
function createSocketEventHandler(args) {
    return function (raw) {
        var _a;
        var data = args.schema.safeParse(raw);
        if (data.success) {
            return args.onData(data.data);
        }
        else if ("error" in data) {
            return (_a = args.onError) === null || _a === void 0 ? void 0 : _a.call(args, data.error);
        }
    };
}
exports.createSocketEventHandler = createSocketEventHandler;
