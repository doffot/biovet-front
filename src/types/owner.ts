// src/types/owner.ts
import { z } from "zod";

// 1. Esquema Base
export const ownerSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, "El nombre es obligatorio"),
  contact: z.string().min(1, "El contacto es obligatorio"),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  nationalId: z.string().nullable().optional(),
  creditBalance: z.number().default(0),
});

// 2. Esquema de Estadísticas (CORREGIDO PARA EVITAR ERROR DE TYPE)
const ownerStatsSchema = z.object({
  petsCount: z.number().default(0), // Quitamos optional, dejamos default
  
  // USAMOS PREPROCESS:
  // Esto toma cualquier valor que venga (fecha, string, null) y lo convierte a string ISO o null
  // ANTES de que Zod valide. Así TypeScript está feliz con "string | null".
  lastVisit: z.preprocess(
    (val) => (val ? new Date(val as string | Date | number).toISOString() : null),
    z.string().nullable()
  ),
  
  totalDebt: z.number().default(0),
  pendingInvoices: z.number().default(0),
});

// 3. Esquema Combinado + Passthrough
// .passthrough() es vital para que no se borren datos extra si el backend envía algo más
export const ownerWithStatsSchema = ownerSchema
  .merge(ownerStatsSchema)
  .passthrough();

// 4. Esquema para la Lista
export const ownersListSchema = z.array(ownerWithStatsSchema);

// 5. Esquema para el Formulario
export const ownerFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  contact: z.string().min(10, "El contacto no parece válido"),
  email: z.string().email("Email inválido").nullable().optional().or(z.literal("")),
  address: z.string().max(200, "La dirección es demasiado larga").nullable().optional(),
  nationalId: z.string().max(20, "El ID nacional es demasiado largo").nullable().optional(),
});

// --- TIPOS DE TYPESCRIPT ---

export type Owner = z.infer<typeof ownerSchema>;
export type OwnerWithStats = z.infer<typeof ownerWithStatsSchema>;

export type OwnerFormData = Pick<
  Owner,
  "name" | "contact" | "email" | "address" | "nationalId"
>;

// --- TIPOS PARA LA TABLA Y ORDENAMIENTO ---
export type SortField = "name" | "petsCount" | "lastVisit" | "totalDebt";
export type SortDirection = "asc" | "desc";