// src/types/grooming.ts
import { z } from "zod";
import type { Staff } from "./staff";

// Schemas base
export const ServiceTypeSchema = z.enum(["Corte", "Baño", "Corte y Baño"]);

// Schemas para campos relacionados
const OwnerFieldSchema = z.union([
  z.string(),
  z.object({
    _id: z.string(),
    name: z.string(),
    contact: z.string().optional(),
  }),
]).nullable().optional();

const GroomerFieldSchema = z.union([
  z.string(),
  z.object({
    _id: z.string(),
    name: z.string(),
    lastName: z.string(),
  }),
]).nullable().optional();

const PatientFieldSchema = z.union([
  z.string(),
  z.object({
    _id: z.string(),
    name: z.string().optional(),
    species: z.string().optional(),
    breed: z.string().optional(),
    weight: z.number().optional(),
    sex: z.enum(["Macho", "Hembra"]).optional(),
    owner: OwnerFieldSchema,
  }),
]).nullable().optional();

// Schema principal del servicio de grooming
export const groomingServiceSchema = z.object({
  _id: z.string().optional(),
  patientId: PatientFieldSchema,
  service: ServiceTypeSchema,
  specifications: z
    .string()
    .min(1, "Las especificaciones son obligatorias")
    .max(300, "Máximo 300 caracteres"),
  observations: z.string().optional(),
  cost: z.number().min(0, "El costo debe ser un valor positivo"),
  groomer: GroomerFieldSchema,
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "La fecha del servicio debe ser válida",
  }),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Schemas para listas y respuestas
export const groomingServicesListSchema = z.array(groomingServiceSchema);
export const groomingServicesListResponseSchema = z.object({
  services: z.array(groomingServiceSchema),
});

// Tipo principal inferido del schema
export type GroomingService = z.infer<typeof groomingServiceSchema>;

// Tipo para el formulario
export type GroomingServiceFormData = {
  date: string;
  service: "Corte" | "Baño" | "Corte y Baño";
  cost: number;
  groomer?: string;
  specifications: string;
  observations?: string;
};

// Tipos inferidos de los schemas enum
export type ServiceType = z.infer<typeof ServiceTypeSchema>;

// Tipo para opciones de peluquero (dropdown)
export type GroomerOption = Pick<Staff, "_id" | "name" | "lastName" | "role">;

// Tipo para crear un nuevo servicio
export type CreateGroomingServiceData = GroomingServiceFormData & {
  patientId: string;
};

// Tipo para actualizar un servicio
export type UpdateGroomingServiceData = {
  formData: Partial<GroomingServiceFormData>;
  groomingId: string;
};

// Tipo para el servicio poblado
export type GroomingServicePopulated = Omit<GroomingService, "groomer" | "patientId"> & {
  groomer?: {
    _id: string;
    name: string;
    lastName: string;
  };
  patientId?: {
    _id: string;
    name: string;
    species?: string;
    breed?: string;
    owner?: {
      _id: string;
      name: string;
      contact?: string;
    };
  };
};