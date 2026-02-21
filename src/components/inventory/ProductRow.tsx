// src/views/inventory/components/ProductRow.tsx

import type { ProductWithInventory } from "@/types/inventory";
import { formatPrice, getCategoryLabel, getStockStatus, getStockStatusConfig, getTotalStock } from "@/utils/productHelpers";
import { Package, Eye, Trash2 } from "lucide-react";


interface ProductRowProps {
  product: ProductWithInventory;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductRow({ product, onEdit, onDelete }: ProductRowProps) {
  const stockStatus = getStockStatus(product);
  const stockCfg = getStockStatusConfig(stockStatus);

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
            {product.description && (
              <p className="text-[11px] text-surface-500 dark:text-slate-400 truncate max-w-50]">
                {product.description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Categoría */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="badge badge-biovet">
          {getCategoryLabel(product.category)}
        </span>
      </td>

      {/* Precio */}
      <td className="px-4 py-3 hidden md:table-cell">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {formatPrice(product.salePrice)}
          </p>
          {product.divisible && product.salePricePerDose && (
            <p className="text-[11px] text-surface-500 dark:text-slate-400">
              {formatPrice(product.salePricePerDose)}/{product.doseUnit}
            </p>
          )}
        </div>
      </td>

      {/* Stock */}
      <td className="px-4 py-3 text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {getTotalStock(product)}
        </p>
      </td>

      {/* Estado */}
      <td className="px-4 py-3 text-center hidden lg:table-cell">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${stockCfg.bg} ${stockCfg.text} ${stockCfg.border}`}
        >
          {stockCfg.label}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-surface-400 dark:text-slate-500 hover:bg-surface-100 dark:hover:bg-dark-50 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer"
            title="Editar"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-danger-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950 transition-all cursor-pointer"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}