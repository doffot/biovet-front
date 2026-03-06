// src/types/labExam.ts
import { z } from "zod";

// =============================================
// CAMPOS COMUNES (BASE)
// =============================================
export const labExamBaseSchema = z.object({
  _id: z.string().optional(),
  vetId: z.string(),
  patientId: z.string().optional(),
  examType: z.string().optional(),

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

  treatingVet: z.string().optional(),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),

  // Campos de pago
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  paymentMethodId: z.string().optional(),
  exchangeRate: z.number().optional(),
  paymentAmount: z.number().optional(),
  paymentCurrency: z.string().optional(),
  isPartialPayment: z.boolean().optional(),
  creditAmountUsed: z.number().optional(),
});

// =============================================
// HEMATOLOGÍA
// =============================================
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
  hematocrit: z.number().min(0, "Requerido"),
  whiteBloodCells: z.number().min(0, "Requerido"),
  totalProtein: z.number().min(0, "Requerido"),
  platelets: z.number().min(0, "Requerido"),
  differentialCount: differentialCountSchema,
  totalCells: z.number().min(0).max(100, "Porcentaje inválido"),
  hemotropico: z.string().optional(),
  observacion: z.string().optional(),
});

// =============================================
// CITOLOGÍA
// =============================================
export const cytologyFieldsSchema = z.object({
  sampleType: z.string().min(1, "El tipo de muestra es obligatorio"),
  coloration: z.string().min(1, "La coloración es obligatoria"),
  results: z.string().min(1, "Los resultados son obligatorios"),
});

// =============================================
// RASPADO CUTÁNEO
// =============================================
export const skinScrapingFieldsSchema = z.object({
  type: z.enum(["superficial", "profunda"]),
  results: z.string().min(1, "Los resultados son obligatorios"),
});

// =============================================
// TRICOGRAMA
// =============================================
export const trichogramFieldsSchema = z.object({
  results: z.string().min(1, "Los resultados son obligatorios"),
});

// =============================================
// TEST RÁPIDO
// =============================================
export const quickTestFieldsSchema = z.object({
  testName: z.string().min(1, "Nombre del test obligatorio"),
  results: z.string().min(1, "Resultado obligatorio"),
});

// =============================================
// UROANÁLISIS
// =============================================
export const urinalysisFieldsSchema = z.object({
  // Método de recolección
  collectionMethod: z.string().optional(),

  // Examen Físico
  color: z.string().optional(),
  appearance: z.string().optional(),
  specificGravity: z.number().optional(),

  // Examen Químico (Tira reactiva)
  pH: z.number().optional(),
  proteins: z.string().optional(),
  glucose: z.string().optional(),
  ketones: z.string().optional(),
  bilirubin: z.string().optional(),
  blood: z.string().optional(),
  urobilinogen: z.string().optional(),
  nitrites: z.string().optional(),
  leukocytesChemical: z.string().optional(),

  // Sedimento Urinario
  epithelialCells: z.string().optional(),
  sedimentLeukocytes: z.string().optional(),
  sedimentErythrocytes: z.string().optional(),
  bacteria: z.string().optional(),
  crystals: z.string().optional(),
  casts: z.string().optional(),
  otherFindings: z.string().optional(),
});

// =============================================
// SCHEMAS COMPLETOS Y TYPES
// =============================================
export const hematologySchema = labExamBaseSchema.merge(hematologyFieldsSchema);
export const cytologySchema = labExamBaseSchema.merge(cytologyFieldsSchema);
export const skinScrapingSchema = labExamBaseSchema.merge(skinScrapingFieldsSchema);
export const trichogramSchema = labExamBaseSchema.merge(trichogramFieldsSchema);
export const quickTestSchema = labExamBaseSchema.merge(quickTestFieldsSchema);
export const urinalysisSchema = labExamBaseSchema.merge(urinalysisFieldsSchema);

// Schema maestro para validación general
export const labExamSchema = labExamBaseSchema
  .merge(hematologyFieldsSchema.partial())
  .merge(cytologyFieldsSchema.partial())
  .merge(skinScrapingFieldsSchema.partial())
  .merge(trichogramFieldsSchema.partial())
  .merge(quickTestFieldsSchema.partial())
  .merge(urinalysisFieldsSchema.partial());

export type LabExam = z.infer<typeof labExamSchema>;
export type LabExamFormData = LabExam;
export type Hematology = z.infer<typeof hematologySchema>;
export type Cytology = z.infer<typeof cytologySchema>;
export type SkinScraping = z.infer<typeof skinScrapingSchema>;
export type Trichogram = z.infer<typeof trichogramSchema>;
export type QuickTest = z.infer<typeof quickTestSchema>;
export type Urinalysis = z.infer<typeof urinalysisSchema>;
export type DifferentialCount = z.infer<typeof differentialCountSchema>;

export interface DifferentialField {
  key: keyof DifferentialCount;
  sound: HTMLAudioElement;
  label: string;
  image: string;
}