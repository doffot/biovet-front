// src/components/grooming/GroomingFilters.tsx

import { Search, RefreshCw } from "lucide-react";

interface GroomingFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function GroomingFilters({
  searchTerm,
  onSearchChange,
  hasActiveFilters,
  onClearFilters,
}: GroomingFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Búsqueda */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por paciente, servicio..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input pl-10 text-sm"
        />
      </div>

      {/* Limpiar filtros */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-biovet-600 dark:text-biovet-400 hover:bg-biovet-50 dark:hover:bg-biovet-950 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Limpiar
        </button>
      )}
    </div>
  );
}