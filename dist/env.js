"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = exports.configureEnvironment = void 0;
/**
 * Function to configure the environment
 */
function configureEnvironment(options) {
    if (options === void 0) { options = {}; }
    var env = process.env.NODE_ENV;
    // Handle skipping in production
    if (options.skipInProduction && env === "production") {
        return;
    }
    // Try configuring
    try {
        var dotenv = require("dotenv");
        var path = !env || env === "production" ? ".env" : ".env." + env;
        dotenv.config({ path: path });
    }
    catch (e) {
        console.warn("An error occured while configuring environment", e);
    }
}
exports.configureEnvironment = configureEnvironment;
/**
 * Object which contains all configuration values.
 */
exports.ENV = {
    /**
     * Host names
     */
    hosts: {
        get client() {
            return ENV_STR("HOSTS_CLIENT");
        },
        get server() {
            return ENV_STR("HOSTS_SERVER");
        },
    },
    /**
     * Application port
     */
    get port() {
        return ENV_NUM("PORT") || 8080;
    },
    /**
     * Application environment
     */
    get env() {
        return ENV_STR("NODE_ENV");
    },
};
/**
 * Helper function for fetching environment variables from process.env and
 * parsing it as a number.
 */
function ENV_NUM(variable) {
    return Number(process.env[variable] || "");
}
/**
 * Helper function for fetching environment variables from process.env and
 * leaving it as is as a string.
 */
function ENV_STR(variable) {
    return process.env[variable] || "";
}
/**
 * Helper function for fetching environment variables from process.env and
 * parsing it as an array of strings, separated by the specified delimiter.
 * The default delimiter is ";"
 */
function ENV_ARRAY(variable, delimiter) {
    if (delimiter === void 0) { delimiter = ";"; }
    return (process.env[variable] || "").split(delimiter);
}
