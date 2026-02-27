// src/components/ui/StatCard.tsx

import { type LucideIcon } from "lucide-react";

type StatVariant = "primary" | "success" | "warning" | "danger" | "neutral" | "info";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  variant?: StatVariant;
  subtitle?: string;
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

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  variant = "primary",
  subtitle 
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className="
        group relative overflow-hidden
        bg-white dark:bg-dark-200 
        rounded-xl border border-surface-200 dark:border-slate-700
        p-4 shadow-sm 
        hover:shadow-md transition-all duration-300
      "
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
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-2 h-2 rounded-full ${styles.dotColor}`} />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
            {label}
          </p>
        </div>

        <p className={`text-2xl sm:text-3xl font-bold font-heading ${styles.valueColor}`}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>

        {subtitle && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}