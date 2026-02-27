// src/components/grooming/GroomingStats.tsx

import { Scissors, Clock, DollarSign, Wallet } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";

interface IncomeStats {
  totalUSD: number;
  paidUSD: number;
  paidBs: number;
  pendingUSD: number;
  hasBsTransactions: boolean;
  hasUSDTransactions: boolean;
}

interface GroomingStatsProps {
  totalServices: number;
  completedServices: number;
  incomeStats: IncomeStats;
}

export function GroomingStats({ 
  totalServices, 
  completedServices, 
  incomeStats 
}: GroomingStatsProps) {
  const completionRate = totalServices > 0 
    ? Math.round((completedServices / totalServices) * 100) 
    : 0;

  const formatUSD = (amount: number): string => `$${amount.toFixed(2)}`;
  
  const formatBs = (amount: number): string => {
    return `Bs. ${amount.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="Servicios"
        value={totalServices}
        icon={Scissors}
        variant="primary"
        subtitle={`${completedServices} completados (${completionRate}%)`}
      />
      <StatCard
        label="Por Cobrar"
        value={formatUSD(incomeStats.pendingUSD)}
        icon={Clock}
        variant="warning"
        subtitle="pendiente de pago"
      />
      <StatCard
        label="Cobrado USD"
        value={formatUSD(incomeStats.paidUSD)}
        icon={DollarSign}
        variant="success"
        subtitle={incomeStats.hasUSDTransactions ? "en dólares" : "sin pagos USD"}
      />
      <StatCard
        label="Cobrado Bs"
        value={formatBs(incomeStats.paidBs)}
        icon={Wallet}
        variant="info"
        subtitle={incomeStats.hasBsTransactions ? "en bolívares" : "sin pagos Bs"}
      />
    </div>
  );
}