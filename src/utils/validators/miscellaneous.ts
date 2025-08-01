import z from "zod";
import type { TArea, TPerson } from "../db";

export type ServerResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      msg: string;
    };

export const idSchema = z.object({
  _id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const UpdatePasswordSchema = z
  .object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"], // Muestra el error en este campo
    message: "Las contraseñas no coinciden",
  });

export type TUpdatePassword = z.infer<typeof UpdatePasswordSchema>;

export const GetAreasSchema = z.object({
  name: z.string(),
});

export type TGetAreas = z.infer<typeof GetAreasSchema>;

export const PersonIdSchema = z.object({
  personId: z.string(),
});

export type TPersonId = z.infer<typeof PersonIdSchema>;

export const GetUsersSchema = z.object({
  username: z.string(),
});

export type TGetUsers = z.infer<typeof GetUsersSchema>;

export const GetPersonsSchema = z.object({
  name: z.string(),
  areaId: z.string(),
});

export type TGetPersons = z.infer<typeof GetPersonsSchema>;

export const ImportExcelSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 26214400, "Max file size is 25MB.")
    .refine(
      (file) =>
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      'only excel format ("xlsx") is accepted',
    ),
});

export type TImportExcel = z.infer<typeof ImportExcelSchema>;

export interface TDecodedToken {
  uuid: string;
  email: string;
  rol: string;
}

export type TDurationString = `${number}${"s" | "m" | "h" | "d" | "y"}`;

export interface DashboardResponse {
  atendido: TPerson[];
  reposo: TPerson[];
  retirado: TPerson[];
  areas: TArea[];
}
