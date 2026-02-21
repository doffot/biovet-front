// src/views/inventory/components/StockMobileCard.tsx

import type { ProductWithInventory } from "@/types/inventory";
import { formatPrice, getCategoryLabel, getStockStatus, getStockStatusConfig } from "@/utils/productHelpers";
import { Package } from "lucide-react";


interface StockMobileCardProps {
  product: ProductWithInventory;
}

export function StockMobileCard({ product }: StockMobileCardProps) {
  const units = product.inventory?.stockUnits ?? 0;
  const doses = product.inventory?.stockDoses ?? 0;
  const totalDoses = units * product.dosesPerUnit + doses;
  const stockValue = units * product.salePrice;
  const status = getStockStatus(product);
  const statusCfg = getStockStatusConfig(status);

  return (
    <div className="p-4 space-y-3 hover:bg-surface-50/50 dark:hover:bg-dark-200/30 transition-colors">
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-biovet-500/10 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-biovet-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
              {product.name}
            </p>
            <p className="text-[11px] text-surface-500 dark:text-slate-400">
              {getCategoryLabel(product.category)}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
        >
          {statusCfg.label}
        </span>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="text-surface-500 dark:text-slate-400">
            <strong className="text-slate-700 dark:text-slate-200">
              {units}
            </strong>{" "}
            {product.unit}
          </span>
          {product.divisible && (
            <span className="text-surface-500 dark:text-slate-400">
              <strong className="text-slate-700 dark:text-slate-200">
                {totalDoses}
              </strong>{" "}
              {product.doseUnit}
            </span>
          )}
        </div>
        <span className="font-medium text-success-600 dark:text-success-400">
          {formatPrice(stockValue)}
        </span>
      </div>

      {/* Progress bar visual */}
      {product.minStock && product.minStock > 0 ? (
        <div className="w-full h-1.5 bg-surface-200 dark:bg-dark-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              status === "out"
                ? "bg-danger-500"
                : status === "low"
                  ? "bg-warning-500"
                  : "bg-success-500"
            }`}
            style={{
              width: `${Math.min(100, (units / Math.max(product.minStock * 2, 1)) * 100)}%`,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}