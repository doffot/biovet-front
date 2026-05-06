// src/types/treatment.ts
import { z } from "zod";

// ─── Constantes ───────────────────────────────────────────────────────────────

export const treatmentTypes = [
  "Antibiótico",
  "Antiinflamatorio",
  "Analgésico",
  "Suplemento",
  "Otro",
] as const;

export const routeTypes = [
  "Oral",
  "Inyectable",
  "Tópica",
  "Intravenosa",
  "Subcutánea",
  "Otro",
] as const;

export const statusTypes = [
  "Activo",
  "Completado",
  "Suspendido",
] as const;

// ─── Tipos derivados de las constantes ────────────────────────────────────────

export type TreatmentType = (typeof treatmentTypes)[number];
export type RouteType    = (typeof routeTypes)[number];
export type StatusType   = (typeof statusTypes)[number];

// ─── Helpers Zod ──────────────────────────────────────────────────────────────

// Acepta string (JSON normal) o Date (Mongoose) y lo convierte a string ISO
const dateOrString = z.union([
  z.string(),
  z.date().transform((d) => d.toISOString()),
]);

// Acepta string normal o ObjectId de Mongoose y lo convierte a string
const mongoIdOrString = z.union([
  z.string(),
  z.object({ toString: z.function() }).transform((v) => String(v)),
]);

// ─── Schema principal ─────────────────────────────────────────────────────────

export const treatmentSchema = z.object({
  _id:             mongoIdOrString,
  patientId:       mongoIdOrString,
  veterinarianId:  mongoIdOrString,
  productId:       mongoIdOrString.optional().nullable(),

  treatmentType:      z.enum(treatmentTypes),
  treatmentTypeOther: z.string().optional().nullable(),

  productName: z.string(),
  dose:        z.string(),
  frequency:   z.string(),
  duration:    z.string(),

  route:      z.enum(routeTypes),
  routeOther: z.string().optional().nullable(),

  cost: z.number(),

  startDate: dateOrString,
  endDate:   dateOrString.optional().nullable(),

  observations: z.string().optional().nullable(),
  status:       z.enum(statusTypes),

  createdAt: dateOrString,
  updatedAt: dateOrString,
});

export const treatmentsListSchema = z.array(treatmentSchema);

// ─── Tipo inferido del schema ─────────────────────────────────────────────────

export type Treatment = z.infer<typeof treatmentSchema>;

// ─── Tipo del formulario ──────────────────────────────────────────────────────

export type TreatmentFormData = {
  treatmentType:      TreatmentType;
  treatmentTypeOther?: string;
  productName: string;
  dose:        string;
  frequency:   string;
  duration:    string;
  route:      RouteType;
  routeOther?: string;
  cost:        number;
  startDate:   string;
  endDate?:    string;
  observations?: string;
  status:      StatusType;
  productId?:  string;
  quantity?:   number;
  isFullUnit?: boolean;
};