// src/components/sales/SalesStats.tsx

import type { TodaySummary } from "@/types/sale";
import { ShoppingCart, DollarSign, TrendingUp, Clock } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";

interface SalesStatsProps {
  summary: TodaySummary;
}

export function SalesStats({ summary }: SalesStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      <StatCard
        label="Ventas Hoy"
        value={summary.totalSales}
        icon={ShoppingCart}
        variant="primary"
      />

      <StatCard
        label="Vendido Hoy"
        value={`$${summary.totalAmount.toFixed(2)}`}
        icon={DollarSign}
        variant="success"
      />

      <StatCard
        label="Cobrado USD"
        value={`$${summary.totalCollectedUSD.toFixed(2)}`}
        icon={TrendingUp}
        variant="primary"
      />

      <StatCard
        label="Pendiente"
        value={`$${summary.totalPending.toFixed(2)}`}
        icon={Clock}
        variant="warning"
      />
    </div>
  );
}