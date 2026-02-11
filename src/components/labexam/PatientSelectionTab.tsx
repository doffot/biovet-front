// src/components/labexam/PatientSelectionTab.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { 
  Search, 
  UserPlus, 
  CheckCircle2, 
  PawPrint,
  User,
  ChevronRight,
  Loader2
} from "lucide-react";
import { getPatients, getPatientById } from "../../api/patientAPI";
import { useAuth } from "../../hooks/useAuth";
import type { Patient } from "../../types";
import type { LabExamFormData } from "../../types";
import type { UseFormSetValue } from "react-hook-form";

interface PatientSelectionTabProps {
  onPatientSelected: () => void;
  setValues: UseFormSetValue<LabExamFormData>;
  currentPatientName?: string;
}

// Helper para extraer el nombre del dueño
const getOwnerName = (owner: Patient["owner"]): string => {
  if (!owner) return "";
  if (typeof owner === "string") return owner;
  if ("name" in owner && owner.name) return owner.name;
  return "";
};

// Componente para avatar del paciente
const PatientAvatar = ({ 
  patient, 
  size = "md" 
}: { 
  patient: Patient; 
  size?: "sm" | "md" | "lg" 
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };
  
  const hasPhoto = patient.photo && typeof patient.photo === 'string';
  
  if (hasPhoto) {
    return (
      <img
        src={patient.photo!}
        alt={patient.name}
        className={`${sizeClasses[size]} rounded-lg object-cover flex-shrink-0 border border-slate-700`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = '';
          target.className = 'hidden';
        }}
      />
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} rounded-lg flex items-center justify-center flex-shrink-0 ${
      patient.species === 'felino' ? 'bg-purple-900/30' : 'bg-blue-900/30'
    }`}>
      <span className={size === "lg" ? "text-xl" : "text-lg"}>
        {patient.species === 'felino' ? '🐱' : '🐕'}
      </span>
    </div>
  );
};

export function PatientSelectionTab({ 
  onPatientSelected, 
  setValues,
  currentPatientName 
}: PatientSelectionTabProps) {
  const { data: authUser } = useAuth();
  
  // 🎯 Detectar si viene desde el layout de mascota
  const { patientId: routePatientId } = useParams<{ patientId: string }>();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isManual, setIsManual] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);

  const [patientName, setPatientName] = useState("");
  const [species, setSpecies] = useState<"canino" | "felino">("canino");
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState<number | "">("");
  const [ownerName, setOwnerName] = useState("");

  // 🎯 Query para cargar el paciente específico si viene desde el layout
  const { data: preloadedPatient, isLoading: isLoadingPreloaded } = useQuery({
    queryKey: ["patient", routePatientId],
    queryFn: () => getPatientById(routePatientId!),
    enabled: !!routePatientId && !hasAutoLoaded,
    staleTime: 5 * 60 * 1000,
  });

  // Query para la lista de pacientes (solo si NO hay routePatientId)
  const { data: allPatients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients,
    enabled: !routePatientId, // Solo cargar si NO viene desde mascota
    staleTime: 5 * 60 * 1000,
  });

  // Helper para calcular edad
  const calculateAgeFromBirthDate = (birthDateString: string) => {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years > 0) return `${years} año${years !== 1 ? "s" : ""}`;
    if (months > 0) return `${months} mes${months !== 1 ? "es" : ""}`;
    return "< 1 mes";
  };

  // Helper para obtener nombre del veterinario
  const getVetFullName = (): string => {
    if (!authUser) return "";
    const name = authUser.name || "";
    const lastName = authUser.lastName || "";
    return `${name} ${lastName}`.trim();
  };

  // 🎯 Auto-cargar paciente si viene desde el layout de mascota
  useEffect(() => {
    if (preloadedPatient && !hasAutoLoaded) {
      setValues("patientId", preloadedPatient._id);
      setValues("patientName", preloadedPatient.name || "");
      setValues("species", preloadedPatient.species || "canino");
      setValues("breed", preloadedPatient.breed || "");
      setValues("sex", preloadedPatient.sex || "");
      setValues("weight", preloadedPatient.weight || undefined);
      setValues("age", preloadedPatient.birthDate 
        ? calculateAgeFromBirthDate(preloadedPatient.birthDate) 
        : ""
      );
      setValues("ownerName", getOwnerName(preloadedPatient.owner));
      setValues("treatingVet", getVetFullName());
      
      setHasAutoLoaded(true);
      setHasSubmitted(true);
      
      // Avanzar automáticamente al siguiente tab
      onPatientSelected();
    }
  }, [preloadedPatient, hasAutoLoaded, setValues, onPatientSelected]);

  useEffect(() => {
    if (currentPatientName && !hasSubmitted && !routePatientId) {
      setIsManual(true);
      setPatientName(currentPatientName);
    }
  }, [currentPatientName, hasSubmitted, routePatientId]);

  const filteredPatients = allPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getOwnerName(patient.owner).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectExisting = (patient: Patient) => {
    setValues("patientId", patient._id); 
    setValues("patientName", patient.name || "");
    setValues("species", patient.species || "canino");
    setValues("breed", patient.breed || "");
    setValues("sex", patient.sex || "");
    setValues("weight", patient.weight || undefined);
    setValues("age", patient.birthDate ? calculateAgeFromBirthDate(patient.birthDate) : "");
    setValues("ownerName", getOwnerName(patient.owner));
    setValues("treatingVet", getVetFullName());
    setHasSubmitted(true);
    onPatientSelected();
  };

  const handleUseManual = () => {
    setIsManual(true);
  };

  const handleSaveManual = () => {
    if (!patientName.trim()) {
      alert("El nombre del paciente es obligatorio");
      return;
    }
    
    if (!ownerName.trim()) {
      alert("El nombre del dueño es obligatorio");
      return;
    }

    setValues("patientName", patientName);
    setValues("species", species);
    setValues("breed", breed);
    setValues("sex", sex);
    setValues("age", age);
    setValues("weight", weight === "" ? undefined : Number(weight));
    setValues("patientId", undefined);
    setValues("ownerName", ownerName);
    setValues("treatingVet", "");
    setHasSubmitted(true);
    onPatientSelected();
  };

  // 🎯 CASO 1: Viene desde layout de mascota - Mostrar loading o confirmación
  if (routePatientId) {
    if (isLoadingPreloaded) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-vet-primary animate-spin mb-3" />
          <p className="text-sm text-vet-muted">Cargando datos del paciente...</p>
        </div>
      );
    }

    if (preloadedPatient) {
      return (
        <div className="space-y-5">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-vet-text">
              Paciente Detectado
            </h3>
            <p className="text-sm text-vet-muted">
              El examen se creará para este paciente
            </p>
          </div>

          {/* Card del paciente pre-cargado */}
          <div className="p-4 bg-emerald-900/20 border-2 border-emerald-700/50 rounded-xl">
            <div className="flex items-center gap-4">
              <PatientAvatar patient={preloadedPatient} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-emerald-400">
                  {preloadedPatient.name}
                </p>
                <p className="text-sm text-emerald-300">
                  {preloadedPatient.species === 'canino' ? '🐕' : '🐱'} {preloadedPatient.species} 
                  {preloadedPatient.breed && ` • ${preloadedPatient.breed}`}
                </p>
                {getOwnerName(preloadedPatient.owner) && (
                  <p className="text-xs text-emerald-400 mt-1">
                    <User className="w-3 h-3 inline mr-1" />
                    Dueño: {getOwnerName(preloadedPatient.owner)}
                  </p>
                )}
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            </div>
          </div>

          {/* Botón para continuar */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={onPatientSelected}
              className="px-6 py-3 bg-vet-primary text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-vet-secondary transition-all shadow-lg shadow-vet-primary/25"
            >
              Continuar con el examen
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }
  }

  // 🎯 CASO 2: Formulario manual para paciente referido
  if (isManual) {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-vet-primary to-vet-secondary flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-vet-text">
            Paciente Referido
          </h3>
          <p className="text-sm text-vet-muted">
            Ingrese los datos del paciente
          </p>
        </div>

        {/* Datos del Paciente */}
        <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
          <h4 className="text-xs font-bold text-vet-text uppercase tracking-wide mb-3 flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-vet-primary" />
            Datos del Paciente
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-vet-text font-semibold text-xs mb-1">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20 text-vet-text"
                placeholder="Ej: Max"
              />
            </div>

            <div>
              <label className="block text-vet-text font-semibold text-xs mb-1">
                Especie <span className="text-red-400">*</span>
              </label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as "canino" | "felino")}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-vet-primary text-vet-text"
              >
                <option value="canino"> Canino</option>
                <option value="felino"> Felino</option>
              </select>
            </div>

            <div>
              <label className="block text-vet-text font-semibold text-xs mb-1">Raza</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-vet-primary text-vet-text"
                placeholder="Ej: Labrador"
              />
            </div>

            <div>
              <label className="block text-vet-text font-semibold text-xs mb-1">Sexo</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-vet-primary text-vet-text"
              >
                <option value="">Seleccionar</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>

            <div>
              <label className="block text-vet-text font-semibold text-xs mb-1">Edad</label>
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-vet-primary text-vet-text"
                placeholder="Ej: 2 años"
              />
            </div>

            <div>
              <label className="block text-vet-text font-semibold text-xs mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-vet-primary text-vet-text"
                placeholder="12.5"
              />
            </div>
          </div>
        </div>

        {/* Datos del Dueño */}
        <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-700/30">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            Datos del Dueño <span className="text-red-400">*</span>
          </h4>
          <div>
            <label className="block text-amber-400 font-semibold text-xs mb-1">
              Nombre del Dueño
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full bg-slate-800 border border-amber-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-700/30 text-vet-text"
              placeholder="Nombre completo"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsManual(false)}
            className="px-4 py-2.5 text-sm text-vet-text bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={handleSaveManual}
            disabled={!patientName || !ownerName}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
              patientName && ownerName
                ? "bg-vet-primary text-white hover:bg-vet-secondary shadow-lg shadow-vet-primary/25"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // 🎯 CASO 3: Selección de paciente desde dashboard
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-vet-primary to-vet-secondary flex items-center justify-center">
          <PawPrint className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-vet-text">
          Seleccionar Paciente
        </h3>
        <p className="text-sm text-vet-muted">
          Busca un paciente existente o registra uno nuevo
        </p>
      </div>

      {/* Botones de opción */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleUseManual}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-vet-primary/30 bg-vet-primary/10 text-vet-primary font-medium hover:border-vet-primary hover:bg-vet-primary/20 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          <span>Paciente Referido</span>
        </button>
        <button
          type="button"
          disabled={!selectedPatient}
          onClick={() => selectedPatient && handleSelectExisting(selectedPatient)}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
            selectedPatient
              ? "bg-vet-primary text-white shadow-lg shadow-vet-primary/25 hover:bg-vet-secondary"
              : "bg-slate-700 text-slate-500 cursor-not-allowed"
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Usar Seleccionado</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre, raza o dueño..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20 bg-slate-800 text-vet-text"
          autoFocus
        />
      </div>

      {/* Lista de pacientes */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-vet-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-sm text-vet-muted">Cargando pacientes...</span>
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-700 divide-y divide-slate-700">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => {
              const ownerDisplayName = getOwnerName(patient.owner);
              const isSelected = selectedPatient?._id === patient._id;
              
              return (
                <div
                  key={patient._id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`p-3 cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? "bg-vet-primary/20 border-l-4 border-l-vet-primary"
                      : "hover:bg-slate-700/50 border-l-4 border-l-transparent"
                  }`}
                >
                  <PatientAvatar patient={patient} size="md" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-vet-text truncate">{patient.name}</p>
                    <p className="text-xs text-vet-muted truncate">
                      {patient.breed || "Sin raza"} 
                      {ownerDisplayName && ` • ${ownerDisplayName}`}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-vet-primary flex-shrink-0" />
                  )}
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${
                    isSelected ? 'text-vet-primary' : 'text-slate-400'
                  }`} />
                </div>
              );
            })
          ) : searchQuery ? (
            <div className="p-6 text-center">
              <p className="text-sm text-vet-muted">No se encontraron pacientes</p>
              <button
                type="button"
                onClick={handleUseManual}
                className="mt-2 text-sm text-vet-primary font-medium hover:underline"
              >
                Registrar como paciente referido
              </button>
            </div>
          ) : (
            <div className="p-6 text-center text-vet-muted">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-500" />
              <p className="text-sm">Escriba para buscar pacientes...</p>
            </div>
          )}
        </div>
      )}

      {/* Paciente seleccionado preview */}
      {selectedPatient && (
        <div className="p-3 bg-emerald-900/20 border border-emerald-700/50 rounded-xl flex items-center gap-3">
          <PatientAvatar patient={selectedPatient} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-400">
              Paciente seleccionado: {selectedPatient.name}
            </p>
            <p className="text-xs text-emerald-300 truncate">
              {selectedPatient.species} • {selectedPatient.breed || "Sin raza"} 
              {getOwnerName(selectedPatient.owner) && ` • Dueño: ${getOwnerName(selectedPatient.owner)}`}
            </p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
        </div>
      )}
    </div>
  );
}