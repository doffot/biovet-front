// src/types/batch.ts
import type { LabExamFormData, DifferentialCount } from "./labExam";

export type BatchExamStatus = "pending" | "saving" | "saved" | "error";

export type BatchExam = {
  // ID temporal solo en frontend
  tempId: string;

  // Mismo FormData que ya usas en CreateLabExamView
  formData: LabExamFormData;

  // Igual que en CreateLabExamView
  differentialCount: DifferentialCount;
  totalCells: number;

  // Control de estado del guardado
  status: BatchExamStatus;
  errorMessage?: string;

  // Pago (solo si ownerName existe = externo)
  paymentData?: {
    paymentMethodId?: string;
    reference?: string;
    addAmountPaidUSD: number;
    addAmountPaidBs: number;
    exchangeRate: number;
    isPartial: boolean;
    creditAmountUsed?: number;
  };
};