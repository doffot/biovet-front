// src/api/dewormingAPI.ts
import { AxiosError } from "axios";
import api from "../lib/axios";
import {
  dewormingSchema,
  dewormingsListSchema,
  type Deworming,
  type DewormingFormData,
} from "../types/deworming";

type CreateResponse = { msg: string; deworming: Deworming };
type ListResponse = { dewormings: Deworming[] };
type SingleResponse = { deworming: Deworming };

export async function createDeworming(
  patientId: string,
  data: DewormingFormData
): Promise<Deworming> {
  try {
    const { data: response } = await api.post<CreateResponse>(
      `/dewormings/${patientId}`,
      data
    );
    const parsed = dewormingSchema.safeParse(response.deworming);
    if (!parsed.success) throw new Error("Datos inválidos");
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear");
    }
    throw new Error("Error de red");
  }
}

export async function getAllDewormings(): Promise<Deworming[]> {
  try {
    const { data } = await api.get<ListResponse>("/dewormings");
    const parsed = dewormingsListSchema.safeParse(data.dewormings);
    if (!parsed.success) {
      throw new Error("Datos de desparasitaciones inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener desparasitaciones");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error de red o desconocido");
  }
}

export async function getDewormingsByPatient(
  patientId: string
): Promise<Deworming[]> {
  try {
    const { data } = await api.get<ListResponse>(
      `/dewormings/patient/${patientId}`
    );
    const parsed = dewormingsListSchema.safeParse(data.dewormings);
    if (!parsed.success) throw new Error("Datos inválidos");
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener");
    }
    throw new Error("Error de red");
  }
}

export async function getDewormingById(id: string): Promise<Deworming> {
  try {
    const { data } = await api.get<SingleResponse>(`/dewormings/${id}`);
    const parsed = dewormingSchema.safeParse(data.deworming);
    if (!parsed.success) throw new Error("Datos inválidos");
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener");
    }
    throw new Error("Error de red");
  }
}

export async function updateDeworming(
  id: string,
  data: Partial<DewormingFormData>
): Promise<Deworming> {
  try {
    const { data: response } = await api.put<{
      msg: string;
      deworming: Deworming;
    }>(`/dewormings/${id}`, data);
    return response.deworming;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al actualizar");
    }
    throw new Error("Error de red");
  }
}

export async function deleteDeworming(id: string): Promise<void> {
  try {
    await api.delete(`/dewormings/${id}`);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al eliminar");
    }
    throw new Error("Error de red");
  }
}
