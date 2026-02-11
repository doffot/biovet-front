// src/types/treatment.ts
import { z } from "zod";

export const treatmentSchema = z.object({
  _id: z.string(),
  patientId: z.string(),
  veterinarianId: z.string(),
  productId: z.string().optional(),
  treatmentType: z.enum(["Antibiótico", "Antiinflamatorio", "Analgésico", "Suplemento", "Otro"]),
  treatmentTypeOther: z.string().optional(),
  productName: z.string(),
  dose: z.string(),
  frequency: z.string(),
  duration: z.string(),
  route: z.enum(["Oral", "Inyectable", "Tópica", "Intravenosa", "Subcutánea", "Otro"]),
  routeOther: z.string().optional(),
  cost: z.number(),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  observations: z.string().optional(),
  status: z.enum(["Activo", "Completado", "Suspendido"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const treatmentsListSchema = z.array(treatmentSchema);

export type TreatmentFormData = {
  treatmentType: string;
  treatmentTypeOther?: string;
  productName: string;
  dose: string;
  frequency: string;
  duration: string;
  route: string;
  routeOther?: string;
  cost: number;
  startDate: string;
  endDate?: string;
  observations?: string;
  status: string;
  productId?: string;
  quantity?: number;
  isFullUnit?: boolean;
};

export type Treatment = z.infer<typeof treatmentSchema>;

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