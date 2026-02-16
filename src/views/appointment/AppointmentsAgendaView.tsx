// src/views/appointments/AppointmentsAgendaView.tsx

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  PawPrint,
  Calendar,
  Clock,
  X,
  CirclePlus,
} from "lucide-react";
import { getAllAppointments } from "../../api/appointmentAPI";
import type {
  AppointmentWithPatient,
  AppointmentStatus,
  AppointmentType,
} from "../../types/appointment";
import { appointmentStatuses, appointmentTypes } from "../../types/appointment";

export default function AppointmentsAgendaView() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    AppointmentStatus | "all"
  >("all");
  const [typeFilter, setTypeFilter] = useState<AppointmentType | "all">(
    "all"
  );
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["allAppointments"],
    queryFn: getAllAppointments,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const getTodayString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const filteredAppointments = useMemo(() => {
    return (appointments as AppointmentWithPatient[]).filter((apt) => {
      if (statusFilter !== "all" && apt.status !== statusFilter) return false;
      if (typeFilter !== "all" && apt.type !== typeFilter) return false;

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const patientName =
          typeof apt.patient === "object"
            ? apt.patient.name?.toLowerCase()
            : "";
        const ownerName =
          typeof apt.patient === "object" &&
          typeof apt.patient.owner === "object"
            ? `${apt.patient.owner.name} ${apt.patient.owner.lastName || ""}`.toLowerCase()
            : "";

        if (
          !patientName.includes(search) &&
          !ownerName.includes(search) &&
          !apt.type.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [appointments, statusFilter, typeFilter, searchTerm]);

  const { todayAppointments, upcomingAppointments, pastAppointments } =
    useMemo(() => {
      const todayStr = getTodayString();
      const now = new Date();

      const today: AppointmentWithPatient[] = [];
      const upcoming: AppointmentWithPatient[] = [];
      const past: AppointmentWithPatient[] = [];

      filteredAppointments.forEach((apt) => {
        const aptDate = new Date(apt.date);
        const aptDateStr = apt.date.split("T")[0];

        if (aptDateStr === todayStr) {
          today.push(apt);
        } else if (aptDate > now) {
          upcoming.push(apt);
        } else {
          past.push(apt);
        }
      });

      today.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      upcoming.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      past.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return {
        todayAppointments: today,
        upcomingAppointments: upcoming,
        pastAppointments: past,
      };
    }, [filteredAppointments]);

  const getStatusStyle = (status: AppointmentStatus) => {
    const styles: Record<AppointmentStatus, string> = {
      Programada: "badge badge-biovet",
      Completada: "badge badge-success",
      Cancelada: "badge badge-danger",
      "No asistió": "badge badge-warning",
    };
    return styles[status];
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Hoy";
    if (date.toDateString() === tomorrow.toDateString()) return "Mañana";

    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  /* ═══ LOADING ═══ */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-biovet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ═══ APPOINTMENT CARD ═══ */
  const AppointmentCard = ({
    apt,
    showDate = false,
  }: {
    apt: AppointmentWithPatient;
    showDate?: boolean;
  }) => {
    const patient = typeof apt.patient === "object" ? apt.patient : null;
    const owner =
      patient && typeof patient.owner === "object" ? patient.owner : null;

    return (
      <Link
        to={
          patient
            ? `/patients/${patient._id}/appointments/${apt._id}`
            : "#"
        }
        className="flex items-center gap-3 p-3 
                      bg-white dark:bg-dark-100 
                      rounded-xl 
                      border border-surface-300 dark:border-slate-700 
                      hover:border-biovet-400 dark:hover:border-biovet-600 
                      hover:shadow-md 
                      transition-all group"
      >
        {/* Hora */}
        <div className="text-center w-14 shrink-0">
          {showDate && (
            <p className="text-[9px] font-medium text-surface-500 dark:text-slate-400 uppercase">
              {formatDateLabel(apt.date)}
            </p>
          )}
          <p className="text-sm font-bold text-biovet-500 dark:text-biovet-400">
            {formatTime(apt.date)}
          </p>
        </div>

        {/* Foto */}
        {patient?.photo ? (
          <img
            src={patient.photo}
            alt={patient.name}
            className="w-10 h-10 rounded-lg object-cover shrink-0 
                       border border-surface-300 dark:border-slate-700"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-lg 
                          bg-biovet-50 dark:bg-biovet-950 
                          flex items-center justify-center shrink-0 
                          border border-biovet-200 dark:border-biovet-800"
          >
            <PawPrint className="w-4 h-4 text-biovet-500 dark:text-biovet-400" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-surface-800 dark:text-white truncate">
              {patient?.name || "Paciente"}
            </h4>
            <span className={getStatusStyle(apt.status)}>
              {apt.status}
            </span>
          </div>
          <p className="text-xs text-surface-500 dark:text-slate-400 truncate">
            {apt.type} {owner && `· ${owner.name}`}
          </p>
        </div>

        {/* Anticipo */}
        {apt.prepaidAmount && apt.prepaidAmount > 0 && (
          <span
            className="text-[10px] font-semibold 
                          text-success-600 dark:text-success-400 
                          bg-success-50 dark:bg-success-950 
                          px-1.5 py-0.5 rounded shrink-0 
                          border border-success-200 dark:border-success-800"
          >
            ${apt.prepaidAmount}
          </span>
        )}

        <ChevronRight
          className="w-4 h-4 
                        text-surface-400 dark:text-slate-500 
                        group-hover:text-biovet-500 dark:group-hover:text-biovet-400 
                        transition-colors shrink-0"
        />
      </Link>
    );
  };

  const todayDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const pendingToday = todayAppointments.filter(
    (a) => a.status === "Programada"
  ).length;

  return (
    <div
      className={`p-4 lg:p-6 transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
    >
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-800 dark:text-white">
            Agenda de Citas
          </h1>
          <p className="text-surface-500 dark:text-slate-400 capitalize">
            {todayDate}
          </p>
        </div>
        <Link to="/appointments/select-patient" className="btn-primary">
          <CirclePlus className="w-5 h-5" />
          Agregar
        </Link>
      </div>

      {/* ═══ FILTROS ═══ */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por mascota, dueño o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-11"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as AppointmentStatus | "all")
          }
          className="input w-auto"
        >
          <option value="all">Todos los estados</option>
          {appointmentStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as AppointmentType | "all")
          }
          className="input w-auto hidden md:block"
        >
          <option value="all">Todos los tipos</option>
          {appointmentTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* ═══ LAYOUT 50/50 ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Columna izquierda: HOY ── */}
        <div
          className="bg-white dark:bg-dark-100 
                        rounded-2xl 
                        border border-surface-300 dark:border-slate-700 
                        overflow-hidden"
        >
          {/* Header gradiente */}
          <div className="bg-linear-to-r from-biovet-500 to-biovet-600 dark:from-biovet-700 dark:to-biovet-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white">Hoy</h2>
                  <p className="text-xs text-white/70">
                    {pendingToday > 0
                      ? `${pendingToday} pendiente${pendingToday !== 1 ? "s" : ""}`
                      : "Sin pendientes"}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-white/20 text-white text-lg font-bold rounded-full">
                {todayAppointments.length}
              </span>
            </div>
          </div>

          {/* Lista de hoy */}
          <div className="p-4 max-h-125 overflow-y-auto custom-scrollbar">
            {todayAppointments.length === 0 ? (
              <div className="py-12 text-center">
                <Clock className="w-10 h-10 text-surface-400 dark:text-slate-600 mx-auto mb-3 opacity-30" />
                <p className="text-surface-800 dark:text-slate-200 font-medium mb-1">
                  Sin citas para hoy
                </p>
                <p className="text-sm text-surface-500 dark:text-slate-400">
                  Tu agenda está libre
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayAppointments.map((apt) => (
                  <AppointmentCard key={apt._id} apt={apt} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Columna derecha ── */}
        <div className="space-y-6">
          {/* Resumen compacto */}
          <div
            className="bg-white dark:bg-dark-100 
                          rounded-2xl 
                          border border-surface-300 dark:border-slate-700 
                          p-4"
          >
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-biovet-500 dark:text-biovet-400">
                  {todayAppointments.length}
                </p>
                <p className="text-[10px] text-surface-500 dark:text-slate-400 uppercase">
                  Hoy
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-800 dark:text-white">
                  {upcomingAppointments.length}
                </p>
                <p className="text-[10px] text-surface-500 dark:text-slate-400 uppercase">
                  Próximas
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-biovet-add dark:text-biovet-300">
                  {
                    filteredAppointments.filter(
                      (a) => a.status === "Programada"
                    ).length
                  }
                </p>
                <p className="text-[10px] text-surface-500 dark:text-slate-400 uppercase">
                  Pendientes
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success-500 dark:text-success-400">
                  {
                    filteredAppointments.filter(
                      (a) => a.status === "Completada"
                    ).length
                  }
                </p>
                <p className="text-[10px] text-surface-500 dark:text-slate-400 uppercase">
                  Completadas
                </p>
              </div>
            </div>
          </div>

          {/* Próximas citas */}
          <div
            className="bg-white dark:bg-dark-100 
                          rounded-2xl 
                          border border-surface-300 dark:border-slate-700 
                          overflow-hidden"
          >
            <div className="p-4 border-b border-surface-300 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-surface-800 dark:text-white">
                  Próximas citas
                </h3>
                <span className="text-xs text-surface-500 dark:text-slate-400">
                  {upcomingAppointments.length} programadas
                </span>
              </div>
            </div>

            <div className="p-4 max-h-70 overflow-y-auto custom-scrollbar">
              {upcomingAppointments.length === 0 ? (
                <p className="text-center text-surface-500 dark:text-slate-400 py-6 text-sm">
                  Sin citas próximas
                </p>
              ) : (
                <div className="space-y-2">
                  {(showAllUpcoming
                    ? upcomingAppointments
                    : upcomingAppointments.slice(0, 5)
                  ).map((apt) => (
                    <AppointmentCard key={apt._id} apt={apt} showDate />
                  ))}
                </div>
              )}
            </div>

            {upcomingAppointments.length > 5 && (
              <div className="p-3 border-t border-surface-300 dark:border-slate-700 text-center">
                <button
                  onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                  className="text-sm font-medium 
                             text-biovet-500 dark:text-biovet-400 
                             hover:text-biovet-600 dark:hover:text-biovet-300 
                             flex items-center justify-center gap-1 mx-auto 
                             transition-colors cursor-pointer"
                >
                  {showAllUpcoming
                    ? "Ver menos"
                    : `Ver todas (${upcomingAppointments.length})`}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showAllUpcoming ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Historial mini */}
          {pastAppointments.length > 0 && (
            <div
              className="bg-white dark:bg-dark-100 
                            rounded-2xl 
                            border border-surface-300 dark:border-slate-700 
                            p-4"
            >
              <button
                onClick={() => setShowHistorial(true)}
                className="w-full flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <h3
                    className="font-semibold text-surface-500 dark:text-slate-400 text-sm 
                                  group-hover:text-surface-800 dark:group-hover:text-white 
                                  transition-colors"
                  >
                    Historial
                  </h3>
                  <span className="text-xs text-surface-500 dark:text-slate-400">
                    ({pastAppointments.length} citas)
                  </span>
                </div>
                <ChevronRight
                  className="w-4 h-4 
                                text-surface-400 dark:text-slate-500 
                                group-hover:text-biovet-500 dark:group-hover:text-biovet-400 
                                transition-colors"
                />
              </button>

              {/* Preview */}
              <div className="mt-3 space-y-2">
                {pastAppointments.slice(0, 3).map((apt) => {
                  const patient =
                    typeof apt.patient === "object" ? apt.patient : null;

                  return (
                    <Link
                      key={apt._id}
                      to={
                        patient
                          ? `/patients/${patient._id}/appointments/${apt._id}`
                          : "#"
                      }
                      className="flex items-center gap-3 p-2 rounded-lg 
                                    hover:bg-surface-50 dark:hover:bg-dark-200 
                                    transition-colors"
                    >
                      {patient?.photo ? (
                        <img
                          src={patient.photo}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover 
                                     border border-surface-300 dark:border-slate-700"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-lg 
                                        bg-biovet-50 dark:bg-biovet-950 
                                        flex items-center justify-center 
                                        border border-biovet-200 dark:border-biovet-800"
                        >
                          <PawPrint className="w-3 h-3 text-surface-500 dark:text-slate-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-800 dark:text-white truncate">
                          {patient?.name}
                        </p>
                        <p className="text-[10px] text-surface-500 dark:text-slate-400">
                          {formatDateLabel(apt.date)} · {apt.type}
                        </p>
                      </div>
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          apt.status === "Completada"
                            ? "bg-success-500"
                            : apt.status === "Cancelada"
                              ? "bg-danger-500"
                              : "bg-warning-500"
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ MODAL HISTORIAL ═══ */}
      {showHistorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="bg-white dark:bg-dark-100 
                          rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] 
                          overflow-hidden flex flex-col 
                          border border-surface-300 dark:border-slate-700"
          >
            {/* Header modal */}
            <div className="flex items-center justify-between p-4 border-b border-surface-300 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-surface-800 dark:text-white">
                  Historial de Citas
                </h2>
                <p className="text-sm text-surface-500 dark:text-slate-400">
                  {pastAppointments.length} citas anteriores
                </p>
              </div>
              <button
                onClick={() => setShowHistorial(false)}
                className="p-2 rounded-lg 
                           hover:bg-surface-100 dark:hover:bg-dark-200 
                           text-surface-500 dark:text-slate-400 
                           hover:text-surface-800 dark:hover:text-white 
                           transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="space-y-2">
                {pastAppointments.map((apt) => (
                  <AppointmentCard key={apt._id} apt={apt} showDate />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              className="p-4 border-t border-surface-300 dark:border-slate-700 
                            bg-surface-50 dark:bg-dark-200"
            >
              <button
                onClick={() => setShowHistorial(false)}
                className="btn-secondary w-full"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SIN RESULTADOS ═══ */}
      {filteredAppointments.length === 0 && (
        <div
          className="bg-white dark:bg-dark-100 
                        rounded-2xl 
                        border border-surface-300 dark:border-slate-700 
                        p-12 text-center mt-6"
        >
          <Calendar className="w-12 h-12 text-surface-400 dark:text-slate-600 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-bold text-surface-800 dark:text-white mb-2">
            Sin resultados
          </h3>
          <p className="text-surface-500 dark:text-slate-400 mb-6">
            {searchTerm
              ? "No hay citas que coincidan con tu búsqueda"
              : "No hay citas registradas"}
          </p>
          <Link to="/appointments/select-patient" className="btn-primary">
            <Plus className="w-5 h-5" />
            Crear primera cita
          </Link>
        </div>
      )}
    </div>
  );
}