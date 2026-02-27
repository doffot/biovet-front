// src/components/labexam/LabExamStats.tsx

import { FileText, PawPrint, Calendar } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";

interface LabExamStatsProps {
  stats: {
    total: number;
    caninos: number;
    felinos: number;
    thisMonth: number;
  };
}

export function LabExamStats({ stats }: LabExamStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="Total Exámenes"
        value={stats.total}
        icon={FileText}
        variant="primary"
      />
      <StatCard
        label="Caninos"
        value={stats.caninos}
        icon={PawPrint}
        variant="success"
      />
      <StatCard
        label="Felinos"
        value={stats.felinos}
        icon={PawPrint}
        variant="info"
      />
      <StatCard
        label="Este Mes"
        value={stats.thisMonth}
        icon={Calendar}
        variant="neutral"
      />
    </div>
  );
}