// src/views/inventory/components/MovementsFilters.tsx

import { RefreshCw, Calendar } from "lucide-react";
import type { MovementType, MovementReason } from "@/types/inventory";
import {
  MOVEMENT_TYPE_OPTIONS,
  MOVEMENT_REASON_OPTIONS,
} from "@/utils/movementHelpers";

interface MovementsFiltersProps {
  typeFilter: MovementType | "all";
  onTypeChange: (value: MovementType | "all") => void;
  reasonFilter: MovementReason | "all";
  onReasonChange: (value: MovementReason | "all") => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function MovementsFilters({
  typeFilter,
  onTypeChange,
  reasonFilter,
  onReasonChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  hasActiveFilters,
  onClearFilters,
}: MovementsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Tipo */}
      <select
        value={typeFilter}
        onChange={(e) => onTypeChange(e.target.value as MovementType | "all")}
        className="input sm:w-44"
      >
        {MOVEMENT_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Razón */}
      <select
        value={reasonFilter}
        onChange={(e) => onReasonChange(e.target.value as MovementReason | "all")}
        className="input sm:w-48"
      >
        {MOVEMENT_REASON_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Fecha Desde */}
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-slate-500 pointer-events-none" />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          placeholder="Desde"
          className="input pl-9 sm:w-40"
        />
      </div>

      {/* Fecha Hasta */}
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-slate-500 pointer-events-none" />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          placeholder="Hasta"
          className="input pl-9 sm:w-40"
        />
      </div>

      {/* Limpiar filtros */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-950 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Limpiar
        </button>
      )}
    </div>
  );
}