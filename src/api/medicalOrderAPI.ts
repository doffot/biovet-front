// src/api/medicalOrderAPI.ts
import { AxiosError } from "axios";
import api from "../lib/axios";
import {
  medicalOrderSchema,
  medicalOrdersListSchema,
  type MedicalOrder,
  type MedicalOrderFormData,
} from "@/types/medicalOrder";

// Tipos de respuesta
type CreateResponse = {
  msg: string;
  medicalOrder: MedicalOrder;
};

type GetOneResponse = {
  medicalOrder: MedicalOrder;
};

type GetListResponse = {
  medicalOrders: MedicalOrder[];
};

type DeleteResponse = {
  msg: string;
};

type UpdateParams = {
  formData: Partial<MedicalOrderFormData>;
  orderId: string;
};

/* ══════════════════════════════════════════
   CREAR ORDEN MÉDICA
   ══════════════════════════════════════════ */
export async function createMedicalOrder(
  formData: MedicalOrderFormData,
  patientId: string
): Promise<MedicalOrder> {
  try {
    const { data } = await api.post<CreateResponse>(
      `/medical-orders/${patientId}`,
      formData
    );

    const parsed = medicalOrderSchema.safeParse(data.medicalOrder);
    if (!parsed.success) {
      console.error("Error parsing medical order:", parsed.error);
      throw new Error("Datos de orden médica inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear la orden médica");
    }
    throw new Error("Error de red o desconocido");
  }
}

/* ══════════════════════════════════════════
   OBTENER ÓRDENES POR PACIENTE
   ══════════════════════════════════════════ */
export async function getMedicalOrdersByPatient(
  patientId: string
): Promise<MedicalOrder[]> {
  try {
    const { data } = await api.get<GetListResponse>(
      `/medical-orders/patient/${patientId}`
    );

    const parsed = medicalOrdersListSchema.safeParse(data.medicalOrders);
    if (!parsed.success) {
      console.error("Error parsing medical orders:", parsed.error);
      throw new Error("Datos de órdenes médicas inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener órdenes médicas");
    }
    throw new Error("Error de red o desconocido");
  }
}

/* ══════════════════════════════════════════
   OBTENER TODAS LAS ÓRDENES DEL VETERINARIO
   ══════════════════════════════════════════ */
export async function getAllMedicalOrders(): Promise<MedicalOrder[]> {
  try {
    const { data } = await api.get<GetListResponse>("/medical-orders");

    const parsed = medicalOrdersListSchema.safeParse(data.medicalOrders);
    if (!parsed.success) {
      console.error("Error parsing medical orders:", parsed.error);
      throw new Error("Datos de órdenes médicas inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener órdenes médicas");
    }
    throw new Error("Error de red o desconocido");
  }
}

/* ══════════════════════════════════════════
   OBTENER ORDEN POR ID
   ══════════════════════════════════════════ */
export async function getMedicalOrderById(id: string): Promise<MedicalOrder> {
  try {
    const { data } = await api.get<GetOneResponse>(`/medical-orders/${id}`);

    const parsed = medicalOrderSchema.safeParse(data.medicalOrder);
    if (!parsed.success) {
      console.error("Error parsing medical order:", parsed.error);
      throw new Error("Datos de orden médica inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener la orden médica");
    }
    throw new Error("Error de red o desconocido");
  }
}

/* ══════════════════════════════════════════
   ACTUALIZAR ORDEN MÉDICA
   ══════════════════════════════════════════ */
export async function updateMedicalOrder({
  formData,
  orderId,
}: UpdateParams): Promise<MedicalOrder> {
  try {
    const { data } = await api.put<CreateResponse>(
      `/medical-orders/${orderId}`,
      formData
    );

    const parsed = medicalOrderSchema.safeParse(data.medicalOrder);
    if (!parsed.success) {
      console.error("Error parsing medical order:", parsed.error);
      throw new Error("Datos de orden médica inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al actualizar la orden médica");
    }
    throw new Error("Error de red o desconocido");
  }
}

/* ══════════════════════════════════════════
   ELIMINAR ORDEN MÉDICA
   ══════════════════════════════════════════ */
export async function deleteMedicalOrder(id: string): Promise<DeleteResponse> {
  try {
    const { data } = await api.delete<DeleteResponse>(`/medical-orders/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al eliminar la orden médica");
    }
    throw new Error("Error de red o desconocido");
  }
}