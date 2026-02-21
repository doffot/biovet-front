// src/views/inventory/components/StockRow.tsx

import type { ProductWithInventory } from "@/types/inventory";
import { formatPrice, getCategoryLabel, getStockStatus, getStockStatusConfig } from "@/utils/productHelpers";
import { Package } from "lucide-react";


interface StockRowProps {
  product: ProductWithInventory;
}

export function StockRow({ product }: StockRowProps) {
  const units = product.inventory?.stockUnits ?? 0;
  const doses = product.inventory?.stockDoses ?? 0;
  const totalDoses = units * product.dosesPerUnit + doses;
  const stockValue = units * product.salePrice;
  const status = getStockStatus(product);
  const statusCfg = getStockStatusConfig(status);

  return (
    <tr className="group hover:bg-surface-50/70 dark:hover:bg-dark-200/30 transition-colors">
      {/* Producto */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-biovet-500/10 flex items-center justify-center shrink-0">
            <Package className="w-3.5 h-3.5 text-biovet-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
              {product.name}
            </p>
            <p className="text-[11px] text-surface-500 dark:text-slate-400">
              {getCategoryLabel(product.category)}
            </p>
          </div>
        </div>
      </td>

      {/* Unidades */}
      <td className="px-4 py-3 text-center">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {units}
        </p>
        <p className="text-[11px] text-surface-500 dark:text-slate-400">
          {product.unit}
        </p>
      </td>

      {/* Dosis */}
      <td className="px-4 py-3 text-center hidden sm:table-cell">
        {product.divisible ? (
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {totalDoses}
            </p>
            <p className="text-[11px] text-surface-500 dark:text-slate-400">
              {product.doseUnit}
            </p>
          </div>
        ) : (
          <span className="text-[11px] text-surface-400 dark:text-slate-500">
            —
          </span>
        )}
      </td>

      {/* Min Stock */}
      <td className="px-4 py-3 text-center hidden md:table-cell">
        <span className="text-sm text-surface-500 dark:text-slate-400">
          {product.minStock ?? 0}
        </span>
      </td>

      {/* Valor */}
      <td className="px-4 py-3 text-right hidden lg:table-cell">
        <p className="text-sm font-medium text-success-600 dark:text-success-400">
          {formatPrice(stockValue)}
        </p>
      </td>

      {/* Estado */}
      <td className="px-4 py-3 text-center">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
        >
          {statusCfg.label}
        </span>
      </td>
    </tr>
  );
}