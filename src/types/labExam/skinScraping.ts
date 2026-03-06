// src/types/labExam/skinScraping.ts

export interface SkinScrapingFormData {
  patientId?: string;
  patientName: string;
  species: string;
  breed?: string;
  sex?: string;
  age?: string;
  weight?: number;
  cost: number;
  discount?: number;
  date: string;
  treatingVet?: string;
  ownerName?: string;
  ownerPhone?: string;
  type: "superficial" | "profunda";
  results: string;
  // Pago
  paymentMethodId?: string;
  paymentReference?: string;
  exchangeRate?: number;
  paymentAmount?: number;
  paymentCurrency?: string;
  isPartialPayment?: boolean;
  creditAmountUsed?: number;
}

export type SkinScrapingTabId = "patient" | "exam" | "results";

export interface SkinScrapingTabConfig {
  id: SkinScrapingTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface SkinScrapingPaymentData {
  paymentMethodId?: string;
  reference?: string;
  addAmountPaidUSD: number;
  addAmountPaidBs: number;
  exchangeRate: number;
  isPartial: boolean;
  creditAmountUsed?: number;
}