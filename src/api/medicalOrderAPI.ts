import { AxiosError } from "axios";
import api from "../lib/axios";
import {
  medicalOrderSchema,
  medicalOrdersListSchema,
  type MedicalOrder,
  type MedicalOrderFormData,
} from "@/types/medicalOrder";

// Tipos de respuesta (Se mantienen igual, pero ahora MedicalOrder tiene la nueva estructura)
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

    // Zod validará que vengan los arrays de hematology, chemistry, etc.
    const parsed = medicalOrderSchema.safeParse(data.medicalOrder);
    if (!parsed.success) {
      console.error("Error parsing medical order:", parsed.error.format());
      throw new Error("Datos de respuesta del servidor incompatibles con el nuevo modelo");
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
      console.error("Error parsing list:", parsed.error.format());
      throw new Error("La lista de órdenes no coincide con el nuevo formato");
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
      console.error("Error parsing all orders:", parsed.error.format());
      throw new Error("Error de sincronización de datos con el nuevo modelo");
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
      throw new Error("La orden solicitada tiene un formato antiguo o inválido");
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
      throw new Error("Error al validar la orden actualizada");
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