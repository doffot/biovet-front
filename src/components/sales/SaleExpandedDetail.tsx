// src/views/sales/components/SaleExpandedDetail.tsx

import type { Sale } from "@/types/sale";
import { Package } from "lucide-react";

interface SaleExpandedDetailProps {
  sale: Sale;
}

export function SaleExpandedDetail({ sale }: SaleExpandedDetailProps) {
  const pendingAmount = sale.total - sale.amountPaid;

  return (
    <div className="space-y-3">
      {/* Items */}
      <div className="bg-white dark:bg-dark-100 rounded-lg border border-surface-300 dark:border-slate-700 overflow-hidden">
        <div className="px-3 py-2 bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700">
          <h4 className="text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            Productos ({sale.items.length})
          </h4>
        </div>
        <div className="divide-y divide-surface-200 dark:divide-slate-700/50">
          {sale.items.map((item, idx) => (
            <div key={idx} className="px-3 py-2.5 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                  {item.productName}
                </p>
                <p className="text-[11px] text-surface-500 dark:text-slate-400">
                  {item.quantity} × $
                  {item.isFullUnit
                    ? item.unitPrice.toFixed(2)
                    : (item.pricePerDose ?? item.unitPrice).toFixed(2)}
                  {!item.isFullUnit && (
                    <span className="ml-1 text-biovet-500 dark:text-biovet-300">(dosis)</span>
                  )}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  ${item.total.toFixed(2)}
                </p>
                {item.discount > 0 && (
                  <p className="text-[10px] text-danger-500">-${item.discount.toFixed(2)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
        <span className="text-surface-500 dark:text-slate-400">
          Subtotal: <strong className="text-slate-700 dark:text-slate-200">${sale.subtotal.toFixed(2)}</strong>
        </span>
        {sale.discountTotal > 0 && (
          <span className="text-surface-500 dark:text-slate-400">
            Descuento: <strong className="text-danger-500">-${sale.discountTotal.toFixed(2)}</strong>
          </span>
        )}
        <span className="text-surface-500 dark:text-slate-400">
          Total: <strong className="text-slate-700 dark:text-slate-200">${sale.total.toFixed(2)}</strong>
        </span>
        <span className="text-surface-500 dark:text-slate-400">
          Pagado: <strong className="text-success-500">${sale.amountPaid.toFixed(2)}</strong>
        </span>
        {sale.creditUsed > 0 && (
          <span className="text-surface-500 dark:text-slate-400">
            Crédito: <strong className="text-biovet-500 dark:text-biovet-300">${sale.creditUsed.toFixed(2)}</strong>
          </span>
        )}
        {pendingAmount > 0.01 && sale.status !== "cancelada" && (
          <span className="text-surface-500 dark:text-slate-400">
            Pendiente: <strong className="text-danger-500">${pendingAmount.toFixed(2)}</strong>
          </span>
        )}
      </div>

      {sale.notes && (
        <div className="bg-surface-50 dark:bg-dark-200 rounded-lg p-3 border border-surface-300 dark:border-slate-700">
          <p className="text-xs text-surface-500 dark:text-slate-400">
            <span className="font-semibold">Notas:</span> {sale.notes}
          </p>
        </div>
      )}
    </div>
  );
}