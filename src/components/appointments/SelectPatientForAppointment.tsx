// src/view/appointments/SelectPatientForAppointment.tsx

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
  const [speciesFilter, setSpeciesFilter] = useState<"all" | "Canino" | "Felino">("all");

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      if (speciesFilter !== "all" && patient.species !== speciesFilter) return false;

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const ownerName = typeof patient.owner === "object"
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
    navigate(`/patients/${patientId}/appointments/create`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-vet-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-vet-muted font-medium">Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 lg:p-6 transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/appointments")}
          className="flex items-center gap-2 text-vet-muted hover:text-vet-accent transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a citas
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl shadow-lg shadow-vet-primary/20">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-vet-text">Nueva Cita</h1>
              <p className="text-vet-muted">Selecciona el paciente para agendar la cita</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card para crear nuevo dueño/paciente - Estilo Oscuro */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <UserPlus className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-300">¿El paciente no está registrado?</h3>
              <p className="text-sm text-amber-400/80">
                Primero debes registrar al dueño y luego agregar la mascota
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              to="/owners/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-soft border border-amber-500/40 text-amber-300 font-medium rounded-lg hover:bg-amber-500/20 hover:border-amber-400 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Dueño
            </Link>
            <Link
              to="/patients"
              state={{ openCreateModal: true }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              <PawPrint className="w-4 h-4" />
              Nueva Mascota
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Filters - Estilo Oscuro */}
      <div className="bg-sky-soft rounded-xl border border-slate-700/50 shadow-lg shadow-black/20 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-vet-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre, dueño o raza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-vet-light border border-slate-600 text-vet-text placeholder:text-vet-muted focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/30 transition-all"
            />
          </div>

          {/* Species Filter */}
          <div className="flex items-center gap-2 p-1 bg-vet-light rounded-xl border border-slate-700">
            <button
              onClick={() => setSpeciesFilter("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                speciesFilter === "all"
                  ? "bg-vet-primary text-white shadow-lg shadow-vet-primary/30"
                  : "text-vet-muted hover:text-vet-text hover:bg-slate-700"
              }`}
            >
              <PawPrint className="w-4 h-4" />
              <span className="hidden sm:inline">Todos</span>
            </button>
            <button
              onClick={() => setSpeciesFilter("Canino")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                speciesFilter === "Canino"
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                  : "text-vet-muted hover:text-vet-text hover:bg-slate-700"
              }`}
            >
              <Dog className="w-4 h-4" />
              <span className="hidden sm:inline">Caninos</span>
            </button>
            <button
              onClick={() => setSpeciesFilter("Felino")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                speciesFilter === "Felino"
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                  : "text-vet-muted hover:text-vet-text hover:bg-slate-700"
              }`}
            >
              <Cat className="w-4 h-4" />
              <span className="hidden sm:inline">Felinos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      {filteredPatients.length === 0 ? (
        <div className="bg-sky-soft rounded-2xl border border-slate-700/50 shadow-lg shadow-black/20 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-vet-light rounded-full flex items-center justify-center border border-slate-700">
            <PawPrint className="w-10 h-10 text-vet-muted" />
          </div>
          <h3 className="text-xl font-bold text-vet-text mb-2">
            {searchTerm ? "No se encontraron pacientes" : "No hay pacientes registrados"}
          </h3>
          <p className="text-vet-muted mb-6">
            {searchTerm
              ? "Intenta con otros términos de búsqueda"
              : "Registra un dueño y su mascota para poder agendar citas"}
          </p>
          
          {/* Botones de acción cuando no hay resultados */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/owners/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-vet-primary to-vet-secondary hover:from-vet-secondary hover:to-vet-primary text-white font-semibold rounded-xl transition-all shadow-lg shadow-vet-primary/30"
            >
              <UserPlus className="w-5 h-5" />
              Registrar Dueño
            </Link>
            {patients.length > 0 && searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-600 text-vet-muted font-medium rounded-xl hover:bg-slate-700 hover:text-vet-text transition-colors"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPatients.map((patient) => {
            const owner = typeof patient.owner === "object" ? patient.owner : null;
            const isCanino = patient.species?.toLowerCase() === "canino";

            return (
              <button
                key={patient._id}
                onClick={() => handleSelectPatient(patient._id)}
                className="bg-sky-soft rounded-xl border border-slate-700/50 shadow-lg shadow-black/10 p-4 text-left hover:shadow-xl hover:shadow-vet-primary/10 hover:border-vet-primary/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    {patient.photo ? (
                      <img
                        src={patient.photo}
                        alt={patient.name}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-slate-600 shadow-lg"
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 shadow-lg ${
                        isCanino 
                          ? "bg-blue-500/20 border-blue-500/30" 
                          : "bg-purple-500/20 border-purple-500/30"
                      }`}>
                        <span className="text-2xl">{isCanino ? "🐕" : "🐱"}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-vet-text truncate group-hover:text-vet-accent transition-colors">
                      {patient.name}
                    </h3>
                    <p className="text-sm text-vet-muted truncate">
                      {patient.breed || patient.species}
                    </p>
                    {owner && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                        <User className="w-3 h-3" />
                        <span className="truncate">{owner.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-vet-accent group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Contador de resultados */}
      {filteredPatients.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-vet-muted">
            Mostrando <span className="text-vet-accent font-medium">{filteredPatients.length}</span> de <span className="text-vet-text">{patients.length}</span> pacientes
          </p>
        </div>
      )}
    </div>
  );
}