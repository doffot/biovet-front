// src/components/owners/detail/tabs/PatientsTab.tsx
import { useNavigate } from "react-router-dom";
import {
  PawPrint,
  Calendar,
  Weight as WeightIcon,
  ChevronRight,
  Eye,
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
}: PatientsTabProps) {
  const navigate = useNavigate();

  if (isLoading) return <PatientsSkeleton />;

  if (patients.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-slate-800 shadow-sm p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-biovet-50 dark:bg-biovet-950/30 flex items-center justify-center mx-auto mb-4">
          <PawPrint className="w-7 h-7 text-biovet-400" />
        </div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
          Sin mascotas registradas
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Usa el botón "Agregar" para registrar la primera mascota
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* ---- TABLA DESKTOP ---- */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 dark:border-slate-800 bg-surface-50/50 dark:bg-dark-100/50">
              <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide px-5 py-3">
                Mascota
              </th>
              <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide px-4 py-3">
                Especie / Raza
              </th>
              <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide px-4 py-3">
                Sexo
              </th>
              <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide px-4 py-3">
                Edad
              </th>
              <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide px-4 py-3">
                Peso
              </th>
              <th className="text-right text-[11px] font-bold text-slate-400 uppercase tracking-wide px-5 py-3">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-slate-800">
            {patients.map((patient) => (
              <PatientRow
                key={patient._id}
                patient={patient}
                onClick={() => navigate(`/patients/${patient._id}`)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- LISTA MOBILE ---- */}
      <div className="sm:hidden divide-y divide-surface-100 dark:divide-slate-800">
        {patients.map((patient) => (
          <PatientMobileRow
            key={patient._id}
            patient={patient}
            onClick={() => navigate(`/patients/${patient._id}`)}
          />
        ))}
      </div>
    </div>
  );
}

// ==================== CONFIGS ====================

const speciesConfig: Record<string, { color: string; bg: string }> = {
  Canino: { color: "text-biovet-600 dark:text-biovet-400", bg: "bg-biovet-50 dark:bg-biovet-950/40" },
  Felino: { color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40" },
  Ave: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
  Reptil: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  Roedor: { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40" },
};

const defaultSpecies = { color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800" };

const sexConfig = {
  Macho: { icon: "♂", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
  Hembra: { icon: "♀", color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/40" },
};

// ==================== TABLE ROW (DESKTOP) ====================

function PatientRow({ patient, onClick }: { patient: Patient; onClick: () => void }) {
  const age = calculateAge(patient.birthDate);
  const species = speciesConfig[patient.species] || defaultSpecies;
  const sex = sexConfig[patient.sex as keyof typeof sexConfig] || sexConfig.Macho;

  return (
    <tr
      onClick={onClick}
      className="hover:bg-surface-50 dark:hover:bg-dark-100/50 cursor-pointer transition-colors group"
    >
      {/* Mascota */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          {patient.photo ? (
            <img
              src={patient.photo}
              alt={patient.name}
              className="w-10 h-10 rounded-xl object-cover border border-surface-200 dark:border-slate-700 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-biovet-100 to-biovet-200 dark:from-biovet-900/40 dark:to-biovet-800/40 flex items-center justify-center">
              <PawPrint size={18} className="text-biovet-500" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-white truncate group-hover:text-biovet-600 dark:group-hover:text-biovet-400 transition-colors">
              {patient.name}
            </p>
            {patient.color && (
              <p className="text-[11px] text-slate-400 truncate">{patient.color}</p>
            )}
          </div>
        </div>
      </td>

      {/* Especie / Raza */}
      <td className="px-4 py-3.5">
        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${species.bg} ${species.color}`}>
          {patient.species}
        </span>
        {patient.breed && (
          <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-32">{patient.breed}</p>
        )}
      </td>

      {/* Sexo */}
      <td className="px-4 py-3.5">
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold ${sex.bg} ${sex.color}`}>
          {sex.icon}
        </span>
      </td>

      {/* Edad */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Calendar size={13} className="text-slate-400 shrink-0" />
          <span className="font-medium">{age}</span>
        </div>
      </td>

      {/* Peso */}
      <td className="px-4 py-3.5">
        {patient.weight ? (
          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <WeightIcon size={13} className="text-slate-400 shrink-0" />
            <span className="font-medium">{patient.weight} kg</span>
          </div>
        ) : (
          <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
        )}
      </td>

      {/* Acción */}
      <td className="px-5 py-3.5 text-right">
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-biovet-600 dark:text-biovet-400 bg-biovet-50 dark:bg-biovet-950/30 rounded-lg hover:bg-biovet-100 dark:hover:bg-biovet-900/40 transition-colors opacity-0 group-hover:opacity-100">
          <Eye size={13} />
          Ver
        </button>
        <ChevronRight size={16} className="inline-block text-slate-300 dark:text-slate-600 group-hover:text-biovet-500 transition-colors ml-2" />
      </td>
    </tr>
  );
}

// ==================== MOBILE ROW ====================

function PatientMobileRow({ patient, onClick }: { patient: Patient; onClick: () => void }) {
  const age = calculateAge(patient.birthDate);
  const species = speciesConfig[patient.species] || defaultSpecies;
  const sex = sexConfig[patient.sex as keyof typeof sexConfig] || sexConfig.Macho;

  return (
    <div
      onClick={onClick}
      className="px-4 py-3.5 flex items-center gap-3 hover:bg-surface-50 dark:hover:bg-dark-100/50 cursor-pointer transition-colors active:bg-surface-100 dark:active:bg-dark-100"
    >
      {/* Avatar */}
      {patient.photo ? (
        <img
          src={patient.photo}
          alt={patient.name}
          className="w-11 h-11 rounded-xl object-cover border border-surface-200 dark:border-slate-700 shadow-sm shrink-0"
        />
      ) : (
        <div className="w-11 h-11 rounded-xl bg-linear-to-br from-biovet-100 to-biovet-200 dark:from-biovet-900/40 dark:to-biovet-800/40 flex items-center justify-center shrink-0">
          <PawPrint size={20} className="text-biovet-500" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
            {patient.name}
          </p>
          <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${sex.bg} ${sex.color}`}>
            {sex.icon}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${species.bg} ${species.color}`}>
            {patient.species}
          </span>
          {patient.breed && (
            <span className="text-[11px] text-slate-400 truncate">{patient.breed}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar size={10} /> {age}
          </span>
          {patient.weight && (
            <span className="flex items-center gap-1">
              <WeightIcon size={10} /> {patient.weight} kg
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 shrink-0" />
    </div>
  );
}

// ==================== SKELETON ====================

function PatientsSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Desktop skeleton */}
      <div className="hidden sm:block">
        <div className="border-b border-surface-200 dark:border-slate-800 bg-surface-50/50 dark:bg-dark-100/50 px-5 py-3">
          <div className="grid grid-cols-6 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-3 bg-surface-200 dark:bg-slate-700 rounded" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-surface-100 dark:divide-slate-800 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-4">
              <div className="w-10 h-10 bg-surface-200 dark:bg-slate-700 rounded-xl shrink-0" />
              <div className="flex-1 grid grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <div className="h-4 w-20 bg-surface-200 dark:bg-slate-700 rounded" />
                  <div className="h-2.5 w-14 bg-surface-100 dark:bg-slate-800 rounded" />
                </div>
                <div className="h-5 w-16 bg-surface-100 dark:bg-slate-800 rounded-md" />
                <div className="h-7 w-7 bg-surface-100 dark:bg-slate-800 rounded-lg" />
                <div className="h-4 w-14 bg-surface-100 dark:bg-slate-800 rounded" />
                <div className="h-4 w-12 bg-surface-100 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile skeleton */}
      <div className="sm:hidden divide-y divide-surface-100 dark:divide-slate-800 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="px-4 py-3.5 flex items-center gap-3">
            <div className="w-11 h-11 bg-surface-200 dark:bg-slate-700 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-surface-200 dark:bg-slate-700 rounded" />
              <div className="flex gap-2">
                <div className="h-4 w-14 bg-surface-100 dark:bg-slate-800 rounded" />
                <div className="h-4 w-20 bg-surface-100 dark:bg-slate-800 rounded" />
              </div>
              <div className="flex gap-3">
                <div className="h-3 w-12 bg-surface-100 dark:bg-slate-800 rounded" />
                <div className="h-3 w-10 bg-surface-100 dark:bg-slate-800 rounded" />
              </div>
            </div>
            <div className="w-5 h-5 bg-surface-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}