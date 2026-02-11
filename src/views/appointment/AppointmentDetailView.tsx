// src/views/appointments/AppointmentDetailView.tsx

import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ChevronLeft,
  Edit,
  Trash2,
  Scissors,
  Plus,
  Calendar,
  Phone,
  Mail,
  User,
  PawPrint,
  Clock,
  FileText,
  DollarSign,
  AlertTriangle,
  MapPin,
  Stethoscope,
  Syringe,
  FlaskConical,
  SprayCan,
  Pill,
  CalendarCheck,
  CalendarX,
  CircleDot,
  ExternalLink,
} from "lucide-react";
import {
  getAppointmentById,
  deleteAppointment,
  updateAppointmentStatus,
} from "../../api/appointmentAPI";
import { getPatientById } from "../../api/patientAPI";
import { toast } from "../../components/Toast";
import type { AppointmentStatus } from "../../types/appointment";
import StatusDropdown from "../../components/appointments/StatusDropdown";
import ConfirmationModal from "@/components/ConfirmationModal";

type PopulatedOwner = {
  _id: string;
  name: string;
  lastName?: string;
  contact?: string;
  email?: string;
  address?: string;
};

const typeConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  Consulta: {
    icon: <Stethoscope size={20} />,
    color: "text-biovet-600 dark:text-biovet-400",
    bg: "bg-biovet-50 dark:bg-biovet-950/30",
    border: "border-biovet-100 dark:border-biovet-900/30",
  },
  Peluquería: {
    icon: <Scissors size={20} />,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-100 dark:border-purple-900/30",
  },
  Laboratorio: {
    icon: <FlaskConical size={20} />,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-100 dark:border-amber-900/30",
  },
  Vacuna: {
    icon: <Syringe size={20} />,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-100 dark:border-emerald-900/30",
  },
  Cirugía: {
    icon: <Pill size={20} />,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-100 dark:border-red-900/30",
  },
  Tratamiento: {
    icon: <SprayCan size={20} />,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-100 dark:border-sky-900/30",
  },
};

const statusConfig: Record<
  string,
  { label: string; class: string; icon: React.ReactNode }
> = {
  Programada: {
    label: "Programada",
    class: "badge badge-biovet",
    icon: <CircleDot size={12} />,
  },
  Completada: {
    label: "Completada",
    class: "badge badge-success",
    icon: <CalendarCheck size={12} />,
  },
  Cancelada: {
    label: "Cancelada",
    class: "badge badge-danger",
    icon: <CalendarX size={12} />,
  },
  "No asistió": {
    label: "No asistió",
    class: "badge badge-warning",
    icon: <AlertTriangle size={12} />,
  },
};

