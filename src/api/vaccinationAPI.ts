// src/api/vaccinationAPI.ts
import { AxiosError } from "axios";
import api from "../lib/axios";
import {
  vaccinationSchema,
  vaccinationsListSchema,
  type Vaccination,
  type VaccinationFormData,
} from "../types/vaccination";

type CreateVaccinationResponse = {
  msg: string;
  vaccination: Vaccination;
};

type GetVaccinationsResponse = {
  vaccinations: Vaccination[];
};

type GetVaccinationResponse = {
  vaccination: Vaccination;
};

//  Helper function para normalizar productId
const normalizeProductId = (productId: any): string | undefined => {
  if (!productId) return undefined;
  if (typeof productId === "string") return productId;
  if (typeof productId === "object" && productId._id) return productId._id;
  return undefined;
};

//  ACTUALIZADO: Helper function para normalizar IDs poblados (acepta null)
const normalizeId = (id: any): string | undefined => {
  if (!id) return undefined;
  if (typeof id === "string") return id;
  if (typeof id === "object" && id?._id) return id._id;
  return undefined;
};

// Crear vacuna
export async function createVaccination(
  patientId: string,
  data: VaccinationFormData
): Promise<Vaccination> {
  try {
    const { data: response } = await api.post<CreateVaccinationResponse>(
      `/vaccinations/${patientId}`,
      data
    );

    const normalized = {
      ...response.vaccination,
      productId: normalizeProductId(response.vaccination.productId),
    };

    const parsed = vaccinationSchema.safeParse(normalized);
    if (!parsed.success) {
      console.error("❌ Zod error:", parsed.error.issues);
      throw new Error("Datos de vacuna inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear vacuna");
    }
    throw new Error("Error de red");
  }
}

// ACTUALIZADO: Obtener todas las vacunas del veterinario
export async function getAllVaccinations(): Promise<Vaccination[]> {
  try {
    const { data } = await api.get<GetVaccinationsResponse>("/vaccinations");

    //  Normalizar todos los IDs poblados
    const normalized = data.vaccinations.map((v: any) => ({
      ...v,
      productId: normalizeProductId(v.productId),
      patientId: normalizeId(v.patientId),
      veterinarianId: normalizeId(v.veterinarianId),
    }));

    const parsed = vaccinationsListSchema.safeParse(normalized);
    if (!parsed.success) {
      console.error("❌ Zod error:", parsed.error.issues);
      console.error("❌ Datos problemáticos:", normalized);
      throw new Error("Datos de vacunas inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener vacunas");
    }
    throw new Error("Error de red");
  }
}

// Obtener vacunas por paciente
export async function getVaccinationsByPatient(
  patientId: string
): Promise<Vaccination[]> {
  try {
    const { data } = await api.get<GetVaccinationsResponse>(
      `/vaccinations/patient/${patientId}`
    );

    const normalized = data.vaccinations.map((v: any) => ({
      ...v,
      productId: normalizeProductId(v.productId),
    }));

    const parsed = vaccinationsListSchema.safeParse(normalized);
    if (!parsed.success) {
      console.error("❌ Zod errors:", JSON.stringify(parsed.error.issues, null, 2));
      throw new Error("Datos inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener vacunas");
    }
    throw new Error("Error de red");
  }
}

// Obtener vacuna por ID
export async function getVaccinationById(id: string): Promise<Vaccination> {
  try {
    const { data } = await api.get<GetVaccinationResponse>(
      `/vaccinations/${id}`
    );

    const normalized = {
      ...data.vaccination,
      productId: normalizeProductId(data.vaccination.productId),
    };

    const parsed = vaccinationSchema.safeParse(normalized);
    if (!parsed.success) {
      console.error("❌ Zod error:", parsed.error.issues);
      throw new Error("Datos inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener vacuna");
    }
    throw new Error("Error de red");
  }
}

// Actualizar vacuna
export async function updateVaccination(
  id: string,
  data: Partial<VaccinationFormData>
): Promise<Vaccination> {
  try {
    const { data: response } = await api.put<{
      msg: string;
      vaccination: Vaccination;
    }>(`/vaccinations/${id}`, data);

    const normalized = {
      ...response.vaccination,
      productId: normalizeProductId(response.vaccination.productId),
    };

    const parsed = vaccinationSchema.safeParse(normalized);
    if (!parsed.success) {
      console.error("❌ Zod error:", parsed.error.issues);
      throw new Error("Datos inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al actualizar");
    }
    throw new Error("Error de red");
  }
}

// Eliminar vacuna
export async function deleteVaccination(id: string): Promise<void> {
  try {
    await api.delete(`/vaccinations/${id}`);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al eliminar");
    }
    throw new Error("Error de red");
  }
}