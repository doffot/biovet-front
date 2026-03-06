// src/types/labExam/quickTest.ts

export interface QuickTestFormData {
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
  testName: string;
  results: string;
  productId?: string;
  quantity: number;
  paymentMethodId?: string;
  paymentReference?: string;
  exchangeRate?: number;
  paymentAmount?: number;
  paymentCurrency?: string;
  isPartialPayment?: boolean;
  creditAmountUsed?: number;
}

export type TabId = "patient" | "exam" | "results";

export interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface PaymentConfirmData {
  paymentMethodId?: string;
  reference?: string;
  addAmountPaidUSD: number;
  addAmountPaidBs: number;
  exchangeRate: number;
  isPartial: boolean;
  creditAmountUsed?: number;
}