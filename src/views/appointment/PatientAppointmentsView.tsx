// src/views/appointments/AppointmentView.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, useNavigate } from "react-router-dom";
import { getAppointmentsByPatient, deleteAppointment } from "@/api/appointmentAPI";
import {
  Calendar,
  Trash2,
  Pencil,
  PlusCircleIcon,
  Loader2,
  Clock,
  ChevronRight,
  DollarSign,
  Stethoscope,
  Scissors,
  FlaskConical,
  Syringe,
  Pill,
  SprayCan,
  CalendarCheck,
  CalendarX,
  AlertTriangle,
  CircleDot,
  CalendarDays,
} from "lucide-react";
import type { Patient } from "@/types/patient";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";

/* ═══ CONFIG POR TIPO ═══ */
const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string; dot: string }> = {
  Consulta: {
    icon: <Stethoscope size={18} />,
    color: "text-biovet-600 dark:text-biovet-400",
    bg: "bg-biovet-50 dark:bg-biovet-950/30",
    border: "border-biovet-100 dark:border-biovet-900/30",
    dot: "bg-biovet-500",
  },
  Peluquería: {
    icon: <Scissors size={18} />,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-100 dark:border-purple-900/30",
    dot: "bg-purple-500",
  },
  Laboratorio: {
    icon: <FlaskConical size={18} />,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-100 dark:border-amber-900/30",
    dot: "bg-amber-500",
  },
  Vacuna: {
    icon: <Syringe size={18} />,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-100 dark:border-emerald-900/30",
    dot: "bg-emerald-500",
  },
  Cirugía: {
    icon: <Pill size={18} />,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-100 dark:border-red-900/30",
    dot: "bg-red-500",
  },
  Tratamiento: {
    icon: <SprayCan size={18} />,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-100 dark:border-sky-900/30",
    dot: "bg-sky-500",
  },
};

/* ═══ CONFIG POR ESTADO ═══ */
const statusConfig: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
  Programada: {
    label: "Programada",
    class: "badge badge-biovet",
    icon: <CircleDot size={10} />,
  },
  Completada: {
    label: "Completada",
    class: "badge badge-success",
    icon: <CalendarCheck size={10} />,
  },
  Cancelada: {
    label: "Cancelada",
    class: "badge badge-danger",
    icon: <CalendarX size={10} />,
  },
  "No asistió": {
    label: "No asistió",
    class: "badge badge-warning",
    icon: <AlertTriangle size={10} />,
  },
};

