import express from "express";
import morgan from "morgan";
import { createServer, Server } from "http";
import { ENV } from "./env";
import { initializeRequestData } from "./middleware/initializeData";
import { handleFailure } from "./middleware/handleFailure";
import { handleErrors } from "./middleware/handleErrors";
import { redirect } from "./lib/requests/redirect";
import { createLogger } from "./lib/utils/createLogger";
import { corsMiddleware } from "./middleware/corsMiddleware";
import { rateLimiters } from "./middleware/rateLimiters";
import { rootRouter } from "./controllers/routes";
import { Server as SocketIoServer } from "socket.io";
import { initializeSockets } from "./sockets/initializeSockets";
import { GameState } from "./lib/game/GameState";

/**
 * App logger
 */
const logger = createLogger();

/**
 * The global Express application
 */
export const app: express.Application = express();

/**
 * The global HTTP server constructed from the Express application. Must
 * be started by the `startServer()` function.
 */
export const http = createServer(app);

/**
 * The global server instance. Must be provided by the `startServer()` function.
 */
export let server: Server;

/**
 * Websocket instance
 */
export let io: SocketIoServer;

/**
 * The start server method starts the express application, server and all
 * other global instances such as database and storage.
 */
export function startServer() {
  return new Promise<void>(async (resolve, reject) => {
    try {
      logger("Starting server in", ENV.env, "mode");

      // All middleware
      app.options("*", corsMiddleware());
      app.use(
        express.json({
          limit: "10mb",
          verify(request, _, buffer) {
            (request as any)["rawBody"] = buffer;
          },
        })
      );
      app.use(corsMiddleware());
      app.use(initializeRequestData());
      app.use(rateLimiters.general());
      if (ENV.env !== "test") {
        app.use(morgan("tiny"));
      }
      logger("Configured middleware");

      // Disable cache
      app.set("etag", false);

      // Apply all API endpoints
      app.use("/api", rootRouter);
      logger("Configured endpoints");

      // Configure other endpoints to redirect user to app
      app.use("/", (req, res) => {
        redirect(res).toFrontend("/");
      });

      // Error handler middleware. First apply specific error handlers, then
      // generic error handler and last failure handler.
      app.use(handleErrors);
      app.use(handleFailure);

      // Start server, resolve when active
      logger("Starting server");
      server = http.listen(ENV.port, function () {
        logger(`App is listening on port ${ENV.port}`);
        resolve();
      });

      // Initialize websockets
      io = new SocketIoServer(server, { cors: { origin: "*" } });
      initializeSockets(io);
      logger("Initialized websockets");
    } catch (error) {
      logger("An error occured while starting the server", error);
      reject(error);
    }
  });
}
