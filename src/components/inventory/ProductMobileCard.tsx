// src/views/inventory/components/ProductMobileCard.tsx

import type { ProductWithInventory } from "@/types/inventory";
import { formatPrice, getCategoryLabel, getStockStatus, getStockStatusConfig, getTotalStock } from "@/utils/productHelpers";
import { Package, Eye, Trash2 } from "lucide-react";


interface ProductMobileCardProps {
  product: ProductWithInventory;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductMobileCard({
  product,
  onEdit,
  onDelete,
}: ProductMobileCardProps) {
  const stockStatus = getStockStatus(product);
  const stockCfg = getStockStatusConfig(stockStatus);

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
        <p className="text-base font-bold text-slate-700 dark:text-slate-200 shrink-0">
          {formatPrice(product.salePrice)}
        </p>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-surface-500 dark:text-slate-400">
            Stock: {getTotalStock(product)}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${stockCfg.bg} ${stockCfg.text} ${stockCfg.border}`}
          >
            {stockCfg.label}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg bg-surface-50 dark:bg-dark-200 text-surface-500 dark:text-slate-400 border border-surface-300 dark:border-slate-700 hover:text-biovet-500 transition-all cursor-pointer"
            title="Editar"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950 border border-danger-200 dark:border-danger-800 transition-all cursor-pointer"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}