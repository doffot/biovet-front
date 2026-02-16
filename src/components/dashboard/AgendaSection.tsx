import { Calendar, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AgendaItem } from "./AgendaItem";
import type { Appointment } from "../../types/appointment";
import { formatTime } from "@/utils/dashboardUtils";

interface AgendaSectionProps {
  appointments: Appointment[];
}

export function AgendaSection({ appointments }: AgendaSectionProps) {
  const navigate = useNavigate();
  const isEmpty = appointments.length === 0;

  const getPatientInfo = (patient: any) => {
    if (typeof patient === "object" && patient) {
      const ownerName =
        typeof patient.owner === "object"
          ? patient.owner?.name || "Sin dueño"
          : "Sin dueño";
      return {
        id: patient._id,
        name: patient.name || "Paciente",
        photo: patient.photo,
        owner: ownerName,
      };
    }
    return { id: null, name: "Paciente", photo: null, owner: "Sin dueño" };
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    const patientInfo = getPatientInfo(appointment.patient);
    if (patientInfo.id) {
      navigate(`/patients/${patientInfo.id}/appointments/${appointment._id}`);
    }
  };

  return (
    <div
      className="bg-white/40 dark:bg-dark-100/40 
                    backdrop-blur-sm rounded-2xl 
                    border border-surface-300 dark:border-slate-700 
                    overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div
        className="px-4 py-3 
                      bg-surface-50/50 dark:bg-dark-200/50 
                      border-b border-surface-300 dark:border-slate-700 
                      flex items-center justify-between"
      >
        <h2 className="font-semibold text-surface-800 dark:text-white flex items-center gap-2">
          <div
            className="p-1.5 bg-white/50 dark:bg-dark-100/50 
                          rounded-lg border border-surface-300 dark:border-slate-700"
          >
            <Calendar className="w-4 h-4 text-biovet-500 dark:text-biovet-400" />
          </div>
          Citas de Hoy
        </h2>

        <div className="flex items-center gap-2">
          {/* Badge contador */}
          <span className="badge badge-biovet">
            {appointments.length}{" "}
            {appointments.length === 1 ? "cita" : "citas"}
          </span>

          {/* Link "Ver todas" */}
          <Link
            to="/appointments"
            className="text-xs text-biovet-500 dark:text-biovet-400 
                       hover:text-biovet-700 dark:hover:text-biovet-300 
                       font-medium flex items-center gap-0.5 
                       transition-colors group"
          >
            Ver todas
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isEmpty ? (
          /* Estado vacío */
          <div className="text-center py-12">
            <div
              className="w-16 h-16 mx-auto mb-4 
                            bg-surface-100 dark:bg-dark-200 
                            rounded-full flex items-center justify-center 
                            animate-pulse 
                            border border-surface-300 dark:border-slate-700"
            >
              <Calendar className="w-8 h-8 text-surface-500 dark:text-slate-500" />
            </div>
            <p className="text-surface-800 dark:text-slate-200 text-sm font-medium">
              No hay citas programadas
            </p>
            <p className="text-surface-500 dark:text-slate-400 text-xs mt-1">
              Agenda libre para hoy
            </p>

            {/* Botón para crear cita */}
            <Link
              to="/appointments"
              className="inline-flex items-center gap-2 mt-4 
                         px-4 py-2 
                         bg-biovet-50 dark:bg-biovet-950 
                         hover:bg-biovet-100 dark:hover:bg-biovet-900 
                         text-biovet-600 dark:text-biovet-400 
                         rounded-lg text-sm font-medium 
                         transition-colors 
                         border border-biovet-200 dark:border-biovet-800"
            >
              <Calendar className="w-4 h-4" />
              Crear primera cita
            </Link>
          </div>
        ) : (
          /* Lista de citas */
          <div className="space-y-2 max-h-85 overflow-y-auto pr-1 custom-scrollbar">
            {/* Primeras 3 citas */}
            {appointments.slice(0, 3).map((apt) => {
              const patientInfo = getPatientInfo(apt.patient);
              return (
                <div
                  key={apt._id}
                  onClick={() => handleAppointmentClick(apt)}
                  className="cursor-pointer"
                >
                  <AgendaItem
                    time={formatTime(apt.date)}
                    patientName={patientInfo.name}
                    patientPhoto={patientInfo.photo}
                    ownerName={patientInfo.owner}
                    reason={apt.reason}
                    type="cita"
                  />
                </div>
              );
            })}

            {/* Separador si hay más de 3 */}
            {appointments.length > 3 && (
              <>
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-surface-300 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span
                      className="bg-white dark:bg-dark-100 
                                    px-3 py-1 
                                    text-surface-500 dark:text-slate-400 
                                    rounded-full 
                                    border border-surface-300 dark:border-slate-700 
                                    shadow-sm"
                    >
                      +{appointments.length - 3} más
                    </span>
                  </div>
                </div>

                {/* Resto de citas */}
                {appointments.slice(3).map((apt) => {
                  const patientInfo = getPatientInfo(apt.patient);
                  return (
                    <div
                      key={apt._id}
                      onClick={() => handleAppointmentClick(apt)}
                      className="cursor-pointer"
                    >
                      <AgendaItem
                        time={formatTime(apt.date)}
                        patientName={patientInfo.name}
                        patientPhoto={patientInfo.photo}
                        ownerName={patientInfo.owner}
                        reason={apt.reason}
                        type="cita"
                      />
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}