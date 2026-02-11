import { z } from "zod";

// Schema para productos dentro del servicio
export const serviceProductSchema = z.object({
  _id: z.string().optional(),
  productId: z.string().optional(),
  productName: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  subtotal: z.number(),
  isFullUnit: z.boolean().optional(),
});

export type ServiceProduct = z.infer<typeof serviceProductSchema>;

// Schema principal del servicio
export const veterinaryServiceSchema = z.object({
  _id: z.string(),
  patientId: z.string(),
  veterinarianId: z.string(),
  serviceDate: z.string(),
  serviceName: z.string(),
  description: z.string().optional().nullable(),
  products: z.array(serviceProductSchema),
  productsTotal: z.number(),
  veterinarianFee: z.number(),
  subtotal: z.number(),
  discount: z.number(),
  totalCost: z.number(),
  status: z.enum(["Completado", "Pendiente", "Cancelado"]),
  notes: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const veterinaryServicesListSchema = z.array(veterinaryServiceSchema);

export type VeterinaryService = z.infer<typeof veterinaryServiceSchema>;

// Schema para el formulario
export const veterinaryServiceFormSchema = z.object({
  serviceName: z.string().min(1, "El nombre del servicio es obligatorio"),
  description: z.string().optional(),
  serviceDate: z.string().optional(),
  products: z.array(
    z.object({
      productId: z.string().optional(),
      productName: z.string().min(1, "El nombre es obligatorio"),
      quantity: z.number().min(0.1, "Cantidad mínima 0.1"),
      unitPrice: z.number().min(0, "El precio no puede ser negativo"),
      isFullUnit: z.boolean().optional(),
    })
  ).optional(),
  veterinarianFee: z.number().min(0, "Los honorarios no pueden ser negativos"),
  discount: z.number().min(0, "El descuento no puede ser negativo").optional(),
  notes: z.string().optional(),
});

export type VeterinaryServiceFormData = z.infer<typeof veterinaryServiceFormSchema>;