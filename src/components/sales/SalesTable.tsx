// src/views/sales/components/SalesTable.tsx

import type { Sale } from "@/types/sale";
import { SaleRow } from "./SaleRow";

const HEADERS = [
  { label: "Fecha", align: "text-left" },
  { label: "Cliente", align: "text-left" },
  { label: "Productos", align: "text-left" },
  { label: "Estado", align: "text-center" },
  { label: "Pago", align: "text-center" },
  { label: "Total", align: "text-right" },
  { label: "Acciones", align: "text-center" },
];

interface SalesTableProps {
  sales: Sale[];
  expandedSale: string | null;
  onToggleExpand: (saleId: string) => void;
  onCancel: (sale: Sale) => void;
}

export function SalesTable({
  sales,
  expandedSale,
  onToggleExpand,
  onCancel,
}: SalesTableProps) {
  return (
    <div className="hidden lg:block flex-1 overflow-auto custom-scrollbar relative">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700 z-10">
          <tr>
            {HEADERS.map((h) => (
              <th
                key={h.label}
                className={`px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider ${h.align}`}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200 dark:divide-slate-700/50">
          {sales.map((sale) => (
            <SaleRow
              key={sale._id}
              sale={sale}
              isExpanded={expandedSale === sale._id}
              onToggleExpand={() => onToggleExpand(sale._id)}
              onCancel={() => onCancel(sale)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}