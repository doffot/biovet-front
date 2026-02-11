import { z } from "zod";

// Schema para lo que viene del Backend (Lectura)
export const medicalStudySchema = z.object({
  _id: z.string().optional(),
  patientId: z.string(),
  veterinarianId: z.string().optional(),
  professional: z.string(),
  studyType: z.string(),
  pdfFile: z.string(), // URL
  presumptiveDiagnosis: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  date: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const medicalStudiesListSchema = z.array(medicalStudySchema);

// Schema para las respuestas de la API
export const medicalStudyResponseSchema = z.object({
  msg: z.string().optional(),
  study: medicalStudySchema
});

export const medicalStudiesListResponseSchema = z.object({
  studies: medicalStudiesListSchema
});

export type MedicalStudy = z.infer<typeof medicalStudySchema>;