import jwt from "jsonwebtoken";
import { env } from "~/env";
import { TDurationString } from "./validators";

export function JsonWebTokenSign(
  uuid: string,
  email: string,
  rol: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload = { uuid, email, rol };
    //validar el inicio de sesion con la clave almacenada en .env
    jwt.sign(
      payload,
      env.SECRET_JWT_SEED,
      { expiresIn: env.SECRET_JWT_SEED_EXPIRATION_TIME as TDurationString },
      (err, token) => {
        if (err || !token) {
          console.warn(err);
          reject("Error interno");
          if (!token) throw new Error("Invalid token");
        }
        resolve(token);
      }
    );
  });
}
