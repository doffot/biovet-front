import { AxiosError } from "axios";

import api from "../lib/axios";
import { z } from "zod";
import { appointmentSchema, type Appointment, type AppointmentWithPatient, type CreateAppointmentForm, type UpdateAppointmentStatusForm } from "../types/appointment";

type CreateAppointmentResponse = {
  msg: string;
  appointment: Appointment;
};

type UpdateAppointmentStatusResponse = {
  msg: string;
  appointment: Appointment;
};

type GetAppointmentsListResponse = {
  success: boolean;
  appointments: Appointment[];
};

export interface AppointmentPaymentInfo {
  hasPayments: boolean;
  totalPaidUSD: number;
  totalPaidBs: number;
  invoiceIds: string[];
}

const GetAppointmentsListResponseSchema = z.object({
  success: z.boolean().optional(),
  appointments: z.array(appointmentSchema),
});

export async function deleteAppointment(appointmentId: string): Promise<void> {
  try {
    await api.delete(`/appointments/${appointmentId}`);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al eliminar la cita");
    }
    throw new Error("Error de red o desconocido");
  }
}

export async function getAppointmentsByPatient(
  patientId: string
): Promise<Appointment[]> {
  try {
    const { data } = await api.get<Appointment[]>(
      `/patients/${patientId}/appointments`
    );

    const response = z.array(appointmentSchema).safeParse(data);
    if (!response.success) {
      throw new Error("Estructura de respuesta inválida del servidor");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al obtener las citas del paciente"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

export async function getActiveAppointmentsByPatient(
  patientId: string
): Promise<Appointment[]> {
  try {
    const appointments = await getAppointmentsByPatient(patientId);

    const activeAppointments = appointments
      .filter((apt) => apt.status === "Programada")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log("📦 Citas activas del paciente:", activeAppointments);

    return activeAppointments;
  } catch (error) {
    throw error;
  }
}

export async function createAppointment(
  formData: CreateAppointmentForm,
  patientId: string
): Promise<Appointment> {
  try {
    const { data } = await api.post<CreateAppointmentResponse>(
      `/patients/${patientId}/appointments`,
      formData
    );

    const response = appointmentSchema.safeParse(data.appointment);
    if (!response.success) {
      throw new Error("Datos de la cita inválidos");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear la cita");
    }
    throw new Error("Error de red o desconocido");
  }
}

export async function updateAppointmentStatus(
  appointmentId: string,
  formData: UpdateAppointmentStatusForm
): Promise<Appointment> {
  try {
    const { data } = await api.patch<UpdateAppointmentStatusResponse>(
      `/appointments/${appointmentId}/status`,
      formData
    );

    const response = appointmentSchema.safeParse(data.appointment);
    if (!response.success) {
      throw new Error("Datos de la cita actualizados inválidos");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al actualizar el estado de la cita"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

export async function getAllAppointments(): Promise<Appointment[]> {
  try {
    const { data } = await api.get("/appointments");
    return data.appointments || [];
  } catch (error) {
    return [];
  }
}

export async function getActiveAppointments(): Promise<AppointmentWithPatient[]> {
  try {
    const { data } = await api.get<GetAppointmentsListResponse>("/appointments");

    const response = GetAppointmentsListResponseSchema.safeParse(data);
    if (!response.success) {
      throw new Error("Estructura de respuesta inválida del servidor");
    }

    const activeAppointments = response.data.appointments
      .filter((apt) => apt.status === "Programada")
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ) as AppointmentWithPatient[];

    return activeAppointments;
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

export async function getAppointmentsByDateForVeterinarian(
  date: string
): Promise<Appointment[]> {
  try {
    const { data } = await api.get<{ appointments: Appointment[] }>(
      `/appointments/date/${date}`
    );
    return data.appointments || [];
  } catch (error) {
    return [];
  }
}

export async function getAppointmentById(id: string): Promise<Appointment> {
  try {
    const { data } = await api.get<{ appointment: Appointment }>(
      `/appointments/${id}`
    );

    console.log("🔍 Raw appointment data:", data.appointment);

    const response = appointmentSchema.safeParse(data.appointment);
    if (!response.success) {
        console.error("❌ Zod errors:", response.error.issues);
      throw new Error("Estructura de respuesta inválida del servidor");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener la cita");
    }
    throw new Error("Error de red o desconocido");
  }
}

type UpdateAppointmentResponse = {
  msg: string;
  appointment: Appointment;
};

export async function updateAppointment(
  appointmentId: string,
  formData: CreateAppointmentForm
): Promise<Appointment> {
  try {
    const { data } = await api.patch<UpdateAppointmentResponse>(
      `/appointments/${appointmentId}`,
      formData
    );

    const response = appointmentSchema.safeParse(data.appointment);
    if (!response.success) {
      throw new Error("Datos de la cita actualizados inválidos");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al actualizar la cita");
    }
    throw new Error("Error de red o desconocido");
  }
}

export async function checkAppointmentPayments(
  appointmentId: string
): Promise<AppointmentPaymentInfo> {
  try {
    const { data } = await api.get<AppointmentPaymentInfo>(
      `/appointments/${appointmentId}/check-payments`
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al verificar pagos");
    }
    throw new Error("Error de red o desconocido");
  }
}

export async function cancelAppointment(
  appointmentId: string,
  shouldRefund: boolean
): Promise<Appointment> {
  try {
    const { data } = await api.patch<{ msg: string; appointment: Appointment }>(
      `/appointments/${appointmentId}/status`,
      { status: "Cancelada", shouldRefund }
    );

    const response = appointmentSchema.safeParse(data.appointment);
    if (!response.success) {
      throw new Error("Datos de la cita inválidos");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al cancelar la cita");
    }
    throw new Error("Error de red o desconocido");
  }
}