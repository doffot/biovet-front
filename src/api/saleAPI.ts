// src/api/saleAPI.ts
import { AxiosError } from "axios";
import api from "../lib/axios";
import {
  saleSchema,
  salesListSchema,
  type Sale,
  type SaleFormData,
  type GetSalesParams,
  type GetSalesResponse,
  type GetSaleResponse,
  type CreateSaleResponse,
  type CancelSaleResponse,
  type ValidateStockItem,
  type ValidateStockResponse,
  type TodaySummaryResponse,
  type SalesSummaryResponse,
} from "../types/sale";

// ==================== CREAR VENTA ====================
export async function createSale(data: SaleFormData): Promise<CreateSaleResponse> {
  try {
    const { data: response } = await api.post<CreateSaleResponse>("/sales", data);
    
    const parsed = saleSchema.safeParse(response.sale);
    if (!parsed.success) {
      console.error("Error parsing sale:", parsed.error);
      throw new Error("Datos de venta inválidos");
    }
    
    return {
      ...response,
      sale: parsed.data,
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear la venta");
    }
    throw error;
  }
}

// ==================== OBTENER VENTAS ====================
export async function getSales(params?: GetSalesParams): Promise<GetSalesResponse> {
  try {
    const { data } = await api.get<GetSalesResponse>("/sales", { params });
    
    const parsed = salesListSchema.safeParse(data.sales);
    if (!parsed.success) {
      console.error("Error parsing sales:", parsed.error);
      throw new Error("Datos de ventas inválidos");
    }
    
    return {
      sales: parsed.data,
      pagination: data.pagination,
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener ventas");
    }
    throw error;
  }
}

// ==================== OBTENER VENTA POR ID ====================
export async function getSaleById(id: string): Promise<Sale> {
  try {
    const { data } = await api.get<GetSaleResponse>(`/sales/${id}`);
    
    const parsed = saleSchema.safeParse(data.sale);
    if (!parsed.success) {
      console.error("Error parsing sale:", parsed.error);
      throw new Error("Datos de venta inválidos");
    }
    
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener la venta");
    }
    throw error;
  }
}

// ==================== CANCELAR VENTA ====================
export async function cancelSale(id: string, reason?: string): Promise<CancelSaleResponse> {
  try {
    const { data } = await api.patch<CancelSaleResponse>(`/sales/${id}/cancel`, { reason });
    
    const parsed = saleSchema.safeParse(data.sale);
    if (!parsed.success) {
      console.error("Error parsing sale:", parsed.error);
      throw new Error("Datos de venta inválidos");
    }
    
    return {
      ...data,
      sale: parsed.data,
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al cancelar la venta");
    }
    throw error;
  }
}

// ==================== VALIDAR STOCK ====================
export async function validateStock(items: ValidateStockItem[]): Promise<ValidateStockResponse> {
  try {
    const { data } = await api.post<ValidateStockResponse>("/sales/validate-stock", { items });
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al validar stock");
    }
    throw error;
  }
}

// ==================== RESUMEN DEL DÍA ====================
export async function getTodaySummary(): Promise<TodaySummaryResponse> {
  try {
    const { data } = await api.get<TodaySummaryResponse>("/sales/today");
    
    const parsed = salesListSchema.safeParse(data.sales);
    if (!parsed.success) {
      console.error("Error parsing sales:", parsed.error);
    }
    
    return {
      summary: data.summary,
      sales: parsed.success ? parsed.data : data.sales,
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener resumen del día");
    }
    throw error;
  }
}

// ==================== RESUMEN POR RANGO DE FECHAS ====================
export async function getSalesSummary(startDate: string, endDate: string): Promise<SalesSummaryResponse> {
  try {
    const { data } = await api.get<SalesSummaryResponse>("/sales/summary", {
      params: { startDate, endDate },
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener resumen de ventas");
    }
    throw error;
  }
}

// ==================== HELPERS ====================

/**
 * Obtener ventas pendientes de pago
 */
export async function getPendingSales(): Promise<Sale[]> {
  const response = await getSales({ isPaid: false, status: "completada" });
  return response.sales;
}

/**
 * Obtener ventas de un cliente
 */
export async function getSalesByOwner(ownerId: string): Promise<Sale[]> {
  const response = await getSales({ ownerId });
  return response.sales;
}

/**
 * Obtener ventas de hoy
 */
export async function getTodaySales(): Promise<Sale[]> {
  const today = new Date().toISOString().split("T")[0];
  const response = await getSales({ startDate: today, endDate: today });
  return response.sales;
}

/**
 * Calcular total del carrito
 */
export function calculateCartTotal(items: { subtotal: number; discount: number }[]): {
  subtotal: number;
  totalDiscount: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
  const total = subtotal - totalDiscount;
  
  return { subtotal, totalDiscount, total };
}

/**
 * Formatear monto como moneda
 */
export function formatCurrency(amount: number, currency: "USD" | "Bs" = "USD"): string {
  if (currency === "USD") {
    return `$${amount.toFixed(2)}`;
  }
  return `Bs. ${amount.toFixed(2)}`;
}