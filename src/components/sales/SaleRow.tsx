// src/views/sales/components/SaleRow.tsx

import { Fragment } from "react";
import { User, Eye, ChevronUp,  Ban } from "lucide-react";
import { getOwnerName, type Sale } from "@/types/sale";
import { getStatusConfig } from "@/utils/ownerHelpers";
import { formatSaleDate, formatSaleTime, getItemsSummary, getPaymentBadge, getPendingAmount } from "@/utils/salesHelpers";
import { SaleExpandedDetail } from "./SaleExpandedDetail";


interface SaleRowProps {
  sale: Sale;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCancel: () => void;
}

export function SaleRow({
  sale,
  isExpanded,
  onToggleExpand,
  onCancel,
}: SaleRowProps) {
  const statusCfg = getStatusConfig(sale.status);
  const payBadge = getPaymentBadge(sale);
  const StatusIcon = statusCfg.icon;
  const PayIcon = payBadge.icon;
  const pending = getPendingAmount(sale);

  return (
    <Fragment>
      <tr className="group hover:bg-surface-50/70 dark:hover:bg-dark-200/30 transition-colors">
        <td className="px-4 py-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {formatSaleDate(sale.createdAt)}
          </p>
          <p className="text-[11px] text-surface-500 dark:text-slate-400">
            {formatSaleTime(sale.createdAt)}
          </p>
        </td>

        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-biovet-500/10 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-biovet-500" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-40">
              {getOwnerName(sale)}
            </span>
          </div>
        </td>

        <td className="px-4 py-3">
          <p className="text-sm text-slate-700 dark:text-slate-200 truncate max-w-50">
            {getItemsSummary(sale)}
          </p>
          <p className="text-[11px] text-surface-500 dark:text-slate-400">
            {sale.items.length} producto{sale.items.length !== 1 ? "s" : ""}
          </p>
        </td>

        <td className="px-4 py-3 text-center">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusCfg.label}
          </span>
        </td>

        <td className="px-4 py-3 text-center">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${payBadge.bg} ${payBadge.text} ${payBadge.border}`}
          >
            <PayIcon className="w-3 h-3" />
            {payBadge.label}
          </span>
          {pending > 0.01 && sale.status !== "cancelada" && (
            <p className="text-[10px] text-danger-500 font-semibold mt-0.5">
              Debe: ${pending.toFixed(2)}
            </p>
          )}
        </td>

        <td className="px-4 py-3 text-right">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            ${sale.total.toFixed(2)}
          </p>
          {sale.discountTotal > 0 && (
            <p className="text-[10px] text-surface-500 dark:text-slate-400">
              Desc: -${sale.discountTotal.toFixed(2)}
            </p>
          )}
        </td>

        <td className="px-4 py-3">
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={onToggleExpand}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                isExpanded
                  ? "bg-biovet-500/10 text-biovet-500 dark:text-biovet-300"
                  : "text-surface-400 dark:text-slate-500 hover:bg-surface-100 dark:hover:bg-dark-50 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
              title={isExpanded ? "Ocultar" : "Ver detalles"}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            
            {sale.status === "completada" && (
              <button
                onClick={onCancel}
                className="p-1.5 rounded-lg text-danger-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950 transition-all cursor-pointer"
                title="Cancelar venta"
              >
                <Ban className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td
            colSpan={7}
            className="bg-surface-50/50 dark:bg-dark-200/20 px-6 py-4 border-b border-surface-200 dark:border-slate-700/50"
          >
            <SaleExpandedDetail sale={sale} />
          </td>
        </tr>
      )}
    </Fragment>
  );
}