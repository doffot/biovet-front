import { useState } from "react";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type {
  RevenueAmounts,
  RevenueChartItem,
} from "../../hooks/useDashboardData";

interface RevenueChartProps {
  data: RevenueChartItem[];
  weekRevenue: RevenueAmounts;
  monthRevenue: RevenueAmounts;
}

type CurrencyFilter = "total" | "USD" | "Bs";

export function RevenueChart({
  data,
  weekRevenue,
  monthRevenue,
}: RevenueChartProps) {
  const [currencyFilter, setCurrencyFilter] =
    useState<CurrencyFilter>("total");

  const formatUSD = (amount: number) => `$${amount.toFixed(2)}`;
  const formatBs = (amount: number) =>
    `Bs ${amount.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="bg-white dark:bg-dark-100 
                        border border-surface-300 dark:border-slate-700 
                        rounded-lg px-3 py-2 shadow-xl"
        >
          <p className="text-surface-800 dark:text-white font-medium text-sm mb-1">
            {label}
          </p>
          {payload.map((entry: any) => (
            <p
              key={entry.name}
              className="text-surface-500 dark:text-slate-400 text-xs"
            >
              {entry.name}:{" "}
              <span className="text-biovet-500 dark:text-biovet-400 font-semibold">
                {entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="bg-white/40 dark:bg-dark-100/40 
                    backdrop-blur-sm rounded-2xl 
                    border border-surface-300 dark:border-slate-700 
                    p-4 lg:p-6 shadow-sm"
    >
      <div className="flex flex-col gap-4 mb-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-semibold text-surface-800 dark:text-white flex items-center gap-2">
            <div
              className="p-1.5 
                            bg-success-50 dark:bg-success-950 
                            rounded-lg 
                            border border-success-200 dark:border-success-800"
            >
              <TrendingUp className="w-4 h-4 text-success-500 dark:text-success-400" />
            </div>
            Ingresos Últimos 7 Días
          </h2>

          {/* Filtro de moneda */}
          <div
            className="flex items-center gap-1 
                          bg-surface-100 dark:bg-dark-200 
                          p-1 rounded-lg 
                          border border-surface-300 dark:border-slate-700"
          >
            <button
              onClick={() => setCurrencyFilter("total")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 cursor-pointer ${
                currencyFilter === "total"
                  ? "bg-biovet-500 text-white shadow-sm"
                  : "text-surface-500 dark:text-slate-400 hover:text-surface-800 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-dark-50"
              }`}
            >
              Total USD
            </button>
            <button
              onClick={() => setCurrencyFilter("USD")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 cursor-pointer ${
                currencyFilter === "USD"
                  ? "bg-success-500 text-white shadow-sm"
                  : "text-surface-500 dark:text-slate-400 hover:text-surface-800 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-dark-50"
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrencyFilter("Bs")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 cursor-pointer ${
                currencyFilter === "Bs"
                  ? "bg-warning-500 text-white shadow-sm"
                  : "text-surface-500 dark:text-slate-400 hover:text-surface-800 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-dark-50"
              }`}
            >
              Bs
            </button>
          </div>
        </div>

        {/* Resumen */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {/* Card Semana */}
          <div
            className="flex items-center gap-3 
                          bg-surface-50 dark:bg-dark-200 
                          px-4 py-3 rounded-xl 
                          border border-surface-300 dark:border-slate-700 
                          backdrop-blur-sm"
          >
            <div
              className="p-2 
                            bg-biovet-50 dark:bg-biovet-950 
                            rounded-lg 
                            border border-biovet-200 dark:border-biovet-800"
            >
              <Calendar className="w-4 h-4 text-biovet-500 dark:text-biovet-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-surface-500 dark:text-slate-400 text-xs">
                Semana
              </span>
              <span className="font-bold text-biovet-500 dark:text-biovet-400 text-lg">
                {formatUSD(weekRevenue.totalUSD)}
              </span>
              <span className="text-[10px] text-surface-500/80 dark:text-slate-500">
                {formatUSD(weekRevenue.USD)} + {formatBs(weekRevenue.Bs)}
              </span>
            </div>
          </div>

          {/* Card Mes */}
          <div
            className="flex items-center gap-3 
                          bg-surface-50 dark:bg-dark-200 
                          px-4 py-3 rounded-xl 
                          border border-surface-300 dark:border-slate-700 
                          backdrop-blur-sm"
          >
            <div
              className="p-2 
                            bg-success-50 dark:bg-success-950 
                            rounded-lg 
                            border border-success-200 dark:border-success-800"
            >
              <DollarSign className="w-4 h-4 text-success-500 dark:text-success-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-surface-500 dark:text-slate-400 text-xs">
                Mes
              </span>
              <span className="font-bold text-success-500 dark:text-success-400 text-lg">
                {formatUSD(monthRevenue.totalUSD)}
              </span>
              <span className="text-[10px] text-surface-500/80 dark:text-slate-500">
                {formatUSD(monthRevenue.USD)} + {formatBs(monthRevenue.Bs)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              {/* Gradiente Total - biovet-500 */}
              <linearGradient id="gradient-total" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#08708a" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#08708a" stopOpacity={0.3} />
              </linearGradient>
              {/* Gradiente USD - success-500 */}
              <linearGradient id="gradient-usd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.3} />
              </linearGradient>
              {/* Gradiente Bs - warning-500 */}
              <linearGradient id="gradient-bs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#dfe3e8"
              vertical={false}
              className="dark:[&>line]:stroke-slate-700"
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#919eab" }}
              stroke="#dfe3e8"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#919eab" }}
              stroke="transparent"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "#f4f6f8", opacity: 0.4 }}
            />
            {currencyFilter !== "total" && (
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                formatter={(value) => (
                  <span style={{ color: "#919eab", fontSize: "12px" }}>
                    {value}
                  </span>
                )}
              />
            )}

            {currencyFilter === "total" && (
              <Bar
                dataKey="totalUSD"
                fill="url(#gradient-total)"
                radius={[8, 8, 0, 0]}
                name="Total USD"
                animationDuration={600}
                animationBegin={0}
              />
            )}
            {currencyFilter === "USD" && (
              <Bar
                dataKey="USD"
                fill="url(#gradient-usd)"
                radius={[8, 8, 0, 0]}
                name="USD"
                animationDuration={600}
                animationBegin={0}
              />
            )}
            {currencyFilter === "Bs" && (
              <Bar
                dataKey="Bs"
                fill="url(#gradient-bs)"
                radius={[8, 8, 0, 0]}
                name="Bs"
                animationDuration={600}
                animationBegin={0}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}