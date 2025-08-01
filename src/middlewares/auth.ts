import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "~/env";
import { UserSchema, usersModel } from "~/utils/db";
import type { TDecodedToken } from "~/utils/validators";

export async function authenticationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const cookie = req.headers.cookie
    ?.split(";")
    .filter((c) => !c.trim().startsWith("__next_hmr_refresh_hash__="))
    .join(";");

  if (cookie) {
    const [_name, token] = cookie.trim().split("=");
    if (!token) return res.status(401).send("unauthorized");

    const { uuid } = jwt.verify(token, env.SECRET_JWT_SEED) as TDecodedToken;
    const user = await usersModel.findById(uuid);
    if (!user) return res.status(401).send("unauthorized");
    const userData = await UserSchema.parseAsync({
      ...user.toJSON(),
      _id: user._id.toString(),
    });

    req.user = {
      id: userData._id,
      email: userData.email,
      role: userData.rol,
    };
  }

  if (env.NODE_ENV === "development") {
    console.log("session:", req.user);
  }
  next();
}

export const checkUserMiddleware =
  () => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    next();
  };

export const checkAdminMiddleware =
  () => (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== "*") {
      return res.status(401).send("Unauthorized");
    }
    next();
  };
