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
  Loader2
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
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };
  
  const hasPhoto = patient.photo && typeof patient.photo === 'string';
  
  if (hasPhoto) {
    return (
      <img
        src={patient.photo!}
        alt={patient.name}
        className={`${sizeClasses[size]} rounded-lg object-cover shrink-0 border border-slate-700`}
      />
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} rounded-lg flex items-center justify-center shrink-0 bg-slate-700`}>
      <PawPrint className={`${size === "lg" ? "w-6 h-6" : "w-5 h-5"} text-slate-400`} />
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
          <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-green-600 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-lg font-bold">Paciente Detectado</h3>
        </div>
        <div className="p-4 bg-green-900/10 border border-green-600/30 rounded-xl flex items-center gap-4">
          <PatientAvatar patient={preloadedPatient} size="lg" />
          <div className="flex-1">
            <p className="text-lg font-bold text-green-500">{preloadedPatient.name}</p>
            <p className="text-sm text-slate-400">{preloadedPatient.species} {preloadedPatient.breed && `• ${preloadedPatient.breed}`}</p>
          </div>
        </div>
        <div className="flex justify-center pt-2">
          <button type="button" onClick={onPatientSelected} className="btn-primary flex items-center gap-2 px-8">
            Continuar <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (isManual) return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-biovet-500 flex items-center justify-center text-white">
          <UserPlus className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold">Paciente Referido</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Nombre *</label>
          <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="input" placeholder="Ej: Max" />
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
          <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} className="input" placeholder="Ej: Labrador" />
        </div>
        <div>
          <label className="label">Sexo</label>
          <select value={sex} onChange={(e) => setSex(e.target.value)} className="input">
            <option value="">Seleccionar</option>
            <option value="Macho">Macho</option>
            <option value="Hembra">Hembra</option>
          </select>
        </div>
        <div>
          <label className="label">Edad</label>
          <input type="text" value={age} onChange={(e) => setAge(e.target.value)} className="input" placeholder="Ej: 2 años" />
        </div>
        <div>
          <label className="label">Peso (kg)</label>
          <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))} className="input" placeholder="12.5" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="label text-biovet-500">Nombre del Dueño *</label>
        <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="input" placeholder="Nombre completo" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => setIsManual(false)} className="btn-secondary">Volver</button>
        <button type="button" onClick={handleSaveManual} disabled={!patientName || !ownerName} className="btn-primary flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Continuar
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-biovet-500 flex items-center justify-center text-white">
          <PawPrint className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold">Seleccionar Paciente</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={handleUseManual} className="btn-secondary flex items-center justify-center gap-2 py-3 border-dashed border-2">
          <UserPlus className="w-5 h-5" /> <span>Paciente Referido</span>
        </button>
        <button type="button" disabled={!selectedPatient} onClick={() => selectedPatient && handleSelectExisting(selectedPatient)} className="btn-primary flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> <span>Usar Seleccionado</span>
        </button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar..." className="input pl-10" />
      </div>
      <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-700 divide-y divide-slate-700">
        {isLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-biovet-500" /></div>
        ) : filteredPatients.map((patient) => (
          <div key={patient._id} onClick={() => setSelectedPatient(patient)} className={`p-3 cursor-pointer flex items-center gap-3 transition-colors ${selectedPatient?._id === patient._id ? "bg-biovet-500/10 border-l-4 border-biovet-500" : "hover:bg-slate-800"}`}>
            <PatientAvatar patient={patient} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{patient.name}</p>
              <p className="text-xs text-slate-400 truncate">{patient.breed || "Sin raza"} • {getOwnerName(patient.owner)}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        ))}
      </div>
    </div>
  );
}