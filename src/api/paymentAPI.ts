// src/api/paymentAPI.ts
import { AxiosError } from "axios";
import {
  PaymentMethodSchema,
  PaymentMethodFormSchema,
  paymentSchema,
  paymentsListSchema,
  type PaymentMethod,
  type PaymentMethodFormData,
  type Payment,
  type PaymentFormData,
  type GetPaymentsParams,
} from "../types/payment";
import api from "../lib/axios";
import type { Invoice } from "../types/invoice";

// ============================================
// TIPOS DE RESPUESTA - PAYMENT METHOD
// ============================================

type PaymentMethodsResponse = {
  success: boolean;
  paymentMethods: PaymentMethod[];
};

type PaymentMethodResponse = {
  success: boolean;
  paymentMethod: PaymentMethod;
};

type CreatePaymentMethodResponse = {
  success: boolean;
  msg: string;
  paymentMethod: PaymentMethod;
};

type UpdatePaymentMethodResponse = {
  success: boolean;
  msg: string;
  paymentMethod: PaymentMethod;
};

type DeletePaymentMethodResponse = {
  success: boolean;
  msg: string;
};

// ============================================
// TIPOS DE RESPUESTA - PAYMENT (HISTORIAL)
// ============================================

type CreatePaymentResponse = {
  msg: string;
  payment: Payment | null;
  invoice: Invoice;
  creditUsed?: number;
};

type GetPaymentsResponse = {
  payments: Payment[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type CancelPaymentResponse = {
  msg: string;
  payment: Payment;
  invoice: Invoice;
};

// ============================================
// PAYMENT METHOD - FUNCIONES
// ============================================

// OBTENER TODOS LOS MÉTODOS DE PAGO DEL VETERINARIO
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const { data } = await api.get<PaymentMethodsResponse>("/payment-methods");

    const response = PaymentMethodSchema.array().safeParse(data.paymentMethods);
    if (!response.success) {
      throw new Error("Estructura de respuesta inválida del servidor");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al obtener los métodos de pago"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// OBTENER MÉTODO DE PAGO POR ID
export async function getPaymentMethodById(id: string): Promise<PaymentMethod> {
  try {
    const { data } = await api.get<PaymentMethodResponse>(
      `/payment-methods/${id}`
    );

    const response = PaymentMethodSchema.safeParse(data.paymentMethod);
    if (!response.success) {
      throw new Error("Estructura de respuesta inválida del servidor");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al obtener el método de pago"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// CREAR MÉTODO DE PAGO
export async function createPaymentMethod(
  formData: PaymentMethodFormData
): Promise<PaymentMethod> {
  try {
    const validatedData = PaymentMethodFormSchema.parse(formData);

    const { data } = await api.post<CreatePaymentMethodResponse>(
      "/payment-methods",
      validatedData
    );

    const response = PaymentMethodSchema.safeParse(data.paymentMethod);
    if (!response.success) {
      throw new Error("Estructura de respuesta inválida del servidor");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al crear el método de pago"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// ACTUALIZAR MÉTODO DE PAGO
export async function updatePaymentMethod(
  id: string,
  formData: Partial<PaymentMethodFormData>
): Promise<PaymentMethod> {
  try {
    const { data } = await api.put<UpdatePaymentMethodResponse>(
      `/payment-methods/${id}`,
      formData
    );

    const response = PaymentMethodSchema.safeParse(data.paymentMethod);
    if (!response.success) {
      throw new Error("Estructura de respuesta inválida del servidor");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al actualizar el método de pago"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// ELIMINAR MÉTODO DE PAGO
export async function deletePaymentMethod(id: string): Promise<void> {
  try {
    await api.delete<DeletePaymentMethodResponse>(`/payment-methods/${id}`);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al eliminar el método de pago"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// ============================================
// PAYMENT (HISTORIAL) - FUNCIONES
// ============================================

/**
 * Crear un nuevo pago
 */
export async function createPayment(
  formData: PaymentFormData
): Promise<CreatePaymentResponse> {
  try {
    const { data } = await api.post<CreatePaymentResponse>("/payments", formData);

    // Si hay payment, validarlo. Si es null (solo crédito), está bien
    if (data.payment) {
      const parsed = paymentSchema.safeParse(data.payment);
      if (!parsed.success) {
        console.error("Error parsing payment:", parsed.error);
        throw new Error("Datos del pago inválidos");
      }
      return {
        msg: data.msg,
        payment: parsed.data,
        invoice: data.invoice,
        creditUsed: data.creditUsed,
      };
    }

    // Pago solo con crédito - no hay objeto payment
    return {
      msg: data.msg,
      payment: null,
      invoice: data.invoice,
      creditUsed: data.creditUsed,
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.msg || "Error al crear el pago");
    }
    throw error;
  }
}

/**
 * Obtener lista de pagos del veterinario
 */
export async function getPayments(
  params?: GetPaymentsParams
): Promise<GetPaymentsResponse> {
  try {
    const { data } = await api.get<GetPaymentsResponse>("/payments", { params });

    const parsed = paymentsListSchema.safeParse(data.payments);
    if (!parsed.success) {
      console.error("Error parsing payments:", parsed.error);
      throw new Error("Datos de los pagos inválidos");
    }

    return {
      payments: parsed.data,
      pagination: data.pagination,
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.msg || "Error al obtener los pagos");
    }
    throw error;
  }
}

/**
 * Obtener historial de pagos de una factura
 */
export async function getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
  try {
    const { data } = await api.get<{ payments: Payment[] }>(
      `/payments/invoice/${invoiceId}`
    );

    const parsed = paymentsListSchema.safeParse(data.payments);
    if (!parsed.success) {
      console.error("Error parsing payments:", parsed.error);
      throw new Error("Datos de los pagos inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data?.msg || "Error al obtener el historial de pagos"
      );
    }
    throw error;
  }
}

/**
 * Cancelar/anular un pago
 */
export async function cancelPayment(
  paymentId: string,
  reason?: string
): Promise<CancelPaymentResponse> {
  try {
    const { data } = await api.patch<CancelPaymentResponse>(
      `/payments/${paymentId}/cancel`,
      { reason }
    );

    const parsed = paymentSchema.safeParse(data.payment);
    if (!parsed.success) {
      console.error("Error parsing cancelled payment:", parsed.error);
      throw new Error("Datos del pago inválidos");
    }

    return {
      msg: data.msg,
      payment: parsed.data,
      invoice: data.invoice,
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.msg || "Error al anular el pago");
    }
    throw error;
  }
}

/**
 * Obtener resumen de pagos por rango de fechas
 */
export async function getPaymentsSummary(
  startDate: string,
  endDate: string
): Promise<{
  totalUSD: number;
  totalBs: number;
  count: number;
  payments: Payment[];
}> {
  try {
    const { payments } = await getPayments({
      status: "active",
      startDate,
      endDate,
      limit: 1000,
    });

    const totalUSD = payments
      .filter((p) => p.currency === "USD")
      .reduce((sum, p) => sum + p.amount, 0);

    const totalBs = payments
      .filter((p) => p.currency === "Bs")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalUSD,
      totalBs,
      count: payments.length,
      payments,
    };
  } catch (error) {
    console.error("Error getting payments summary:", error);
    return { totalUSD: 0, totalBs: 0, count: 0, payments: [] };
  }
}