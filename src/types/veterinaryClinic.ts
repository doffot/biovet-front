// src/types/veterinaryClinic.ts
import { z } from "zod";

export const socialMediaSchema = z.object({
  platform: z.enum([
    "facebook",
    "instagram", 
    "twitter",
    "tiktok",
    "youtube",
    "linkedin",
    "otro"
  ]),
  url: z.string().url("URL inválida"),
});

export const veterinaryClinicSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Nombre requerido").max(150),
  rif: z.string().max(20).optional(),
  logo: z.string().url().optional().nullable(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  address: z.string().max(250).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  website: z.string().url().optional(),
  socialMedia: z.array(socialMediaSchema).optional(),
  businessHours: z.string().max(500).optional(),
  services: z.array(z.string()).optional(),
  description: z.string().max(1000).optional(),
  veterinarian: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const veterinaryClinicFormSchema = veterinaryClinicSchema.omit({
  _id: true,
  veterinarian: true,
  createdAt: true,
  updatedAt: true,
});

export type VeterinaryClinic = z.infer<typeof veterinaryClinicSchema>;
export type VeterinaryClinicFormData = z.infer<typeof veterinaryClinicFormSchema>;

export const SOCIAL_PLATFORMS = {
  facebook: "Facebook",
  instagram: "Instagram",
  twitter: "Twitter",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  otro: "Otro",
} as const;