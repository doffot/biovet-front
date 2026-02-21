// src/views/sales/components/SalesMobileList.tsx

import type { Sale } from "@/types/sale";
import { SaleMobileCard } from "./SaleMobileCard";

interface SalesMobileListProps {
  sales: Sale[];
  expandedSale: string | null;
  onToggleExpand: (saleId: string) => void;
  onPay: (sale: Sale) => void;
  onCancel: (sale: Sale) => void;
}

export function SalesMobileList({
  sales,
  expandedSale,
  onToggleExpand,
  onCancel,
}: SalesMobileListProps) {
  return (
    <div className="lg:hidden flex-1 overflow-auto custom-scrollbar divide-y divide-surface-200 dark:divide-slate-700/50">
      {sales.map((sale) => (
        <SaleMobileCard
          key={sale._id}
          sale={sale}
          isExpanded={expandedSale === sale._id}
          onToggleExpand={() => onToggleExpand(sale._id)}
          onCancel={() => onCancel(sale)}
        />
      ))}
    </div>
  );
}