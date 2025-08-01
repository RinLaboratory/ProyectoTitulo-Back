import { env } from "~/env";
import type { TSafeUser } from "~/utils/db";
import {
  passwordsModel,
  UpdateUserSchema,
  UserSchema,
  usersModel,
} from "~/utils/db";
import { normalizeString } from "~/utils/normalize-string";
import type { ServerResult } from "~/utils/validators";
import { GetUsersSchema, idSchema } from "~/utils/validators";
import bcrypt from "bcrypt";

const saltRounds = env.HOW_MANY_HASHES;

export async function getCurrentUser(
  input: unknown,
): Promise<ServerResult<TSafeUser>> {
  const { _id } = await idSchema.parseAsync(input);

  const user = await usersModel.findById(_id);

  return {
    success: true,
    data: await UserSchema.parseAsync({
      ...user?.toJSON(),
      _id: user?._id.toString(),
    }),
  };
}

// admin
export async function getUsers(
  input: unknown,
): Promise<ServerResult<TSafeUser[]>> {
  const { username } = await GetUsersSchema.parseAsync(input);
  const normalizedUsername = normalizeString(username);
  const nameRegex = new RegExp(normalizedUsername);

  const users = await usersModel
    .find({
      $or: [{ usernameE: nameRegex }, { email: nameRegex }],
    })
    .then((value) =>
      value.map((user) =>
        UserSchema.parse({ ...user.toJSON(), _id: user._id.toString() }),
      ),
    );

  return { success: true, data: users };
}

// admin
export async function editUser(
  input: unknown,
): Promise<ServerResult<TSafeUser>> {
  const updatedUser = await UpdateUserSchema.parseAsync(input);
  try {
    if (updatedUser.password) {
      bcrypt.hash(updatedUser.password, saltRounds, async function (err, hash) {
        const pass = await passwordsModel.findById(updatedUser.password_id);
        if (!pass) {
          throw new Error("Password not found");
        }

        if (updatedUser.password?.length !== 0) {
          await pass.updateOne({ password: hash });
        }
      });
    }

    const filteredData = {
      username: updatedUser.username,
      usernameE: normalizeString(updatedUser.username),
      email: updatedUser.email,
      password_id: updatedUser.password_id,
      rol: updatedUser.rol,
    };

    const existingUser = await usersModel.findById(updatedUser._id);
    if (!existingUser) {
      return { success: false, msg: "user does not exist" };
    }

    await existingUser.updateOne(filteredData);

    return {
      success: true,
      data: await UserSchema.parseAsync({
        ...existingUser.toJSON(),
        ...filteredData,
        _id: existingUser._id.toString(),
      }),
    };
  } catch {
    return {
      success: false,
      msg: "failed to update user",
    };
  }
}

// admin
export async function deleteUser(
  input: unknown,
  userData: unknown,
): Promise<ServerResult<TSafeUser>> {
  const markedUser = await UserSchema.parseAsync(input);
  const { _id: currentUserId } = await idSchema.parseAsync(userData);

  try {
    const user = await usersModel.findById(markedUser._id);
    if (!user) {
      return { success: false, msg: "user does not exist" };
    }

    if (user.rol === "*" || currentUserId === user._id.toString()) {
      return { success: false, msg: "you can not delete another admin" };
    }

    await usersModel.deleteOne({ _id: markedUser._id });
    await passwordsModel.deleteOne({ _id: markedUser.password_id });

    return { success: true, data: markedUser };
  } catch {
    return { success: false, msg: "failed to delete user from database" };
  }
}
