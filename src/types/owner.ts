// src/types/owner.ts
import { z } from "zod";

export const ownerSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, "El nombre es obligatorio"),
  contact: z.string().min(1, "El contacto es obligatorio"),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  nationalId: z.string().nullable().optional(),
  creditBalance: z.number().default(0),
});

export const ownersListSchema = z.array(
  ownerSchema.pick({
    _id: true,
    name: true,
    contact: true,
    email: true,
    address: true,
    nationalId: true,
    creditBalance: true,
  })
);

export type Owner = z.infer<typeof ownerSchema>;

export type OwnerFormData = Pick<
  Owner,
  "name" | "contact" | "email" | "address" | "nationalId"
>;

export const ownerFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  contact: z.string().min(10, "El contacto no parece válido"),
  email: z.string().email("Email inválido").nullable().optional(),
  address: z.string().max(200, "La dirección es demasiado larga").nullable().optional(),
  nationalId: z.string().max(20, "El ID nacional es demasiado largo").nullable().optional(),
});