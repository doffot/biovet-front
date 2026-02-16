import type { LucideIcon } from "lucide-react";
import type { CurrencyAmounts } from "../../constants/dashboardConstants";
import type { RevenueAmounts } from "../../hooks/useDashboardData";

interface DualCurrencyCardProps {
  title: string;
  amounts: CurrencyAmounts | RevenueAmounts;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  iconBgColor?: string;
  onClick?: () => void;
}

function isRevenueAmounts(
  amounts: CurrencyAmounts | RevenueAmounts
): amounts is RevenueAmounts {
  return "totalUSD" in amounts;
}

export function DualCurrencyCard({
  title,
  amounts,
  subtitle,
  icon: Icon,
  color,
  bgColor,
  iconBgColor = "bg-surface-50 dark:bg-dark-200",
  onClick,
}: DualCurrencyCardProps) {
  const formatUSD = (amount: number) => `$${amount.toFixed(2)}`;
  const formatBs = (amount: number) =>
    `Bs ${amount.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const isClickable = !!onClick;
  const hasTotal = isRevenueAmounts(amounts);
  const hasBs = amounts.Bs > 0;

  return (
    <div
      className={`
        ${bgColor} rounded-xl p-4 shadow-sm 
        border border-surface-300 dark:border-slate-700
        transition-all duration-300 group
        ${
          isClickable
            ? "cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            : "hover:shadow-md"
        }
      `}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Título */}
          <p className="text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            {title}
          </p>

          {/* Total en USD (si tiene) */}
          {hasTotal ? (
            <>
              <p className={`text-2xl font-bold ${color} mb-1`}>
                {formatUSD(amounts.totalUSD)}
              </p>
              <div className="text-xs text-surface-500 dark:text-slate-400 space-y-1">
                <p className="font-medium">{formatUSD(amounts.USD)} USD</p>
                {hasBs && (
                  <p className="font-medium">
                    {formatUSD(amounts.bsInUSD)}{" "}
                    <span className="opacity-70">
                      ({formatBs(amounts.Bs)})
                    </span>
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* USD */}
              <p className={`text-2xl font-bold ${color} mb-1`}>
                {formatUSD(amounts.USD)}
              </p>
              {/* Bolívares */}
              <p className="text-sm font-semibold text-surface-500 dark:text-slate-400">
                {formatBs(amounts.Bs)}
              </p>
            </>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-surface-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-surface-400 dark:bg-slate-600"></span>
              {subtitle}
              {isClickable && (
                <span
                  className="text-biovet-500 dark:text-biovet-400 
                             opacity-0 group-hover:opacity-100 
                             transition-opacity ml-1"
                >
                  → Ver detalles
                </span>
              )}
            </p>
          )}
        </div>

        {/* Icono con fondo personalizable */}
        <div
          className={`
            ${iconBgColor} 
            p-3 rounded-xl 
            group-hover:scale-110 
            transition-all duration-300
            shadow-sm
            border border-surface-300 dark:border-slate-700
          `}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}