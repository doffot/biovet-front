import { Search, Filter, X, Download } from 'lucide-react';

export type OwnerFilterState = {
  search: string;
  hasDebt: 'all' | 'yes' | 'no';
  sortBy: 'name' | 'lastVisit' | 'debt';
  sortOrder: 'asc' | 'desc';
};

type OwnerFiltersProps = {
  filters: OwnerFilterState;
  onFiltersChange: (filters: OwnerFilterState) => void;
  totalCount: number;
  filteredCount: number;
  selectedCount: number;
  onExportClick: () => void;
};

export default function OwnerFilters({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  selectedCount,
  onExportClick,
}: OwnerFiltersProps) {
  const hasActiveFilters = filters.search || filters.hasDebt !== 'all';

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      hasDebt: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  return (
    <div className="space-y-4">
      {/* Primera fila: Búsqueda + Acciones */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono, email o cédula..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="input pl-10 pr-10"
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Botón Exportar */}
        <button
          onClick={onExportClick}
          disabled={filteredCount === 0}
          className="btn-secondary shrink-0"
        >
          <Download size={18} />
          Exportar {selectedCount > 0 ? `(${selectedCount})` : ''}
        </button>
      </div>

      {/* Segunda fila: Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filtro de deuda */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filters.hasDebt}
            onChange={(e) => onFiltersChange({ ...filters, hasDebt: e.target.value as OwnerFilterState['hasDebt'] })}
            className="input py-1.5 px-3 w-auto text-sm"
          >
            <option value="all">Todos</option>
            <option value="yes">Con deuda</option>
            <option value="no">Sin deuda</option>
          </select>
        </div>

        {/* Ordenar por */}
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-') as [OwnerFilterState['sortBy'], OwnerFilterState['sortOrder']];
            onFiltersChange({ ...filters, sortBy, sortOrder });
          }}
          className="input py-1.5 px-3 w-auto text-sm"
        >
          <option value="name-asc">Nombre A-Z</option>
          <option value="name-desc">Nombre Z-A</option>
          <option value="lastVisit-desc">Última visita (reciente)</option>
          <option value="lastVisit-asc">Última visita (antigua)</option>
          <option value="debt-desc">Mayor deuda</option>
          <option value="debt-asc">Menor deuda</option>
        </select>

        {/* Limpiar filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-biovet-500 hover:text-biovet-600 dark:text-biovet-400 dark:hover:text-biovet-300 font-medium flex items-center gap-1"
          >
            <X size={14} />
            Limpiar filtros
          </button>
        )}

        {/* Contador */}
        <div className="ml-auto text-sm text-slate-500 dark:text-slate-400">
          {filteredCount === totalCount ? (
            <span>{totalCount} propietario{totalCount !== 1 ? 's' : ''}</span>
          ) : (
            <span>{filteredCount} de {totalCount} propietarios</span>
          )}
        </div>
      </div>
    </div>
  );
}