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

// export async function createDeworming(
//   patientId: string,
//   data: DewormingFormData
// ): Promise<Deworming> {
//   try {
//     const { data: response } = await api.post<CreateResponse>(
//       `/dewormings/${patientId}`,
//       data
//     );
//     // Permitimos passthrough para evitar bloqueo en creación si el backend devuelve algo extra
//     const parsed = dewormingSchema.safeParse(response.deworming);
//     if (!parsed.success) {
//       console.warn("⚠️ Zod warning en create:", parsed.error);
//       return response.deworming; // Retornamos aunque la validación falle un poco
//     }
//     return parsed.data;
//   } catch (error) {
//     if (error instanceof AxiosError && error.response) {
//       throw new Error(error.response.data.msg || "Error al crear");
//     }
//     throw new Error("Error de red");
//   }
// }

export async function createDeworming(
  patientId: string,
  data: DewormingFormData
): Promise<Deworming> {
  try {
    console.log("🚀 Enviando a Backend:", { patientId, payload: data }); // LOG 1

    const { data: response } = await api.post<CreateResponse>(
      `/dewormings/${patientId}`,
      data
    );

    console.log("✅ Respuesta Cruda Backend:", response); // LOG 2

    const parsed = dewormingSchema.safeParse(response.deworming);
    if (!parsed.success) {
      console.error("⚠️ Zod Validación Falló en Create:", parsed.error.format());
      return response.deworming;
    }
    return parsed.data;
  } catch (error) {
    console.error("❌ Error en Catch de Create:", error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear");
    }
    throw new Error("Error de red");
  }
}

export async function getDewormingsByPatient(
  patientId: string
): Promise<Deworming[]> {
  try {
    console.log("🔍 Solicitando historial para paciente:", patientId);

    const { data } = await api.get<ListResponse>(
      `/dewormings/patient/${patientId}`
    );

    console.log("📦 Datos recibidos (List):", data.dewormings); // LOG 3

    const parsed = dewormingsListSchema.safeParse(data.dewormings);
    
    if (!parsed.success) {
      console.error("❌ Error de Validación Zod en Lista:", JSON.stringify(parsed.error.format(), null, 2));
      return data.dewormings; 
    }
    
    return parsed.data;
  } catch (error) {
    console.error("❌ Error en Catch de GetByPatient:", error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener");
    }
    throw new Error("Error de red");
  }
}

export async function getAllDewormings(): Promise<Deworming[]> {
  try {
    const { data } = await api.get<ListResponse>("/dewormings");
    return data.dewormings;
  } catch (error) {
    throw new Error("Error al obtener desparasitaciones");
  }
}

// export async function getDewormingsByPatient(
//   patientId: string
// ): Promise<Deworming[]> {
//   try {
//     const { data } = await api.get<ListResponse>(
//       `/dewormings/patient/${patientId}`
//     );

//     // 👇 DEBUGGING: Ver qué llega del backend
//     console.log("📦 Datos crudos del backend:", data.dewormings);

//     const parsed = dewormingsListSchema.safeParse(data.dewormings);
    
//     if (!parsed.success) {
//       // 👇 MUESTRA EL ERROR EXACTO EN CONSOLA
//       console.error("❌ Error de Validación Zod:", parsed.error.format());
      
//       // FALLBACK: Si falla la validación, devolvemos los datos crudos
//       // para que no se rompa la UI, pero sabrás que hay un error.
//       return data.dewormings as unknown as Deworming[];
//     }
    
//     return parsed.data;
//   } catch (error) {
//     if (error instanceof AxiosError && error.response) {
//       throw new Error(error.response.data.msg || "Error al obtener");
//     }
//     throw new Error("Error de red");
//   }
// }

export async function getDewormingById(id: string): Promise<Deworming> {
  try {
    const { data } = await api.get<SingleResponse>(`/dewormings/${id}`);
    return data.deworming;
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