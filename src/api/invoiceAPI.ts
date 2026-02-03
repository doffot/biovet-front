// src/api/invoiceAPI.ts
import { AxiosError } from "axios";
import {
  invoiceSchema,
  invoicesListSchema,
  type Invoice,
  type InvoiceFormData,
  type InvoiceStatus,
} from "../types/invoice";
import api from "../lib/axios";

// ============================================
// TIPOS DE RESPUESTA
// ============================================

type CreateInvoiceResponse = {
  msg: string;
  invoice: Invoice;
};

type GetInvoiceResponse = {
  invoice: Invoice;
};

type GetInvoicesResponse = {
  invoices: Invoice[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type DeleteInvoiceResponse = {
  msg: string;
};

// Parámetros para filtrar facturas
type GetInvoicesParams = {
  status?: InvoiceStatus;
  ownerId?: string;
  ownerName?: string;
  patientId?: string;
  page?: number;
  limit?: number;
};

// Datos para actualizar factura
type UpdateInvoiceData = Partial<InvoiceFormData> & {
  paymentMethod?: string;
  paymentReference?: string;
  paymentStatus?: InvoiceStatus;
  exchangeRate?: number;
  amountPaidUSD?: number;
  amountPaidBs?: number;
  addAmountPaidUSD?: number;
  addAmountPaidBs?: number;
};

// Datos para actualizar item
type UpdateInvoiceItemData = {
  cost?: number;
  description?: string;
  quantity?: number;
};

// Resumen de deuda
type DebtSummary = {
  totalDebt: number;
  invoicesCount: number;
  invoices: Invoice[];
};

// ============================================
// FUNCIONES DE API
// ============================================

/**
 * Crear una nueva factura
 */
export async function createInvoice(formData: InvoiceFormData): Promise<Invoice> {
  try {
    const { data } = await api.post<CreateInvoiceResponse>("/invoices", formData);

    const parsed = invoiceSchema.safeParse(data.invoice);
    if (!parsed.success) {
      console.error("Error parsing invoice:", parsed.error);
      throw new Error("Datos de la factura inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.msg || "Error al crear la factura");
    }
    throw error;
  }
}

/**
 * Obtener lista de facturas con filtros y paginación
 */
export async function getInvoices(params?: GetInvoicesParams): Promise<GetInvoicesResponse> {
  try {
    const { data } = await api.get<GetInvoicesResponse>("/invoices", { params });

    const parsed = invoicesListSchema.safeParse(data.invoices);
    if (!parsed.success) {
      console.error("Error parsing invoices:", parsed.error);
      throw new Error("Datos de las facturas inválidos");
    }

    return {
      invoices: parsed.data,
      pagination: data.pagination,
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.msg || "Error al obtener facturas");
    }
    throw error;
  }
}

/**
 * Obtener factura por ID
 */
export async function getInvoiceById(id: string): Promise<Invoice> {
  try {
    const { data } = await api.get<GetInvoiceResponse>(`/invoices/${id}`);

    const parsed = invoiceSchema.safeParse(data.invoice);
    if (!parsed.success) {
      throw new Error("Datos de la factura inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.msg || "Error al obtener la factura");
    }
    throw error;
  }
}

/**
 * Obtener factura por Resource ID (grooming, consulta, etc.)
 */
export async function getInvoiceByResourceId(
  resourceId: string,
  type: "grooming" | "labExam" | "consulta" | "vacuna" | "producto" = "grooming"
): Promise<Invoice | null> {
  try {
    const { data } = await api.get<GetInvoiceResponse>(
      `/invoices/resource/${resourceId}`,
      { params: { type } }
    );

    const parsed = invoiceSchema.safeParse(data.invoice);
    if (!parsed.success) {
      console.error("Error parsing invoice:", parsed.error);
      return null;
    }

    return parsed.data;
  } catch (error) {
    // Si no existe, retornar null en lugar de lanzar error
    if (error instanceof AxiosError && error.response?.status === 404) {
      return null;
    }
    return null;
  }
}

/**
 * Actualizar factura (pagos, estado, etc.)
 */
export async function updateInvoice(
  id: string,
  updateData: UpdateInvoiceData
): Promise<Invoice> {
  try {
    // Limpiar datos undefined
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    const { data } = await api.put<CreateInvoiceResponse>(
      `/invoices/${id}`,
      cleanData
    );

    const parsed = invoiceSchema.safeParse(data.invoice);
    if (!parsed.success) {
      throw new Error("Datos de la factura actualizados inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.msg || "Error al actualizar la factura");
    }
    throw error;
  }
}

/**
 * Actualizar item específico de una factura
 */
export async function updateInvoiceItem(
  invoiceId: string,
  resourceId: string,
  updates: UpdateInvoiceItemData
): Promise<Invoice> {
  try {
    const { data } = await api.put<CreateInvoiceResponse>(
      `/invoices/${invoiceId}/item/${resourceId}`,
      updates
    );

    const parsed = invoiceSchema.safeParse(data.invoice);
    if (!parsed.success) {
      throw new Error("Datos de la factura inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.msg || "Error al actualizar el item de la factura");
    }
    throw error;
  }
}

/**
 * Eliminar factura
 */
export async function deleteInvoice(id: string): Promise<DeleteInvoiceResponse> {
  try {
    const { data } = await api.delete<DeleteInvoiceResponse>(`/invoices/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.msg || "Error al eliminar la factura");
    }
    throw error;
  }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Obtener facturas pendientes o parciales por paciente
 */
export async function getPendingInvoicesByPatient(patientId: string): Promise<Invoice[]> {
  try {
    const [pendingResponse, partialResponse] = await Promise.all([
      getInvoices({ patientId, status: "Pendiente" }),
      getInvoices({ patientId, status: "Parcial" }),
    ]);

    return [...pendingResponse.invoices, ...partialResponse.invoices];
  } catch (error) {
    return [];
  }
}

/**
 * Obtener facturas pendientes o parciales por owner
 */
export async function getPendingInvoicesByOwner(ownerId: string): Promise<Invoice[]> {
  try {
    const [pendingResponse, partialResponse] = await Promise.all([
      getInvoices({ ownerId, status: "Pendiente" }),
      getInvoices({ ownerId, status: "Parcial" }),
    ]);

    return [...pendingResponse.invoices, ...partialResponse.invoices];
  } catch (error) {
    return [];
  }
}

/**
 * Obtener resumen de deuda por paciente
 */
export async function getPatientDebtSummary(patientId: string): Promise<DebtSummary> {
  try {
    const invoices = await getPendingInvoicesByPatient(patientId);

    const totalDebt = invoices.reduce((sum, inv) => {
      const remaining = inv.total - (inv.amountPaid || 0);
      return sum + Math.max(0, remaining); // Evitar valores negativos
    }, 0);

    return {
      totalDebt,
      invoicesCount: invoices.length,
      invoices,
    };
  } catch (error) {
    return { totalDebt: 0, invoicesCount: 0, invoices: [] };
  }
}

/**
 * Obtener resumen de deuda por owner
 */
export async function getOwnerDebtSummary(ownerId: string): Promise<DebtSummary> {
  try {
    const invoices = await getPendingInvoicesByOwner(ownerId);

    const totalDebt = invoices.reduce((sum, inv) => {
      const remaining = inv.total - (inv.amountPaid || 0);
      return sum + Math.max(0, remaining);
    }, 0);

    return {
      totalDebt,
      invoicesCount: invoices.length,
      invoices,
    };
  } catch (error) {
    console.error("Error getting owner debt summary:", error);
    return { totalDebt: 0, invoicesCount: 0, invoices: [] };
  }
}

/**
 * Registrar pago incremental en USD
 */
export async function addPaymentUSD(
  invoiceId: string,
  amount: number,
  paymentMethod?: string,
  paymentReference?: string
): Promise<Invoice> {
  return updateInvoice(invoiceId, {
    addAmountPaidUSD: amount,
    paymentMethod,
    paymentReference,
  });
}

/**
 * Registrar pago incremental en Bs
 */
export async function addPaymentBs(
  invoiceId: string,
  amount: number,
  exchangeRate: number,
  paymentMethod?: string,
  paymentReference?: string
): Promise<Invoice> {
  return updateInvoice(invoiceId, {
    addAmountPaidBs: amount,
    exchangeRate,
    paymentMethod,
    paymentReference,
  });
}

/**
 * Marcar factura como pagada completamente
 */
export async function markAsPaid(
  invoiceId: string,
  invoice: Invoice,
  paymentMethod?: string,
  paymentReference?: string
): Promise<Invoice> {
  const remaining = invoice.total - (invoice.amountPaid || 0);

  return updateInvoice(invoiceId, {
    addAmountPaidUSD: remaining,
    paymentMethod,
    paymentReference,
  });
}

/**
 * Cancelar factura
 */
export async function cancelInvoice(invoiceId: string): Promise<Invoice> {
  return updateInvoice(invoiceId, {
    paymentStatus: "Cancelado",
  });
}