import { env } from "~/env";
import bcrypt from "bcrypt";
import { JsonWebTokenSign } from "~/utils/sign-jwt";
import type { ServerResult } from "~/utils/validators/miscellaneous";
import {
  loginSchema,
  UpdatePasswordSchema,
} from "~/utils/validators/miscellaneous";
import type { TSafeUser } from "~/utils/db";
import {
  InsertUserSchema,
  passwordsModel,
  UserSchema,
  usersModel,
} from "~/utils/db";
import { normalizeString } from "~/utils/normalize-string";

const saltRounds = env.HOW_MANY_HASHES;

export async function login(input: unknown): Promise<
  ServerResult<{
    token: string;
    cookieOptions: { expires: Date; httpOnly: boolean };
  }>
> {
  const loginData = await loginSchema.parseAsync(input);
  let validation = false;

  // buscamos los usuarios que coincidan con el correo colocado
  const user = await usersModel.findOne({ email: loginData.email });
  if (!user) {
    return { success: false, msg: "invalid credentials" };
  }

  const userData = await UserSchema.parseAsync({
    ...user.toJSON(),
    _id: user._id.toString(),
  });

  const pass = await passwordsModel.findById(userData.password_id);

  if (!pass?.password) {
    return { success: false, msg: "invalid credentials" };
  }

  validation = await bcrypt.compare(loginData.password, pass.password);

  if (validation) {
    try {
      const token = await JsonWebTokenSign(
        userData._id.toString(),
        userData.email,
        userData.rol,
      );

      const cookieOptions = {
        expires: new Date(
          Date.now() + env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
        ),
        httpOnly: true,
      };

      return { success: true, data: { token, cookieOptions } };
    } catch (err) {
      console.warn(err);
      return { success: false, msg: "Web Server Error" };
    }
  } else {
    return { success: false, msg: "invalid credentials" };
  }
}

export async function changePassword(
  input: unknown,
): Promise<ServerResult<{ status: "ok" }>> {
  const { password, userId } = await UpdatePasswordSchema.parseAsync(input);

  const user = await usersModel.findById(userId);
  if (!user) {
    return { success: false, msg: "user not found" };
  }

  try {
    bcrypt.hash(password, saltRounds, async function (err, hash) {
      const storedPassword = await passwordsModel.findById(user.password_id);
      if (!storedPassword) {
        throw new Error("password not found");
      }

      await storedPassword.updateOne({ password: hash });
    });
  } catch (e) {
    console.error(e);
    return { success: false, msg: "failed to update password" };
  }
  return { success: true, data: { status: "ok" } };
}

// admin function
export async function register(
  input: unknown,
): Promise<ServerResult<TSafeUser>> {
  const registerData = await InsertUserSchema.parseAsync(input);

  const user = await usersModel.findOne({ email: registerData.email });

  if (user) {
    return { success: false, msg: "user is already registered" };
  }

  const insertedUser: TSafeUser[] = [];

  bcrypt.hash(registerData.password, saltRounds, async function (err, hash) {
    const pass = new passwordsModel({ password: hash });
    await pass.save();

    const b_username = normalizeString(registerData.username);

    const hashedUserPassword = {
      username: registerData.username,
      usernameE: b_username,
      rol: "user",
      email: registerData.email,
      password_id: pass._id.toString(),
    };

    const user = await new usersModel(hashedUserPassword).save();
    await user.save();

    insertedUser.push(
      await UserSchema.parseAsync({
        ...user.toJSON(),
        _id: user._id.toString(),
      }),
    );
  });
  if (!insertedUser[0]) {
    return { success: false, msg: "failed to insert user into database" };
  }

  return { success: true, data: insertedUser[0] };
}
