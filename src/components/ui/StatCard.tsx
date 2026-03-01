// src/components/ui/StatCard.tsx

import { type LucideIcon } from "lucide-react";

type StatVariant = "primary" | "success" | "warning" | "danger" | "neutral" | "info";

interface CurrencyAmounts {
  USD: number;
  Bs: number;
}

interface RevenueAmounts extends CurrencyAmounts {
  totalUSD: number;
  bsInUSD: number;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  variant?: StatVariant;
  subtitle?: string;
  onClick?: () => void;
  // Para dual currency
  amounts?: CurrencyAmounts | RevenueAmounts;
}

const variantStyles: Record<StatVariant, {
  iconColor: string;
  valueColor: string;
  dotColor: string;
}> = {
  primary: {
    iconColor: "text-biovet-500/10 dark:text-biovet-400/10",
    valueColor: "text-biovet-600 dark:text-biovet-400",
    dotColor: "bg-biovet-500",
  },
  success: {
    iconColor: "text-success-500/10 dark:text-success-400/10",
    valueColor: "text-success-600 dark:text-success-400",
    dotColor: "bg-success-500",
  },
  warning: {
    iconColor: "text-warning-500/10 dark:text-warning-400/10",
    valueColor: "text-warning-600 dark:text-warning-400",
    dotColor: "bg-warning-500",
  },
  danger: {
    iconColor: "text-danger-500/10 dark:text-danger-400/10",
    valueColor: "text-danger-600 dark:text-danger-400",
    dotColor: "bg-danger-500",
  },
  neutral: {
    iconColor: "text-slate-500/10 dark:text-slate-400/10",
    valueColor: "text-slate-700 dark:text-slate-200",
    dotColor: "bg-slate-500",
  },
  info: {
    iconColor: "text-biovet-600/10 dark:text-biovet-300/10",
    valueColor: "text-biovet-600 dark:text-biovet-300",
    dotColor: "bg-biovet-600 dark:bg-biovet-300",
  },
};

function isRevenueAmounts(
  amounts: CurrencyAmounts | RevenueAmounts
): amounts is RevenueAmounts {
  return "totalUSD" in amounts;
}

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  variant = "primary",
  subtitle,
  onClick,
  amounts
}: StatCardProps) {
  const styles = variantStyles[variant];

  const formatUSD = (amount: number) => `$${amount.toFixed(2)}`;
  const formatBs = (amount: number) =>
    `Bs. ${amount.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Determinar si es dual currency
  const isDualCurrency = !!amounts;
  const hasTotal = amounts && isRevenueAmounts(amounts);
  const hasBs = amounts && amounts.Bs > 0;

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`
        group relative overflow-hidden
        bg-white dark:bg-dark-200 
        rounded-xl border border-surface-200 dark:border-slate-700
        p-4 shadow-sm 
        hover:shadow-md transition-all duration-300
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
      `}
    >
      {/* Icono marca de agua */}
      <Icon
        className={`
          absolute -bottom-4 -right-4
          w-24 h-24 
          ${styles.iconColor}
          transform rotate-[-15deg]
          transition-all duration-500 ease-out
          group-hover:scale-110 group-hover:rotate-[-10deg]
        `}
        strokeWidth={1.5}
      />

      {/* Contenido */}
      <div className="relative z-10">
        {/* Header con dot y título */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${styles.dotColor}`} />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
            {label}
          </p>
        </div>

        {/* Contenido según tipo */}
        {isDualCurrency && amounts ? (
          // Modo Dual Currency
          <>
            {hasTotal ? (
              // Con totalUSD (RevenueAmounts)
              <>
                <p className={`text-2xl sm:text-3xl font-bold font-heading ${styles.valueColor}`}>
                  {formatUSD(amounts.totalUSD)}
                </p>
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5 mt-1">
                  <p className="font-medium">{formatUSD(amounts.USD)} USD directo</p>
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
              // Sin totalUSD (CurrencyAmounts normal)
              <>
                <p className={`text-2xl sm:text-3xl font-bold font-heading ${styles.valueColor}`}>
                  {formatUSD(amounts.USD)}
                </p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatBs(amounts.Bs)}
                </p>
              </>
            )}
          </>
        ) : (
          // Modo simple (valor único)
          <p className={`text-2xl sm:text-3xl font-bold font-heading ${styles.valueColor}`}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600"></span>
            {subtitle}
            {onClick && (
              <span className="text-biovet-500 dark:text-biovet-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                → Ver
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}