// src/types/appointment.ts

import { z } from "zod";

// ============================================
// CONSTANTES
// ============================================

export const appointmentTypes = [
  "Consulta",
  "Peluquería",
  "Laboratorio",
  "Vacuna",
  "Cirugía",
  "Tratamiento"
] as const;

export const appointmentStatuses = [
  "Programada",
  "Completada",
  "Cancelada",
  "No asistió"
] as const;

// ============================================
// SCHEMAS DE ENTIDADES RELACIONADAS
// ============================================

const ownerSchema = z.object({
  _id: z.string(),
  name: z.string(),
  lastName: z.string().nullable().optional(),
  contact: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
});

const vetSchema = z.object({
  _id: z.string(),
  name: z.string(),
  lastName: z.string().nullable().optional(),
  specialty: z.string().nullable().optional(),
});

const populatedPatientSchema = z.object({
  _id: z.string(),
  name: z.string(),
  photo: z.string().nullable().optional(),
  owner: z.union([z.string(), ownerSchema]),
  mainVet: z.union([z.string(), vetSchema]),
  species: z.string().nullable().optional(),
  breed: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  identification: z.string().nullable().optional(),
});

// ============================================
// SCHEMA PRINCIPAL DE CITA
// ============================================

export const appointmentSchema = z.object({
  _id: z.string(),
  patient: z.union([z.string(), populatedPatientSchema]),
  type: z.enum(appointmentTypes),
  date: z.string(),
  status: z.enum(appointmentStatuses),
  reason: z.string(),
  observations: z.string().nullable().optional(),
  prepaidAmount: z.number().nullable().optional().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================
// TIPOS INFERIDOS
// ============================================

export type AppointmentStatus = typeof appointmentStatuses[number];
export type AppointmentType = typeof appointmentTypes[number];

export type Appointment = z.infer<typeof appointmentSchema>;
export type Owner = z.infer<typeof ownerSchema>;
export type Vet = z.infer<typeof vetSchema>;
export type PopulatedPatient = z.infer<typeof populatedPatientSchema>;

// ============================================
// TIPOS DE CITAS CON RELACIONES POBLADAS
// ============================================

export type PopulatedAppointment = Omit<Appointment, 'patient'> & {
  patient: PopulatedPatient;
};

export type AppointmentWithPatient = PopulatedAppointment;

// ============================================
// TIPOS PARA FORMULARIOS
// ============================================

export type CreateAppointmentForm = {
  type: AppointmentType;
  date: string;
  reason: string;
  observations?: string;
  prepaidAmount?: number;
  assignedTo?: string;
};

export type UpdateAppointmentForm = {
  type: AppointmentType;
  date: string;
  reason: string;
  observations?: string;
};

export type UpdateAppointmentStatusForm = {
  status: AppointmentStatus;
  shouldRefund?: boolean
};

// ============================================
// UTILIDADES
// ============================================

export const appointmentTypesValues = [...appointmentTypes];
export const appointmentStatusesValues = [...appointmentStatuses];

export const isPatientPopulated = (
  patient: string | PopulatedPatient
): patient is PopulatedPatient => {
  return typeof patient === 'object' && patient !== null && '_id' in patient;
};

export const isOwnerPopulated = (
  owner: string | Owner
): owner is Owner => {
  return typeof owner === 'object' && owner !== null && '_id' in owner;
};