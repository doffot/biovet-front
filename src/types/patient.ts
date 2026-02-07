// src/types/patient.ts
import { z } from "zod";

const OwnerPopulatedSchema = z.object({
  _id: z.string(),
  name: z.string(),
});

export const OwnerFieldSchema = z.union([
  z.string().min(1, "El dueño es obligatorio"),
  OwnerPopulatedSchema,
]);

export const patientSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, "El nombre es obligatorio"),
  birthDate: z.string().refine(
    (date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    },
    {
      message: "La fecha de nacimiento debe ser válida (formato YYYY-MM-DD)",
    }
  ),
  species: z.string().min(1, "La especie es obligatoria"),
  breed: z.string().optional().nullable(),
  sex: z.enum(["Macho", "Hembra"]),
  weight: z.number().optional().nullable(),
  color: z.string().optional().nullable(),
  identification: z.string().optional().nullable(),
  owner: OwnerFieldSchema, 
  photo: z.string().optional().nullable(),
  mainVet: z.string().min(1, "El nombre del veterinario principal es obligatorio"),
  referringVet: z.string().optional().nullable(),
  // NUEVO CAMPO AGREGADO
  observations: z.string().optional().nullable(),
});

export const patientsListSchema = z.array(
  z.object({
    _id: z.string(),
    name: z.string(),
    birthDate: z.string(),
    species: z.string(),
    breed: z.string().optional().nullable(),
    sex: z.enum(["Macho", "Hembra"]),
    weight: z.number().optional().nullable(),
    color: z.string().optional().nullable(),
    identification: z.string().optional().nullable(),
    owner: OwnerFieldSchema, 
    photo: z.string().optional().nullable(),
    mainVet: z.string(),
    referringVet: z.string().optional().nullable(),
   observations: z.string().optional().nullable().default(""),
  })
);

// Tipos derivados
export type Patient = z.infer<typeof patientSchema>;
export type PatientFormData = Pick<
  Patient,
  | "name"
  | "birthDate"
  | "species"
  | "breed"
  | "sex"
  | "weight"
  | "color"
  | "identification"
  | "owner"
  | "photo"
  | "mainVet"
  | "referringVet"
  | "observations" 
>;