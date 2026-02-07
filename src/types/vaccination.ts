// src/types/vaccination.ts
import { z } from "zod";

export const vaccinationSchema = z.object({
  _id: z.string().optional(),
  patientId: z.string().nullable().optional(), 
  veterinarianId: z.string().optional(),
  vaccinationDate: z.string(),
  vaccineType: z.string().min(1, "El tipo de vacuna es obligatorio"),
  source: z.enum(['internal', 'external']).default('internal'),
  appliedBy: z.string().optional(),
  cost: z.number().min(0, "El costo debe ser positivo").optional(),
  laboratory: z.string().optional(),
  batchNumber: z.string().optional(),
  expirationDate: z.string().optional(),
  nextVaccinationDate: z.string().optional(),
  observations: z.string().optional(),
  productId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const vaccinationsListSchema = z.array(vaccinationSchema);

export type Vaccination = z.infer<typeof vaccinationSchema>;

export type VaccinationFormData = Pick<
  Vaccination,
  | "vaccinationDate"
  | "vaccineType"
  | "source"
  | "appliedBy"
  | "cost"
  | "laboratory"
  | "batchNumber"
  | "expirationDate"
  | "nextVaccinationDate"
  | "observations"
> & {
  productId?: string; 
};