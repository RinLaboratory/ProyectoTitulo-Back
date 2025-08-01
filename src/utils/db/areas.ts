import mongoose from "mongoose";
import z from "zod";

export const AreaSchema = z.object({
  _id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  value: z.string(),
  label: z.string(),
  nextId: z.string(),
  isClass: z.boolean(),
});

export type TArea = z.infer<typeof AreaSchema>;

export const InsertAreaSchema = AreaSchema.pick({
  label: true,
  value: true,
  isClass: true,
  nextId: true,
});

export type TInsertArea = z.infer<typeof InsertAreaSchema>;

const dbAreaSchema = new mongoose.Schema({
  value: String,
  label: String,
  nextId: String,
  isClass: Boolean,
});

dbAreaSchema.index({ label: "text" });
export const areasModel = mongoose.model("area", dbAreaSchema);
