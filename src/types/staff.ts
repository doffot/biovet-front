// src/types/staff.ts
import { z } from "zod";

// Roles permitidos
export const StaffRoleSchema = z.enum(["veterinario", "groomer", "asistente", "recepcionista"]);
export type StaffRole = z.infer<typeof StaffRoleSchema>;

export const staffSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "El nombre es obligatorio").max(50, "Máximo 50 caracteres"),
  lastName: z.string().min(1, "El apellido es obligatorio").max(50, "Máximo 50 caracteres"),
  role: StaffRoleSchema,
  isOwner: z.boolean().optional(),
  veterinarianId: z.string().optional().nullable(), // Solo si es dueño
  phone: z.string().optional(),
  active: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const staffFormSchema = staffSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  isOwner: true,        
  veterinarianId: true, 
}).extend({
  phone: z.string().optional(),
});

export const staffListSchema = z.array(staffSchema);

export type Staff = z.infer<typeof staffSchema>;
export type StaffFormData = z.infer<typeof staffFormSchema>;

export type StaffRelation = string | Staff;