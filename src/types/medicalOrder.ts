import { z } from "zod";

// 1. Definimos las opciones constantes para los Checkboxes (basado en la imagen)
export const MEDICAL_ORDER_OPTIONS = {
  hematology: ['Hematología Completa', 'Despistaje Hemoparásitos', 'Contaje Plaquetario', 'PT', 'PTT'],
  coprology: ['Evaluación Fresca', 'Flotación', 'Sangre Oculta en Heces', 'Determ. Polisacáridos en Heces', 'Heces Coloreadas'],
  urinalysis: ['Tira Reactiva', 'Sedimento Fresco', 'Sedimento Coloreado'],
  cytology: [
    'Masas Cutáneas y Subcutáneas', 'Masas en Cavidades', 'Nódulos Linfáticos', 
    'Eval. Efusiones en Cavid.', 'Eval. Líquido Cefalorraquídeo', 'Médula Osea'
  ],
  hormonal: ['Cortisol', 'T3', 'T4'],
  skin: ['Raspado Cutáneo', 'Tricograma', 'Cinta Adhesiva'],
  chemistry: [
    'Alanino Aminotrasferasa (ALT)', 'Aspartato Aminotrasferasa (AST)', 'Fosfatasa Alcalina (FA)', 
    'Bilirrubina Total', 'Proteínas totales', 'Albúmina', 'Globulina', 'BUN / Urea', 'Creatinina', 'Glucosa'
  ],
  cultures: ['Bacteriológico', 'Micológico', 'Urocultivo', 'Coprocultivo', 'Hemocultivo'],
  antigenicTests: ['Parvovirus Canino', 'Dirofilaria Inmitis', 'Distemper Canino', 'Giardia sp', 'Coronavirus Felino']
} as const;

// 2. Schema para el paciente populado (lo mantenemos igual)
const populatedPatientSchema = z.object({
  _id: z.string(),
  name: z.string(),
  species: z.string().optional(),
  breed: z.string().optional(),
  owner: z.string().optional(),
}).nullable().optional();

// 3. Schema Principal (Base de datos)
export const medicalOrderSchema = z.object({
  _id: z.string().optional(),
  patientId: z.union([z.string(), populatedPatientSchema]),
  veterinarianId: z.string(),
  status: z.enum(['pending', 'completed', 'cancelled']).default('pending'),
  issueDate: z.string(),
  
  // Categorías como arrays de strings
  hematology: z.array(z.string()).default([]),
  coprology: z.array(z.string()).default([]),
  urinalysis: z.array(z.string()).default([]),
  cytology: z.array(z.string()).default([]),
  hormonal: z.array(z.string()).default([]),
  skin: z.array(z.string()).default([]),
  chemistry: z.array(z.string()).default([]),
  cultures: z.array(z.string()).default([]),
  antigenicTests: z.array(z.string()).default([]),
  
  specialExams: z.string().optional(),
  observations: z.string().max(500, "Máximo 500 caracteres").optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// 4. Schema para el Formulario (React Hook Form)
// Quitamos 'studies' y usamos las categorías individuales
export const medicalOrderFormSchema = z.object({
  issueDate: z.string().min(1, "La fecha es obligatoria"),
  hematology: z.array(z.string()).default([]),
  coprology: z.array(z.string()).default([]),
  urinalysis: z.array(z.string()).default([]),
  cytology: z.array(z.string()).default([]),
  hormonal: z.array(z.string()).default([]),
  skin: z.array(z.string()).default([]),
  chemistry: z.array(z.string()).default([]),
  cultures: z.array(z.string()).default([]),
  antigenicTests: z.array(z.string()).default([]),
  specialExams: z.string().optional(),
  observations: z.string().optional(),
}).refine((data) => {
  // Validación: Al menos un examen seleccionado o algo escrito en especiales
  const hasExams = Object.values(data).some(val => Array.isArray(val) && val.length > 0);
  return hasExams || (data.specialExams && data.specialExams.length > 0);
}, {
  message: "Debe seleccionar al menos un estudio o especificar uno especial",
  path: ["specialExams"] // El error se mostrará aquí si todo está vacío
});

// Tipos exportados
export type MedicalOrder = z.infer<typeof medicalOrderSchema>;
export type MedicalOrderFormData = z.infer<typeof medicalOrderFormSchema>;
export const medicalOrdersListSchema = z.array(medicalOrderSchema);

// Labels para los títulos de las secciones
export const ORDER_CATEGORY_LABELS: Record<string, string> = {
  hematology: "Hematología",
  coprology: "Coprología",
  urinalysis: "Uroanálisis",
  cytology: "Citología",
  hormonal: "Hormonal",
  skin: "Piel",
  chemistry: "Química Sanguínea",
  cultures: "Cultivos",
  antigenicTests: "Pruebas Antigénicas"
};

// Mantenemos tus helpers de utilidad
export function getPatientName(order: MedicalOrder): string {
  if (!order.patientId) return "Sin paciente";
  if (typeof order.patientId === "string") return "Paciente";
  return order.patientId.name || "Sin nombre";
}