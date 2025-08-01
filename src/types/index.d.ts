import type { Request as ExpressRequest } from "express";
import type { IncomingMessage as HttpIncomingMessage } from "http";

declare module "express" {
  interface Request extends ExpressRequest {
    session?: Session;
    user?: { id?: string; email?: string; role?: string };
  }
}

declare module "http" {
  interface IncomingMessage extends HttpIncomingMessage {
    session?: Session;
    user?: Session["user"];
  }
}
