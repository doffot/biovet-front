// src/api/labExamAPI.ts
import { AxiosError } from "axios";

import api from "../lib/axios";
import { labExamSchema, labExamsListSchema, type LabExam, type LabExamFormData } from "@/types/labExam";

//  Helper para manejar errores de Axios de forma consistente.
const handleErrors = (error: unknown) => {
  if (error instanceof AxiosError && error.response) {
    throw new Error(error.response.data.msg || "Ocurrió un error inesperado.");
  }
  throw new Error("Error de red o desconocido.");
};

// ---
export async function createLabExam(
  formData: LabExamFormData
): Promise<LabExam> {
  try {
    const { data } = await api.post(`/lab-exams`, formData);

    const result = labExamSchema.safeParse(data);
    if (!result.success) {
      throw new Error("Datos del examen inválidos recibidos del servidor.");
    }
    return result.data;
  } catch (error) {
    handleErrors(error);
    return Promise.reject(error);
  }
}

// ---
//  Obtener todos los exámenes de laboratorio
export async function getAllLabExams(): Promise<LabExam[]> {
  try {
    const { data } = await api.get(`/lab-exams`);

    const result = labExamsListSchema.safeParse(data);
    if (!result.success) {
      throw new Error("Datos de la lista de exámenes inválidos.");
    }
    return result.data;
  } catch (error) {
    handleErrors(error);
    return Promise.reject(error);
  }
}

// ---
//  Obtener un examen por ID
export async function getLabExamById(id: string): Promise<LabExam> {
  try {
    const { data } = await api.get(`/lab-exams/${id}`);

    const result = labExamSchema.safeParse(data);
    if (!result.success) {
      throw new Error("Datos del examen inválidos.");
    }
    return result.data;
  } catch (error) {
    handleErrors(error);
    return Promise.reject(error);
  }
}

//  Obtener exámenes por paciente
export async function getLabExamsByPatient(
  patientId: string
): Promise<LabExam[]> {
  try {
    const { data } = await api.get(`/lab-exams/patient/${patientId}`);

    const result = labExamsListSchema.safeParse(data);
    if (!result.success) {
      throw new Error("Datos de exámenes inválidos.");
    }
    return result.data;
  } catch (error) {
    handleErrors(error);
    return Promise.reject(error);
  }
}

// ---
//  Actualizar un examen
export async function updateLabExam(
  id: string,
  formData: Partial<LabExamFormData>
): Promise<LabExam> {
  try {
    const { data } = await api.put(`/lab-exams/${id}`, formData);

    // ✅ Extraer el labExam de la respuesta
    const examData = data.labExam || data;
    
    const result = labExamSchema.safeParse(examData);
    if (!result.success) {
      console.error("Zod validation error:", result.error);
      throw new Error("Datos del examen inválidos recibidos del servidor.");
    }
    return result.data;
  } catch (error) {
    handleErrors(error);
    return Promise.reject(error);
  }
}

// ---
//  Eliminar un examen
export async function deleteLabExam(id: string): Promise<void> {
  try {
    await api.delete(`/lab-exams/${id}`);
  } catch (error) {
    handleErrors(error);
    return Promise.reject(error);
  }
}

export async function searchPatients(query: string) {
  const { data } = await api.get(`/patients/search?q=${query}`);
  return data;
}
