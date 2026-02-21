// src/views/purchases/PurchaseListView.tsx
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingBag,
  Search,
  X,
  Plus,
  FileText,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getAllPurchases } from "@/api/purchaseAPI";
import Spinner from "@/components/Spinner";

const ITEMS_PER_PAGE = 10;

const STATUS_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "completada", label: "Completadas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "cancelada", label: "Canceladas" },
];

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  completada: {
    label: "Completada",
    badge: "bg-success-50 dark:bg-success-950 text-success-600 dark:text-success-400 border-success-200 dark:border-success-800",
  },
  pendiente: {
    label: "Pendiente",
    badge: "bg-warning-50 dark:bg-warning-950 text-warning-600 dark:text-warning-400 border-warning-200 dark:border-warning-800",
  },
  cancelada: {
    label: "Cancelada",
    badge: "bg-danger-50 dark:bg-danger-950 text-danger-600 dark:text-danger-400 border-danger-200 dark:border-danger-800",
  },
};

export default function PurchaseListView() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: getAllPurchases,
  });

  // Filtros
  const filteredPurchases = useMemo(() => {
    return purchases.filter((purchase) => {
      const matchesSearch =
        !searchTerm.trim() ||
        purchase.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.items.some((item) =>
          item.productName.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" || purchase.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [purchases, searchTerm, statusFilter]);

  // Paginación
  const totalPages = Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPurchases = filteredPurchases.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const hasActiveFilters = !!(searchTerm || statusFilter !== "all");

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  if (isLoading) return <Spinner fullScreen size="xl" />;

  const totalCountText = `${purchases.length} compra${purchases.length !== 1 ? "s" : ""} registrada${purchases.length !== 1 ? "s" : ""}`;

  return (
    <div className="flex flex-col h-full bg-surface-100 dark:bg-dark-300">
      {/* HEADER FIJO */}
      <div className="shrink-0 px-4 sm:px-8 pt-4 sm:pt-6 pb-0 space-y-4 sm:space-y-5">
        {/* Título */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-surface-400 hover:text-surface-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white leading-tight">
                Historial de Compras
              </h1>
              <p className="text-[13px] text-biovet-500 font-medium">
                {totalCountText}
              </p>
            </div>
          </div>

          <Link
            to="/purchases/new"
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-biovet-500 hover:bg-biovet-600 text-white rounded-lg font-bold text-[13px] transition-all shadow-sm cursor-pointer active:scale-[0.98]"
          >
            <div className="p-0.5 border-2 border-white rounded-full">
              <Plus size={12} strokeWidth={3} />
            </div>
            <span className="hidden sm:inline">Agregar</span>
          </Link>
        </div>

        <div className="border border-biovet-200/50 dark:border-biovet-800/30" />

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar proveedor o producto..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input pl-9 pr-8"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-surface-200 dark:hover:bg-dark-50 rounded transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-surface-400 dark:text-slate-500" />
              </button>
            )}
          </div>

          {/* Filtro por estado */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="input sm:w-44"
          >
            {STATUS_FILTERS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Limpiar filtros */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-950 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* CONTENIDO SCROLLEABLE */}
      <div className="flex-1 overflow-hidden px-4 sm:px-8 pb-4 sm:pb-8">
        <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm h-full flex flex-col overflow-hidden">
          {paginatedPurchases.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-surface-100 dark:bg-dark-200 rounded-full flex items-center justify-center border border-surface-300 dark:border-slate-700">
                  <ShoppingBag className="w-7 h-7 text-surface-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
                  {hasActiveFilters
                    ? "Sin resultados"
                    : "No hay compras registradas"}
                </p>
                <p className="text-surface-500 dark:text-slate-400 text-xs mb-3">
                  {hasActiveFilters
                    ? "Prueba con otros filtros"
                    : "Registra tu primera compra"}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-950 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Limpiar filtros
                  </button>
                ) : (
                  <Link
                    to="/purchases/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-biovet-500 text-white text-sm font-semibold rounded-lg hover:bg-biovet-600 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar Compra
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block flex-1 overflow-auto custom-scrollbar relative">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700 z-10">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider text-left">
                        Compra
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider text-left">
                        Proveedor
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider text-left hidden xl:table-cell">
                        Productos
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider text-left">
                        Total
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider text-left hidden md:table-cell">
                        Método
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider text-left">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider text-center">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200 dark:divide-slate-700/50">
                    {paginatedPurchases.map((purchase) => {
                      const statusCfg = STATUS_CONFIG[purchase.status] || STATUS_CONFIG.pendiente;
                      return (
                        <tr
                          key={purchase._id}
                          className="hover:bg-surface-50/50 dark:hover:bg-dark-200/30 transition-colors"
                        >
                          {/* Compra */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full bg-biovet-500/10 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4 text-biovet-500" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                  #{purchase._id.substring(0, 8)}
                                </p>
                                <p className="text-[11px] text-surface-500 dark:text-slate-400">
                                  {purchase.items.length} producto
                                  {purchase.items.length !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Proveedor */}
                          <td className="px-4 py-3">
                            <p className="text-sm text-slate-700 dark:text-slate-200">
                              {purchase.provider || "—"}
                            </p>
                          </td>

                          {/* Productos */}
                          <td className="px-4 py-3 hidden xl:table-cell">
                            <p className="text-sm text-surface-500 dark:text-slate-400 max-w-50 truncate">
                              {purchase.items
                                .map((item) => `${item.productName} (${item.quantity})`)
                                .join(", ")}
                            </p>
                          </td>

                          {/* Total */}
                          <td className="px-4 py-3">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                              ${purchase.totalAmount.toFixed(2)}
                            </p>
                          </td>

                          {/* Método */}
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-biovet-50 dark:bg-biovet-950 text-biovet-600 dark:text-biovet-300 border-biovet-200 dark:border-biovet-800 capitalize">
                              {purchase.paymentMethod}
                            </span>
                          </td>

                          {/* Fecha */}
                          <td className="px-4 py-3">
                            <p className="text-sm text-surface-500 dark:text-slate-400">
                              {format(new Date(purchase.createdAt), "dd MMM yyyy", {
                                locale: es,
                              })}
                            </p>
                          </td>

                          {/* Estado */}
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.badge}`}
                            >
                              {statusCfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden flex-1 overflow-auto custom-scrollbar divide-y divide-surface-200 dark:divide-slate-700/50">
                {paginatedPurchases.map((purchase) => {
                  const statusCfg = STATUS_CONFIG[purchase.status] || STATUS_CONFIG.pendiente;
                  return (
                    <div
                      key={purchase._id}
                      className="p-4 space-y-3 hover:bg-surface-50/50 dark:hover:bg-dark-200/30 transition-colors"
                    >
                      {/* Top */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-biovet-500/10 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-biovet-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                              #{purchase._id.substring(0, 8)}
                            </p>
                            <p className="text-[11px] text-surface-500 dark:text-slate-400">
                              {purchase.provider || "Sin proveedor"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${statusCfg.badge}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Productos */}
                      <p className="text-[11px] text-surface-500 dark:text-slate-400 line-clamp-2">
                        {purchase.items
                          .map((item) => `${item.productName} (${item.quantity})`)
                          .join(", ")}
                      </p>

                      {/* Bottom */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-biovet-50 dark:bg-biovet-950 text-biovet-600 dark:text-biovet-300 border-biovet-200 dark:border-biovet-800 capitalize">
                            {purchase.paymentMethod}
                          </span>
                          <span className="text-[11px] text-surface-500 dark:text-slate-400">
                            {format(new Date(purchase.createdAt), "dd MMM yyyy", {
                              locale: es,
                            })}
                          </span>
                        </div>
                        <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                          ${purchase.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="shrink-0 px-4 py-3 bg-surface-50 dark:bg-dark-200 border-t border-surface-300 dark:border-slate-700 flex items-center justify-between">
              <p className="text-[11px] text-surface-500 dark:text-slate-400 font-medium">
                {startIndex + 1}-
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredPurchases.length)}{" "}
                de {filteredPurchases.length}
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-surface-100 dark:hover:bg-dark-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Anterior
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            currentPage === page
                              ? "bg-biovet-500 text-white shadow-sm"
                              : "border border-surface-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-biovet-400"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span
                          key={page}
                          className="text-surface-400 dark:text-slate-500 px-1 text-xs"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-surface-100 dark:hover:bg-dark-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}