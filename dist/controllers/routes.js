"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootRouter = void 0;
var express_1 = require("express");
/**
 * Root router registers all subrouters
 */
exports.rootRouter = (0, express_1.Router)();
exports.rootRouter.get("/", function (req, res) {
    res.send("Working 🌈");
});
