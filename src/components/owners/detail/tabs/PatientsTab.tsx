// src/components/owners/detail/tabs/PatientsTab.tsx
import { useNavigate } from "react-router-dom";
import {
  PawPrint,
  Plus,
  ChevronRight,
  Calendar,
  Weight as WeightIcon,
} from "lucide-react";
import type { Patient } from "@/types/patient";
import { calculateAge } from "@/utils/ownerHelpers";

interface PatientsTabProps {
  patients: Patient[];
  isLoading: boolean;
  ownerId: string;
}

export function PatientsTab({
  patients,
  isLoading,
  ownerId,
}: PatientsTabProps) {
  const navigate = useNavigate();

  const handleAddPatient = () => {
    navigate(`/owners/${ownerId}/patients/new`);
  };

  if (isLoading) return <PatientsSkeleton />;

  if (patients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-75 w-full">
        <AddPatientCard onClick={handleAddPatient} isEmpty />
      </div>
    );
  }

  return (
    /* Contenedor padre que centra el Grid */
    <div className="flex justify-center w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl justify-items-center">
        {patients.map((patient) => (
          <PatientCard
            key={patient._id}
            patient={patient}
            onClick={() => navigate(`/patients/${patient._id}`)}
          />
        ))}
        {/* La tarjeta de agregar siempre al final del grid */}
        <AddPatientCard onClick={handleAddPatient} />
      </div>
    </div>
  );
}

// ==================== ADD PATIENT CARD ====================
function AddPatientCard({
  onClick,
  isEmpty = false,
}: {
  onClick: () => void;
  isEmpty?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        ${isEmpty ? "w-full max-w-xs" : "w-full"} 
        min-h-40 h-full
        border-2 border-dashed border-slate-300 dark:border-slate-700
        rounded-2xl bg-slate-50/50 dark:bg-slate-900/30
        hover:border-biovet-400 dark:hover:border-biovet-600
        hover:bg-biovet-50/50 dark:hover:bg-biovet-950/20
        transition-all duration-300
        flex flex-col items-center justify-center gap-3
        group cursor-pointer
        focus:outline-none focus:ring-4 focus:ring-biovet-500/10
      `}
    >
      <div
        className="w-12 h-12 rounded-full 
                      bg-white dark:bg-slate-800 shadow-sm
                      group-hover:bg-biovet-100 dark:group-hover:bg-biovet-900/40
                      flex items-center justify-center transition-all group-hover:scale-110"
      >
        <Plus
          size={24}
          className="text-slate-400 group-hover:text-biovet-500 transition-colors"
        />
      </div>
      <span className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-biovet-600 transition-colors">
        Agregar nueva mascota
      </span>
    </button>
  );
}

// ==================== PATIENT CARD ====================
function PatientCard({
  patient,
  onClick,
}: {
  patient: Patient;
  onClick: () => void;
}) {
  const age = calculateAge(patient.birthDate);

  const speciesConfig: Record<string, { color: string; bgColor: string }> = {
    Canino: {
      color: "text-biovet-600 dark:text-biovet-400",
      bgColor: "bg-biovet-50 dark:bg-biovet-950/40",
    },
    Felino: {
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
    },
    Ave: {
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
    },
    Reptil: {
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    },
  };

  const species = speciesConfig[patient.species] || {
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
  };

  const sexConfig = {
    Macho: {
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      icon: "♂",
    },
    Hembra: {
      color: "text-pink-500",
      bg: "bg-pink-50 dark:bg-pink-950/40",
      icon: "♀",
    },
  };

  const sex =
    sexConfig[patient.sex as keyof typeof sexConfig] || sexConfig["Macho"];

  return (
    <div
      onClick={onClick}
      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 
                 rounded-2xl overflow-hidden transition-all duration-300 
                 hover:shadow-xl hover:shadow-biovet-500/5 hover:-translate-y-1
                 hover:border-biovet-300 dark:hover:border-biovet-700
                 cursor-pointer group"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            {patient.photo ? (
              <img
                src={patient.photo}
                alt={patient.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-sm"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl bg-linear-to-br from-biovet-100 to-biovet-200 
                              dark:from-biovet-900/40 dark:to-biovet-800/40 flex items-center justify-center shadow-inner"
              >
                <PawPrint size={28} className="text-biovet-500" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white dark:border-slate-900 rounded-full" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-biovet-600 transition-colors truncate">
              {patient.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
              {patient.breed || "Sin raza"}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${species.bgColor} ${species.color}`}
              >
                {patient.species}
              </span>
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${sex.bg} ${sex.color}`}
              >
                {sex.icon}
              </span>
            </div>
          </div>

          <ChevronRight
            size={20}
            className="text-slate-300 group-hover:text-biovet-500 group-hover:translate-x-1 transition-all mt-1"
          />
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Calendar size={14} className="text-biovet-400" />
            <span>{age}</span>
          </div>

          {patient.weight && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <WeightIcon size={14} className="text-biovet-400" />
              <span>{patient.weight} kg</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== SKELETON ====================
function PatientsSkeleton() {
  return (
    <div className="flex justify-center w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl justify-items-center animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-full h-45 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"
          />
        ))}
      </div>
    </div>
  );
}
