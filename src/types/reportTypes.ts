// src/views/invoices/types/reportTypes.ts

import type { Invoice, InvoiceStatus } from "./invoice";

export type DateRangeType = "today" | "week" | "month" | "year" | "custom" | "all";
export type CurrencyFilter = "all" | "USD" | "Bs";
export type StatusFilter = "all" | InvoiceStatus;
export type PaymentCurrencyFilter = "all" | "usd" | "bs" | "mixed";

export interface FilterState {
  dateRange: DateRangeType;
  customFrom: string;
  customTo: string;
  currency: CurrencyFilter;
  status: StatusFilter;
  paymentCurrency: PaymentCurrencyFilter;
  itemType: string;
}

export interface ReportStats {
  // Cobrado
  totalCobradoUSD: number;
  totalCobradoBs: number;
  cobradoBsEnUSD: number;
  totalCobradoGeneral: number;
  
  // Pendiente (legacy - mantener para no romper código existente)
  totalPendienteUSD: number;
  
  // Pendiente separado por moneda (NUEVO)
  pendienteUSD: number;
  pendienteBs: number;
  
  // Totales
  totalFacturado: number;
  totalInvoices: number;
  
  // Por estado
  byStatus: Record<InvoiceStatus, number>;
  paidCount: number;
  pendingCount: number;
  partialCount: number;
  canceledCount: number;
  
  // Por tipo/método
  byItemType: Record<string, { count: number; total: number }>;
  byPaymentMethod: Record<string, { count: number; totalUSD: number; totalBs: number }>;
}

export interface ReportData {
  invoices: Invoice[];
  stats: ReportStats;
  filters: FilterState;
  periodLabel: string;
  isLoading: boolean;
  isFetching: boolean;
}