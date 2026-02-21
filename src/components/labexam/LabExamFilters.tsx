// src/views/labExams/components/LabExamFilters.tsx

import { Search, X, Filter, RefreshCw, Download } from "lucide-react";

interface LabExamFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  speciesFilter: string;
  onSpeciesChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function LabExamFilters({
  searchTerm,
  onSearchChange,
  speciesFilter,
  onSpeciesChange,
  hasActiveFilters,
  onClearFilters,
}: LabExamFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 sm:gap-3 pb-4 sm:pb-5">
      {/* Search */}
      <div className="relative flex-1">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 dark:text-slate-500"
          size={18}
        />
        <input
          type="text"
          placeholder="Buscar por nombre o raza..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-10 py-2.5 bg-white dark:bg-dark-200 border border-surface-300 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder:text-surface-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-biovet-500 outline-none transition-all shadow-sm"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-surface-200 dark:hover:bg-dark-50 rounded cursor-pointer"
          >
            <X className="w-4 h-4 text-surface-400 dark:text-slate-500" />
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Species */}
        <div className="flex items-center bg-white dark:bg-dark-200 border border-surface-300 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
          <div className="pl-3 text-surface-400 dark:text-slate-500">
            <Filter size={16} />
          </div>
          <select
            value={speciesFilter}
            onChange={(e) => onSpeciesChange(e.target.value)}
            className="pl-2 pr-8 py-2.5 bg-transparent text-sm font-medium text-slate-600 dark:text-slate-300 outline-none appearance-none cursor-pointer"
          >
            <option value="all">Todas especies</option>
            <option value="canino">Caninos</option>
            <option value="felino">Felinos</option>
          </select>
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white dark:bg-dark-200 border border-surface-300 dark:border-slate-700 rounded-lg text-sm font-medium text-surface-500 dark:text-slate-400 hover:text-danger-500 hover:border-danger-300 dark:hover:border-danger-700 transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        )}

        {/* Export */}
        <button className="flex items-center gap-1.5 px-3 py-2.5 bg-white dark:bg-dark-200 border border-surface-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-surface-50 dark:hover:bg-dark-50 transition-all shadow-sm cursor-pointer">
          <Download size={16} className="text-biovet-500" />
          <span className="hidden sm:inline">Exportar</span>
        </button>
      </div>
    </div>
  );
}