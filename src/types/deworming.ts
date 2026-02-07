// src/types/deworming.ts
import { z } from "zod";

export const dewormingSchema = z.object({
  _id: z.string(),
  applicationDate: z.string().datetime(),
  dewormingType: z.enum(["Interna", "Externa", "Ambas"]),
  productName: z.string(),
  dose: z.string(),
  cost: z.number(),
  nextApplicationDate: z.string().nullable().optional(),
  patientId: z.string(),
  veterinarianId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const dewormingsListSchema = z.array(dewormingSchema);

export type DewormingFormData = {
  applicationDate: string;
  dewormingType: string;
  productName: string;
  dose: string;
  cost: number;
  nextApplicationDate: string;
  productId?: string;
  quantity?: number;
  isFullUnit?: boolean;
};

export type Deworming = z.infer<typeof dewormingSchema>;