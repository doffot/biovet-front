// src/types/labExam/trichogram.ts

export interface TrichogramFormData {
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

export type TrichogramTabId = "patient" | "exam" | "results";

export interface TrichogramTabConfig {
  id: TrichogramTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface TrichogramPaymentData {
  paymentMethodId?: string;
  reference?: string;
  addAmountPaidUSD: number;
  addAmountPaidBs: number;
  exchangeRate: number;
  isPartial: boolean;
  creditAmountUsed?: number;
}