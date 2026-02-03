// src/types/invoice.ts
import { z } from "zod";

// Tipos
export const InvoiceStatusSchema = z.enum(["Pendiente", "Pagado", "Parcial", "Cancelado"]);
export const InvoiceItemTypeSchema = z.enum(["grooming", "labExam", "consulta", "vacuna", "producto"]);

export const invoiceItemSchema = z.object({
  type: InvoiceItemTypeSchema,
  resourceId: z.string(),
  description: z.string().min(1, "La descripción es obligatoria"),
  cost: z.number().min(0, "El costo debe ser positivo"),
  quantity: z.number().min(1, "La cantidad debe ser al menos 1").int(),
});

const populatedOwnerSchema = z.object({
  _id: z.string(),
  name: z.string(),
  contact: z.string().optional(),
}).nullable().optional();

const populatedPatientSchema = z.object({
  _id: z.string(),
  name: z.string(),
}).nullable().optional();

const populatedVetSchema = z.object({
  _id: z.string(),
  name: z.string(),
  lastName: z.string().optional(),
}).nullable().optional();

const populatedPaymentMethodSchema = z.object({
  _id: z.string(),
  name: z.string(),
}).nullable().optional();

export const invoiceSchema = z.object({
  _id: z.string().optional(),
  
  ownerId: z.union([z.string(), populatedOwnerSchema]).optional(),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  
  patientId: z.union([z.string(), populatedPatientSchema]).optional(),
  veterinarianId: z.union([z.string(), populatedVetSchema]),
  paymentMethod: z.union([z.string(), populatedPaymentMethodSchema]).optional(),
  
  items: z.array(invoiceItemSchema).min(1, "La factura debe tener al menos un ítem"),
  
  currency: z.enum(["USD", "Bs"]),
  exchangeRate: z.number().optional(),
  
  total: z.number().min(0, "El total debe ser positivo"),
  
  amountPaidUSD: z.number().min(0).optional().default(0),
  amountPaidBs: z.number().min(0).optional().default(0),
  
  amountPaid: z.number().min(0, "El monto pagado debe ser positivo"),
  paymentStatus: InvoiceStatusSchema,
  paymentReference: z.string().optional(),
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "La fecha debe ser válida",
  }),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const invoicesListSchema = z.array(invoiceSchema);
export const invoiceResponseSchema = z.object({
  invoice: invoiceSchema,
});
export const invoicesResponseSchema = z.object({
  invoices: invoicesListSchema,
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }).optional(),
});

export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;
export type InvoiceItemType = z.infer<typeof InvoiceItemTypeSchema>;

export type PopulatedOwner = z.infer<typeof populatedOwnerSchema>;
export type PopulatedPatient = z.infer<typeof populatedPatientSchema>;

export type InvoiceFormData = {
  ownerId?: string;
  ownerName?: string;
  ownerPhone?: string;
  patientId?: string;
  items: InvoiceItem[];
  currency: "USD" | "Bs";
  exchangeRate?: number;
  total: number;
  amountPaidUSD?: number;
  amountPaidBs?: number;
  amountPaid?: number;
  paymentStatus: InvoiceStatus;
  paymentMethod?: string;
  paymentReference?: string;
  date: string;
};

export function getOwnerId(invoice: Invoice): string | undefined {
  if (!invoice.ownerId) return undefined;
  if (typeof invoice.ownerId === 'string') return invoice.ownerId;
  return invoice.ownerId._id;
}

// Helper para obtener el nombre del paciente
export function getPatientName(invoice: Invoice): string {
  if (!invoice.patientId) return 'Sin paciente';
  if (typeof invoice.patientId === 'string') return 'Paciente';
  if (typeof invoice.patientId === 'object' && invoice.patientId !== null) {
    return invoice.patientId.name || 'Sin nombre';
  }
  return 'Sin paciente';
}

// Helper para obtener el nombre del owner
export function getOwnerName(invoice: Invoice): string {
  if (invoice.ownerName) return invoice.ownerName;
  if (!invoice.ownerId) return 'Sin propietario';
  if (typeof invoice.ownerId === 'string') return 'Propietario';
  if (typeof invoice.ownerId === 'object' && invoice.ownerId !== null) {
    return invoice.ownerId.name || 'Sin nombre';
  }
  return 'Sin propietario';
}