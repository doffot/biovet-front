// src/components/labexam/PatientSelectionTab.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { 
  Search, 
  UserPlus, 
  CheckCircle2, 
  PawPrint,
  ChevronRight,
  Loader2,
  User,
  Info
} from "lucide-react";
import { getPatients, getPatientById } from "../../api/patientAPI";
import { useAuth } from "../../hooks/useAuth";
import type { UseFormSetValue } from "react-hook-form";
import type { LabExamFormData } from "@/types/labExam";
import type { Patient } from "@/types/patient";

interface PatientSelectionTabProps {
  onPatientSelected: () => void;
  setValues: UseFormSetValue<LabExamFormData>;
  currentPatientName?: string;
}

const getOwnerName = (owner: Patient["owner"]): string => {
  if (!owner) return "";
  if (typeof owner === "string") return owner;
  if ("name" in owner && owner.name) return owner.name;
  return "";
};

const PatientAvatar = ({ 
  patient, 
  size = "md" 
}: { 
  patient: Patient; 
  size?: "sm" | "md" | "lg" 
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-14 h-14"
  };
  
  const hasPhoto = patient.photo && typeof patient.photo === 'string';
  
  if (hasPhoto) {
    return (
      <img
        src={patient.photo!}
        alt={patient.name}
        className={`${sizeClasses[size]} rounded-lg object-cover shrink-0 border border-surface-300 dark:border-slate-700`}
      />
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} rounded-lg flex items-center justify-center shrink-0 bg-surface-200 dark:bg-dark-100 border border-surface-300 dark:border-slate-700`}>
      <PawPrint className={`${size === "lg" ? "w-7 h-7" : "w-5 h-5"} text-slate-400`} />
    </div>
  );
};

export function PatientSelectionTab({ 
  onPatientSelected, 
  setValues,
  currentPatientName 
}: PatientSelectionTabProps) {
  const { data: authUser } = useAuth();
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

  const { data: preloadedPatient, isLoading: isLoadingPreloaded } = useQuery({
    queryKey: ["patient", routePatientId],
    queryFn: () => getPatientById(routePatientId!),
    enabled: !!routePatientId && !hasAutoLoaded,
    staleTime: 5 * 60 * 1000,
  });

  const { data: allPatients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients,
    enabled: !routePatientId,
    staleTime: 5 * 60 * 1000,
  });

  const calculateAgeFromBirthDate = (birthDateString: string) => {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0) { years--; months += 12; }
    if (years > 0) return `${years} año${years !== 1 ? "s" : ""}`;
    if (months > 0) return `${months} mes${months !== 1 ? "es" : ""}`;
    return "< 1 mes";
  };

  const getVetFullName = (): string => {
    if (!authUser) return "";
    const name = authUser.name || "";
    const lastName = authUser.lastName || "";
    return `${name} ${lastName}`.trim();
  };

  useEffect(() => {
    if (preloadedPatient && !hasAutoLoaded) {
      setValues("patientId", preloadedPatient._id);
      setValues("patientName", preloadedPatient.name || "");
      setValues("species", preloadedPatient.species || "canino");
      setValues("breed", preloadedPatient.breed || "");
      setValues("sex", preloadedPatient.sex || "");
      setValues("weight", preloadedPatient.weight || undefined);
      setValues("age", preloadedPatient.birthDate ? calculateAgeFromBirthDate(preloadedPatient.birthDate) : "");
      setValues("ownerName", getOwnerName(preloadedPatient.owner));
      setValues("treatingVet", getVetFullName());
      setHasAutoLoaded(true);
      setHasSubmitted(true);
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

  const handleUseManual = () => setIsManual(true);

  const handleSaveManual = () => {
    if (!patientName.trim()) return;
    if (!ownerName.trim()) return;
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

  if (routePatientId) {
    if (isLoadingPreloaded) return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-biovet-500 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Cargando datos del paciente...</p>
      </div>
    );
    if (preloadedPatient) return (
      <div className="space-y-5">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-success-500 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-lg font-bold">Paciente Detectado</h3>
        </div>
        <div className="p-4 bg-success-50 dark:bg-success-950/20 border border-success-200 dark:border-success-800 rounded-xl flex items-center gap-4">
          <PatientAvatar patient={preloadedPatient} size="lg" />
          <div className="flex-1">
            <p className="text-lg font-bold text-success-700 dark:text-success-400">{preloadedPatient.name}</p>
            <p className="text-sm text-slate-500">{preloadedPatient.species} {preloadedPatient.breed && `• ${preloadedPatient.breed}`}</p>
          </div>
        </div>
        <div className="flex justify-center pt-2">
          <button type="button" onClick={onPatientSelected} className="btn-primary px-8">
            Continuar <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (isManual) return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-surface-200 dark:border-dark-100 pb-4">
        <div className="w-10 h-10 rounded-lg bg-biovet-500 flex items-center justify-center text-white">
          <UserPlus className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold">Datos del Paciente Referido</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="label">Nombre del Paciente *</label>
          <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="input" placeholder="Nombre de la mascota" />
        </div>
        <div>
          <label className="label">Especie *</label>
          <select value={species} onChange={(e) => setSpecies(e.target.value as any)} className="input">
            <option value="canino">Canino</option>
            <option value="felino">Felino</option>
          </select>
        </div>
        <div>
          <label className="label">Raza</label>
          <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} className="input" placeholder="Ej: Poodle" />
        </div>
        <div>
          <label className="label">Sexo</label>
          <select value={sex} onChange={(e) => setSex(e.target.value)} className="input">
            <option value="">Seleccionar</option>
            <option value="Macho">Macho</option>
            <option value="Hembra">Hembra</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Edad</label>
            <input type="text" value={age} onChange={(e) => setAge(e.target.value)} className="input" placeholder="2 años" />
          </div>
          <div>
            <label className="label">Peso (kg)</label>
            <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))} className="input" placeholder="0.0" />
          </div>
        </div>
      </div>

      <div className="p-4 bg-surface-50 dark:bg-dark-200 border border-surface-200 dark:border-slate-700 rounded-lg space-y-3">
        <label className="label text-biovet-600 dark:text-biovet-400 flex items-center gap-2">
          <User className="w-4 h-4" /> Nombre del Propietario *
        </label>
        <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="input" placeholder="Nombre completo del dueño" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => setIsManual(false)} className="btn-secondary">Volver</button>
        <button type="button" onClick={handleSaveManual} disabled={!patientName || !ownerName} className="btn-primary">
          <CheckCircle2 className="w-4 h-4" /> Registrar y Continuar
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <PawPrint className="w-5 h-5 text-biovet-500" /> Seleccionar Paciente
        </h3>
        <button type="button" onClick={handleUseManual} className="text-biovet-600 dark:text-biovet-400 text-sm font-bold hover:underline flex items-center gap-1">
          <UserPlus className="w-4 h-4" /> Paciente Referido
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          placeholder="Buscar por nombre, raza o dueño..." 
          className="input pl-10 h-12" 
        />
      </div>

      <div className="border border-surface-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-dark-300 shadow-sm">
        <div className="max-h-80 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-biovet-500" /></div>
          ) : filteredPatients.length > 0 ? (
            <div className="divide-y divide-surface-200 dark:divide-slate-800">
              {filteredPatients.map((patient) => {
                const isSelected = selectedPatient?._id === patient._id;
                return (
                  <div 
                    key={patient._id} 
                    onClick={() => setSelectedPatient(patient)} 
                    className={`p-3 cursor-pointer flex items-center gap-4 transition-colors ${
                      isSelected ? "bg-biovet-50 dark:bg-biovet-950/30" : "hover:bg-surface-50 dark:hover:bg-dark-200"
                    }`}
                  >
                    <PatientAvatar patient={patient} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold truncate ${isSelected ? "text-biovet-600 dark:text-biovet-400" : "text-slate-700 dark:text-slate-200"}`}>
                        {patient.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate uppercase tracking-wider font-medium">
                        {patient.breed || "Mestizo"} • {getOwnerName(patient.owner)}
                      </p>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="w-6 h-6 text-biovet-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Info className="w-8 h-8 mx-auto opacity-20" />
              <p>No se encontraron pacientes.</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2">
        <button 
          type="button" 
          disabled={!selectedPatient} 
          onClick={() => selectedPatient && handleSelectExisting(selectedPatient)} 
          className="btn-primary w-full py-4 text-base shadow-lg shadow-biovet-500/10"
        >
          Usar Paciente Seleccionado
        </button>
      </div>
    </div>
  );
}