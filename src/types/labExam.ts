// src/types/labExam.ts
import { z } from "zod";

export const differentialCountSchema = z.object({
  segmentedNeutrophils: z.number().min(0).max(100).optional(),
  bandNeutrophils: z.number().min(0).max(100).optional(),
  lymphocytes: z.number().min(0).max(100).optional(),
  monocytes: z.number().min(0).max(100).optional(),
  basophils: z.number().min(0).max(100).optional(),
  reticulocytes: z.number().min(0).max(100).optional(),
  eosinophils: z.number().min(0).max(100).optional(),
  nrbc: z.number().min(0).max(100).optional(),
});

export const labExamSchema = z.object({
  _id: z.string().optional(),
  vetId: z.string(),
  patientId: z.string().optional(),

  patientName: z.string().min(1, "El nombre del paciente es obligatorio"),
  species: z.string().min(1, "La especie es obligatoria"),
  breed: z.string().optional(),
  sex: z.string().optional(),
  age: z.string().optional(),
  weight: z.number().min(0).optional(),

  cost: z.number().min(0, "El costo debe ser un valor positivo"),
  discount: z.number().min(0, "El descuento no puede ser negativo").optional(),

  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "La fecha del examen debe ser válida",
  }),
  hematocrit: z.number().min(0, "El hematocrito debe ser un valor positivo"),
  whiteBloodCells: z.number().min(0, "Los glóbulos blancos deben ser un valor positivo"),
  totalProtein: z.number().min(0, "La proteína total debe ser un valor positivo"),
  platelets: z.number().min(0, "Las plaquetas deben ser un valor positivo"),
  differentialCount: differentialCountSchema,
  totalCells: z.number().min(0).max(100, "El total de células debe ser un porcentaje válido"),
  hemotropico: z.string().optional(),
  observacion: z.string().optional(),
  treatingVet: z.string().optional(),

  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),

  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  paymentMethodId: z.string().optional(),
  exchangeRate: z.number().optional(),
  paymentAmount: z.number().optional(),
  paymentCurrency: z.string().optional(),
  isPartialPayment: z.boolean().optional(),
  creditAmountUsed: z.number().optional(),
});

export const labExamsListSchema = z.array(labExamSchema);

export type LabExam = z.infer<typeof labExamSchema>;

export type LabExamFormData = Pick<
  LabExam,
  | "patientId"
  | "patientName"
  | "species"
  | "breed"
  | "sex"
  | "age"
  | "weight"
  | "cost"
  | "discount"
  | "date"
  | "hematocrit"
  | "whiteBloodCells"
  | "totalProtein"
  | "platelets"
  | "differentialCount"
  | "totalCells"
  | "hemotropico"
  | "observacion"
  | "treatingVet"
  | "ownerName"
  | "ownerPhone"
  | "paymentMethod"
  | "paymentReference"
  | "paymentMethodId"
  | "exchangeRate"
  | "paymentAmount"
  | "paymentCurrency"
  | "isPartialPayment"
  | "creditAmountUsed"
>;

export type DifferentialCount = LabExamFormData["differentialCount"];

export interface DifferentialField {
  key: keyof DifferentialCount;
  sound: HTMLAudioElement;
  label: string;
  image: string;
}