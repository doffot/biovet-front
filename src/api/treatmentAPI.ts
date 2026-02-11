// src/api/treatmentAPI.ts
import { AxiosError } from "axios";
import api from "../lib/axios";
import {
  treatmentSchema,
  treatmentsListSchema,
  type Treatment,
  type TreatmentFormData,
} from "../types/treatment";

type CreateResponse = { msg: string; treatment: Treatment };
type ListResponse = { treatments: Treatment[] };
type SingleResponse = { treatment: Treatment };
type UpdateResponse = { msg: string; treatment: Treatment };

// Crear
export async function createTreatment(
  patientId: string,
  data: TreatmentFormData
): Promise<Treatment> {
  try {
    const { data: response } = await api.post<CreateResponse>(
      `/treatments/${patientId}`,
      data
    );
    const parsed = treatmentSchema.safeParse(response.treatment);
    if (!parsed.success) throw new Error("Datos inválidos");
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear");
    }
    throw new Error("Error de red");
  }
}

// Obtener todos
export async function getAllTreatments(): Promise<Treatment[]> {
  try {
    const { data } = await api.get<ListResponse>("/treatments");
    const parsed = treatmentsListSchema.safeParse(data.treatments);
    if (!parsed.success) {
      throw new Error("Datos de tratamientos inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener tratamientos");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error de red o desconocido");
  }
}

// Obtener por paciente
export async function getTreatmentsByPatient(
  patientId: string
): Promise<Treatment[]> {
  try {
    const { data } = await api.get<ListResponse>(
      `/treatments/patient/${patientId}`
    );
    const parsed = treatmentsListSchema.safeParse(data.treatments);
    if (!parsed.success) throw new Error("Datos inválidos");
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener");
    }
    throw new Error("Error de red");
  }
}

// Obtener por ID
export async function getTreatmentById(id: string): Promise<Treatment> {
  try {
    const { data } = await api.get<SingleResponse>(`/treatments/${id}`);
    const parsed = treatmentSchema.safeParse(data.treatment);
    if (!parsed.success) throw new Error("Datos inválidos");
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener");
    }
    throw new Error("Error de red");
  }
}

// Actualizar
export async function updateTreatment(
  id: string,
  data: Partial<TreatmentFormData>
): Promise<Treatment> {
  try {
    const { data: response } = await api.put<UpdateResponse>(
      `/treatments/${id}`,
      data
    );

    const parsed = treatmentSchema.safeParse(response.treatment);
    if (!parsed.success) throw new Error("Datos inválidos");
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al actualizar");
    }
    throw new Error("Error de red");
  }
}

// Eliminar
export async function deleteTreatment(id: string): Promise<void> {
  try {
    await api.delete(`/treatments/${id}`);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al eliminar");
    }
    throw new Error("Error de red");
  }
}