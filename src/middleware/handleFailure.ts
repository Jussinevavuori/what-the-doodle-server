import { Request, Response, NextFunction } from "express";
import { ENV } from "../env";
import { DatabaseAccessFailure } from "../lib/result/Failures";
import { Failure } from "../lib/result/Result";

/**
 * Error handler middleware which handles all failures. Assumes an error
 * handler middleware has ran before this middleware and converted all
 * errors into failures.
 */
export function handleFailure(
  failure: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  /**
   * Pass if response sent
   */
  if (!res.headersSent) {
    /**
     * Act only on failures
     */
    if (failure instanceof Failure) {
      /**
       * Log failures in development
       */
      if (ENV.env === "development") {
        req.on("end", () => {
          console.error(`  > Failure: ${failure.code} (${failure.status})`);
          console.error(`  > ${failure.message}`);
          console.error(`  > Errors: ${JSON.stringify(failure.errors)}`);
          console.error(``);
        });
      }

      /**
       * Warn on database access failures
       */
      if (failure instanceof DatabaseAccessFailure) {
        console.warn(
          `[HANDLE_FAILURE]:`,
          `Caught database access failure`,
          failure.code,
          failure.error
        );
      }

      /**
       * Respond with standard failure data to frontend
       */
      return res.status(failure.status).json({
        data: { errors: failure.errors },
        message: failure.message,
        status: failure.status,
        code: failure.code,
      });
    }
  }

  /**
   * In case of error pass failure
   */
  next(failure);
}
