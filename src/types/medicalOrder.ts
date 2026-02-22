// src/types/medicalOrder.ts
import { z } from "zod";

// Tipos de estudio
export const StudyTypeSchema = z.enum([
  "ecografia",
  "radiografia",
  "laboratorio",
  "tomografia",
  "electrocardiograma",
  "endoscopia",
  "citologia",
  "biopsia",
  "otro",
]);

export const StudyPrioritySchema = z.enum(["normal", "urgente"]);

// Schema para cada estudio
export const studySchema = z.object({
  type: StudyTypeSchema,
  name: z.string().min(1, "El nombre es obligatorio").max(150, "Máximo 150 caracteres"),
  region: z.string().max(100, "Máximo 100 caracteres").optional(),
  reason: z.string().min(1, "El motivo es obligatorio").max(300, "Máximo 300 caracteres"),
  priority: StudyPrioritySchema.default("normal"),
  instructions: z.string().max(300, "Máximo 300 caracteres").optional(),
});

// Schema para paciente populado
const populatedPatientSchema = z.object({
  _id: z.string(),
  name: z.string(),
  species: z.string().optional(),
  breed: z.string().optional(),
  owner: z.string().optional(),
}).nullable().optional();

// Schema para consulta populada
const populatedConsultationSchema = z.object({
  _id: z.string(),
  consultationDate: z.string().optional(),
  reasonForVisit: z.string().optional(),
}).nullable().optional();

// Schema principal de orden médica
export const medicalOrderSchema = z.object({
  _id: z.string().optional(),
  patientId: z.union([z.string(), populatedPatientSchema]),
  veterinarianId: z.string(),
  consultationId: z.union([z.string(), populatedConsultationSchema]).optional(),
  issueDate: z.string(),
  studies: z.array(studySchema).min(1, "Debe incluir al menos un estudio"),
  clinicalHistory: z.string().max(1000, "Máximo 1000 caracteres").optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Schema para formulario (sin campos auto-generados)
export const medicalOrderFormSchema = z.object({
  issueDate: z.string().min(1, "La fecha es obligatoria"),
  consultationId: z.string().optional(),
  studies: z.array(studySchema).min(1, "Debe incluir al menos un estudio"),
  clinicalHistory: z.string().max(1000, "Máximo 1000 caracteres").optional(),
});

// Lista de órdenes
export const medicalOrdersListSchema = z.array(medicalOrderSchema);

// Tipos exportados
export type StudyType = z.infer<typeof StudyTypeSchema>;
export type StudyPriority = z.infer<typeof StudyPrioritySchema>;
export type Study = z.infer<typeof studySchema>;
export type MedicalOrder = z.infer<typeof medicalOrderSchema>;
export type MedicalOrderFormData = z.infer<typeof medicalOrderFormSchema>;

// Labels para los tipos de estudio
export const STUDY_TYPE_LABELS: Record<StudyType, string> = {
  ecografia: "Ecografía",
  radiografia: "Radiografía",
  laboratorio: "Laboratorio",
  tomografia: "Tomografía",
  electrocardiograma: "Electrocardiograma",
  endoscopia: "Endoscopía",
  citologia: "Citología",
  biopsia: "Biopsia",
  otro: "Otro",
};

// Labels para prioridad
export const PRIORITY_LABELS: Record<StudyPriority, string> = {
  normal: "Normal",
  urgente: "Urgente",
};

// Helper para obtener el ID del paciente
export function getPatientId(order: MedicalOrder): string | undefined {
  if (!order.patientId) return undefined;
  if (typeof order.patientId === "string") return order.patientId;
  return order.patientId._id;
}

// Helper para obtener el nombre del paciente
export function getPatientName(order: MedicalOrder): string {
  if (!order.patientId) return "Sin paciente";
  if (typeof order.patientId === "string") return "Paciente";
  if (typeof order.patientId === "object" && order.patientId !== null) {
    return order.patientId.name || "Sin nombre";
  }
  return "Sin paciente";
}