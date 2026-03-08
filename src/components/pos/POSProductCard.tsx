// src/components/pos/POSProductCard.tsx
import { Plus, CheckCircle2 } from "lucide-react";
import type { ProductWithInventory } from "@/types/inventory";

interface POSProductCardProps {
  product: ProductWithInventory;
  isFullUnitMode: boolean;
  inCart: boolean;
  onAddToCart: () => void;
  onSetMode: (isFullUnit: boolean) => void;
}

export function POSProductCard({
  product,
  isFullUnitMode,
  inCart,
  onAddToCart,
  onSetMode,
}: POSProductCardProps) {
  const inventory = product.inventory;
  const stockUnits = inventory?.stockUnits || 0;
  const stockDoses = inventory?.stockDoses || 0;
  const totalDoses = stockUnits * product.dosesPerUnit + stockDoses;

  return (
    <div className="p-3 flex items-center gap-3">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
            {product.name}
          </p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 shrink-0">
            $
            {isFullUnitMode
              ? product.salePrice.toFixed(2)
              : (product.salePricePerDose ?? product.salePrice).toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-surface-500 dark:text-slate-400 capitalize">
            {product.category}
          </span>
          <span className="text-xs text-warning-600 dark:text-warning-400">
            • {product.divisible
              ? `${totalDoses} ${product.doseUnit}`
              : `${stockUnits} ${product.unit}`}
          </span>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-2 mt-2">
          {product.divisible && (
            <div className="flex gap-1">
              <button
                onClick={() => onSetMode(true)}
                className={`px-2 py-1 rounded text-xs font-medium cursor-pointer ${
                  isFullUnitMode
                    ? "bg-biovet-500 text-white"
                    : "bg-surface-100 dark:bg-dark-200 text-surface-500"
                }`}
              >
                {product.unit}
              </button>
              <button
                onClick={() => onSetMode(false)}
                className={`px-2 py-1 rounded text-xs font-medium cursor-pointer ${
                  !isFullUnitMode
                    ? "bg-biovet-500 text-white"
                    : "bg-surface-100 dark:bg-dark-200 text-surface-500"
                }`}
              >
                {product.doseUnit}
              </button>
            </div>
          )}

          <button
            onClick={onAddToCart}
            disabled={inCart}
            className={`ml-auto px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 cursor-pointer ${
              inCart
                ? "bg-success-100 dark:bg-success-950 text-success-600 dark:text-success-400"
                : "bg-biovet-500 text-white"
            }`}
          >
            {inCart ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                Añadido
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}