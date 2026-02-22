// src/api/veterinaryClinicAPI.ts
import { AxiosError } from "axios";
import api from "../lib/axios";
import {
  veterinaryClinicSchema,
  type VeterinaryClinic,
} from "@/types/veterinaryClinic";

type ApiResponse = {
  msg: string;
  clinic: VeterinaryClinic;
};

/* ══════════════════════════════════════════
   CREAR CLÍNICA
   ══════════════════════════════════════════ */
export async function createVeterinaryClinic(
  formData: FormData
): Promise<VeterinaryClinic> {
  try {
    const { data } = await api.post<ApiResponse>("/veterinary-clinic", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
console.log(data);
    const parsed = veterinaryClinicSchema.safeParse(data.clinic);
    if (!parsed.success) {
      console.error("Error parsing clinic:", parsed.error);
      throw new Error("Datos de clínica inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear la clínica");
    }
    throw new Error("Error de red o desconocido");
  }
}

/* ══════════════════════════════════════════
   OBTENER MI CLÍNICA
   ══════════════════════════════════════════ */
export async function getMyClinic(): Promise<VeterinaryClinic | null> {
  try {
    const { data } = await api.get<ApiResponse>("/veterinary-clinic/my-clinic");

    const parsed = veterinaryClinicSchema.safeParse(data.clinic);
    if (!parsed.success) {
      console.error("Error parsing clinic:", parsed.error);
      throw new Error("Datos de clínica inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return null; // No tiene clínica aún
    }
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener la clínica");
    }
    throw new Error("Error de red o desconocido");
  }
}

/* ══════════════════════════════════════════
   OBTENER CLÍNICA POR ID
   ══════════════════════════════════════════ */
export async function getClinicById(id: string): Promise<VeterinaryClinic> {
  try {
    const { data } = await api.get<ApiResponse>(`/veterinary-clinic/${id}`);

    const parsed = veterinaryClinicSchema.safeParse(data.clinic);
    if (!parsed.success) {
      console.error("Error parsing clinic:", parsed.error);
      throw new Error("Datos de clínica inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener la clínica");
    }
    throw new Error("Error de red o desconocido");
  }
}

/* ══════════════════════════════════════════
   ACTUALIZAR CLÍNICA
   ══════════════════════════════════════════ */
export async function updateVeterinaryClinic(
  formData: FormData
): Promise<VeterinaryClinic> {
  try {
    const { data } = await api.put<ApiResponse>("/veterinary-clinic", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const parsed = veterinaryClinicSchema.safeParse(data.clinic);
    if (!parsed.success) {
      console.error("Error parsing clinic:", parsed.error);
      throw new Error("Datos de clínica inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al actualizar la clínica");
    }
    throw new Error("Error de red o desconocido");
  }
}

/* ══════════════════════════════════════════
   ELIMINAR CLÍNICA
   ══════════════════════════════════════════ */
export async function deleteVeterinaryClinic(): Promise<{ msg: string }> {
  try {
    const { data } = await api.delete<{ msg: string }>("/veterinary-clinic");
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al eliminar la clínica");
    }
    throw new Error("Error de red o desconocido");
  }
}

/* ══════════════════════════════════════════
   ELIMINAR SOLO LOGO
   ══════════════════════════════════════════ */
export async function deleteClinicLogo(): Promise<{ msg: string }> {
  try {
    const { data } = await api.delete<{ msg: string }>("/veterinary-clinic/logo");
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al eliminar el logo");
    }
    throw new Error("Error de red o desconocido");
  }
}