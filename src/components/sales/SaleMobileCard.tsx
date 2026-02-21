// src/views/sales/components/SaleMobileCard.tsx

import { User, Eye, ChevronUp, Ban } from "lucide-react";
import { SaleExpandedDetail } from "./SaleExpandedDetail";
import { getOwnerName, type Sale } from "@/types/sale";
import { formatDate, getStatusConfig } from "@/utils/ownerHelpers";
import { getPaymentBadge, getPendingAmount } from "@/utils/salesHelpers";
import { formatTime } from "@/utils/dashboardUtils";


interface SaleMobileCardProps {
  sale: Sale;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCancel: () => void;
}

export function SaleMobileCard({
  sale,
  isExpanded,
  onToggleExpand,
  onCancel,
}: SaleMobileCardProps) {
  const statusCfg = getStatusConfig(sale.status);
  const StatusIcon = statusCfg.icon;
  const payBadge = getPaymentBadge(sale);
  const PayIcon = payBadge.icon;
  const pending = getPendingAmount(sale);

  return (
    <div className="hover:bg-surface-50/50 dark:hover:bg-dark-200/30 transition-colors">
      <div className="p-4 space-y-3">
        {/* Top */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-biovet-500/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-biovet-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                {getOwnerName(sale)}
              </p>
              <p className="text-[11px] text-surface-500 dark:text-slate-400">
                {formatDate(sale.createdAt)} · {formatTime(sale.createdAt)}
              </p>
            </div>
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-200 shrink-0">
            ${sale.total.toFixed(2)}
          </p>
        </div>

        {/* Items */}
        <p className="text-xs text-surface-500 dark:text-slate-400 truncate">
          {sale.items.map((i) => i.productName).join(", ")}
        </p>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
          >
            <StatusIcon className="w-2.5 h-2.5" />
            {statusCfg.label}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${payBadge.bg} ${payBadge.text} ${payBadge.border}`}
          >
            <PayIcon className="w-2.5 h-2.5" />
            {payBadge.label}
          </span>
          {pending > 0.01 && sale.status !== "cancelada" && (
            <span className="text-[10px] font-bold text-danger-500">
              Debe: ${pending.toFixed(2)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleExpand}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              isExpanded
                ? "bg-biovet-500/10 text-biovet-500 dark:text-biovet-300 border-biovet-500/20"
                : "bg-surface-50 dark:bg-dark-200 text-surface-500 dark:text-slate-400 border-surface-300 dark:border-slate-700"
            }`}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Ocultar
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" /> Detalles
              </>
            )}
          </button>
         
          {sale.status === "completada" && (
            <button
              onClick={onCancel}
              className="p-2 rounded-lg text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950 border border-danger-200 dark:border-danger-800 transition-all cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4">
          <SaleExpandedDetail sale={sale} />
        </div>
      )}
    </div>
  );
}