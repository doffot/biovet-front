// src/components/owners/detail/OwnerBalanceCards.tsx
import { CreditCard, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { formatCurrency, type DebtInfo } from '@/utils/ownerHelpers';

interface OwnerBalanceCardsProps {
  creditBalance: number;
  debtInfo: DebtInfo;
}

export function OwnerBalanceCards({ creditBalance, debtInfo }: OwnerBalanceCardsProps) {
  return (
    <div className="p-3 sm:p-4 border-b border-surface-100 dark:border-slate-800 space-y-2 sm:space-y-3">
      {/* Balance de crédito */}
      <div className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-center justify-between ${
        creditBalance > 0 
          ? 'bg-success-50 dark:bg-success-950/20 border border-success-100 dark:border-success-900/30'
          : creditBalance < 0
            ? 'bg-danger-50 dark:bg-danger-950/20 border border-danger-100 dark:border-danger-900/30'
            : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
            creditBalance > 0 ? 'bg-success-100 dark:bg-success-900/30' 
            : creditBalance < 0 ? 'bg-danger-100 dark:bg-danger-900/30'
            : 'bg-slate-200 dark:bg-slate-700'
          }`}>
            {creditBalance >= 0 
              ? <TrendingUp size={14} className={creditBalance > 0 ? "text-success-600" : "text-slate-400"} />
              : <TrendingDown size={14} className="text-danger-600" />
            }
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
              Crédito
            </p>
            <p className={`text-xs sm:text-sm font-black ${
              creditBalance > 0 ? 'text-success-600 dark:text-success-400'
              : creditBalance < 0 ? 'text-danger-600 dark:text-danger-400'
              : 'text-slate-500'
            }`}>
              {formatCurrency(creditBalance)}
            </p>
          </div>
        </div>
        <CreditCard size={16} className={creditBalance > 0 ? 'text-success-400' : 'text-slate-300'} />
      </div>

      {/* Deuda pendiente */}
      {debtInfo.totalDebt > 0 && (
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle size={14} className="text-amber-600" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                Deuda
              </p>
              <p className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
                {formatCurrency(debtInfo.totalDebt)}
              </p>
            </div>
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/50 px-1.5 sm:px-2 py-0.5 rounded-full">
            {debtInfo.pendingCount} fact.
          </span>
        </div>
      )}
    </div>
  );
}