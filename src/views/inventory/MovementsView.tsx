// src/views/inventory/MovementsView.tsx

import { useNavigate } from "react-router-dom";
import { ArrowRightLeft, AlertCircle, RefreshCw } from "lucide-react";
import Spinner from "../../components/Spinner";
import { useMovements } from "@/hooks/useMovements";
import { MovementsHeader } from "@/components/inventory/MovementsHeader";
import { MovementsFilters } from "@/components/inventory/MovementsFilters";
import { MovementsTable } from "@/components/inventory/MovementsTable";
import { MovementMobileCard } from "@/components/inventory/MovementMobileCard";
import { MovementsPagination } from "@/components/inventory/MovementsPagination";



export default function MovementsView() {
  const navigate = useNavigate();
  const {
    typeFilter,
    setTypeFilter,
    reasonFilter,
    setReasonFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    currentPage,
    setCurrentPage,

    movements,
    stats,
    isLoading,
    isError,
    error,
    hasActiveFilters,

    totalPages,
    startIndex,
    itemsPerPage,
    totalItems,

    handleClearFilters,
  } = useMovements();

  if (isLoading) return <Spinner fullScreen size="xl" />;

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-100 dark:bg-dark-300">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 bg-danger-50 dark:bg-danger-950 rounded-full flex items-center justify-center border border-danger-200 dark:border-danger-800">
            <AlertCircle className="w-7 h-7 text-danger-500" />
          </div>
          <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
            Error al cargar movimientos
          </p>
          <p className="text-surface-500 dark:text-slate-400 text-xs mb-3">
            {error?.message || "No se pudieron cargar los movimientos"}
          </p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const totalCountText = `${stats.total} movimiento${stats.total !== 1 ? "s" : ""} registrado${stats.total !== 1 ? "s" : ""}`;

  return (
    <div className="flex flex-col h-full bg-surface-100 dark:bg-dark-300">
      {/* HEADER FIJO */}
      <div className="shrink-0 px-4 sm:px-8 pt-4 sm:pt-6 pb-0 space-y-4 sm:space-y-5">
        <MovementsHeader
          totalCount={totalCountText}
          onBack={() => navigate(-1)}
        />

        <MovementsFilters
          typeFilter={typeFilter}
          onTypeChange={(v) => setTypeFilter(v)}
          reasonFilter={reasonFilter}
          onReasonChange={(v) => setReasonFilter(v)}
          dateFrom={dateFrom}
          onDateFromChange={(v) => setDateFrom(v)}
          dateTo={dateTo}
          onDateToChange={(v) => setDateTo(v)}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* CONTENIDO SCROLLEABLE */}
      <div className="flex-1 overflow-hidden px-4 sm:px-8 pb-4 sm:pb-8">
        <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm h-full flex flex-col overflow-hidden">
          {movements.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-surface-100 dark:bg-dark-200 rounded-full flex items-center justify-center border border-surface-300 dark:border-slate-700">
                  <ArrowRightLeft className="w-7 h-7 text-surface-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
                  {hasActiveFilters
                    ? "Sin resultados"
                    : "No hay movimientos registrados"}
                </p>
                <p className="text-surface-500 dark:text-slate-400 text-xs mb-3">
                  {hasActiveFilters
                    ? "Prueba con otros filtros"
                    : "Los movimientos se registran automáticamente"}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-950 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <MovementsTable movements={movements} />

              {/* Mobile */}
              <div className="lg:hidden flex-1 overflow-auto custom-scrollbar divide-y divide-surface-200 dark:divide-slate-700/50">
                {movements.map((movement) => (
                  <MovementMobileCard
                    key={movement._id}
                    movement={movement}
                  />
                ))}
              </div>
            </>
          )}

          <MovementsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}