export default function AppointmentView() {
  const contextData = useOutletContext<any>();
  const patient: Patient = contextData.patient || contextData;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ═══ QUERIES ═══ */
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", patient._id],
    queryFn: () => getAppointmentsByPatient(patient._id),
    enabled: !!patient._id,
  });

  /* ═══ MUTATION DELETE ═══ */
  const deleteMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      toast.success("Eliminada", "La cita ha sido eliminada correctamente");
      queryClient.invalidateQueries({ queryKey: ["appointments", patient._id] });
      queryClient.invalidateQueries({ queryKey: ["activeAppointments", patient._id] });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error("Error", error.message || "No se pudo eliminar la cita");
    },
  });

  /* ═══ HELPERS ═══ */
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  /* ═══ LOADING ═══ */
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-biovet-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col bg-surface-50 dark:bg-dark-300 min-h-screen lg:min-h-0 lg:h-[calc(100vh-14rem)] lg:rounded-2xl lg:border lg:border-surface-200 lg:dark:border-dark-100 lg:overflow-hidden">

        {/* ═══ HEADER ═══ */}
        <div className="sticky top-0 lg:static z-40 bg-biovet-50 dark:bg-dark-200 border-b border-surface-200 dark:border-dark-100 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-heading text-slate-800 dark:text-white">
                Citas
              </h1>
              {appointments.length > 0 && (
                <span className="badge badge-neutral">{appointments.length}</span>
              )}
            </div>

            <button
              onClick={() => navigate(`/patients/${patient._id}/appointments/new`)}
              className="btn-primary shadow-lg active:scale-95 transition-transform xs:rounded-full w-10 h-10 lg:w-auto lg:h-auto p-0 lg:px-4 lg:py-2.5 flex items-center justify-center gap-2"
            >
              <PlusCircleIcon size={20} />
              <span className="hidden lg:inline font-semibold">Agendar</span>
            </button>
          </div>
        </div>

        {/* ═══ CONTENIDO ═══ */}
        <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-4 pb-24">
          <div className="max-w-4xl mx-auto relative pl-4 lg:pl-0">

            {/* Línea vertical timeline */}
            {sortedAppointments.length > 0 && (
              <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-dark-100 z-0" />
            )}

            <div className="space-y-6 relative">
              {sortedAppointments.length === 0 ? (
                /* ═══ EMPTY STATE ═══ */
                <div className="text-center py-20 ml-10 border-2 border-dashed border-slate-200 dark:border-dark-100 rounded-2xl">
                  <CalendarDays className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3 opacity-50" />
                  <p className="text-slate-400 dark:text-slate-500 font-medium mb-1">
                    No hay citas registradas
                  </p>
                  <p className="text-xs text-slate-300 dark:text-slate-600">
                    Agenda la primera cita para este paciente
                  </p>
                </div>
              ) : (
                sortedAppointments.map((appointment) => {
                  const tConfig = typeConfig[appointment.type] || typeConfig["Consulta"];
                  const sConfig = statusConfig[appointment.status] || statusConfig["Programada"];
                  const isPast = appointment.status === "Completada" || appointment.status === "Cancelada" || appointment.status === "No asistió";

                  return (
                    <div
                      key={appointment._id}
                      className="relative flex items-start gap-5 group"
                    >
                      {/* ── Dot timeline ── */}
                      <div className={`shrink-0 relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-surface-50 dark:border-dark-300 shadow-sm ${isPast ? "bg-surface-100 dark:bg-dark-100 text-surface-400 dark:text-slate-500" : `bg-white dark:bg-dark-200 ${tConfig.color}`}`}>
                        {tConfig.icon}
                      </div>

                      {/* ── Card ── */}
                      <div className="flex-1 min-w-0">
                        <div className={`bg-white dark:bg-dark-200 p-5 rounded-2xl rounded-tl-sm shadow-sm border border-surface-200 dark:border-dark-100 hover:shadow-md transition-all duration-200 relative ${isPast ? "opacity-75 hover:opacity-100" : ""}`}>

                          {/* Acciones */}
                          <div className="absolute top-4 right-4 flex gap-1.5">
                            <button
                              onClick={() => navigate(`/patients/${patient._id}/appointments/${appointment._id}/edit`)}
                              className="p-1.5 rounded-lg text-surface-400 hover:text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-950/30 transition-colors"
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteId(appointment._id)}
                              className="p-1.5 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/30 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          {/* Fecha + Hora + Estado */}
                          <div className="mb-3 pr-20">
                            <div className="flex items-center gap-3 mb-1.5">
                              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                                <Calendar size={13} className="text-biovet-500" />
                                {formatDate(appointment.date)}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-surface-500 dark:text-slate-400 bg-surface-50 dark:bg-dark-300 px-2 py-0.5 rounded-md">
                                <Clock size={11} />
                                {formatTime(appointment.date)}
                              </div>
                            </div>

                            {/* Tipo + Estado */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${tConfig.bg} ${tConfig.color} border ${tConfig.border}`}>
                                {tConfig.icon}
                                {appointment.type}
                              </span>
                              <span className={sConfig.class}>
                                {sConfig.icon}
                                {sConfig.label}
                              </span>
                            </div>
                          </div>

                          {/* Motivo */}
                          {appointment.reason && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3 line-clamp-2">
                              {appointment.reason}
                            </p>
                          )}

                          {/* Observaciones preview */}
                          {appointment.observations && (
                            <div className="bg-warning-50 dark:bg-warning-950/20 p-2.5 rounded-xl border border-warning-100 dark:border-warning-900/30 mb-3">
                              <p className="text-xs text-warning-700 dark:text-warning-400 line-clamp-1 italic">
                                📝 {appointment.observations}
                              </p>
                            </div>
                          )}

                          {/* Anticipo */}
                          {appointment.prepaidAmount && appointment.prepaidAmount > 0 && (
                            <div className="inline-flex items-center gap-1.5 bg-success-50 dark:bg-success-950/20 text-success-600 dark:text-success-400 px-2.5 py-1 rounded-lg text-xs font-semibold border border-success-100 dark:border-success-900/30 mb-3">
                              <DollarSign size={12} />
                              Anticipo: ${appointment.prepaidAmount.toFixed(2)}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-dashed border-surface-100 dark:border-dark-100">
                            <span className="text-[11px] text-surface-400 dark:text-slate-500 font-medium">
                              ID: {appointment._id.slice(-6).toUpperCase()}
                            </span>
                            <button
                              onClick={() => navigate(`/patients/${patient._id}/appointments/${appointment._id}`)}
                              className="text-biovet-600 dark:text-biovet-400 hover:text-biovet-800 dark:hover:text-biovet-300 font-bold text-sm flex items-center gap-1 transition-colors"
                            >
                              Ver detalle
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MODAL ELIMINAR ═══ */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
        title="Eliminar Cita"
        message="¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer."
        variant="danger"
        confirmText="Eliminar cita"
        confirmIcon={Trash2}
        isLoading={deleteMutation.isPending}
        loadingText="Eliminando..."
      />
    </>
  );
}