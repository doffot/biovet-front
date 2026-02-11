// src/api/veterinaryServiceAPI.ts
import { AxiosError } from "axios";
import api from "../lib/axios";
import {
  veterinaryServiceSchema,
  veterinaryServicesListSchema,
  type VeterinaryService,
  type VeterinaryServiceFormData,
} from "../types/veterinaryService";

// Crear servicio
export async function createVeterinaryService(
  patientId: string,
  formData: VeterinaryServiceFormData
): Promise<VeterinaryService> {
  try {
    console.log("=== CREATE SERVICE ===");
    console.log("PatientId:", patientId);
    console.log("FormData:", JSON.stringify(formData, null, 2));
    
    const { data } = await api.post<{ msg: string; service: VeterinaryService }>(
      `/veterinary-services/${patientId}`,
      formData
    );
    
    console.log("Response data:", data);
    
    const parsed = veterinaryServiceSchema.safeParse(data.service);
    if (!parsed.success) {
      console.error("Error de validación Zod:", parsed.error);
      throw new Error("Datos del servicio inválidos");
    }
    return parsed.data;
  } catch (error) {
    console.log("=== ERROR ===");
    if (error instanceof AxiosError) {
      console.log("Status:", error.response?.status);
      console.log("Response data:", error.response?.data);
      throw new Error(error.response?.data?.msg || "Error al registrar el servicio");
    }
    console.log("Error no axios:", error);
    throw error;
  }
}

// Obtener servicios por paciente
export async function getServicesByPatient(patientId: string): Promise<VeterinaryService[]> {
  try {
    console.log("=== GET SERVICES BY PATIENT ===");
    console.log("PatientId:", patientId);
    
    const { data } = await api.get<{ services: VeterinaryService[] }>(
      `/veterinary-services/patient/${patientId}`
    );
    
    console.log("Response services:", data.services);
    
    const parsed = veterinaryServicesListSchema.safeParse(data.services);
    if (!parsed.success) {
      console.error("Error de validación Zod:", parsed.error);
      throw new Error("Datos de servicios inválidos");
    }
    return parsed.data;
  } catch (error) {
    console.log("=== ERROR ===");
    if (error instanceof AxiosError) {
      console.log("Status:", error.response?.status);
      console.log("Response data:", error.response?.data);
      throw new Error(error.response?.data?.msg || "Error al obtener servicios");
    }
    console.log("Error no axios:", error);
    throw error;
  }
}

// Obtener servicio por ID
export async function getServiceById(id: string): Promise<VeterinaryService> {
  try {
    const { data } = await api.get<{ service: VeterinaryService }>(
      `/veterinary-services/${id}`
    );
    const parsed = veterinaryServiceSchema.safeParse(data.service);
    if (!parsed.success) {
      console.error("Error de validación Zod:", parsed.error);
      throw new Error("Datos del servicio inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg);
    }
    throw new Error("Error al obtener el servicio");
  }
}

// Eliminar servicio
export async function deleteVeterinaryService(id: string): Promise<void> {
  try {
    await api.delete(`/veterinary-services/${id}`);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg);
    }
    throw new Error("Error al eliminar el servicio");
  }
}