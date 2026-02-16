import {
  DollarSign,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { DualCurrencyCard } from "./DualCurrencyCard";
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
      {/* Ingresos Hoy - Verde esmeralda */}
      <DualCurrencyCard
        title="Ingresos Hoy"
        amounts={todayRevenue}
        icon={DollarSign}
        iconBgColor="bg-emerald-500/10"
        color="text-emerald-500"
        bgColor="bg-card border-emerald-500/20 hover:border-emerald-500/50 shadow-soft hover:shadow-emerald-500/10"
      />
      
      {/* Por Cobrar - Ámbar con alerta */}
      <DualCurrencyCard
        title="Por Cobrar"
        amounts={pendingDebt}
        subtitle={`${pendingInvoicesCount} facturas pendientes`}
        icon={CreditCard}
        iconBgColor="bg-amber-500/10"
        color="text-amber-500"
        bgColor="bg-card border-amber-500/20 hover:border-amber-500/50 shadow-soft hover:shadow-amber-500/10"
        onClick={onPendingDebtClick}
      />
      
      {/* Ingresos del Mes - Azul vet neón */}
      <DualCurrencyCard
        title="Ingresos del Mes"
        amounts={monthRevenue}
        icon={TrendingUp}
        iconBgColor="bg-vet-primary/10"
        color="text-vet-accent"
        bgColor="bg-card border-vet-accent/20 hover:border-vet-accent/50 shadow-soft hover:shadow-vet-accent/10"
      />
    </div>
  );
}