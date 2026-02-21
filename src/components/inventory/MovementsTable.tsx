// src/views/inventory/components/MovementsTable.tsx

import type { Movement } from "@/types/inventory";
import { MovementRow } from "./MovementRow";

const HEADERS = [
  { label: "Fecha", align: "text-left" },
  { label: "Producto", align: "text-left" },
  { label: "Tipo", align: "text-left" },
  { label: "Razón", align: "text-left", hidden: "hidden md:table-cell" },
  { label: "Cantidad", align: "text-center" },
  { label: "Stock Después", align: "text-center", hidden: "hidden lg:table-cell" },
];

interface MovementsTableProps {
  movements: Movement[];
}

export function MovementsTable({ movements }: MovementsTableProps) {
  return (
    <div className="hidden lg:block flex-1 overflow-auto custom-scrollbar relative">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700 z-10">
          <tr>
            {HEADERS.map((h) => (
              <th
                key={h.label}
                className={`px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider ${h.align} ${h.hidden || ""}`}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200 dark:divide-slate-700/50">
          {movements.map((movement) => (
            <MovementRow key={movement._id} movement={movement} />
          ))}
        </tbody>
      </table>
    </div>
  );
}