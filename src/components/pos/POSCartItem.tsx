// src/components/pos/POSCartItem.tsx
import { Trash2, Minus, Plus } from "lucide-react";
import type { CartItem } from "@/types/sale";

interface POSCartItemProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onToggleUnitMode: () => void;
  onRemove: () => void;
}

export function POSCartItem({
  item,
  onUpdateQuantity,
  onToggleUnitMode,
  onRemove,
}: POSCartItemProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-surface-50 dark:bg-dark-200 rounded-lg">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
            {item.productName}
          </span>
          {item.isDivisible && (
            <button
              onClick={onToggleUnitMode}
              className="text-[10px] px-1 py-0.5 rounded bg-biovet-100 dark:bg-biovet-900/30 text-biovet-600 dark:text-biovet-400 shrink-0 cursor-pointer"
            >
              {item.isFullUnit ? item.unit : item.doseUnit}
            </button>
          )}
        </div>
        <p className="text-xs text-surface-500 dark:text-slate-400">
          ${(item.isFullUnit ? item.unitPrice : item.pricePerDose || item.unitPrice).toFixed(2)} c/u
        </p>
      </div>

      {/* Cantidad */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdateQuantity(item.quantity - 1)}
          className="p-1 rounded bg-surface-200 dark:bg-dark-100 hover:bg-surface-300 dark:hover:bg-dark-50 transition-colors cursor-pointer"
        >
          <Minus className="w-3 h-3 text-slate-600 dark:text-slate-300" />
        </button>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 w-6 text-center">
          {item.quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(item.quantity + 1)}
          className="p-1 rounded bg-surface-200 dark:bg-dark-100 hover:bg-surface-300 dark:hover:bg-dark-50 transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3 text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      {/* Total */}
      <span className="text-sm font-bold text-success-600 dark:text-success-400 w-16 text-right">
        ${item.total.toFixed(2)}
      </span>

      {/* Eliminar */}
      <button
        onClick={onRemove}
        className="p-1 text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/50 rounded transition-colors cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}