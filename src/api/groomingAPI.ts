// src/api/groomingAPI.ts
import { AxiosError } from "axios";
import {
  groomingServiceSchema,
  groomingServicesListResponseSchema,
  type GroomingService,
  type GroomingServiceFormData,
} from "../types";
import api from "../lib/axios";

//  TIPOS DE RESPUESTA DEL BACKEND

type CreateGroomingResponse = {
  msg: string;
  service: GroomingService;
};

type UpdateGroomingResponse = {
  msg: string;
  service: GroomingService;
};

type GetGroomingResponse = {
  service: GroomingService;
};

type GetGroomingListResponse = {
  services: GroomingService[];
};

//  CREAR SERVICIO DE GROOMING
export async function createGroomingService(
  formData: GroomingServiceFormData,
  patientId: string
): Promise<GroomingService> {
  try {
    const { data } = await api.post<CreateGroomingResponse>(
      `/patients/${patientId}/grooming`,
      formData //
    );

    const parsed = groomingServiceSchema.safeParse(data.service);
    if (!parsed.success) {
      throw new Error("Datos del servicio inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al crear el servicio de grooming"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

//  OBTENER SERVICIOS POR PACIENTE
export async function getGroomingServicesByPatient(
  patientId: string
): Promise<GroomingService[]> {
  try {
    const { data } = await api.get<GetGroomingListResponse>(
      `/patients/${patientId}/grooming`
    );

    const parsed = groomingServicesListResponseSchema.safeParse({
      services: data.services,
    });
    if (!parsed.success) {
      throw new Error("Datos de servicios inválidos");
    }

    return parsed.data.services;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al obtener servicios de grooming"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

//  OBTENER SERVICIO POR ID
export async function getGroomingServiceById(
  id: GroomingService["_id"]
): Promise<GroomingService> {
  try {
    const { data } = await api.get<GetGroomingResponse>(`/grooming/${id}`);

    const parsed = groomingServiceSchema.safeParse(data.service);
    if (!parsed.success) {
      throw new Error("Datos del servicio inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al obtener el servicio"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

//  OBTENER TODOS LOS SERVICIOS
export async function getAllGroomingServices(): Promise<GroomingService[]> {
  try {
    const { data } = await api.get<GetGroomingListResponse>("/grooming");

    const parsed = groomingServicesListResponseSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Estructura de respuesta inválida");
    }

    return parsed.data.services;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al obtener todos los servicios"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

//  ACTUALIZAR SERVICIO
type UpdateGroomingAPI = {
  formData: Partial<GroomingServiceFormData>;
  groomingId: GroomingService["_id"];
};

export async function updateGroomingService({
  formData,
  groomingId,
}: UpdateGroomingAPI): Promise<GroomingService> {
  try {
    const { data } = await api.put<UpdateGroomingResponse>(
      `/grooming/${groomingId}`,
      formData
    );

    const parsed = groomingServiceSchema.safeParse(data.service);
    if (!parsed.success) {
      throw new Error("Datos actualizados inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al actualizar servicio"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

//  ELIMINAR SERVICIO
export async function deleteGroomingService(
  id: GroomingService["_id"]
): Promise<{ msg: string }> {
  try {
    const { data } = await api.delete<{ msg: string }>(`/grooming/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al eliminar servicio");
    }
    throw new Error("Error de red o desconocido");
  }
}
