// src/views/appointments/EditAppointmentView.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, X, Pencil, Loader2 } from "lucide-react";
import { toast } from "../../components/Toast";
import { useAuth } from "../../hooks/useAuth";
import type { CreateAppointmentForm, AppointmentType } from "../../types/appointment";
import {
  getAppointmentById,
  updateAppointment,
  getAppointmentsByDateForVeterinarian,
} from "../../api/appointmentAPI";
import { getPatientById } from "../../api/patientAPI";
import {
  CategorySelector,
  DateTimeSelector,
  AppointmentDetails,
} from "../../components/appointments/create";

type FormErrors = {
  type?: string;
  date?: string;
  time?: string;
  reason?: string;
};

const formatLocalDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function EditAppointmentView() {
  const { patientId, appointmentId } = useParams<{ patientId: string; appointmentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useAuth();

  const [isClosing, setIsClosing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [reason, setReason] = useState("");
  const [observations, setObservations] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  // Cargar cita existente
  const { data: appointment, status: appointmentStatus } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => getAppointmentById(appointmentId!),
    enabled: !!appointmentId,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  // Cargar paciente
  const { data: patient, status: patientStatus } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  // Citas del día para deshabilitar horarios
  const { data: vetAppointmentsOnDate = [] } = useQuery({
    queryKey: ["vetAppointments", selectedDateStr],
    queryFn: () => getAppointmentsByDateForVeterinarian(selectedDateStr),
    enabled: !!user,
  });

  // Popular formulario UNA sola vez
  useEffect(() => {
    if (!appointment || hasLoaded) return;
    setHasLoaded(true);

    const appointmentDate = new Date(appointment.date);
    const hours = String(appointmentDate.getHours()).padStart(2, "0");
    const minutes = String(appointmentDate.getMinutes()).padStart(2, "0");

    setSelectedType(appointment.type as AppointmentType);
    setSelectedDate(appointmentDate);
    setSelectedTime(`${hours}:${minutes}`);
    setReason(appointment.reason || "");
    setObservations(appointment.observations || "");
  }, [appointment, hasLoaded]);

  // Mutation para actualizar
  const { mutate: updateMutate, isPending } = useMutation({
    mutationFn: (formData: CreateAppointmentForm) =>
      updateAppointment(appointmentId!, formData),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] }),
        queryClient.invalidateQueries({ queryKey: ["appointments", patientId] }),
        queryClient.invalidateQueries({ queryKey: ["activeAppointments", patientId] }),
        queryClient.invalidateQueries({ queryKey: ["vetAppointments"] }),
      ]);
      toast.success("Cita actualizada exitosamente");
      handleClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => navigate(`/patients/${patientId}/appointments`), 300);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedType) {
      newErrors.type = "Selecciona el tipo de cita";
    }

    if (!selectedTime) {
      newErrors.time = "Selecciona una hora";
    }

    if (!reason.trim()) {
      newErrors.reason = "El motivo es requerido";
    } else if (reason.length < 2) {
      newErrors.reason = "Mínimo 2 caracteres";
    } else if (reason.length > 200) {
      newErrors.reason = "Máximo 200 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const dateWithTime = new Date(selectedDate);
    dateWithTime.setHours(hours, minutes, 0, 0);

    const formData: CreateAppointmentForm = {
      type: selectedType!,
      date: formatLocalDateTime(dateWithTime),
      reason: reason.trim(),
      observations: observations.trim() || undefined,
    };

    updateMutate(formData);
  };

  // Filtrar la cita actual de los horarios deshabilitados
  const filteredDisabledHours = vetAppointmentsOnDate.filter(
    (apt) => apt._id !== appointmentId
  );

  // Loading
  const isLoading = appointmentStatus === "pending" || patientStatus === "pending";

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-dark-400 z-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-biovet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-surface-500 uppercase tracking-widest">Cargando cita...</p>
        </div>
      </div>
    );
  }

  if (!appointment || !patient) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-dark-400 z-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-danger-500 font-bold">Cita no encontrada</p>
          <button onClick={() => navigate(`/patients/${patientId}/appointments`)} className="btn-secondary">
            Volver a citas
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Panel Fullscreen */}
      <div
        className={`fixed inset-0 z-50 bg-white dark:bg-dark-200 flex flex-col transform transition-transform duration-300 ease-out ${
          isClosing ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {/* ═══ HEADER ═══ */}
        <header className="shrink-0 bg-linear-to-r from-biovet-600 to-biovet-700 text-white px-4 sm:px-6 py-4 sm:py-5">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-biovet-200" />
                    Editar Cita
                  </h1>
                  <p className="text-biovet-100 text-xs sm:text-sm mt-0.5">
                    {patient.name} • {patient.species}
                    <span className="hidden sm:inline"> • {patient.breed}</span>
                    <span className="hidden sm:inline text-biovet-200">
                      {" "}• {new Date(appointment.date).toLocaleDateString('es-ES', { dateStyle: 'medium' })}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ═══ CONTENIDO ═══ */}
        <main className="flex-1 overflow-y-auto bg-surface-50 dark:bg-dark-300 custom-scrollbar">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-32 sm:pb-6">
            <div className="space-y-4">

              {/* 1. Tipo */}
              <CategorySelector
                selectedType={selectedType}
                onSelect={setSelectedType}
              />
              {errors.type && (
                <p className="error-text font-medium -mt-2 ml-1">⚠️ {errors.type}</p>
              )}

              {/* 2. Fecha y Hora */}
              <DateTimeSelector
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateChange={setSelectedDate}
                onTimeSelect={setSelectedTime}
                disabledHoursData={filteredDisabledHours}
              />
              {errors.time && (
                <p className="error-text font-medium -mt-2 ml-1">⚠️ {errors.time}</p>
              )}

              {/* 3. Motivo y Observaciones */}
              <AppointmentDetails
                reason={reason}
                observations={observations}
                onReasonChange={setReason}
                onObservationsChange={setObservations}
                errors={{ reason: errors.reason }}
              />
            </div>
          </div>
        </main>

        {/* ═══ FOOTER ═══ */}
        <footer className="shrink-0 fixed bottom-0 left-0 right-0 sm:relative bg-white dark:bg-dark-200 border-t border-surface-200 dark:border-dark-100 px-4 sm:px-6 py-3 sm:py-4 mb-16 sm:mb-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary px-6 py-2.5"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="btn-primary px-8 py-2.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}