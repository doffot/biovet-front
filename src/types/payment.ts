// src/types/payment.ts
import { z } from "zod";



export const PaymentMethodSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  currency: z.string(),
  paymentMode: z.string(),
  requiresReference: z.boolean().default(false),
  isActive: z.boolean().default(true),
  veterinarian: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const PaymentMethodFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  currency: z.string().min(1, "La moneda es obligatoria"),
  paymentMode: z.string().min(1, "El modo de pago es obligatorio"),
  requiresReference: z.boolean().default(false),
});

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type PaymentMethodFormData = z.infer<typeof PaymentMethodFormSchema>;



export const PaymentStatusSchema = z.enum(["active", "cancelled"]);
export const PaymentCurrencySchema = z.enum(["USD", "Bs"]);

const populatedPaymentMethodSchema = z.object({
  _id: z.string(),
  name: z.string(),
  currency: z.string().optional(),
}).nullable().optional();

const populatedVetSchema = z.object({
  _id: z.string(),
  name: z.string(),
  lastName: z.string().optional(),
}).nullable().optional();

const populatedInvoiceSchema = z.object({
  _id: z.string(),
  total: z.number(),
  paymentStatus: z.string(),
}).nullable().optional();

export const paymentSchema = z.object({
  _id: z.string(),
  invoiceId: z.union([z.string(), populatedInvoiceSchema]),
  amount: z.number().min(0.01),
  currency: PaymentCurrencySchema,
  exchangeRate: z.number().min(0.01),
  amountUSD: z.number().min(0),
  paymentMethod: z.union([z.string(), populatedPaymentMethodSchema]).nullable().optional(),
  reference: z.string().optional(),
  status: PaymentStatusSchema,
  isCredit: z.boolean().default(false),
  cancelledAt: z.string().optional(),
  cancelledBy: z.union([z.string(), populatedVetSchema]).optional(),
  cancelledReason: z.string().optional(),
  createdBy: z.union([z.string(), populatedVetSchema]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const paymentsListSchema = z.array(paymentSchema);

export type Payment = z.infer<typeof paymentSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type PaymentCurrency = z.infer<typeof PaymentCurrencySchema>;

export type PaymentFormData = {
  invoiceId: string;
  amount?: number;
  currency: PaymentCurrency;
  exchangeRate: number;
  paymentMethod?: string;
  reference?: string;
  creditAmountUsed?: number;
};

export type GetPaymentsParams = {
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};



// Helper para obtener nombre del método de pago
export function getPaymentMethodName(payment: Payment): string {
  if (!payment.paymentMethod) return "Crédito a favor";
  if (typeof payment.paymentMethod === "string") return "Método";
  return payment.paymentMethod.name || "Sin nombre";
}

// Helper para obtener nombre del creador
export function getCreatorName(payment: Payment): string {
  if (!payment.createdBy) return "Desconocido";
  if (typeof payment.createdBy === "string") return "Usuario";
  const vet = payment.createdBy;
  return `${vet.name || ""} ${vet.lastName || ""}`.trim() || "Sin nombre";
}

// Helper para obtener nombre de quien canceló
export function getCancelledByName(payment: Payment): string {
  if (!payment.cancelledBy) return "Desconocido";
  if (typeof payment.cancelledBy === "string") return "Usuario";
  const vet = payment.cancelledBy;
  return `${vet.name || ""} ${vet.lastName || ""}`.trim() || "Sin nombre";
}

// Helper para formatear monto
export function formatPaymentAmount(payment: Payment): string {
  if (payment.currency === "Bs") {
    return `Bs. ${payment.amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
  }
  return `$${payment.amount.toFixed(2)}`;
}