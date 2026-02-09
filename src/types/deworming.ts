// src/types/deworming.ts
import { z } from "zod";

export const dewormingSchema = z.object({
  _id: z.string(),
  applicationDate: z.string().datetime(),
  source: z.enum(["Interno", "Externo"]), // Nuevo campo
  dewormingType: z.enum(["Interna", "Externa", "Ambas"]),
  productName: z.string(),
  productId: z.string().nullable().optional(),
  dose: z.string(),
  cost: z.number(),
  nextApplicationDate: z.string().nullable().optional(),
  patientId: z.string(),
  // Ahora es opcional porque si es "Externo" no vendrá un ID de veterinario
  veterinarianId: z.string().nullable().optional(), 
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const dewormingsListSchema = z.array(dewormingSchema);

export type Deworming = z.infer<typeof dewormingSchema>;

// Tipos para el Formulario (lo que envías al backend)
export type DewormingFormData = {
  applicationDate: string;
  source: "Interno" | "Externo"; // Agregado
  dewormingType: "Interna" | "Externa" | "Ambas"; // Tipado más estricto
  productName: string;
  dose: string;
  cost: number;
  nextApplicationDate?: string; // Opcional
  productId?: string;
  quantity?: number;
  isFullUnit?: boolean;
  veterinarianId?: string; // Agregado por si lo manejas en el form
};