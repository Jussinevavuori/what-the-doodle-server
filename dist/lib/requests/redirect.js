"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirect = void 0;
var getUrl_1 = require("./getUrl");
/**
 * Utility function for redirecting a response to either a server or a client
 * endpoint.
 */
function redirect(response) {
    return {
        /**
         * Redirect to a server endpoint.
         */
        toServer: function (path) {
            if (path === void 0) { path = "/"; }
            return response.redirect(getUrl_1.getUrl.toServer(path));
        },
        /**
         * Redirect to a client endpoint.
         */
        toFrontend: function (path) {
            if (path === void 0) { path = "/"; }
            /**
             * While testing, do not redirect, only return redirection status.
             */
            if (process.env.NODE_ENV === "test") {
                return response.status(302).end();
            }
            return response.redirect(getUrl_1.getUrl.toFrontend(path));
        },
    };
}
exports.redirect = redirect;
