// src/api/purchaseAPI.ts
import { AxiosError } from "axios";
import api from "../lib/axios";
import type { CreatePurchaseResponse, GetPurchaseResponse, GetPurchasesResponse, Purchase, PurchaseFormData } from "../types/purchase";


// ==================== CREAR COMPRA ====================
export async function createPurchase(data: PurchaseFormData): Promise<Purchase> {
  try {
    const { data: response } = await api.post<CreatePurchaseResponse>("/purchases", data);
    return response.purchase;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al registrar la compra");
    }
    throw new Error("Error de red");
  }
}

// ==================== OBTENER TODAS LAS COMPRAS ====================
export async function getAllPurchases(): Promise<Purchase[]> {
  try {
    const { data } = await api.get<GetPurchasesResponse>("/purchases");
    return data.purchases;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener compras");
    }
    throw new Error("Error de red");
  }
}

// ==================== OBTENER COMPRA POR ID ====================
export async function getPurchaseById(id: string): Promise<Purchase> {
  try {
    const { data } = await api.get<GetPurchaseResponse>(`/purchases/${id}`);
    return data.purchase;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener la compra");
    }
    throw new Error("Error de red");
  }
}