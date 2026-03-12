// src/constants/product.ts

// Definir los valores como constante para usar en Zod
export const PRODUCT_CATEGORY_VALUES = [
  "vacuna",
  "desparasitante", 
  "medicamento",
  "test",
  "alimento",
  "accesorio",
  "otro",
] as const;

// Tipo derivado de los valores
export type ProductCategory = typeof PRODUCT_CATEGORY_VALUES[number];

// Opciones para los selects (UI)
export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "vacuna", label: "Vacuna" },
  { value: "desparasitante", label: "Desparasitante" },
  { value: "medicamento", label: "Medicamento" },
  { value: "test", label: "Test" },
  { value: "alimento", label: "Alimento" },
  { value: "accesorio", label: "Accesorio" },
  { value: "otro", label: "Otro" },
];

// Unidades de dosis comunes
export const DOSE_UNITS = [
  { value: "dosis", label: "Dosis" },
  { value: "parte", label: "Parte" },
  { value: "ml", label: "ml" },
  { value: "mg", label: "mg" },
  { value: "tableta", label: "Tableta" },
] as const;