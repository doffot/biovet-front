// src/views/appointments/SelectPatientForAppointment.tsx

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  PawPrint,
  User,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Dog,
  Cat,
  UserPlus,
} from "lucide-react";
import { getPatients } from "../../api/patientAPI";

export default function SelectPatientForAppointment() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<
    "all" | "Canino" | "Felino"
  >("all");

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      if (speciesFilter !== "all" && patient.species !== speciesFilter)
        return false;

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const ownerName =
          typeof patient.owner === "object"
            ? patient.owner.name.toLowerCase()
            : "";

        if (
          !patient.name.toLowerCase().includes(search) &&
          !ownerName.includes(search) &&
          !(patient.breed || "").toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [patients, searchTerm, speciesFilter]);

  const handleSelectPatient = (patientId: string) => {
    navigate(`/patients/${patientId}/appointments/new`);
  };

  /* ═══ LOADING ═══ */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-biovet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-500 dark:text-slate-400 font-medium">
            Cargando pacientes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 lg:p-6 transition-all duration-500 ${
        mounted
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      }`}
    >
      {/* ═══ HEADER ═══ */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/appointments")}
          className="flex items-center gap-2 
                     text-surface-500 dark:text-slate-400 
                     hover:text-biovet-500 dark:hover:text-biovet-400 
                     transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a citas
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="p-3 
                            bg-linear-to-br from-biovet-500 to-biovet-600 
                            dark:from-biovet-600 dark:to-biovet-700 
                            rounded-xl shadow-lg shadow-biovet-500/20"
            >
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-surface-800 dark:text-white">
                Nueva Cita
              </h1>
              <p className="text-surface-500 dark:text-slate-400">
                Selecciona el paciente para agendar la cita
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CARD NUEVO DUEÑO/PACIENTE ═══ */}
      <div
        className="bg-warning-50 dark:bg-warning-950/30 
                      border border-warning-200 dark:border-warning-800 
                      rounded-xl p-4 mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="p-2 
                            bg-warning-100 dark:bg-warning-900 
                            rounded-lg"
            >
              <UserPlus className="w-5 h-5 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <h3 className="font-semibold text-warning-700 dark:text-warning-300">
                ¿El paciente no está registrado?
              </h3>
              <p className="text-sm text-warning-600/80 dark:text-warning-400/80">
                Primero debes registrar al dueño y luego agregar la mascota
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              to="/owners/create"
              className="btn-secondary"
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Dueño
            </Link>
            <Link
              to="/patients"
              state={{ openCreateModal: true }}
              className="btn-primary"
            >
              <PawPrint className="w-4 h-4" />
              Nueva Mascota
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ SEARCH & FILTERS ═══ */}
      <div
        className="bg-white dark:bg-dark-100 
                      rounded-xl 
                      border border-surface-300 dark:border-slate-700 
                      shadow-sm p-4 mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, dueño o raza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Species Filter */}
          <div
            className="flex items-center gap-1 p-1 
                          bg-surface-100 dark:bg-dark-200 
                          rounded-xl 
                          border border-surface-300 dark:border-slate-700"
          >
            <button
              onClick={() => setSpeciesFilter("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                speciesFilter === "all"
                  ? "bg-biovet-500 text-white shadow-sm"
                  : "text-surface-500 dark:text-slate-400 hover:text-surface-800 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-dark-50"
              }`}
            >
              <PawPrint className="w-4 h-4" />
              <span className="hidden sm:inline">Todos</span>
            </button>
            <button
              onClick={() => setSpeciesFilter("Canino")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                speciesFilter === "Canino"
                  ? "bg-biovet-add text-white shadow-sm"
                  : "text-surface-500 dark:text-slate-400 hover:text-surface-800 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-dark-50"
              }`}
            >
              <Dog className="w-4 h-4" />
              <span className="hidden sm:inline">Caninos</span>
            </button>
            <button
              onClick={() => setSpeciesFilter("Felino")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                speciesFilter === "Felino"
                  ? "bg-biovet-600 text-white shadow-sm"
                  : "text-surface-500 dark:text-slate-400 hover:text-surface-800 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-dark-50"
              }`}
            >
              <Cat className="w-4 h-4" />
              <span className="hidden sm:inline">Felinos</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ PATIENTS GRID ═══ */}
      {filteredPatients.length === 0 ? (
        /* Empty state */
        <div
          className="bg-white dark:bg-dark-100 
                        rounded-2xl 
                        border border-surface-300 dark:border-slate-700 
                        shadow-sm p-12 text-center"
        >
          <div
            className="w-20 h-20 mx-auto mb-4 
                          bg-surface-100 dark:bg-dark-200 
                          rounded-full flex items-center justify-center 
                          border border-surface-300 dark:border-slate-700"
          >
            <PawPrint className="w-10 h-10 text-surface-400 dark:text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-surface-800 dark:text-white mb-2">
            {searchTerm
              ? "No se encontraron pacientes"
              : "No hay pacientes registrados"}
          </h3>
          <p className="text-surface-500 dark:text-slate-400 mb-6">
            {searchTerm
              ? "Intenta con otros términos de búsqueda"
              : "Registra un dueño y su mascota para poder agendar citas"}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/owners/new" className="btn-primary">
              <UserPlus className="w-5 h-5" />
              Registrar Dueño
            </Link>
            {patients.length > 0 && searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="btn-secondary"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPatients.map((patient) => {
            const owner =
              typeof patient.owner === "object" ? patient.owner : null;
            const isCanino =
              patient.species?.toLowerCase() === "canino";

            return (
              <button
                key={patient._id}
                onClick={() => handleSelectPatient(patient._id)}
                className="bg-white dark:bg-dark-100 
                              rounded-xl 
                              border border-surface-300 dark:border-slate-700 
                              shadow-sm p-4 text-left 
                              hover:shadow-md hover:border-biovet-400 dark:hover:border-biovet-600 
                              transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {/* Photo */}
                  <div className="shrink-0">
                    {patient.photo ? (
                      <img
                        src={patient.photo}
                        alt={patient.name}
                        className="w-14 h-14 rounded-xl object-cover 
                                   border-2 border-surface-300 dark:border-slate-700 
                                   shadow-sm"
                      />
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 shadow-sm ${
                          isCanino
                            ? "bg-biovet-50 dark:bg-biovet-950 border-biovet-200 dark:border-biovet-800"
                            : "bg-biovet-50 dark:bg-biovet-950 border-biovet-300 dark:border-biovet-700"
                        }`}
                      >
                        <span className="text-2xl">
                          {isCanino ? "🐕" : "🐱"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-surface-800 dark:text-white truncate 
                                    group-hover:text-biovet-500 dark:group-hover:text-biovet-400 
                                    transition-colors"
                    >
                      {patient.name}
                    </h3>
                    <p className="text-sm text-surface-500 dark:text-slate-400 truncate">
                      {patient.breed || patient.species}
                    </p>
                    {owner && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-surface-500 dark:text-slate-500">
                        <User className="w-3 h-3" />
                        <span className="truncate">{owner.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ArrowRight
                    className="w-5 h-5 
                                  text-surface-400 dark:text-slate-600 
                                  group-hover:text-biovet-500 dark:group-hover:text-biovet-400 
                                  group-hover:translate-x-1 
                                  transition-all shrink-0 mt-1"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ═══ CONTADOR ═══ */}
      {filteredPatients.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-surface-500 dark:text-slate-400">
            Mostrando{" "}
            <span className="text-biovet-500 dark:text-biovet-400 font-medium">
              {filteredPatients.length}
            </span>{" "}
            de{" "}
            <span className="text-surface-800 dark:text-white">
              {patients.length}
            </span>{" "}
            pacientes
          </p>
        </div>
      )}
    </div>
  );
}