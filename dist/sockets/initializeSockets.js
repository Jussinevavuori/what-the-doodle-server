"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSockets = void 0;
var zod_1 = require("zod");
var createSocketEventHandler_1 = require("./createSocketEventHandler");
var emitSocketError_1 = require("./emitSocketError");
var GameRoom_1 = require("../lib/game/GameRoom");
function initializeSockets(io) {
    // Initialize a socket when it connects
    io.on("connection", function (socket) {
        socket.on("@game/join", (0, createSocketEventHandler_1.createSocketEventHandler)({
            schema: zod_1.z
                .object({
                roomId: zod_1.z.string().nonempty(),
                userName: zod_1.z.string().nonempty(),
                userAvatar: zod_1.z.string().nonempty(),
                userId: zod_1.z.string().nonempty(),
            })
                .strict(),
            onData: function (data) {
                var room = GameRoom_1.GameRoom.getRoom(io, data.roomId);
                room.connectSocket(socket, {
                    id: data.userId,
                    name: data.userName,
                    avatar: data.userAvatar,
                });
            },
            onError: function (e) {
                console.log("err:@room/join", e);
                (0, emitSocketError_1.emitSocketError)(socket, "Error while joining room", {
                    redirectPath: "/",
                });
            },
        }));
    });
}
exports.initializeSockets = initializeSockets;
