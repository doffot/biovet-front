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
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getAllPurchases } from "@/api/purchaseAPI";
import Spinner from "@/components/Spinner";
import { StatCard } from "@/components/ui/StatCard";

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
    badge: "badge badge-success",
  },
  pendiente: {
    label: "Pendiente",
    badge: "badge badge-warning",
  },
  cancelada: {
    label: "Cancelada",
    badge: "badge badge-danger",
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

  // Stats
  const stats = useMemo(() => {
    const total = purchases.length;
    const totalAmount = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const completadas = purchases.filter((p) => p.status === "completada").length;
    const pendientes = purchases.filter((p) => p.status === "pendiente").length;

    return { total, totalAmount, completadas, pendientes };
  }, [purchases]);

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
      {/* ═══════════════════════════════════════
          HEADER FIJO
          ═══════════════════════════════════════ */}
      <div className="shrink-0 px-4 sm:px-8 pt-4 sm:pt-6 pb-0 space-y-4 sm:space-y-5">
        {/* Título */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-surface-50 dark:hover:bg-dark-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-linear-to-br from-biovet-500 to-biovet-600 rounded-xl flex items-center justify-center shadow-lg shadow-biovet-500/20">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-heading">
                  Historial de Compras
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {totalCountText}
                </p>
              </div>
            </div>
          </div>

          <Link to="/purchases/new" className="btn-primary shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Compra</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total Compras"
            value={stats.total}
            icon={ShoppingBag}
            variant="primary"
          />
          <StatCard
            label="Monto Total"
            value={`$${stats.totalAmount.toFixed(2)}`}
            icon={DollarSign}
            variant="success"
          />
          <StatCard
            label="Completadas"
            value={stats.completadas}
            icon={CheckCircle}
            variant="neutral"
          />
          <StatCard
            label="Pendientes"
            value={stats.pendientes}
            icon={Clock}
            variant="warning"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar proveedor o producto..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input pl-10 pr-9"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-100 dark:hover:bg-dark-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
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
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-biovet-600 dark:text-biovet-400 hover:bg-biovet-50 dark:hover:bg-biovet-950 rounded-lg transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          CONTENIDO SCROLLEABLE
          ═══════════════════════════════════════ */}
      <div className="flex-1 overflow-hidden px-4 sm:px-8 pb-24 lg:pb-8 pt-4">
        <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-200 dark:border-slate-700 shadow-sm h-full flex flex-col overflow-hidden">
          {paginatedPurchases.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-surface-100 dark:bg-dark-200 rounded-full flex items-center justify-center border border-surface-200 dark:border-slate-700">
                  <ShoppingBag className="w-7 h-7 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
                  {hasActiveFilters
                    ? "Sin resultados"
                    : "No hay compras registradas"}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">
                  {hasActiveFilters
                    ? "Prueba con otros filtros"
                    : "Registra tu primera compra"}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-950 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Limpiar filtros
                  </button>
                ) : (
                  <Link
                    to="/purchases/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-biovet-500 text-white text-sm font-semibold rounded-lg hover:bg-biovet-600 transition-colors"
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
                  <thead className="sticky top-0 bg-surface-50 dark:bg-dark-200 border-b border-surface-200 dark:border-slate-700 z-10">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">
                        Compra
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">
                        Proveedor
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left hidden xl:table-cell">
                        Productos
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                        Total
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left hidden md:table-cell">
                        Método
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
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
                          className="group hover:bg-surface-50/70 dark:hover:bg-dark-200/30 transition-colors"
                        >
                          {/* Compra */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-lg bg-biovet-100 dark:bg-biovet-900/50 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4 text-biovet-600 dark:text-biovet-400" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                  #{purchase._id.substring(0, 8).toUpperCase()}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {purchase.items.length} producto{purchase.items.length !== 1 ? "s" : ""}
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
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-50 truncate">
                              {purchase.items
                                .map((item) => `${item.productName} (${item.quantity})`)
                                .join(", ")}
                            </p>
                          </td>

                          {/* Total */}
                          <td className="px-4 py-3 text-right">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              ${purchase.totalAmount.toFixed(2)}
                            </p>
                          </td>

                          {/* Método */}
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="badge badge-biovet capitalize">
                              {purchase.paymentMethod}
                            </span>
                          </td>

                          {/* Fecha */}
                          <td className="px-4 py-3">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {format(new Date(purchase.createdAt), "dd MMM yyyy", { locale: es })}
                            </p>
                          </td>

                          {/* Estado */}
                          <td className="px-4 py-3 text-center">
                            <span className={statusCfg.badge}>
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
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-biovet-100 dark:bg-biovet-900/50 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-biovet-600 dark:text-biovet-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                              #{purchase._id.substring(0, 8).toUpperCase()}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {purchase.provider || "Sin proveedor"}
                            </p>
                          </div>
                        </div>
                        <span className={`${statusCfg.badge} shrink-0`}>
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Productos */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {purchase.items
                          .map((item) => `${item.productName} (${item.quantity})`)
                          .join(", ")}
                      </p>

                      {/* Bottom */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="badge badge-biovet capitalize">
                            {purchase.paymentMethod}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {format(new Date(purchase.createdAt), "dd MMM yyyy", { locale: es })}
                          </span>
                        </div>
                        <p className="text-base font-bold text-slate-900 dark:text-white">
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
            <div className="shrink-0 px-4 py-3 bg-surface-50 dark:bg-dark-200 border-t border-surface-200 dark:border-slate-700 flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredPurchases.length)} de {filteredPurchases.length}
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-surface-100 dark:hover:bg-dark-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  Anterior
                </button>

                <div className="hidden sm:flex items-center gap-1">
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
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                            currentPage === page
                              ? "bg-biovet-500 text-white shadow-sm"
                              : "border border-surface-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-biovet-400"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="text-slate-400 px-1 text-xs">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-surface-100 dark:hover:bg-dark-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
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