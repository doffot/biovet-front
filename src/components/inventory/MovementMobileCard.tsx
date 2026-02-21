// src/views/inventory/components/MovementMobileCard.tsx

import type { Movement } from "@/types/inventory";
import {
  getMovementTypeConfig,
  getMovementReasonLabel,
  formatMovementQuantity,
  formatMovementDate,
  formatMovementTime,
} from "@/utils/movementHelpers";
import { Package } from "lucide-react";

interface MovementMobileCardProps {
  movement: Movement;
}

export function MovementMobileCard({ movement }: MovementMobileCardProps) {
  const typeConfig = getMovementTypeConfig(movement.type);

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
              {movement.product.name}
            </p>
            <p className="text-[11px] text-surface-500 dark:text-slate-400">
              {getMovementReasonLabel(movement.reason)}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border}`}
        >
          <span className="text-xs">{typeConfig.icon}</span>
          {typeConfig.label}
        </span>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {formatMovementQuantity(
              movement.quantityUnits,
              movement.quantityDoses,
              movement.product.unit,
              movement.product.doseUnit
            )}
          </span>
          <span className="text-[11px] text-surface-400 dark:text-slate-500">
            →
          </span>
          <span className="text-[11px] text-surface-500 dark:text-slate-400">
            Stock: {movement.stockAfterUnits} {movement.product.unit}
            {movement.stockAfterDoses > 0 && (
              <span> + {movement.stockAfterDoses} {movement.product.doseUnit}</span>
            )}
          </span>
        </div>

        <p className="text-[11px] text-surface-500 dark:text-slate-400 shrink-0">
          {formatMovementDate(movement.createdAt)}{" "}
          {formatMovementTime(movement.createdAt)}
        </p>
      </div>
    </div>
  );
}