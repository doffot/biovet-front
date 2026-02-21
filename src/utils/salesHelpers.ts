// src/views/sales/helpers/salesHelpers.ts

import type { Sale, SaleStatus } from "@/types/sale";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  type LucideIcon,
} from "lucide-react";


// ==================== TIPOS ====================

export type FilterStatus =
  | "all"
  | "completada"
  | "pendiente"
  | "con-deuda"
  | "cancelada";

export interface StatusConfig {
  icon: LucideIcon;
  label: string;
  text: string;
  bg: string;
  border: string;
}

export interface PaymentBadgeConfig {
  icon: LucideIcon;
  label: string;
  text: string;
  bg: string;
  border: string;
}

// ==================== HELPERS PROPIOS DE SALES ====================

export function getPendingAmount(sale: Sale): number {
  return Math.max(0, sale.total - sale.amountPaid);
}

export function formatSaleDate(d: string): string {
  return new Date(d).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatSaleTime(d: string): string {
  return new Date(d).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getItemsSummary(sale: Sale): string {
  if (sale.items.length <= 2) {
    return sale.items.map((i) => i.productName).join(", ");
  }
  return `${sale.items
    .slice(0, 2)
    .map((i) => i.productName)
    .join(", ")} +${sale.items.length - 2}`;
}

// ==================== STATUS CONFIGS ====================

export function getStatusConfig(status: SaleStatus): StatusConfig {
  switch (status) {
    case "completada":
      return {
        icon: CheckCircle2,
        label: "Completada",
        text: "text-success-600 dark:text-success-400",
        bg: "bg-success-50 dark:bg-success-950",
        border: "border-success-200 dark:border-success-800",
      };
    case "pendiente":
      return {
        icon: Clock,
        label: "Pendiente",
        text: "text-warning-600 dark:text-warning-400",
        bg: "bg-warning-50 dark:bg-warning-950",
        border: "border-warning-200 dark:border-warning-800",
      };
    case "cancelada":
      return {
        icon: XCircle,
        label: "Cancelada",
        text: "text-danger-600 dark:text-danger-400",
        bg: "bg-danger-50 dark:bg-danger-950",
        border: "border-danger-200 dark:border-danger-800",
      };
  }
}

export function getPaymentBadge(sale: Sale): PaymentBadgeConfig {
  if (sale.isPaid)
    return {
      icon: CheckCircle2,
      label: "Pagado",
      text: "text-success-600 dark:text-success-400",
      bg: "bg-success-50 dark:bg-success-950",
      border: "border-success-200 dark:border-success-800",
    };
  if (sale.amountPaid > 0)
    return {
      icon: Clock,
      label: "Parcial",
      text: "text-warning-600 dark:text-warning-400",
      bg: "bg-warning-50 dark:bg-warning-950",
      border: "border-warning-200 dark:border-warning-800",
    };
  return {
    icon: AlertCircle,
    label: "Sin pago",
    text: "text-danger-600 dark:text-danger-400",
    bg: "bg-danger-50 dark:bg-danger-950",
    border: "border-danger-200 dark:border-danger-800",
  };
}