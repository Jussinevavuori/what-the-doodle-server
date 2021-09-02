import { Router } from "express";

/**
 * Root router registers all subrouters
 */
export const rootRouter = Router();

rootRouter.get("/", (req, res) => {
  res.send("Working 🌈");
});
