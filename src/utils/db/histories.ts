import mongoose from "mongoose";
import z from "zod";

export const HistorySentSchema = z.enum(["Clase", "Casa", "Urgencias", ""]);

export type THistorySent = z.infer<typeof HistorySentSchema>;

export const HistorySchema = z.object({
  _id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  personId: z.string(),
  timestamp: z.date(),
  sintomas: z.string(),
  tratamiento: z.string(),
  enviado: HistorySentSchema,
});

export type THistory = z.infer<typeof HistorySchema>;

export const InsertHistorySchema = HistorySchema.pick({
  enviado: true,
  sintomas: true,
  tratamiento: true,
  personId: true,
  timestamp: true,
});

export type TInsertHistory = z.infer<typeof InsertHistorySchema>;

const dbHistorySchema = new mongoose.Schema({
  personId: String,
  timestamp: Date,
  sintomas: String,
  tratamiento: String,
  enviado: String,
});

dbHistorySchema.index({ personId: "text" });
export const historiesModel = mongoose.model("history", dbHistorySchema);
