// src/views/inventory/StockView.tsx

import { useNavigate } from "react-router-dom";
import {
  Package,
  AlertCircle,
  RefreshCw,
  Search,
  X,
  AlertTriangle,
  Download,
  ArrowLeft,
  DollarSign,
  Layers,
  XCircle,
} from "lucide-react";
import Spinner from "@/components/Spinner";
import { StatCard } from "@/components/ui/StatCard";
import { formatPrice } from "@/utils/productHelpers";
import { useStockView } from "@/hooks/useStockView";
import { StockRow } from "@/components/inventory/StockRow";
import { StockMobileCard } from "@/components/inventory/StockMobileCard";
import { ProductPagination } from "@/components/inventory/ProductPagination";

const HEADERS = [
  { label: "Producto", align: "text-left" },
  { label: "Unidades", align: "text-center" },
  { label: "Dosis", align: "text-center", hidden: "hidden sm:table-cell" },
  { label: "Mínimo", align: "text-center", hidden: "hidden md:table-cell" },
  { label: "Valor", align: "text-right", hidden: "hidden lg:table-cell" },
  { label: "Estado", align: "text-center" },
];

export default function StockView() {
  const navigate = useNavigate();
  const {
    searchTerm,
    setSearchTerm,
    stockFilter,
    setStockFilter,
    currentPage,
    setCurrentPage,
    currentProducts,
    filteredProducts,
    stats,
    isLoading,
    isError,
    hasActiveFilters,
    totalPages,
    startIndex,
    itemsPerPage,
    handleClearFilters,
  } = useStockView();

  if (isLoading) return <Spinner fullScreen size="xl" />;

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-100 dark:bg-dark-300">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 bg-danger-50 dark:bg-danger-950 rounded-full flex items-center justify-center border border-danger-200 dark:border-danger-800">
            <AlertCircle className="w-7 h-7 text-danger-500" />
          </div>
          <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm">
            Error al cargar inventario
          </p>
          <button onClick={() => navigate(-1)} className="btn-primary mt-3">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-100 dark:bg-dark-300">
      {/* HEADER FIJO */}
      <div className="shrink-0 px-4 sm:px-8 pt-4 sm:pt-6 pb-0 space-y-4 sm:space-y-5">
        {/* Título */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-surface-50 dark:hover:bg-dark-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-linear-to-br from-biovet-500 to-biovet-600 rounded-xl flex items-center justify-center shadow-lg shadow-biovet-500/20">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-heading">
                Stock Actual
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Inventario en tiempo real
              </p>
            </div>
          </div>
        </div>

        {/* Stats con StatCard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total Unidades"
            value={stats.totalUnits}
            icon={Layers}
            variant="primary"
          />
          <StatCard
            label="Valor Inventario"
            value={formatPrice(stats.totalValue)}
            icon={DollarSign}
            variant="success"
          />
          <StatCard
            label="Stock Bajo"
            value={stats.lowStock}
            icon={AlertTriangle}
            variant="warning"
          />
          <StatCard
            label="Agotados"
            value={stats.outOfStock}
            icon={XCircle}
            variant="danger"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 sm:gap-3 pb-4 sm:pb-5">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-11 pr-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-100 dark:hover:bg-dark-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
              <div className="pl-3 text-slate-400">
                <AlertTriangle size={16} />
              </div>
              <select
                value={stockFilter}
                onChange={(e) =>
                  setStockFilter(
                    e.target.value as "all" | "ok" | "low" | "out"
                  )
                }
                className="pl-2 pr-8 py-2.5 bg-transparent text-sm font-medium text-slate-600 dark:text-slate-300 outline-none appearance-none cursor-pointer"
              >
                <option value="all">Todo</option>
                <option value="ok">En stock</option>
                <option value="low">Stock bajo</option>
                <option value="out">Agotados</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-danger-500 hover:border-danger-300 dark:hover:border-danger-700 transition-all shadow-sm"
              >
                <RefreshCw size={14} />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}

            <button className="flex items-center gap-1.5 px-3 py-2.5 bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-surface-50 dark:hover:bg-dark-100 transition-all shadow-sm">
              <Download size={16} className="text-biovet-500" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO SCROLLEABLE */}
      <div className="flex-1 overflow-hidden px-4 sm:px-8 pb-4 sm:pb-8">
        <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-200 dark:border-slate-700 shadow-sm h-full flex flex-col overflow-hidden">
          {currentProducts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-surface-100 dark:bg-dark-200 rounded-full flex items-center justify-center border border-surface-200 dark:border-slate-700">
                  <Package className="w-7 h-7 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
                  {hasActiveFilters ? "Sin resultados" : "Sin inventario"}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">
                  {hasActiveFilters
                    ? "Prueba con otros filtros"
                    : "Registra productos para ver el stock"}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-950 rounded-lg transition-colors"
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
              <div className="hidden lg:block flex-1 overflow-auto custom-scrollbar relative">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-surface-50 dark:bg-dark-200 border-b border-surface-200 dark:border-slate-700 z-10">
                    <tr>
                      {HEADERS.map((h) => (
                        <th
                          key={h.label}
                          className={`px-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${h.align} ${h.hidden || ""}`}
                        >
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200 dark:divide-slate-700/50">
                    {currentProducts.map((product) => (
                      <StockRow key={product._id} product={product} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="lg:hidden flex-1 overflow-auto custom-scrollbar divide-y divide-surface-200 dark:divide-slate-700/50">
                {currentProducts.map((product) => (
                  <StockMobileCard key={product._id} product={product} />
                ))}
              </div>
            </>
          )}

          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsPerPage={itemsPerPage}
            totalItems={filteredProducts.length}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}