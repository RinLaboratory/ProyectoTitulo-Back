import mongoose from "mongoose";
import z from "zod";

export const UserSchema = z.object({
  _id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  username: z.string(),
  usernameE: z.string(),
  email: z.string().email(),
  password_id: z.string(),
  rol: z.string(),
});

export type TSafeUser = z.infer<typeof UserSchema>;

export const InsertUserSchema = UserSchema.pick({
  email: true,
  username: true,
})
  .extend({
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"], // Muestra el error en este campo
    message: "Las contraseñas no coinciden",
  });

export type TInsertUser = z.infer<typeof InsertUserSchema>;

export const UpdateUserSchema = UserSchema.extend({
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"], // Muestra el error en este campo
  message: "Las contraseñas no coinciden",
});

export type TUpdateUser = z.infer<typeof UpdateUserSchema>;

const dbUserSchema = new mongoose.Schema({
  username: String,
  usernameE: String,
  email: String,
  password_id: String,
  rol: String,
});

dbUserSchema.index({ usernameE: "text" });
export const usersModel = mongoose.model("usuarios", dbUserSchema);
