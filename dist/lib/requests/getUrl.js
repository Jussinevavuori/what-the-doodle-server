"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUrl = void 0;
var env_1 = require("../../env");
/**
 * Utility function for removing a trailing slash.
 */
function removeTrailingSlash(url) {
    return url.endsWith("/") ? url.slice(0, -1) : url;
}
/**
 * Utility function for removing a leading slash.
 */
function removeLeadingSlash(url) {
    return url.startsWith("/") ? url.slice(1) : url;
}
/**
 * Utility function for constructing a query string from a query object.
 */
function constructQuery(query) {
    if (!query)
        return "";
    return ("?" +
        Object.entries(query)
            .filter(function (entry) { return !!entry[1]; })
            .map(function (entry) { return entry[0] + "=" + entry[1]; })
            .join("&"));
}
/**
 * Utility function for getting a URL to the server or to the frontend.
 */
exports.getUrl = {
    /**
     * Get a server endpoint based on a path and a query.
     */
    toServer: function (path, query) {
        if (path === void 0) { path = "/"; }
        if (query === void 0) { query = {}; }
        return [
            removeTrailingSlash(env_1.ENV.hosts.server),
            removeLeadingSlash(path),
            constructQuery(query),
        ].join("/");
    },
    /**
     * Get a client endpoint based on a path and a query.
     */
    toFrontend: function (path, query) {
        if (path === void 0) { path = "/"; }
        if (query === void 0) { query = {}; }
        return [
            removeTrailingSlash(env_1.ENV.hosts.client),
            removeLeadingSlash(path),
            constructQuery(query),
        ].join("/");
    },
};