export default function AppointmentDetailView() {
  const { appointmentId, patientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingCancelStatus, setPendingCancelStatus] =
    useState<AppointmentStatus | null>(null);

  // ✅ FIX: usar status y fetchStatus en vez de isLoading
  const {
    data: appointment,
    status: appointmentStatus,
    error: appointmentError,
  } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => getAppointmentById(appointmentId!),
    enabled: !!appointmentId,
  });

  const {
    data: patient,
    status: patientStatus,
    error: patientError,
  } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const { mutate: deleteAppointmentMutate, isPending: isDeleting } =
    useMutation({
      mutationFn: () => deleteAppointment(appointmentId!),
      onSuccess: () => {
        toast.success("Cita eliminada");
        queryClient.invalidateQueries({
          queryKey: ["appointments", patientId],
        });
        queryClient.invalidateQueries({
          queryKey: ["activeAppointments", patientId],
        });
        navigate(`/patients/${patientId}/appointments`);
      },
      onError: (error: Error) =>
        toast.error("Error al eliminar", error.message),
    });

  const { mutate: updateStatusMutate, isPending: isUpdatingStatus } =
    useMutation({
      mutationFn: async ({
        status,
        shouldRefund,
      }: {
        status: AppointmentStatus;
        shouldRefund?: boolean;
      }) => {
        return updateAppointmentStatus(appointmentId!, {
          status,
          shouldRefund,
        });
      },
      onSuccess: () => {
        toast.success("Estado actualizado");
        queryClient.invalidateQueries({
          queryKey: ["appointment", appointmentId],
        });
        queryClient.invalidateQueries({
          queryKey: ["appointments", patientId],
        });
        queryClient.invalidateQueries({
          queryKey: ["activeAppointments", patientId],
        });
        queryClient.invalidateQueries({
          queryKey: ["groomingServices", patientId],
        });
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        queryClient.invalidateQueries({ queryKey: ["owners"] });
        setShowCancelModal(false);
        setPendingCancelStatus(null);
      },
      onError: (error: Error) => toast.error("Error", error.message),
    });

  const handleStatusUpdate = (status: AppointmentStatus) => {
    if (
      status === "Cancelada" &&
      appointment?.prepaidAmount &&
      appointment.prepaidAmount > 0
    ) {
      setPendingCancelStatus(status);
      setShowCancelModal(true);
      return;
    }
    updateStatusMutate({ status });
  };

  const handleCancelWithRefund = (shouldRefund: boolean) => {
    if (pendingCancelStatus) {
      updateStatusMutate({ status: pendingCancelStatus, shouldRefund });
    }
  };

  // ✅ FIX: Chequear status correctamente
  const isLoading =
    appointmentStatus === "pending" || patientStatus === "pending";
  const hasError = appointmentStatus === "error" || patientStatus === "error";

  /* ═══ LOADING ═══ */
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-dark-400 z-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-biovet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-surface-500 uppercase tracking-widest">
            Cargando cita...
          </p>
        </div>
      </div>
    );
  }

  /* ═══ ERROR ═══ */
  if (hasError || !appointment || !patient) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-dark-400 z-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-danger-50 dark:bg-danger-950/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-danger-500" />
          </div>
          <p className="text-slate-700 dark:text-slate-200 font-bold">
            Cita no encontrada
          </p>
          {(appointmentError || patientError) && (
            <p className="text-xs text-danger-500">
              {(appointmentError as Error)?.message ||
                (patientError as Error)?.message}
            </p>
          )}
          <button
            onClick={() => navigate(`/patients/${patientId}/appointments`)}
            className="btn-secondary"
          >
            Volver a citas
          </button>
        </div>
      </div>
    );
  }

  /* ═══ DATA ═══ */
  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = appointmentDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const canCreateService =
    appointment.type === "Peluquería" &&
    (appointment.status === "Programada" ||
      appointment.status === "Completada");

  const owner =
    patient?.owner && typeof patient.owner === "object"
      ? (patient.owner as PopulatedOwner)
      : null;
  const ownerName = owner
    ? `${owner.name} ${owner.lastName || ""}`.trim()
    : null;
  const ownerPhone = owner?.contact || null;
  const ownerEmail = owner?.email || null;
  const ownerAddress = owner?.address || null;
  const ownerId =
    owner?._id || (typeof patient?.owner === "string" ? patient.owner : null);

  const tConfig = typeConfig[appointment.type] || typeConfig["Consulta"];
  const sConfig =
    statusConfig[appointment.status] || statusConfig["Programada"];

  return (
    <>
      <div className="fixed inset-0 z-60 bg-surface-100 dark:bg-dark-400 flex flex-col overflow-hidden animate-fade-in">
        {/* ═══ HEADER ═══ */}
        <header className="bg-white dark:bg-dark-200 border-b border-surface-200 dark:border-dark-100 px-4 md:px-6 py-3 shrink-0 z-20">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/patients/${patientId}/appointments`)}
                className="btn-icon-neutral w-9! h-9! rounded-xl!"
              >
                <ChevronLeft size={18} />
              </button>
              <div>
                <h1 className="text-base font-bold text-slate-800 dark:text-white leading-none">
                  Detalle de Cita
                </h1>
                <p className="text-[11px] text-surface-500 dark:text-slate-400 font-medium mt-1 flex items-center gap-1.5 capitalize">
                  <Calendar size={11} className="text-biovet-500" />
                  {formattedDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  navigate(
                    `/patients/${patientId}/appointments/${appointmentId}/edit`,
                  )
                }
                className="btn-icon-neutral rounded-xl!"
                title="Editar"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="btn-icon-danger rounded-xl!"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* ═══ BODY ═══ */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
          <div className="max-w-5xl mx-auto space-y-5 pb-16">
            {/* BANNER TIPO + ESTADO */}
            <section className="bg-white dark:bg-dark-200 rounded-2xl border border-surface-200 dark:border-dark-100 p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${tConfig.bg} ${tConfig.color} border ${tConfig.border} flex items-center justify-center shrink-0`}
                  >
                    {tConfig.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white font-heading">
                      {appointment.type}
                    </h2>
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-surface-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {formattedTime}
                      </span>
                      <span className="text-surface-300 dark:text-slate-600">
                        •
                      </span>
                      <span className="capitalize">{formattedDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={sConfig.class}>
                    {sConfig.icon}
                    {sConfig.label}
                  </div>
                  <StatusDropdown
                    currentStatus={appointment.status}
                    onStatusChange={handleStatusUpdate}
                    isUpdating={isUpdatingStatus}
                  />
                </div>
              </div>
            </section>

            {/* GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
              {/* COL IZQUIERDA */}
              <div className="space-y-5">
                {/* Paciente */}
                <section className="bg-white dark:bg-dark-200 rounded-2xl border border-surface-200 dark:border-dark-100 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                    <PawPrint size={14} className="text-biovet-500" /> Paciente
                  </h3>
                  <Link
                    to={`/patients/${patientId}`}
                    className="flex items-center gap-3 group"
                  >
                    {patient?.photo ? (
                      <img
                        src={patient.photo}
                        alt={patient.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-surface-200 dark:border-dark-100"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-dark-300 flex items-center justify-center border border-surface-200 dark:border-dark-100">
                        <PawPrint size={24} className="text-surface-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-biovet-500 transition-colors truncate">
                        {patient.name}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="badge badge-neutral">
                          {patient.species}
                        </span>
                        <span className="badge badge-neutral">
                          {patient.breed}
                        </span>
                      </div>
                    </div>
                    <ExternalLink
                      size={14}
                      className="text-surface-300 dark:text-slate-600 group-hover:text-biovet-500 transition-colors shrink-0"
                    />
                  </Link>
                </section>

                {/* Propietario */}
                {ownerName && (
                  <section className="bg-white dark:bg-dark-200 rounded-2xl border border-surface-200 dark:border-dark-100 p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                      <User size={14} className="text-biovet-500" /> Propietario
                    </h3>
                    <div className="space-y-3">
                      {ownerId ? (
                        <Link
                          to={`/owners/${ownerId}`}
                          className="font-bold text-slate-700 dark:text-slate-200 hover:text-biovet-500 dark:hover:text-biovet-400 transition-colors"
                        >
                          {ownerName}
                        </Link>
                      ) : (
                        <p className="font-bold text-slate-700 dark:text-slate-200">
                          {ownerName}
                        </p>
                      )}
                      {ownerPhone && (
                        <a
                          href={`tel:${ownerPhone}`}
                          className="flex items-center gap-2 text-sm text-biovet-500 hover:text-biovet-600 dark:hover:text-biovet-400 transition-colors"
                        >
                          <Phone size={14} /> {ownerPhone}
                        </a>
                      )}
                      {ownerEmail && (
                        <a
                          href={`mailto:${ownerEmail}`}
                          className="flex items-center gap-2 text-sm text-surface-500 dark:text-slate-400 hover:text-biovet-500 transition-colors"
                        >
                          <Mail size={14} /> {ownerEmail}
                        </a>
                      )}
                      {ownerAddress && (
                        <p className="flex items-center gap-2 text-sm text-surface-500 dark:text-slate-400">
                          <MapPin size={14} /> {ownerAddress}
                        </p>
                      )}
                    </div>
                  </section>
                )}

                {/* Anticipo */}
                {/* Anticipo - siempre visible */}
                <section className="bg-success-50 dark:bg-success-950/20 rounded-2xl border border-success-100 dark:border-success-900/30 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-success-600 dark:text-success-400 mb-3 flex items-center gap-2">
                    <DollarSign size={14} /> Anticipo
                  </h3>
                  <p className="text-3xl font-bold text-success-600 dark:text-success-400 font-heading">
                    ${(appointment.prepaidAmount ?? 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-success-500/70 dark:text-success-400/50 mt-1">
                    {appointment.prepaidAmount && appointment.prepaidAmount > 0
                      ? "Monto abonado al crear la cita"
                      : "Sin anticipo registrado"}
                  </p>
                </section>
              </div>

              {/* COL DERECHA */}
              <div className="lg:col-span-2 space-y-5">
                {/* Motivo */}
                <section className="bg-white dark:bg-dark-200 rounded-2xl border border-surface-200 dark:border-dark-100 p-5 md:p-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <FileText size={14} className="text-biovet-500" /> Motivo de
                    la cita
                  </h3>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-[15px]">
                    {appointment.reason || (
                      <span className="text-surface-400 dark:text-slate-500 italic">
                        Sin especificar
                      </span>
                    )}
                  </p>
                </section>

                {/* Observaciones */}
                {appointment.observations && (
                  <section className="bg-white dark:bg-dark-200 rounded-2xl border border-surface-200 dark:border-dark-100 p-5 md:p-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                      <FileText size={14} className="text-warning-500" />{" "}
                      Observaciones
                    </h3>
                    <div className="p-4 bg-warning-50 dark:bg-warning-950/20 rounded-xl border border-warning-100 dark:border-warning-900/30">
                      <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {appointment.observations}
                      </p>
                    </div>
                  </section>
                )}

                {/* Peluquería */}
                {canCreateService && (
                  <Link
                    to={`/patients/${patientId}/grooming-services/create?appointmentId=${appointmentId}`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-semibold transition-colors shadow-sm"
                  >
                    <Scissors size={18} />
                    <Plus size={14} className="-ml-1.5" />
                    Crear servicio de peluquería
                  </Link>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-surface-400 dark:text-slate-500 pt-1 px-1">
                  <span>
                    Creada el{" "}
                    {new Date(appointment.createdAt).toLocaleDateString(
                      "es-ES",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </span>
                  {appointment.updatedAt !== appointment.createdAt && (
                    <span>
                      Editada el{" "}
                      {new Date(appointment.updatedAt).toLocaleDateString(
                        "es-ES",
                        { day: "numeric", month: "short", year: "numeric" },
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODALES */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => deleteAppointmentMutate()}
        title="Eliminar cita"
        message={
          <p className="text-surface-500 dark:text-slate-400">
            ¿Estás seguro de eliminar la cita del{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {formattedDate}
            </span>
            ? Esta acción no se puede deshacer.
          </p>
        }
        confirmText="Eliminar"
        confirmIcon={Trash2}
        variant="danger"
        isLoading={isDeleting}
        loadingText="Eliminando..."
      />

      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setPendingCancelStatus(null);
        }}
        onConfirm={() => handleCancelWithRefund(true)}
        title="Cancelar cita con anticipo"
        message={
          <div className="space-y-4">
            <p className="text-surface-500 dark:text-slate-400">
              Esta cita tiene un anticipo de{" "}
              <span className="font-bold text-success-500">
                ${appointment?.prepaidAmount?.toFixed(2)}
              </span>
            </p>
            <p className="text-surface-500 dark:text-slate-400">
              ¿Qué deseas hacer con el anticipo?
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleCancelWithRefund(true)}
                disabled={isUpdatingStatus}
                className="btn-primary w-full justify-center disabled:opacity-50"
              >
                Reembolsar anticipo
              </button>
              <button
                onClick={() => handleCancelWithRefund(false)}
                disabled={isUpdatingStatus}
                className="btn-secondary w-full justify-center disabled:opacity-50"
              >
                Mantener como crédito
              </button>
            </div>
          </div>
        }
        confirmText=""
        variant="warning"
        isLoading={isUpdatingStatus}
        loadingText="Procesando..."
      />
    </>
  );
}
