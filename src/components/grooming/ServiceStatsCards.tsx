import { Scissors, DollarSign, Clock, Wallet } from "lucide-react";

interface IncomeStats {
  totalUSD: number;
  totalBs: number;
  paidUSD: number;
  paidBs: number;
  pendingUSD: number;
  pendingBs: number;
  hasBsTransactions: boolean;
  hasUSDTransactions: boolean;
}

interface StatsCardsProps {
  filteredServices: any[];
  incomeStats: IncomeStats;
}

export default function ServiceStatsCards({
  filteredServices,
  incomeStats,
}: StatsCardsProps) {
  const totalServices = filteredServices.length;
  const completedServices = filteredServices.filter(
    (s) => s.status === "Completado"
  ).length;
  const completionRate =
    totalServices > 0 ? (completedServices / totalServices) * 100 : 0;

  const formatUSD = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const formatBs = (amount: number): string => {
    return `Bs. ${amount.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const totalPendingUSD = incomeStats.pendingUSD;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Servicios */}
      <div
        className="bg-white dark:bg-dark-100 
                      rounded-xl p-4 
                      border border-surface-300 dark:border-slate-700 
                      shadow-sm hover:shadow-md 
                      transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-surface-500 dark:text-slate-400 uppercase tracking-wide">
              Servicios
            </p>
            <p className="text-2xl font-bold text-surface-800 dark:text-white mt-1">
              {totalServices}
            </p>
            <p className="text-xs text-surface-500/80 dark:text-slate-500 mt-0.5">
              {completedServices} completados ({completionRate.toFixed(0)}%)
            </p>
          </div>
          <div
            className="w-10 h-10 
                          bg-biovet-50 dark:bg-biovet-950 
                          border border-biovet-200 dark:border-biovet-800 
                          rounded-lg flex items-center justify-center 
                          group-hover:scale-110 transition-transform"
          >
            <Scissors className="w-5 h-5 text-biovet-500 dark:text-biovet-400" />
          </div>
        </div>
      </div>

      {/* Por Cobrar */}
      <div
        className="bg-warning-50 dark:bg-warning-950/30 
                      rounded-xl p-4 
                      border border-warning-200 dark:border-warning-800 
                      shadow-sm hover:shadow-md 
                      transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-warning-600/80 dark:text-warning-400/80 uppercase tracking-wide">
              Por Cobrar
            </p>
            <p className="text-2xl font-bold text-warning-600 dark:text-warning-400 mt-1">
              {formatUSD(totalPendingUSD)}
            </p>
            {incomeStats.pendingBs > 0 && (
              <p className="text-xs text-warning-600/70 dark:text-warning-400/70 mt-0.5">
                + {formatBs(incomeStats.pendingBs)}
              </p>
            )}
          </div>
          <div
            className="w-10 h-10 
                          bg-warning-100 dark:bg-warning-900 
                          border border-warning-200 dark:border-warning-800 
                          rounded-lg flex items-center justify-center 
                          group-hover:scale-110 transition-transform"
          >
            <Clock className="w-5 h-5 text-warning-600 dark:text-warning-400" />
          </div>
        </div>
      </div>

      {/* Cobrado en USD */}
      <div
        className="bg-success-50 dark:bg-success-950/30 
                      rounded-xl p-4 
                      border border-success-200 dark:border-success-800 
                      shadow-sm hover:shadow-md 
                      transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-success-600/80 dark:text-success-400/80 uppercase tracking-wide">
              Cobrado USD
            </p>
            <p className="text-2xl font-bold text-success-600 dark:text-success-400 mt-1">
              {formatUSD(incomeStats.paidUSD)}
            </p>
            <p className="text-xs text-success-600/70 dark:text-success-400/70 mt-0.5">
              {incomeStats.hasUSDTransactions
                ? "en dólares"
                : "sin pagos USD"}
            </p>
          </div>
          <div
            className="w-10 h-10 
                          bg-success-100 dark:bg-success-900 
                          border border-success-200 dark:border-success-800 
                          rounded-lg flex items-center justify-center 
                          group-hover:scale-110 transition-transform"
          >
            <DollarSign className="w-5 h-5 text-success-600 dark:text-success-400" />
          </div>
        </div>
      </div>

      {/* Cobrado en Bolívares */}
      <div
        className="bg-biovet-50 dark:bg-biovet-950/30 
                      rounded-xl p-4 
                      border border-biovet-200 dark:border-biovet-800 
                      shadow-sm hover:shadow-md 
                      transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-biovet-600/80 dark:text-biovet-400/80 uppercase tracking-wide">
              Cobrado Bs
            </p>
            <p className="text-2xl font-bold text-biovet-600 dark:text-biovet-400 mt-1">
              {formatBs(incomeStats.paidBs)}
            </p>
            <p className="text-xs text-biovet-600/70 dark:text-biovet-400/70 mt-0.5">
              {incomeStats.hasBsTransactions
                ? "en bolívares"
                : "sin pagos Bs"}
            </p>
          </div>
          <div
            className="w-10 h-10 
                          bg-biovet-100 dark:bg-biovet-900 
                          border border-biovet-200 dark:border-biovet-800 
                          rounded-lg flex items-center justify-center 
                          group-hover:scale-110 transition-transform"
          >
            <Wallet className="w-5 h-5 text-biovet-600 dark:text-biovet-400" />
          </div>
        </div>
      </div>
    </div>
  );
}