import mongoose from "mongoose";
import z from "zod";

export const PersonSchema = z.object({
  _id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  rut: z.string(),
  name: z.string(),
  nameE: z.string(),
  lastname: z.string(),
  lastnameE: z.string(),
  phone: z.string(),
  insurance: z.string(),
  address: z.string(),
  bloodType: z.string(),
  areaId: z.string(),
  Rname: z.string(),
  Rlastname: z.string(),
  Rphone: z.string(),
  EmergencyContact: z.string(),
});

export type TPerson = z.infer<typeof PersonSchema>;

export const InsertPersonSchema = PersonSchema.pick({
  rut: true,
  name: true,
  lastname: true,
  phone: true,
  insurance: true,
  address: true,
  bloodType: true,
  areaId: true,
  Rname: true,
  Rlastname: true,
  Rphone: true,
  EmergencyContact: true,
});

export type TInsertPerson = z.infer<typeof InsertPersonSchema>;

export interface TImportPerson {
  rut: string;
  nombres: string;
  apellidos: string;
  "telefono casa": string;
  "seguro medico": string;
  "direccion casa": string;
  "grupo sanguineo": string;
  "curso/area": string;
  "nombres apoderado": string;
  "apellido apoderado": string;
  "telefono apoderado": string;
  "contacto de emergencia": string;
}

const dbPersonSchema = new mongoose.Schema({
  rut: String,
  name: String,
  nameE: String,
  lastname: String,
  lastnameE: String,
  phone: String,
  insurance: String,
  address: String,
  bloodType: String,
  areaId: String,
  Rname: String,
  Rlastname: String,
  Rphone: String,
  EmergencyContact: String,
});

dbPersonSchema.index({ nameE: "text" });
export const personsModel = mongoose.model("person", dbPersonSchema);
