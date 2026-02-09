// src/types/product.ts
import { z } from "zod";

export const productSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
  description: z.string().max(200, "Máximo 200 caracteres").optional(),
  category: z.enum(["vacuna", "desparasitante", "medicamento", "alimento", "accesorio", "otro"]),
  
  // Precios
  salePrice: z.number().min(0, "El precio de venta debe ser positivo"),
  salePricePerDose: z.number().min(0, "El precio por dosis debe ser positivo").optional(),
  costPrice: z.number().min(0, "El costo debe ser positivo").optional(),
  
  // Unidades
  unit: z.string().min(1, "La unidad física es obligatoria").max(30, "Máximo 30 caracteres"),
  doseUnit: z.string().min(1, "La unidad de dosis es obligatoria").max(10, "Máximo 10 caracteres"),
  dosesPerUnit: z.number().min(1, "Debe haber al menos 1 dosis por unidad"),
  
  // Stock
  stockUnits: z.number().min(0, "El stock no puede ser negativo").optional(),
  stockDoses: z.number().min(0, "El stock de dosis no puede ser negativo").optional(),
  minStock: z.number().min(0, "El stock mínimo no puede ser negativo").optional(),
  
  // Comportamiento
  divisible: z.boolean().optional(),
  
  // Estado
  active: z.boolean().optional(),
  
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