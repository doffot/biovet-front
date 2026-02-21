interface ReportMetricsProps {
  total: number;
  paid: number;
  pending: number;
  partial: number;
}

interface MetricItemProps {
  value: number;
  label: string;
  variant?: "default" | "success" | "warning" | "info";
}

function MetricItem({ value, label, variant = "default" }: MetricItemProps) {
  const valueColors = {
    default: "text-vet-text",
    success: "text-emerald-500",
    warning: "text-amber-500",
    info: "text-vet-primary",
  };

  const bgColors = {
    default: "bg-card border-border",
    success: "bg-emerald-500/10 border-emerald-500/20",
    warning: "bg-amber-500/10 border-amber-500/20",
    info: "bg-vet-primary/10 border-vet-primary/20",
  };

  return (
    <div className={`${bgColors[variant]} border rounded-lg p-4 text-center shadow-sm`}>
      <p className={`text-3xl font-bold ${valueColors[variant]}`}>{value}</p>
      <p className="text-xs text-vet-muted mt-1 uppercase tracking-wide">{label}</p>
    </div>
  );
}

export function ReportMetrics({ total, paid, pending, partial }: ReportMetricsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <MetricItem value={total} label="Total" />
      <MetricItem value={paid} label="Pagadas" variant="success" />
      <MetricItem value={pending} label="Pendientes" variant="warning" />
      <MetricItem value={partial} label="Parciales" variant="info" />
    </div>
  );
}