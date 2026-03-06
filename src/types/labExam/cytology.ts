import { z } from "zod";
import { labExamBaseSchema } from "../labExam";

export const cytologyFieldsSchema = z.object({
  sampleType: z.string().min(1, "El tipo de muestra es obligatorio"),
  coloration: z.string().min(1, "La coloración es obligatoria"),
  results: z.string().min(1, "Los resultados son obligatorios"),
});

// Schema completo de citología
export const cytologySchema = labExamBaseSchema.merge(cytologyFieldsSchema);

export type CytologyFields = z.infer<typeof cytologyFieldsSchema>;
export type Cytology = z.infer<typeof cytologySchema>;