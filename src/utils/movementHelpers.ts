// src/utils/movementHelpers.ts

import type { MovementType, MovementReason, MovementReferenceType } from "../types/inventory";

// ==================== TIPOS ====================
export interface MovementTypeConfig {
  label: string;
  text: string;
  bg: string;
  border: string;
  icon: string;
}

// ==================== LABELS ====================
export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  entrada: "Entrada",
  salida: "Salida",
  ajuste: "Ajuste",
};

export const MOVEMENT_REASON_LABELS: Record<MovementReason, string> = {
  compra: "Compra",
  venta: "Venta",
  uso_clinico: "Uso Clínico",
  devolucion: "Devolución",
  vencimiento: "Vencimiento",
  perdida: "Pérdida",
  ajuste_manual: "Ajuste Manual",
  stock_inicial: "Stock Inicial",
};

export const MOVEMENT_REFERENCE_LABELS: Record<MovementReferenceType, string> = {
  Deworming: "Desparasitación",
  Vaccination: "Vacunación",
  Consultation: "Consulta",
  Sale: "Venta",
  Treatment: "Tratamiento",
  VeterinaryService: "Servicio Veterinario",
};

// ==================== OPTIONS (para selects) ====================
export const MOVEMENT_TYPE_OPTIONS: { value: MovementType | "all"; label: string }[] = [
  { value: "all", label: "Todos los tipos" },
  { value: "entrada", label: "Entrada" },
  { value: "salida", label: "Salida" },
  { value: "ajuste", label: "Ajuste" },
];

export const MOVEMENT_REASON_OPTIONS: { value: MovementReason | "all"; label: string }[] = [
  { value: "all", label: "Todas las razones" },
  { value: "compra", label: "Compra" },
  { value: "venta", label: "Venta" },
  { value: "uso_clinico", label: "Uso Clínico" },
  { value: "devolucion", label: "Devolución" },
  { value: "vencimiento", label: "Vencimiento" },
  { value: "perdida", label: "Pérdida" },
  { value: "ajuste_manual", label: "Ajuste Manual" },
  { value: "stock_inicial", label: "Stock Inicial" },
];

// ==================== HELPERS ====================
export function getMovementTypeLabel(type: MovementType): string {
  return MOVEMENT_TYPE_LABELS[type] || type;
}

export function getMovementReasonLabel(reason: MovementReason): string {
  return MOVEMENT_REASON_LABELS[reason] || reason;
}

export function getMovementReferenceLabel(ref: MovementReferenceType): string {
  return MOVEMENT_REFERENCE_LABELS[ref] || ref;
}

export function getMovementTypeConfig(type: MovementType): MovementTypeConfig {
  switch (type) {
    case "entrada":
      return {
        label: "Entrada",
        icon: "+",
        text: "text-success-600 dark:text-success-400",
        bg: "bg-success-50 dark:bg-success-950",
        border: "border-success-200 dark:border-success-800",
      };
    case "salida":
      return {
        label: "Salida",
        icon: "-",
        text: "text-danger-600 dark:text-danger-400",
        bg: "bg-danger-50 dark:bg-danger-950",
        border: "border-danger-200 dark:border-danger-800",
      };
    case "ajuste":
      return {
        label: "Ajuste",
        icon: "~",
        text: "text-warning-600 dark:text-warning-400",
        bg: "bg-warning-50 dark:bg-warning-950",
        border: "border-warning-200 dark:border-warning-800",
      };
  }
}

export function formatMovementQuantity(
  quantityUnits: number,
  quantityDoses: number,
  unit: string,
  doseUnit: string
): string {
  const parts: string[] = [];

  if (quantityUnits > 0) {
    parts.push(`${quantityUnits} ${unit}${quantityUnits !== 1 ? "s" : ""}`);
  }

  if (quantityDoses > 0) {
    parts.push(`${quantityDoses} ${doseUnit}`);
  }

  return parts.join(" + ") || "0";
}

export function formatMovementDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatMovementTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMovementDateTime(dateString: string): string {
  return `${formatMovementDate(dateString)} ${formatMovementTime(dateString)}`;
}