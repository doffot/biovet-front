import { AxiosError } from "axios";
import api from "../lib/axios";
import {
  medicalStudiesListSchema,
  medicalStudyResponseSchema,
  medicalStudiesListResponseSchema,
  type MedicalStudy,
} from "../types/medicalStudy";

// Crear estudio médico con PDF
export async function createMedicalStudy(
  patientId: string,
  formData: FormData
): Promise<MedicalStudy> {
  try {
    // IMPORTANTE: El ID va en la URL, los datos en el formData
    const { data } = await api.post(
      `/medical-studies/${patientId}`, 
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const parsed = medicalStudyResponseSchema.safeParse(data);
    if (!parsed.success) {
      console.error("Zod Error:", parsed.error);
      throw new Error("Respuesta del servidor inválida");
    }
    return parsed.data.study;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al subir el estudio");
    }
    throw new Error("Error de red o desconocido");
  }
}

// Obtener estudios por paciente
export async function getMedicalStudiesByPatient(patientId: string): Promise<MedicalStudy[]> {
  try {
    const { data } = await api.get(`/medical-studies/patient/${patientId}`);
    
    const parsed = medicalStudiesListResponseSchema.safeParse(data);
    if (!parsed.success) {
      // Intento fallback si la estructura es directa array
      const parsedArray = medicalStudiesListSchema.safeParse(data.studies || data);
      if(parsedArray.success) return parsedArray.data;
      throw new Error("Datos de estudios inválidos");
    }
    return parsed.data.studies;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener estudios");
    }
    throw new Error("Error de red");
  }
}

// Obtener estudio por ID
export async function getMedicalStudyById(id: string): Promise<MedicalStudy> {
  try {
    const { data } = await api.get(`/medical-studies/${id}`);
    
    const parsed = medicalStudyResponseSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Datos del estudio inválidos");
    }
    return parsed.data.study;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener el estudio");
    }
    throw new Error("Error de red");
  }
}

// Eliminar estudio
export async function deleteMedicalStudy(id: string): Promise<void> {
  try {
    await api.delete(`/medical-studies/${id}`);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al eliminar");
    }
    throw new Error("Error de red");
  }
}