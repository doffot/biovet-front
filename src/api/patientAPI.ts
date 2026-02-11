import { AxiosError } from "axios";
import api from "../lib/axios";
import { patientSchema, patientsListSchema, type Patient } from "@/types/patient";

// Definir el tipo para el historial
export type HistoryType = 
  | 'appointment' 
  | 'consultation' 
  | 'deworming' 
  | 'grooming' 
  | 'labExam' 
  | 'study' 
  | 'recipe' 
  | 'treatment' 
  | 'vaccination' 
  | 'service';

export interface HistoryItem {
  _id: string;
  type: HistoryType;
  date: string;
  title: string;
  description: string;
  veterinarian: string;
  rawData?: any;
}

// Tipos auxiliares
type CreateResponse = {
  msg: string;
  patient: Patient;
};

type UpdatePatientAPI = {
  formData: FormData;
  patientId: string;
};

// ==========================================
// CREAR PACIENTE
// ==========================================
export async function createPatient(
  formData: FormData,
  ownerId: string
): Promise<Patient> {
  try {
    const { data } = await api.post<CreateResponse>(
      `/owners/${ownerId}/patients`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const response = patientSchema.safeParse(data.patient);
    if (!response.success) {
      throw new Error("Datos de paciente inválidos");
    }

    return response.data;
  } catch (error) {
    console.log(error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear el paciente");
    }
    throw new Error("Error de red o desconocido");
  }
}

// ==========================================
// OBTENER TODOS LOS PACIENTES
// ==========================================
export async function getPatients() {
  try {
    const { data } = await api.get("/patients");
    const response = patientsListSchema.safeParse(data);

    if (response.success) {
      return response.data;
    }
    throw new Error("Datos de pacientes inválidos");
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener pacientes");
    }
    throw new Error("Error de red o desconocido");
  }
}

// ==========================================
// OBTENER PACIENTE POR ID
// ==========================================
export async function getPatientById(id: Patient["_id"]) {
  try {
    const { data } = await api.get<Patient>(`/patients/${id}`);
    const response = patientSchema.safeParse(data);
    if (response.success) {
      return response.data;
    } else {
      throw new Error("Datos de paciente inválidos");
    }
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener paciente");
    }
    throw new Error("Error de red o desconocido");
  }
}

// ==========================================
// ACTUALIZAR PACIENTE
// ==========================================
export async function updatePatient({
  formData,
  patientId,
}: UpdatePatientAPI): Promise<Patient> {
  try {
    const { data } = await api.put(`/patients/${patientId}`, formData, {
      headers: {},
    });

    return data.patient;
  } catch (error: any) {
    if (error instanceof Error && "response" in error) {
      const axiosError = error as { response?: { data: { msg?: string } } };
      throw new Error(
        axiosError.response?.data?.msg || "Error al actualizar paciente"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// ==========================================
// ELIMINAR PACIENTE
// ==========================================
export async function deletePatient(id: Patient["_id"]) {
  try {
    const { data } = await api.delete(`/patients/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al eliminar paciente");
    }
    throw new Error("Error de red o desconocido");
  }
}

// ==========================================
// OBTENER PACIENTES POR DUEÑO
// ==========================================
export async function getPatientsByOwner(ownerId: string): Promise<Patient[]> {
  try {
    const { data } = await api.get(`/patients/owner/${ownerId}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al cargar mascotas");
    }
    throw new Error("Error de red");
  }
}

// ==========================================
// OBTENER HISTORIAL COMPLETO (NUEVO)
// ==========================================
export async function getPatientHistory(patientId: string): Promise<HistoryItem[]> {
  try {
    const { data } = await api.get<HistoryItem[]>(`/patients/${patientId}/history`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener el historial médico");
    }
    throw new Error("Error de red o desconocido al cargar el historial");
  }
}