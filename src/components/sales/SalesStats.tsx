// src/views/sales/components/SalesStats.tsx

import type { TodaySummary } from "@/types/sale";
import { ShoppingCart, DollarSign, TrendingUp, Clock } from "lucide-react";

interface SalesStatsProps {
  summary: TodaySummary;
}

const statsConfig = [
  {
    label: "Ventas Hoy",
    key: "totalSales" as const,
    icon: ShoppingCart,
    color: "text-biovet-500",
    bgIcon: "bg-biovet-500/10",
    format: (v: number) => v.toString(),
  },
  {
    label: "Vendido Hoy",
    key: "totalAmount" as const,
    icon: DollarSign,
    color: "text-success-600 dark:text-success-400",
    bgIcon: "bg-success-500/10",
    format: (v: number) => `$${v.toFixed(2)}`,
  },
  {
    label: "Cobrado USD",
    key: "totalCollectedUSD" as const,
    icon: TrendingUp,
    color: "text-biovet-500",
    bgIcon: "bg-biovet-500/10",
    format: (v: number) => `$${v.toFixed(2)}`,
  },
  {
    label: "Pendiente",
    key: "totalPending" as const,
    icon: Clock,
    color: "text-warning-600 dark:text-warning-400",
    bgIcon: "bg-warning-500/10",
    format: (v: number) => `$${v.toFixed(2)}`,
  },
];

export function SalesStats({ summary }: SalesStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {statsConfig.map((stat) => (
        <div
          key={stat.key}
          className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 p-3 shadow-sm flex items-center gap-3"
        >
          <div className={`p-2 rounded-lg ${stat.bgIcon}`}>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-surface-500 dark:text-slate-400 font-medium truncate">
              {stat.label}
            </p>
            <p className={`text-base sm:text-lg font-bold ${stat.color} truncate`}>
              {stat.format(summary[stat.key])}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}