import { z } from "zod";
import { labExamBaseSchema } from "../labExam";

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

export const hematologyFieldsSchema = z.object({
  hematocrit: z.number().min(0, "El hematocrito debe ser un valor positivo"),
  whiteBloodCells: z.number().min(0, "Los glóbulos blancos deben ser un valor positivo"),
  totalProtein: z.number().min(0, "La proteína total debe ser un valor positivo"),
  platelets: z.number().min(0, "Las plaquetas deben ser un valor positivo"),
  differentialCount: differentialCountSchema,
  totalCells: z.number().min(0).max(100, "El total de células debe ser un porcentaje válido"),
  hemotropico: z.string().optional(),
  observacion: z.string().optional(),
});

// Schema completo de hematología
export const hematologySchema = labExamBaseSchema.merge(hematologyFieldsSchema);

export type HematologyFields = z.infer<typeof hematologyFieldsSchema>;
export type Hematology = z.infer<typeof hematologySchema>;
export type DifferentialCount = z.infer<typeof differentialCountSchema>;

export interface DifferentialField {
  key: keyof DifferentialCount;
  sound: HTMLAudioElement;
  label: string;
  image: string;
}