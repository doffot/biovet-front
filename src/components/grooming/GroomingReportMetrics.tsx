// src/components/grooming/GroomingReportMetrics.tsx
import { useMemo } from "react";
import {
  Scissors,
  CheckCircle,
  Clock,
  FileX,
} from "lucide-react";
import type { EnrichedGroomingService } from "@/views/grooming/GroomingReportView";

interface GroomingReportMetricsProps {
  services: EnrichedGroomingService[];
}

export function GroomingReportMetrics({
  services,
}: GroomingReportMetricsProps) {
  const stats = useMemo(() => {
    const total = services.length;
    const paid = services.filter(
      (s) => s.paymentInfo.paymentStatus === "Pagado"
    ).length;
    const pending = services.filter(
      (s) =>
        s.paymentInfo.paymentStatus === "Pendiente" ||
        s.paymentInfo.paymentStatus === "Parcial"
    ).length;
    const notInvoiced = services.filter(
      (s) => s.paymentInfo.paymentStatus === "Sin facturar"
    ).length;

    return { total, paid, pending, notInvoiced };
  }, [services]);

  const metrics = [
    {
      label: "Total",
      value: stats.total,
      icon: Scissors,
      bg: "bg-biovet-50 dark:bg-biovet-950",
      iconColor: "text-biovet-500",
      border: "border-biovet-200 dark:border-biovet-800",
      valueColor: "text-slate-800 dark:text-slate-100",
    },
    {
      label: "Pagados",
      value: stats.paid,
      icon: CheckCircle,
      bg: "bg-success-50 dark:bg-success-950",
      iconColor: "text-success-500",
      border: "border-success-200 dark:border-success-800",
      valueColor: "text-success-600 dark:text-success-400",
    },
    {
      label: "Pendientes",
      value: stats.pending,
      icon: Clock,
      bg: "bg-warning-50 dark:bg-warning-950",
      iconColor: "text-warning-500",
      border: "border-warning-200 dark:border-warning-800",
      valueColor: "text-warning-600 dark:text-warning-400",
    },
    {
      label: "Sin facturar",
      value: stats.notInvoiced,
      icon: FileX,
      bg: "bg-surface-100 dark:bg-dark-200",
      iconColor: "text-surface-500 dark:text-slate-400",
      border: "border-surface-300 dark:border-slate-700",
      valueColor: "text-surface-500 dark:text-slate-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.label}
            className={`${metric.bg} border ${metric.border} rounded-xl p-4 text-center transition-shadow`}
          >
            <div className="flex justify-center mb-2">
              <Icon className={`w-5 h-5 ${metric.iconColor}`} />
            </div>
            <p className={`text-2xl sm:text-3xl font-bold ${metric.valueColor}`}>
              {metric.value}
            </p>
            <p className="text-[11px] text-surface-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-medium">
              {metric.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}