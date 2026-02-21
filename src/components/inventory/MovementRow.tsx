// src/views/inventory/components/MovementRow.tsx

import type { Movement } from "@/types/inventory";
import {
  getMovementTypeConfig,
  getMovementReasonLabel,
  formatMovementQuantity,
  formatMovementDate,
  formatMovementTime,
} from "@/utils/movementHelpers";

interface MovementRowProps {
  movement: Movement;
}

export function MovementRow({ movement }: MovementRowProps) {
  const typeConfig = getMovementTypeConfig(movement.type);

  return (
    <tr className="hover:bg-surface-50/50 dark:hover:bg-dark-200/30 transition-colors">
      {/* Fecha */}
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {formatMovementDate(movement.createdAt)}
        </p>
        <p className="text-[11px] text-surface-500 dark:text-slate-400">
          {formatMovementTime(movement.createdAt)}
        </p>
      </td>

      {/* Producto */}
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
          {movement.product.name}
        </p>
      </td>

      {/* Tipo */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border}`}
        >
          <span className="text-xs">{typeConfig.icon}</span>
          {typeConfig.label}
        </span>
      </td>

      {/* Razón */}
      <td className="px-4 py-3 hidden md:table-cell">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {getMovementReasonLabel(movement.reason)}
        </p>
      </td>

      {/* Cantidad */}
      <td className="px-4 py-3 text-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {formatMovementQuantity(
            movement.quantityUnits,
            movement.quantityDoses,
            movement.product.unit,
            movement.product.doseUnit
          )}
        </p>
      </td>

      {/* Stock después */}
      <td className="px-4 py-3 text-center hidden lg:table-cell">
        <p className="text-xs text-surface-500 dark:text-slate-400">
          {movement.stockAfterUnits} {movement.product.unit}
          {movement.stockAfterDoses > 0 && (
            <span> + {movement.stockAfterDoses} {movement.product.doseUnit}</span>
          )}
        </p>
      </td>
    </tr>
  );
}