// src/types/sale.ts
import { z } from "zod";

// =============== ENUMS ===============
export const SaleStatusSchema = z.enum(["completada", "pendiente", "cancelada"]);
export type SaleStatus = z.infer<typeof SaleStatusSchema>;

// =============== SALE ITEM ===============
export const saleItemSchema = z.object({
  product: z.string(),
  productName: z.string(),
  quantity: z.number().min(0.01),
  isFullUnit: z.boolean(),
  unitPrice: z.number().min(0),
  pricePerDose: z.number().min(0).optional(),
  subtotal: z.number().min(0),
  discount: z.number().min(0).default(0),
  total: z.number().min(0),
});

export type SaleItem = z.infer<typeof saleItemSchema>;

// =============== POPULATED REFS ===============
const populatedOwnerSchema = z.object({
  _id: z.string(),
  name: z.string(),
  contact: z.string().optional(),
  creditBalance: z.number().optional(),
}).nullable().optional();

const populatedPatientSchema = z.object({
  _id: z.string(),
  name: z.string(),
  species: z.string().optional(),
  breed: z.string().optional(),
}).nullable().optional();

const populatedInvoiceSchema = z.object({
  _id: z.string(),
  paymentStatus: z.string(),
  total: z.number().optional(),
  amountPaid: z.number().optional(),
}).nullable().optional();

// =============== SALE ===============
export const saleSchema = z.object({
  _id: z.string(),
  
  // Cliente
  owner: z.union([z.string(), populatedOwnerSchema]).optional(),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  
  // Paciente
  patient: z.union([z.string(), populatedPatientSchema]).optional(),
  patientName: z.string().optional(),
  
  // Items
  items: z.array(saleItemSchema),
  
  // Totales
  subtotal: z.number().min(0),
  discountTotal: z.number().min(0).default(0),
  total: z.number().min(0),
  
  // Pago
  amountPaidUSD: z.number().min(0).default(0),
  amountPaidBs: z.number().min(0).default(0),
  creditUsed: z.number().min(0).default(0),
  exchangeRate: z.number().min(0.01).default(1),
  amountPaid: z.number().min(0).default(0),
  changeAmount: z.number().min(0).default(0),
  
  // Estado
  status: SaleStatusSchema,
  isPaid: z.boolean(),
  
  // Factura
  invoice: z.union([z.string(), populatedInvoiceSchema]).optional(),
  
  // Metadata
  notes: z.string().optional(),
  veterinarian: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Sale = z.infer<typeof saleSchema>;

export const salesListSchema = z.array(saleSchema);

// =============== FORM DATA ===============
export type SaleItemFormData = {
  productId: string;
  quantity: number;
  isFullUnit: boolean;
  discount?: number;
};

export type SaleFormData = {
  // Cliente
  ownerId?: string;
  ownerName?: string;
  ownerPhone?: string;
  patientId?: string;
  
  // Items
  items: SaleItemFormData[];
  
  // Descuentos
  discountTotal?: number;
  
  // Pago
  amountPaidUSD?: number;
  amountPaidBs?: number;
  creditUsed?: number;
  exchangeRate?: number;
  
  // Método de pago
  paymentMethodId?: string;
  paymentReference?: string;
  
  // Notas
  notes?: string;
};

// =============== CART ITEM (para el frontend) ===============
export type CartItem = {
  productId: string;
  productName: string;
  quantity: number;
  isFullUnit: boolean;
  unitPrice: number;
  pricePerDose?: number;
  subtotal: number;
  discount: number;
  total: number;
  unit: string;
  doseUnit: string;
  availableStock: number;
  isDivisible: boolean;
};

// =============== VALIDATE STOCK ===============
export type ValidateStockItem = {
  productId: string;
  quantity: number;
  isFullUnit: boolean;
};

export type ValidateStockResult = {
  productId: string;
  productName?: string;
  valid: boolean;
  available?: number;
  requested?: number;
  unit?: string;
  error?: string;
};

export type ValidateStockResponse = {
  valid: boolean;
  items: ValidateStockResult[];
};

// =============== RESPONSES ===============
export type CreateSaleResponse = {
  msg: string;
  sale: Sale;
  invoiceId: string;
  paymentsCreated: number;
  changeAmount: number;
};

export type GetSaleResponse = {
  sale: Sale;
};

export type GetSalesResponse = {
  sales: Sale[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type CancelSaleResponse = {
  msg: string;
  sale: Sale;
};

// =============== SUMMARY ===============
export type TodaySummary = {
  totalSales: number;
  completedCount: number;
  pendingCount: number;
  totalAmount: number;
  totalCollectedUSD: number;
  totalCollectedBs: number;
  totalCreditUsed: number;
  totalPending: number;
};

export type TodaySummaryResponse = {
  summary: TodaySummary;
  sales: Sale[];
};

export type SalesByDay = Record<string, {
  count: number;
  total: number;
  paid: number;
}>;

export type TopProduct = {
  productId: string;
  name: string;
  quantity: number;
  total: number;
};

export type SalesSummary = {
  totalSales: number;
  totalAmount: number;
  totalCollected: number;
  totalPending: number;
  averageTicket: number;
  salesByDay: SalesByDay;
  topProducts: TopProduct[];
};

export type SalesSummaryResponse = {
  summary: SalesSummary;
};

// =============== FILTERS ===============
export type GetSalesParams = {
  status?: SaleStatus;
  isPaid?: boolean;
  ownerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

// =============== HELPERS ===============
export function getOwnerName(sale: Sale): string {
  if (sale.ownerName) return sale.ownerName;
  if (!sale.owner) return "Cliente anónimo";
  if (typeof sale.owner === "string") return "Cliente";
  return sale.owner.name || "Sin nombre";
}

export function getOwnerId(sale: Sale): string | undefined {
  if (!sale.owner) return undefined;
  if (typeof sale.owner === "string") return sale.owner;
  return sale.owner._id;
}

export function getPatientName(sale: Sale): string | undefined {
  if (sale.patientName) return sale.patientName;
  if (!sale.patient) return undefined;
  if (typeof sale.patient === "string") return "Paciente";
  return sale.patient.name;
}

export function getInvoiceId(sale: Sale): string | undefined {
  if (!sale.invoice) return undefined;
  if (typeof sale.invoice === "string") return sale.invoice;
  return sale.invoice._id;
}

export function getInvoiceStatus(sale: Sale): string | undefined {
  if (!sale.invoice) return undefined;
  if (typeof sale.invoice === "string") return undefined;
  return sale.invoice.paymentStatus;
}

export function formatSaleStatus(status: SaleStatus): string {
  const statusMap: Record<SaleStatus, string> = {
    completada: "Completada",
    pendiente: "Pendiente",
    cancelada: "Cancelada",
  };
  return statusMap[status];
}

export function getSaleStatusColor(status: SaleStatus): string {
  const colorMap: Record<SaleStatus, string> = {
    completada: "text-green-600 bg-green-50",
    pendiente: "text-yellow-600 bg-yellow-50",
    cancelada: "text-red-600 bg-red-50",
  };
  return colorMap[status];
}