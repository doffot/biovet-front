// src/components/inventory/ProductStats.tsx

import { Package, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";

interface ProductStatsProps {
  stats: {
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
  };
}

export function ProductStats({ stats }: ProductStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="Total Productos"
        value={stats.total}
        icon={Package}
        variant="primary"
      />
      <StatCard
        label="Activos"
        value={stats.active}
        icon={CheckCircle2}
        variant="success"
      />
      <StatCard
        label="Stock Bajo"
        value={stats.lowStock}
        icon={AlertTriangle}
        variant="warning"
      />
      <StatCard
        label="Agotados"
        value={stats.outOfStock}
        icon={XCircle}
        variant="danger"
      />
    </div>
  );
}