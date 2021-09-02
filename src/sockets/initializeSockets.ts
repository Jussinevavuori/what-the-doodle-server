import { Server as SocketIoServer } from "socket.io";
import { z } from "zod";
import { createSocketEventHandler } from "./createSocketEventHandler";
import { emitSocketError } from "./emitSocketError";
import { GameRoom } from "../lib/game/GameRoom";

export function initializeSockets(io: SocketIoServer) {
  // Initialize a socket when it connects
  io.on("connection", (socket) => {
    socket.on(
      "@game/join",
      createSocketEventHandler({
        schema: z
          .object({
            roomId: z.string().nonempty(),
            userName: z.string().nonempty(),
            userAvatar: z.string().nonempty(),
            userId: z.string().nonempty(),
          })
          .strict(),
        onData(data) {
          const room = GameRoom.getRoom(io, data.roomId);
          room.connectSocket(socket, {
            id: data.userId,
            name: data.userName,
            avatar: data.userAvatar,
          });
        },
        onError: (e: any) => {
          console.log("err:@room/join", e);
          emitSocketError(socket, "Error while joining room", {
            redirectPath: "/",
          });
        },
      })
    );
  });
}
