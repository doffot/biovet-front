// src/types/consultation.ts
import { z } from "zod";

export const consultationSchema = z.object({
  _id: z.string(),
  patientId: z.string(),
  veterinarianId: z.string(),
  consultationDate: z.string(),
  isDraft: z.boolean().optional(),
  
  // Anamnesis y Motivo
  reasonForVisit: z.string().optional(),
  symptomOnset: z.string().optional(),
  symptomEvolution: z.union([
    z.enum(["empeorado", "mejorado", "estable"]),
    z.literal(""),
    z.null()
  ]).optional(),
  
  // Antecedentes y Estilo de Vida
  isNeutered: z.boolean().nullable().optional(),
  cohabitantAnimals: z.string().optional(),
  contactWithStrays: z.string().optional(),
  feeding: z.string().optional(),
  appetite: z.union([
    z.enum(["Normal", "Mucho", "Poco", "Nada"]),
    z.literal(""),
    z.null()
  ]).optional(),
  
  // Sistema Gastrointestinal / Urinario
  vomiting: z.string().optional(),
  bowelMovementFrequency: z.string().optional(),
  stoolConsistency: z.union([
    z.enum(["normal", "dura", "pastosa", "líquida"]),
    z.literal(""),
    z.null()
  ]).optional(),
  bloodOrParasitesInStool: z.string().optional(),
  normalUrination: z.string().optional(),
  urineFrequencyAndAmount: z.string().optional(),
  urineColor: z.string().optional(),
  painOrDifficultyUrinating: z.string().optional(),
  
  // Sistema Respiratorio / Otros
  cough: z.string().optional(),
  sneezing: z.string().optional(),
  breathingDifficulty: z.boolean().nullable().optional(),
  itchingOrExcessiveLicking: z.boolean().nullable().optional(),
  hairLossOrSkinLesions: z.string().optional(),
  eyeDischarge: z.string().optional(),
  earIssues: z.string().optional(),
  feverSigns: z.boolean().nullable().optional(),
  lethargyOrWeakness: z.boolean().nullable().optional(),
  
  // Tratamientos previos (No vacunas)
  currentTreatment: z.string().optional(),
  medications: z.string().optional(),
  previousIllnesses: z.string().optional(),
  previousSurgeries: z.string().optional(),
  adverseReactions: z.string().optional(),
  lastHeatOrBirth: z.string().optional(),
  mounts: z.string().optional(),
  
  // Constantes Fisiológicas (Examen Físico)
  temperature: z.union([z.number(), z.string(), z.null()]).optional(),
  lymphNodes: z.string().optional(),
  heartRate: z.union([z.number(), z.string(), z.null()]).optional(),
  respiratoryRate: z.union([z.number(), z.string(), z.null()]).optional(),
  capillaryRefillTime: z.string().optional(),
  weight: z.union([z.number(), z.string(), z.null()]).optional(),
  
  // Evaluación por Sistemas
  integumentarySystem: z.string().optional(),
  cardiovascularSystem: z.string().optional(),
  ocularSystem: z.string().optional(),
  respiratorySystem: z.string().optional(),
  nervousSystem: z.string().optional(),
  musculoskeletalSystem: z.string().optional(),
  gastrointestinalSystem: z.string().optional(),
  
  // Diagnóstico y Plan
  presumptiveDiagnosis: z.string().optional(),
  definitiveDiagnosis: z.string().optional(),
  requestedTests: z.string().optional(),
  treatmentPlan: z.string().optional(),
  
  // Administración
  cost: z.union([z.number(), z.string(), z.null()]).optional(),
  discount: z.union([z.number(), z.string(), z.null()]).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const consultationsListSchema = z.array(consultationSchema);

export type Consultation = z.infer<typeof consultationSchema>;


export type ConsultationFormData = Omit<
  Consultation, 
  "_id" | "patientId" | "veterinarianId" | "createdAt" | "updatedAt"
>;