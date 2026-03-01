// src/views/appointments/AppointmentView.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, useNavigate } from "react-router-dom";
import { getAppointmentsByPatient, deleteAppointment } from "@/api/appointmentAPI";
import {
  Calendar,
  Trash2,
  Pencil,
  Loader2,
  Clock,
  ChevronRight,
  CalendarCheck,
  CalendarX,
  AlertTriangle,
  CircleDot,
  CalendarDays,
} from "lucide-react";
import type { Patient } from "@/types/patient";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import TimelineLayout from "@/components/ui/TimelineLayout";

/* ═══ CONFIG POR ESTADO ═══ */
const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Programada: {
    label: "Programada",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    icon: <CircleDot size={12} />,
  },
  Completada: {
    label: "Completada",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    icon: <CalendarCheck size={12} />,
  },
  Cancelada: {
    label: "Cancelada",
    color: "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800",
    icon: <CalendarX size={12} />,
  },
  "No asistió": {
    label: "No asistió",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    icon: <AlertTriangle size={12} />,
  },
};

export default function AppointmentView() {
  const contextData = useOutletContext<any>();
  const patient: Patient = contextData.patient || contextData;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", patient._id],
    queryFn: () => getAppointmentsByPatient(patient._id),
    enabled: !!patient._id,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      toast.success("Eliminada", "Cita eliminada correctamente");
      queryClient.invalidateQueries({ queryKey: ["appointments", patient._id] });
      queryClient.invalidateQueries({ queryKey: ["activeAppointments", patient._id] });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error("Error", error.message || "No se pudo eliminar la cita");
    },
  });

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

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <TimelineLayout
      title="Citas"
      subtitle={`Agenda de ${patient?.name}`}
      headerIcon={Calendar}
      count={appointments.length}
      countLabel="citas"
      onAdd={() => navigate(`/patients/${patient._id}/appointments/new`)}
      variant="citas"
    >
      {sortedAppointments.length === 0 ? (
        <div className="ml-8 text-center py-16 border-2 border-dashed border-orange-200 dark:border-orange-900 rounded-2xl">
          <CalendarDays className="w-12 h-12 mx-auto text-orange-300 dark:text-orange-700 mb-3 opacity-50" />
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-1">No hay citas registradas</p>
          <p className="text-xs text-slate-300 dark:text-slate-600">Agenda la primera cita para este paciente</p>
        </div>
      ) : (
        sortedAppointments.map((appointment) => {
          const sConfig = statusConfig[appointment.status] || statusConfig["Programada"];
          const isPast = appointment.status === "Completada" || appointment.status === "Cancelada" || appointment.status === "No asistió";

          return (
            <div key={appointment._id} className={`relative flex gap-6 md:gap-8 group animate-fade-in ${isPast ? "opacity-60 hover:opacity-100 transition-opacity" : ""}`}>
              {/* Icono Timeline */}
              <div className="relative z-10 shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-500 shadow-sm transition-transform group-hover:scale-110">
                <Calendar size={14} strokeWidth={2.5} />
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                      {appointment.type}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {formatDate(appointment.date)}
                      </span>
                      <span className="flex items-center gap-1 opacity-70">
                        <Clock size={12} /> {formatTime(appointment.date)}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1">
                    {/* Badge Estado */}
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${sConfig.color}`}>
                      {sConfig.icon}
                      <span className="hidden sm:inline">{sConfig.label}</span>
                    </div>

                    <button
                      onClick={() => navigate(`/patients/${patient._id}/appointments/${appointment._id}/edit`)}
                      className="p-2 text-slate-400 hover:text-orange-500 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteId(appointment._id)}
                      className="p-2 text-slate-400 hover:text-danger-500 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Motivo */}
                {appointment.reason && (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 italic line-clamp-2">
                    "{appointment.reason}"
                  </p>
                )}

                {/* Anticipo */}
                {appointment.prepaidAmount && appointment.prepaidAmount > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-success-50 dark:bg-success-950/20 text-success-600 dark:text-success-400 px-2.5 py-1 rounded-lg text-xs font-semibold border border-success-100 dark:border-success-900/30">
                    Anticipo: ${appointment.prepaidAmount.toFixed(2)}
                  </div>
                )}

                {/* Link detalle */}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => navigate(`/patients/${patient._id}/appointments/${appointment._id}`)}
                    className="text-orange-600 dark:text-orange-400 hover:text-orange-800 font-bold text-sm flex items-center gap-1 transition-colors"
                  >
                    Ver detalle <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Eliminar Cita"
        message="¿Eliminar esta cita?"
        variant="danger"
        confirmText="Eliminar"
        isLoading={deleteMutation.isPending}
      />
    </TimelineLayout>
  );
}