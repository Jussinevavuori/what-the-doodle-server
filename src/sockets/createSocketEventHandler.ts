import { z, ZodError } from "zod";

/**
 * Utility function to create an event handler for a socket which validates data
 * according to a zod schema and fires the onData function with correct typing
 * on valid data and onError function on invalid data.
 */
export function createSocketEventHandler<T>(args: {
  schema: z.Schema<T>;
  onData: (t: T) => void;
  onError?: (e: ZodError<T>) => void;
}) {
  return (raw: string) => {
    const data = args.schema.safeParse(raw);
    if (data.success) {
      return args.onData(data.data);
    } else if ("error" in data) {
      return args.onError?.(data.error);
    }
  };
}
