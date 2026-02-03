import { z } from "zod";

const estadosVenezuela = [
  "Amazonas",
  "Anzoátegui",
  "Apure",
  "Aragua",
  "Barinas",
  "Bolívar",
  "Carabobo",
  "Cojedes",
  "Delta Amacuro",
  "Distrito Capital",
  "Falcón",
  "Guárico",
  "Lara",
  "Mérida",
  "Miranda",
  "Monagas",
  "Nueva Esparta",
  "Portuguesa",
  "Sucre",
  "Táchira",
  "Trujillo",
  "Vargas",
  "Yaracuy",
  "Zulia",
] as const;

export type EstadoVenezuela = (typeof estadosVenezuela)[number];
export { estadosVenezuela };

/** auth & veterinary */
const authSchema = z.object({
  name: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string(),
  confirmPassword: z.string(),
  whatsapp: z.string(),
  ci: z.string(),
  cmv: z.string(),
  estado: z.enum(estadosVenezuela).optional(),
  runsai: z.string().optional(),
  msds: z.string().optional(),
  somevepa: z.string().optional(),
  confirmed: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  token: z.string(),
});

type Auth = z.infer<typeof authSchema>;

// Formularios existentes
export type UserLoginForm = Pick<Auth, "email" | "password">;
export type UserRegistrationForm = Pick<
  Auth,
  | "name"
  | "lastName"
  | "email"
  | "password"
  | "confirmPassword"
  | "whatsapp"
  | "ci"
  | "cmv"
  | "estado"
  | "runsai"
  | "msds"
  | "somevepa"
>;
export type RequestConfirmationCodeForm = Pick<Auth, "email">;
export type ForgotPasswordForm = Pick<Auth, "email">;
export type NewPasswordForm = Pick<Auth, "password" | "confirmPassword">;
export type confirmToken = Pick<Auth, "token">;

// =====================================================
// ✅ USUARIOS Y PERFIL
// =====================================================

const planTypeEnum = z.enum(['trial', 'basic', 'premium']);

// User básico (para el header/sidebar) — ahora incluye campos del plan
export const userSchema = authSchema
  .pick({
    name: true,
    lastName: true,
    email: true,
  })
  .extend({
    _id: z.string(),
    isLegacyUser: z.boolean().optional(),
    planType: planTypeEnum.optional(),
    trialEndedAt: z.string().nullable().optional(),
    patientCount: z.number().optional(),
    isActive: z.boolean().optional(),
  });

export type User = z.infer<typeof userSchema>;

// Perfil completo del veterinario — también incluye campos del plan
export const userProfileSchema = z.object({
  _id: z.string(),
  name: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  whatsapp: z.string(),
  ci: z.string(),
  cmv: z.string(),
  estado: z.enum(estadosVenezuela),
  runsai: z.string().nullable().optional(),
  msds: z.string().nullable().optional(),
  somevepa: z.string().nullable().optional(),
  signature: z.string().nullable().optional(), //  firma
  confirmed: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Campos del plan
  isLegacyUser: z.boolean().optional(),
  planType: planTypeEnum.optional(),
  trialEndedAt: z.string().nullable().optional(),
  patientCount: z.number().optional(),
  isActive: z.boolean().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// Formulario para actualizar perfil (solo campos editables)
export type UpdateProfileForm = Pick<
  UserProfile,
  "name" | "lastName" | "whatsapp" | "estado" | "runsai" | "msds" | "somevepa"
>;

// Formulario para cambiar contraseña
export interface ChangePasswordForm {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}