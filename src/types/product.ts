// src/types/product.ts

import { z } from "zod";
import { PRODUCT_CATEGORY_VALUES } from "@/constants/product";

export const productSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
  description: z.string().max(200, "Máximo 200 caracteres").optional().nullable(),
  category: z.enum(PRODUCT_CATEGORY_VALUES),
  
  // Precios
  salePrice: z.number().min(0, "El precio de venta debe ser positivo"),
  salePricePerDose: z.number().min(0, "El precio por dosis debe ser positivo").optional().nullable(),
  costPrice: z.number().min(0, "El costo debe ser positivo").optional().nullable(),
  
  // Unidades
  unit: z.string().min(1, "La unidad física es obligatoria").max(30, "Máximo 30 caracteres"),
  doseUnit: z.string().max(10, "Máximo 10 caracteres").optional().default("dosis"),
  dosesPerUnit: z.number().min(1, "Debe haber al menos 1 dosis por unidad").optional().default(1),
  
  // Stock
  stockUnits: z.number().min(0, "El stock no puede ser negativo").optional().nullable(),
  stockDoses: z.number().min(0, "El stock de dosis no puede ser negativo").optional().nullable(),
  minStock: z.number().min(0, "El stock mínimo no puede ser negativo").optional().nullable(),
  
  // Comportamiento
  divisible: z.boolean().optional().default(false),
  
  // Estado
  active: z.boolean().optional().default(true),
  
  // Fechas
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const productsListSchema = z.array(productSchema);

export type Product = z.infer<typeof productSchema>;

// FormData para crear/actualizar
export type ProductFormData = Pick<
  Product,
  | "name"
  | "description"
  | "category"
  | "unit"
  | "doseUnit"
  | "divisible"
  | "active"
  | "stockUnits"
  | "stockDoses"
  | "minStock"
> & {
  salePrice?: number;
  salePricePerDose?: number;
  costPrice?: number;
  dosesPerUnit?: number;
};