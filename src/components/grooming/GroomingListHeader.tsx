// src/components/grooming/GroomingListHeader.tsx

import { ArrowLeft, Scissors, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface GroomingListHeaderProps {
  totalCount: string;
  onBack: () => void;
}

export function GroomingListHeader({ totalCount, onBack }: GroomingListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Título */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-surface-50 dark:hover:bg-dark-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-linear-to-br from-biovet-500 to-biovet-600 rounded-xl flex items-center justify-center shadow-lg shadow-biovet-500/20">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-heading">
              Peluquería
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {totalCount}
            </p>
          </div>
        </div>
      </div>

      {/* Botón agregar */}
      <Link to="/patients" className="btn-primary shrink-0">
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Nuevo Servicio</span>
        <span className="sm:hidden">Nuevo</span>
      </Link>
    </div>
  );
}