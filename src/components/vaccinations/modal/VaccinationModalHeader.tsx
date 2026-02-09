import { X, PawPrint } from "lucide-react";
import type { Patient } from "@/types/patient";

interface Props {
  patient: Patient;
  isEditing: boolean;
  onClose: () => void;
  isPending: boolean;
}

export function VaccinationModalHeader({ patient, isEditing, onClose, isPending }: Props) {
  return (
    <div className="bg-linear-to-r from-biovet-500 to-biovet-600 px-4 sm:px-6 py-4 shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="relative shrink-0">
            {patient.photo ? (
              <img
                src={patient.photo}
                alt={patient.name}
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border-2 sm:border-3 border-white/30 shadow-lg"
              />
            ) : (
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/20 border-2 sm:border-3 border-white/30 flex items-center justify-center shadow-lg">
                <PawPrint className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white font-heading truncate">
              {isEditing ? "Editar Vacuna" : "Nueva Vacuna"}
            </h2>
            <p className="text-biovet-100 text-xs sm:text-sm truncate">
              {patient.name} • {patient.species}
              {patient.breed && ` • ${patient.breed}`}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={isPending}
          className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}