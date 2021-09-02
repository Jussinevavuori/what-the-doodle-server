import { Socket } from "socket.io";

/**
 * Utility function to send socket errors. Provides typing and handles correct
 * shape of error message.
 */
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
