// src/api/OwnerAPI.ts
import { AxiosError } from "axios";
import api from "../lib/axios";
import { ownersListSchema, type Owner, type OwnerFormData } from "../types/owner";

type CreateOwnerResponse = {
  msg: string;
  owner: Owner;
};

export async function createOwner(formData: OwnerFormData): Promise<CreateOwnerResponse> {
  try {
    const { data } = await api.post<CreateOwnerResponse>("/owners", formData);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear el dueño");
    }
    throw new Error("Error de red o desconocido");
  }
}
export async function getOwners() {
  try {
    const { data } = await api.get("/owners");
    const response = ownersListSchema.safeParse(data);
    if (response.success) {
      return response.data;
    }
    return data; 
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener los dueños");
    }
    throw new Error("Error de red o desconocido");
  }
}

export async function getOwnersById(id: Owner["_id"]) {
  try {
    const { data } = await api.get(`/owners/${id}`);
    console.log('entro owner by id',data);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener el dueño");
    }
    throw new Error("Error de red o desconocido");
  }
}

type OwnerAPIType = {
  formData: OwnerFormData;
  ownerId: Owner["_id"];
};

type UpdateOwnerResponse = {
  msg: string;
  owner: Owner;
};

export async function updateOwners({ formData, ownerId }: OwnerAPIType) {
  try {
    const { data } = await api.put<UpdateOwnerResponse>(
      `/owners/${ownerId}`,
      formData
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al actualizar el dueño");
    }
    throw new Error("Error de red o desconocido");
  }
}


// Obtener citas activas de todas las mascotas de un owner
export async function getOwnerAppointments(ownerId: string) {
  try {
    const { data } = await api.get(`/owners/${ownerId}/appointments`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener citas");
    }
    throw new Error("Error de red o desconocido");
  }
}


// Obtener servicios de grooming de todas las mascotas de un owner
export async function getOwnerGroomingServices(ownerId: string) {
  try {
    const { data } = await api.get(`/owners/${ownerId}/grooming-services`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener servicios");
    }
    throw new Error("Error de red o desconocido");
  }
}

export async function deleteOwners(id: Owner["_id"]) {
  try {
    const { data } = await api.delete(`/owners/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al eliminar el dueño");
    }
    throw new Error("Error de red o desconocido");
  }
}