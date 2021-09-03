"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.io = exports.server = exports.http = exports.app = void 0;
var express_1 = __importDefault(require("express"));
var morgan_1 = __importDefault(require("morgan"));
var http_1 = require("http");
var env_1 = require("./env");
var initializeData_1 = require("./middleware/initializeData");
var handleFailure_1 = require("./middleware/handleFailure");
var handleErrors_1 = require("./middleware/handleErrors");
var redirect_1 = require("./lib/requests/redirect");
var createLogger_1 = require("./lib/utils/createLogger");
var corsMiddleware_1 = require("./middleware/corsMiddleware");
var rateLimiters_1 = require("./middleware/rateLimiters");
var routes_1 = require("./controllers/routes");
var socket_io_1 = require("socket.io");
var initializeSockets_1 = require("./sockets/initializeSockets");
/**
 * App logger
 */
var logger = (0, createLogger_1.createLogger)();
/**
 * The global Express application
 */
exports.app = (0, express_1.default)();
/**
 * The global HTTP server constructed from the Express application. Must
 * be started by the `startServer()` function.
 */
exports.http = (0, http_1.createServer)(exports.app);
/**
 * The start server method starts the express application, server and all
 * other global instances such as database and storage.
 */
function startServer() {
    var _this = this;
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                logger("Starting server in", env_1.ENV.env, "mode");
                // All middleware
                exports.app.options("*", (0, corsMiddleware_1.corsMiddleware)());
                exports.app.use(express_1.default.json({
                    limit: "10mb",
                    verify: function (request, _, buffer) {
                        request["rawBody"] = buffer;
                    },
                }));
                exports.app.use((0, corsMiddleware_1.corsMiddleware)());
                exports.app.use((0, initializeData_1.initializeRequestData)());
                exports.app.use(rateLimiters_1.rateLimiters.general());
                if (env_1.ENV.env !== "test") {
                    exports.app.use((0, morgan_1.default)("tiny"));
                }
                logger("Configured middleware");
                // Disable cache
                exports.app.set("etag", false);
                // Apply all API endpoints
                exports.app.use("/api", routes_1.rootRouter);
                logger("Configured endpoints");
                exports.app.use("/api/test", function (req, res) {
                    res.send("It's working! 🌈");
                });
                // Configure other endpoints to redirect user to app
                exports.app.use("/", function (req, res) {
                    (0, redirect_1.redirect)(res).toFrontend("/");
                });
                // Error handler middleware. First apply specific error handlers, then
                // generic error handler and last failure handler.
                exports.app.use(handleErrors_1.handleErrors);
                exports.app.use(handleFailure_1.handleFailure);
                // Start server, resolve when active
                logger("Starting server");
                exports.server = exports.http.listen(env_1.ENV.port, function () {
                    logger("App is listening on port " + env_1.ENV.port);
                    resolve();
                });
                // Initialize websockets
                exports.io = new socket_io_1.Server(exports.server, { cors: { origin: "*" } });
                (0, initializeSockets_1.initializeSockets)(exports.io);
                logger("Initialized websockets");
            }
            catch (error) {
                logger("An error occured while starting the server", error);
                reject(error);
            }
            return [2 /*return*/];
        });
    }); });
}
exports.startServer = startServer;
