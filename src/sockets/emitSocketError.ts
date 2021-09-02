import { Socket } from "socket.io";

export function emitSocketError(
  socket: Socket,
  message: String,
  options: {
    redirectPath?: string;
  } = {}
) {
  socket.emit(
    "error",
    JSON.stringify({
      message,
      ...options,
    })
  );
}
