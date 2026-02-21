// src/utils/productHelpers.ts

import type { Product } from "../types/product";
import type { ProductWithInventory } from "../types/inventory";

// ==================== TIPOS ====================

export type CategoryFilter = "all" | Product["category"];

export type StockStatus = "ok" | "low" | "out";

export interface StockStatusConfig {
  label: string;
  text: string;
  bg: string;
  border: string;
}

// ==================== CATEGORÍAS ====================

export const CATEGORY_LABELS: Record<Product["category"], string> = {
  vacuna: "Vacuna",
  desparasitante: "Desparasitante",
  medicamento: "Medicamento",
  alimento: "Alimento",
  accesorio: "Accesorio",
  otro: "Otro",
};

export const CATEGORY_OPTIONS: { value: Product["category"]; label: string }[] = [
  { value: "vacuna", label: "Vacuna" },
  { value: "desparasitante", label: "Desparasitante" },
  { value: "medicamento", label: "Medicamento" },
  { value: "alimento", label: "Alimento" },
  { value: "accesorio", label: "Accesorio" },
  { value: "otro", label: "Otro" },
];

// ==================== HELPERS ====================

export function getCategoryLabel(category: Product["category"]): string {
  return CATEGORY_LABELS[category] || category;
}

export function getStockStatus(product: ProductWithInventory): StockStatus {
  const units = product.inventory?.stockUnits ?? 0;
  const doses = product.inventory?.stockDoses ?? 0;
  const minStock = product.minStock ?? 0;

  if (units === 0 && doses === 0) return "out";
  if (minStock > 0 && units <= minStock) return "low";
  return "ok";
}

export function getStockStatusConfig(status: StockStatus): StockStatusConfig {
  switch (status) {
    case "ok":
      return {
        label: "En stock",
        text: "text-success-600 dark:text-success-400",
        bg: "bg-success-50 dark:bg-success-950",
        border: "border-success-200 dark:border-success-800",
      };
    case "low":
      return {
        label: "Stock bajo",
        text: "text-warning-600 dark:text-warning-400",
        bg: "bg-warning-50 dark:bg-warning-950",
        border: "border-warning-200 dark:border-warning-800",
      };
    case "out":
      return {
        label: "Agotado",
        text: "text-danger-600 dark:text-danger-400",
        bg: "bg-danger-50 dark:bg-danger-950",
        border: "border-danger-200 dark:border-danger-800",
      };
  }
}

export function getTotalStock(product: ProductWithInventory): string {
  const units = product.inventory?.stockUnits ?? 0;
  const doses = product.inventory?.stockDoses ?? 0;

  if (product.divisible) {
    const totalDoses = units * product.dosesPerUnit + doses;
    return `${units} ${product.unit} (${totalDoses} ${product.doseUnit})`;
  }
  return `${units} ${product.unit}`;
}

export function getStockUnits(product: ProductWithInventory): number {
  return product.inventory?.stockUnits ?? 0;
}

export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}