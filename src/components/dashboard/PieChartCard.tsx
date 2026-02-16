import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { LucideIcon } from "lucide-react";

interface PieChartCardProps {
  title: string;
  icon: LucideIcon;
  data: readonly { name: string; value: number }[];
  tooltipLabel: string;
  emptyMessage?: string;
}

// Colores usando la paleta BioVet Track
const CHART_COLORS = [
  "#08708a", // biovet-500
  "#22c55e", // success-500
  "#f59e0b", // warning-500
  "#ef4444", // danger-500
  "#0077B6", // biovet-add
  "#5db0c6", // biovet-400
  "#16a34a", // success-600
  "#d97706", // warning-600
];

export function PieChartCard({
  title,
  icon: Icon,
  data,
  tooltipLabel,
  emptyMessage = "Sin datos disponibles",
}: PieChartCardProps) {
  const isEmpty = data.length === 0;

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="bg-white dark:bg-dark-100 
                        border border-surface-300 dark:border-slate-700 
                        rounded-lg px-3 py-2 shadow-xl"
        >
          <p className="text-surface-800 dark:text-white font-medium text-sm">
            {payload[0].name}
          </p>
          <p className="text-surface-500 dark:text-slate-400 text-xs">
            {tooltipLabel}:{" "}
            <span className="text-biovet-500 dark:text-biovet-400 font-semibold">
              {payload[0].value}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Legend personalizada
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-surface-500 dark:text-slate-400 font-medium">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="bg-white/40 dark:bg-dark-100/40 
                    backdrop-blur-sm rounded-2xl 
                    border border-surface-300 dark:border-slate-700 
                    p-4 lg:p-6 shadow-sm"
    >
      {/* Header */}
      <h2 className="font-semibold text-surface-800 dark:text-white mb-4 flex items-center gap-2">
        <div
          className="p-1.5 
                        bg-biovet-50 dark:bg-biovet-950 
                        rounded-lg 
                        border border-biovet-200 dark:border-biovet-800"
        >
          <Icon className="w-4 h-4 text-biovet-500 dark:text-biovet-400" />
        </div>
        {title}
      </h2>

      {/* Chart */}
      <div className="h-64">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div
              className="w-12 h-12 
                            bg-surface-100 dark:bg-dark-200 
                            rounded-full flex items-center justify-center mb-3 
                            border border-surface-300 dark:border-slate-700"
            >
              <Icon className="w-6 h-6 text-surface-500 dark:text-slate-500" />
            </div>
            <p className="text-surface-500 dark:text-slate-400 text-sm">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[...data]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                stroke="transparent"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    style={{
                      filter: `drop-shadow(0 0 2px ${CHART_COLORS[index % CHART_COLORS.length]}40)`,
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}