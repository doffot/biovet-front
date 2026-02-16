// src/views/dashboard/constants/dashboardConstants.ts
export const CHART_COLORS = [
  "#10b981",
  "#3b82f6", 
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899"
];

export const QUERY_CONFIG = {
  staleTime: 30 * 1000,
  gcTime: 5 * 60 * 1000,
} as const;

export const QUERY_CONFIG_EXTENDED = {
  staleTime: 60 * 1000,
  gcTime: 5 * 60 * 1000,
} as const;

// Tipos para moneda
export interface CurrencyAmounts {
  USD: number;
  Bs: number;
}

export const EMPTY_CURRENCY: CurrencyAmounts = {
  USD: 0,
  Bs: 0,
};