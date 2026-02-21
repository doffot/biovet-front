// src/views/inventory/components/ProductStats.tsx

import { Package, CheckCircle2, AlertTriangle, XCircle, type LucideIcon } from "lucide-react";

interface ProductStatsProps {
  stats: {
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
  };
}

interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgIcon: string;
}

export function ProductStats({ stats }: ProductStatsProps) {
  const items: StatItem[] = [
    {
      label: "Total",
      value: stats.total,
      icon: Package,
      color: "text-biovet-500",
      bgIcon: "bg-biovet-500/10",
    },
    {
      label: "Activos",
      value: stats.active,
      icon: CheckCircle2,
      color: "text-success-600 dark:text-success-400",
      bgIcon: "bg-success-500/10",
    },
    {
      label: "Stock Bajo",
      value: stats.lowStock,
      icon: AlertTriangle,
      color: "text-warning-600 dark:text-warning-400",
      bgIcon: "bg-warning-500/10",
    },
    {
      label: "Agotados",
      value: stats.outOfStock,
      icon: XCircle,
      color: "text-danger-600 dark:text-danger-400",
      bgIcon: "bg-danger-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {items.map((stat) => (
        <div
          key={stat.label}
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
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}