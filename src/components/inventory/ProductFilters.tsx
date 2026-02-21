// src/views/inventory/components/ProductFilters.tsx

import type { CategoryFilter } from "@/utils/productHelpers";
import { Search, X, Filter, RefreshCw, Download, AlertTriangle } from "lucide-react";


interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: CategoryFilter;
  onCategoryChange: (value: CategoryFilter) => void;
  stockFilter: "all" | "ok" | "low" | "out";
  onStockFilterChange: (value: "all" | "ok" | "low" | "out") => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function ProductFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  stockFilter,
  onStockFilterChange,
  hasActiveFilters,
  onClearFilters,
}: ProductFiltersProps) {
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
          placeholder="Buscar por nombre, descripción o categoría..."
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

      <div className="flex items-center gap-2 flex-wrap">
        {/* Category */}
        <div className="flex items-center bg-white dark:bg-dark-200 border border-surface-300 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
          <div className="pl-3 text-surface-400 dark:text-slate-500">
            <Filter size={16} />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value as CategoryFilter)}
            className="pl-2 pr-8 py-2.5 bg-transparent text-sm font-medium text-slate-600 dark:text-slate-300 outline-none appearance-none cursor-pointer"
          >
            <option value="all">Categorías</option>
            <option value="vacuna">Vacunas</option>
            <option value="desparasitante">Desparasitantes</option>
            <option value="medicamento">Medicamentos</option>
            <option value="alimento">Alimentos</option>
            <option value="accesorio">Accesorios</option>
            <option value="otro">Otros</option>
          </select>
        </div>

        {/* Stock */}
        <div className="flex items-center bg-white dark:bg-dark-200 border border-surface-300 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
          <div className="pl-3 text-surface-400 dark:text-slate-500">
            <AlertTriangle size={16} />
          </div>
          <select
            value={stockFilter}
            onChange={(e) =>
              onStockFilterChange(
                e.target.value as "all" | "ok" | "low" | "out"
              )
            }
            className="pl-2 pr-8 py-2.5 bg-transparent text-sm font-medium text-slate-600 dark:text-slate-300 outline-none appearance-none cursor-pointer"
          >
            <option value="all">Todo stock</option>
            <option value="ok">En stock</option>
            <option value="low">Stock bajo</option>
            <option value="out">Agotados</option>
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