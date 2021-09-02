import { z, ZodError } from "zod";

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
