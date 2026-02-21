// src/views/labExams/components/LabExamStats.tsx

import { FileText, PawPrint, Calendar, type LucideIcon } from "lucide-react";

interface LabExamStatsProps {
  stats: {
    total: number;
    caninos: number;
    felinos: number;
    thisMonth: number;
  };
}

interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgIcon: string;
}

export function LabExamStats({ stats }: LabExamStatsProps) {
  const items: StatItem[] = [
    {
      label: "Total",
      value: stats.total,
      icon: FileText,
      color: "text-biovet-500",
      bgIcon: "bg-biovet-500/10",
    },
    {
      label: "Caninos",
      value: stats.caninos,
      icon: PawPrint,
      color: "text-biovet-add dark:text-biovet-400",
      bgIcon: "bg-biovet-500/10",
    },
    {
      label: "Felinos",
      value: stats.felinos,
      icon: PawPrint,
      color: "text-biovet-600 dark:text-biovet-300",
      bgIcon: "bg-biovet-500/10",
    },
    {
      label: "Este Mes",
      value: stats.thisMonth,
      icon: Calendar,
      color: "text-slate-700 dark:text-white",
      bgIcon: "bg-surface-100 dark:bg-dark-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {items.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 p-3 shadow-sm flex items-center gap-3"
        >
          <div className={`p-2 rounded-lg ${stat.bgIcon}`}>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-surface-500 dark:text-slate-400 font-medium truncate">
              {stat.label}
            </p>
            <p className={`text-base sm:text-lg font-bold ${stat.color} truncate`}>
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}