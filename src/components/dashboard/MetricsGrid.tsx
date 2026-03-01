// src/components/dashboard/MetricsGrid.tsx

import {
  DollarSign,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import type { CurrencyAmounts } from "../../constants/dashboardConstants";
import type { RevenueAmounts } from "../../hooks/useDashboardData";

interface MetricsGridProps {
  todayAppointments: number;
  todayConsultations: number;
  todayGrooming: number;
  todayRevenue: RevenueAmounts;
  totalPatients: number;
  totalOwners: number;
  pendingDebt: CurrencyAmounts;
  pendingInvoicesCount: number;
  monthRevenue: RevenueAmounts;
  onPendingDebtClick?: () => void;
}

export function MetricsGrid({
  todayRevenue,
  pendingDebt,
  pendingInvoicesCount,
  monthRevenue,
  onPendingDebtClick,
}: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        label="Ingresos Hoy"
        value={0}
        amounts={todayRevenue}
        icon={DollarSign}
        variant="success"
      />
      
      <StatCard
        label="Por Cobrar"
        value={0}
        amounts={pendingDebt}
        icon={CreditCard}
        variant={(pendingDebt.Bs > 0 || pendingDebt.USD > 0) ? "warning" : "success"}
        subtitle={`${pendingInvoicesCount} facturas pendientes`}
        onClick={onPendingDebtClick}
      />
      
      <StatCard
        label="Ingresos del Mes"
        value={0}
        amounts={monthRevenue}
        icon={TrendingUp}
        variant="primary"
      />
    </div>
  );
}