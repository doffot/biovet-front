// src/components/pos/POSProductRow.tsx
import { Plus, CheckCircle2 } from "lucide-react";
import type { ProductWithInventory } from "@/types/inventory";

interface POSProductRowProps {
  product: ProductWithInventory;
  isFullUnitMode: boolean;
  inCart: boolean;
  onAddToCart: () => void;
  onSetMode: (isFullUnit: boolean) => void;
}

export function POSProductRow({
  product,
  isFullUnitMode,
  inCart,
  onAddToCart,
  onSetMode,
}: POSProductRowProps) {
  const inventory = product.inventory;
  const stockUnits = inventory?.stockUnits || 0;
  const stockDoses = inventory?.stockDoses || 0;
  const totalDoses = stockUnits * product.dosesPerUnit + stockDoses;

  return (
    <tr className="hover:bg-surface-100 dark:hover:bg-dark-50 transition-colors">
      {/* Producto */}
      <td className="px-3 py-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-40">
          {product.name}
        </p>
        <p className="text-xs text-surface-500 dark:text-slate-400 capitalize">
          {product.category}
        </p>
      </td>

      {/* Precio */}
      <td className="px-3 py-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          $
          {isFullUnitMode
            ? product.salePrice.toFixed(2)
            : (product.salePricePerDose ?? product.salePrice).toFixed(2)}
        </p>
        <p className="text-xs text-surface-500 dark:text-slate-400">
          {isFullUnitMode ? product.unit : product.doseUnit}
        </p>
      </td>

      {/* Stock */}
      <td className="px-3 py-2">
        <span className="text-xs text-warning-600 dark:text-warning-400">
          {product.divisible
            ? `${totalDoses} ${product.doseUnit}`
            : `${stockUnits} ${product.unit}`}
        </span>
      </td>

      {/* Modo */}
      <td className="px-3 py-2">
        {product.divisible ? (
          <div className="flex gap-1 justify-center">
            <button
              onClick={() => onSetMode(true)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                isFullUnitMode
                  ? "bg-biovet-500 text-white"
                  : "bg-surface-100 dark:bg-dark-200 text-surface-500 dark:text-slate-400 hover:bg-surface-200 dark:hover:bg-dark-50"
              }`}
            >
              {product.unit}
            </button>
            <button
              onClick={() => onSetMode(false)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                !isFullUnitMode
                  ? "bg-biovet-500 text-white"
                  : "bg-surface-100 dark:bg-dark-200 text-surface-500 dark:text-slate-400 hover:bg-surface-200 dark:hover:bg-dark-50"
              }`}
            >
              {product.doseUnit}
            </button>
          </div>
        ) : (
          <span className="text-xs text-surface-400 text-center block">—</span>
        )}
      </td>

      {/* Acción */}
      <td className="px-3 py-2 text-center">
        <button
          onClick={onAddToCart}
          disabled={inCart}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
            inCart
              ? "bg-success-50 dark:bg-success-950 text-success-600 dark:text-success-400 cursor-not-allowed"
              : "bg-biovet-500 hover:bg-biovet-600 text-white"
          }`}
        >
          {inCart ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              <span className="hidden lg:inline">Añadido</span>
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" />
              <span className="hidden lg:inline">Agregar</span>
            </>
          )}
        </button>
      </td>
    </tr>
  );
}