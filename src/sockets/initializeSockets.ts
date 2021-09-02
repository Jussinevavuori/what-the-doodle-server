import { Server as SocketIoServer } from "socket.io";
import { z } from "zod";
import { createSocketEventHandler } from "./createSocketEventHandler";
import { GameRoom } from "./GameRoom";

export function initializeSockets(io: SocketIoServer) {
  // All rooms
  const rooms: Record<string, GameRoom> = {};

  // Initialize a socket when it connects
  io.on("connection", (socket) => {
    console.log(`A user connected (${socket.id})`);

    // Allow user's to join rooms
    socket.on(
      "@room/join",
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
          // Get room or create new
          if (!rooms[data.roomId]) {
            rooms[data.roomId] = new GameRoom(io, data.roomId);
          }
          const room = rooms[data.roomId];

          // Join room as socket and initialize socket to room
          socket.join(data.roomId);
          room.connectSocket(socket, data.userId);
          room.addPlayer(socket, {
            id: data.userId,
            name: data.userName,
            avatar: data.userAvatar,
          });
          room.updateStateToAll();
        },
        onError: (e: any) => console.log("err:@room/join", e),
      })
    );
  });
}
