declare namespace Express {
  export interface Request {
    /**
     * Raw request body
     */
    rawBody: Buffer;

    /**
     * Contains all application specific data that has been assigned and parsed
     * to the request by this application.
     */
    data: {};
  }
}
