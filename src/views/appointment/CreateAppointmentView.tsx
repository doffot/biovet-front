// src/views/appointments/CreateAppointmentView.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, X, CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "../../components/Toast";
import { useAuth } from "../../hooks/useAuth";
import type { CreateAppointmentForm, AppointmentType } from "../../types/appointment";
import {
  createAppointment,
  getAppointmentsByDateForVeterinarian,
} from "../../api/appointmentAPI";
import { getPatientById } from "../../api/patientAPI";
import {
  StaffSelector,
  CategorySelector,
  DateTimeSelector,
  AppointmentDetails,
} from "../../components/appointments/create";
import PrepaymentModal from "../../components/appointments/PrepaymentModal";
import { getStaffList } from "@/api/staffAPI";

type PendingAppointmentData = {
  formData: CreateAppointmentForm;
  dateWithTime: Date;
};

type FormErrors = {
  type?: string;
  date?: string;
  time?: string;
  reason?: string;
  staff?: string;
};

const formatLocalDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const offsetMinutes = date.getTimezoneOffset();
  const offsetSign = offsetMinutes <= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, "0");
  const offsetMins = String(absOffset % 60).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:00${offsetSign}${offsetHours}:${offsetMins}`;
};

export default function CreateAppointmentView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [reason, setReason] = useState("");
  const [observations, setObservations] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [showPrepaymentModal, setShowPrepaymentModal] = useState(false);
  const [pendingAppointment, setPendingAppointment] = useState<PendingAppointmentData | null>(null);

  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const { data: staffList = [], isLoading: isLoadingStaff } = useQuery({
    queryKey: ["staff"],
    queryFn: getStaffList,
    enabled: mounted,
  });

  const { data: vetAppointmentsOnDate = [] } = useQuery({
    queryKey: ["vetAppointments", selectedDateStr, selectedStaffId],
    queryFn: () => getAppointmentsByDateForVeterinarian(selectedDateStr),
    enabled: !!user && mounted,
  });

  const { mutate: createMutate, isPending } = useMutation({
    mutationFn: (formData: CreateAppointmentForm) => {
      if (!patientId) throw new Error("ID de paciente no encontrado");
      return createAppointment(formData, patientId);
    },
    onSuccess: (appointment) => {
      const prepaidAmount = appointment.prepaidAmount || 0;

      if (prepaidAmount > 0) {
        toast.success(`Cita creada con anticipo de $${prepaidAmount.toFixed(2)}`);
      } else {
        toast.success("Cita creada con éxito");
      }

      resetForm();

      queryClient.invalidateQueries({ queryKey: ["activeAppointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      queryClient.invalidateQueries({ queryKey: ["vetAppointments"] });

      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setShowPrepaymentModal(false);
    },
  });

  useEffect(() => {
    setMounted(true);
    if (user?._id) {
      setSelectedStaffId(user._id);
    }
  }, [user]);

  const resetForm = () => {
    setSelectedTime("");
    setSelectedDate(new Date());
    setSelectedType(null);
    setReason("");
    setObservations("");
    setPendingAppointment(null);
    setShowPrepaymentModal(false);
    setErrors({});
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => navigate(`/patients/${patientId}/appointments`), 300);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedStaffId) {
      newErrors.staff = "Selecciona quién atenderá la cita";
    }

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
      date: "",
      reason: reason.trim(),
      observations: observations.trim() || undefined,
      assignedTo: selectedStaffId || undefined,
    };

    setPendingAppointment({ formData, dateWithTime });
    setShowPrepaymentModal(true);
  };

  const handleConfirmWithPrepayment = (amount: number) => {
    if (!pendingAppointment) return;

    const finalFormData: CreateAppointmentForm = {
      ...pendingAppointment.formData,
      date: formatLocalDateTime(pendingAppointment.dateWithTime),
      prepaidAmount: amount,
    };

    createMutate(finalFormData);
  };

  const handleSkipPrepayment = () => {
    if (!pendingAppointment) return;

    const finalFormData: CreateAppointmentForm = {
      ...pendingAppointment.formData,
      date: formatLocalDateTime(pendingAppointment.dateWithTime),
      prepaidAmount: 0,
    };

    createMutate(finalFormData);
  };

  const handleCloseModal = () => {
    setShowPrepaymentModal(false);
    setPendingAppointment(null);
  };

  if (!patientId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-dark-400">
        <div className="text-center space-y-3">
          <p className="text-danger-500 font-bold">ID de paciente no válido</p>
          <button onClick={() => navigate(-1)} className="btn-secondary">Volver</button>
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
                    <CalendarPlus className="w-5 h-5 text-biovet-200" />
                    Nueva Cita
                  </h1>
                  {patient && (
                    <p className="text-biovet-100 text-xs sm:text-sm mt-0.5">
                      {patient.name} • {patient.species}
                      <span className="hidden sm:inline"> • {patient.breed}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ═══ CONTENIDO ═══ */}
        <main className="flex-1 overflow-y-auto bg-surface-50 dark:bg-dark-300 custom-scrollbar">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-32 sm:pb-6">
            <div className="space-y-4">

              {/* 1. Staff */}
              <StaffSelector
                staffList={staffList}
                selectedStaffId={selectedStaffId}
                onSelect={setSelectedStaffId}
                currentVetId={user?._id}
                currentVetName={user?.name}
                currentVetLastName={user?.lastName}
                isLoading={isLoadingStaff}
              />
              {errors.staff && (
                <p className="error-text font-medium -mt-2 ml-1">⚠️ {errors.staff}</p>
              )}

              {/* 2. Tipo */}
              <CategorySelector
                selectedType={selectedType}
                onSelect={setSelectedType}
              />
              {errors.type && (
                <p className="error-text font-medium -mt-2 ml-1">⚠️ {errors.type}</p>
              )}

              {/* 3. Fecha y Hora */}
              <DateTimeSelector
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateChange={setSelectedDate}
                onTimeSelect={setSelectedTime}
                disabledHoursData={vetAppointmentsOnDate}
              />
              {errors.time && (
                <p className="error-text font-medium -mt-2 ml-1">⚠️ {errors.time}</p>
              )}

              {/* 4. Motivo y Observaciones */}
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
                  Agendar Cita
                </>
              )}
            </button>
          </div>
        </footer>
      </div>

      {/* Modal de Prepago */}
      <PrepaymentModal
        isOpen={showPrepaymentModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmWithPrepayment}
        onSkip={handleSkipPrepayment}
        appointmentType={selectedType || ""}
        isLoading={isPending}
      />
    </>
  );
}