// src/views/inventory/LowStockView.tsx

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  AlertTriangle,
  Package,
  Search,
  X,
  RefreshCw,
  XCircle,
  ShoppingBag,
} from "lucide-react";
import Spinner from "../../components/Spinner";
import { getProductsWithInventory } from "../../api/productAPI";
import {
  getStockStatus,
  getStockStatusConfig,
  getCategoryLabel,
  formatPrice,
  
} from "../../utils/productHelpers";
import type { ProductWithInventory } from "../../types/inventory";

export default function LowStockView() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "with-inventory"],
    queryFn: getProductsWithInventory,
  });

  // Solo productos con problemas de stock
  const problemProducts = useMemo(() => {
    return products.filter((p) => {
      const status = getStockStatus(p);
      return status === "low" || status === "out";
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    return problemProducts.filter((p) => {
      const matchesSearch =
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase());

      const status = getStockStatus(p);
      const matchesFilter =
        filter === "all" || status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [problemProducts, searchTerm, filter]);

  const stats = useMemo(() => {
    const low = problemProducts.filter(
      (p) => getStockStatus(p) === "low"
    ).length;
    const out = problemProducts.filter(
      (p) => getStockStatus(p) === "out"
    ).length;
    return { total: problemProducts.length, low, out };
  }, [problemProducts]);

  if (isLoading) return <Spinner fullScreen size="xl" />;

  return (
    <div className="flex flex-col h-full bg-surface-100 dark:bg-dark-300">
      {/* HEADER FIJO */}
      <div className="shrink-0 px-4 sm:px-8 pt-4 sm:pt-6 pb-0 space-y-4 sm:space-y-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-surface-400 hover:text-surface-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white leading-tight">
              Alertas de Stock
            </h1>
            <p className="text-[13px] text-biovet-500 font-medium">
              {stats.total} producto{stats.total !== 1 ? "s" : ""} requieren
              atención
            </p>
          </div>
        </div>

        <div className="border border-biovet-200/50 dark:border-biovet-800/30" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            {
              label: "Total Alertas",
              value: stats.total,
              icon: AlertTriangle,
              color: "text-biovet-500",
              bgIcon: "bg-biovet-500/10",
            },
            {
              label: "Stock Bajo",
              value: stats.low,
              icon: AlertTriangle,
              color: "text-warning-600 dark:text-warning-400",
              bgIcon: "bg-warning-500/10",
            },
            {
              label: "Agotados",
              value: stats.out,
              icon: XCircle,
              color: "text-danger-600 dark:text-danger-400",
              bgIcon: "bg-danger-500/10",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 p-3 shadow-sm flex items-center gap-3"
            >
              <div className={`p-2 rounded-lg ${stat.bgIcon}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-surface-500 dark:text-slate-400 font-medium truncate">
                  {stat.label}
                </p>
                <p
                  className={`text-base sm:text-lg font-bold ${stat.color}`}
                >
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pb-4 sm:pb-5">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 dark:text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-white dark:bg-dark-200 border border-surface-300 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder:text-surface-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-biovet-500 outline-none transition-all shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-surface-200 dark:hover:bg-dark-50 rounded cursor-pointer"
              >
                <X className="w-4 h-4 text-surface-400 dark:text-slate-500" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white dark:bg-dark-200 border border-surface-300 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
              <div className="pl-3 text-surface-400 dark:text-slate-500">
                <AlertTriangle size={16} />
              </div>
              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value as "all" | "low" | "out")
                }
                className="pl-2 pr-8 py-2.5 bg-transparent text-sm font-medium text-slate-600 dark:text-slate-300 outline-none appearance-none cursor-pointer"
              >
                <option value="all">Todos</option>
                <option value="low">Stock bajo</option>
                <option value="out">Agotados</option>
              </select>
            </div>

            {(searchTerm || filter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilter("all");
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-white dark:bg-dark-200 border border-surface-300 dark:border-slate-700 rounded-lg text-sm font-medium text-surface-500 dark:text-slate-400 hover:text-danger-500 transition-all shadow-sm cursor-pointer"
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 overflow-hidden px-4 sm:px-8 pb-4 sm:pb-8">
        <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm h-full flex flex-col overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-success-50 dark:bg-success-950 rounded-full flex items-center justify-center border border-success-200 dark:border-success-800">
                  <Package className="w-7 h-7 text-success-500" />
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
                  {problemProducts.length === 0
                    ? "¡Todo en orden!"
                    : "Sin resultados"}
                </p>
                <p className="text-surface-500 dark:text-slate-400 text-xs">
                  {problemProducts.length === 0
                    ? "No hay productos con stock bajo o agotado"
                    : "Prueba con otros filtros"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto custom-scrollbar divide-y divide-surface-200 dark:divide-slate-700/50">
              {filteredProducts.map((product) => (
                <LowStockItem key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========================================
   LOW STOCK ITEM
   ======================================== */
function LowStockItem({ product }: { product: ProductWithInventory }) {
  const units = product.inventory?.stockUnits ?? 0;
  const minStock = product.minStock ?? 0;
  const status = getStockStatus(product);
  const statusCfg = getStockStatusConfig(status);
  const isOut = status === "out";

  return (
    <div
      className={`p-4 flex items-center gap-4 hover:bg-surface-50/50 dark:hover:bg-dark-200/30 transition-colors ${
        isOut ? "bg-danger-50/20 dark:bg-danger-950/10" : ""
      }`}
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
          isOut
            ? "bg-danger-50 dark:bg-danger-950 border-danger-200 dark:border-danger-800"
            : "bg-warning-50 dark:bg-warning-950 border-warning-200 dark:border-warning-800"
        }`}
      >
        {isOut ? (
          <XCircle className="w-5 h-5 text-danger-500" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-warning-500" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
            {product.name}
          </p>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
          >
            {statusCfg.label}
          </span>
        </div>
        <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5">
          {getCategoryLabel(product.category)} · Actual:{" "}
          <strong
            className={isOut ? "text-danger-500" : "text-warning-500"}
          >
            {units} {product.unit}
          </strong>
          {minStock > 0 && (
            <span> · Mínimo: {minStock}</span>
          )}
        </p>

        {/* Progress */}
        {minStock > 0 && (
          <div className="w-full max-w-50 h-1.5 bg-surface-200 dark:bg-dark-200 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all ${
                isOut ? "bg-danger-500" : "bg-warning-500"
              }`}
              style={{
                width: `${Math.min(100, (units / Math.max(minStock, 1)) * 100)}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Precio */}
      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {formatPrice(product.salePrice)}
        </p>
        <p className="text-[11px] text-surface-500 dark:text-slate-400">
          por {product.unit}
        </p>
      </div>

      {/* Action */}
      <button
        onClick={() => {}}
        className="p-2 rounded-lg bg-biovet-500/10 text-biovet-500 dark:text-biovet-300 hover:bg-biovet-500/20 transition-all cursor-pointer shrink-0"
        title="Registrar compra"
      >
        <ShoppingBag className="w-4 h-4" />
      </button>
    </div>
  );
}