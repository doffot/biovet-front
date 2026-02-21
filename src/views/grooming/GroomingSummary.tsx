// src/views/reports/GroomingReportSummary.tsx
import { useState, useMemo } from "react";
import { DollarSign, TrendingUp, Clock, Banknote } from "lucide-react";
import { DateRangeSelector } from "@/components/invoices/DateRangeSelector";
import type { EnrichedGroomingService } from "./GroomingReportView";
import type { DateRangeType } from "@/types/reportTypes";

interface GroomingReportSummaryProps {
  services: EnrichedGroomingService[];
}

interface DateFilters {
  dateRange: DateRangeType;
  customFrom: string;
  customTo: string;
}

/* ── Helper para calcular fechas según el filtro ── */
const getFilterDates = (filters: DateFilters): { startDate: Date; endDate: Date } => {
  const now = new Date();
  let startDate: Date;
  let endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  switch (filters.dateRange) {
    case "today":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week": {
      const day = now.getDay() || 7;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - day + 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "custom":
      startDate = filters.customFrom
        ? new Date(filters.customFrom + "T00:00:00")
        : new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = filters.customTo
        ? new Date(filters.customTo + "T23:59:59")
        : new Date();
      break;
    case "all":
      startDate = new Date(2020, 0, 1);
      endDate = new Date(2100, 11, 31);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { startDate, endDate };
};

/* ── Helper para label del período ── */
const getPeriodLabel = (filters: DateFilters): string => {
  const now = new Date();
  
  switch (filters.dateRange) {
    case "today":
      return "Hoy";
    case "week":
      return "Esta semana";
    case "month":
      return now.toLocaleDateString("es-VE", { month: "long", year: "numeric" });
    case "year":
      return `Año ${now.getFullYear()}`;
    case "custom":
      if (filters.customFrom && filters.customTo) {
        const from = new Date(filters.customFrom + "T00:00:00");
        const to = new Date(filters.customTo + "T00:00:00");
        
        // Si es un mes completo, mostrar nombre del mes
        if (from.getDate() === 1) {
          const lastDayOfMonth = new Date(from.getFullYear(), from.getMonth() + 1, 0);
          if (to.getTime() === lastDayOfMonth.getTime()) {
            return from.toLocaleDateString("es-VE", { month: "long", year: "numeric" });
          }
        }
        
        return `${from.toLocaleDateString("es-VE", { day: "2-digit", month: "short" })} - ${to.toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" })}`;
      }
      return "Período personalizado";
    case "all":
      return "Todo el historial";
    default:
      return "Este mes";
  }
};

export function GroomingReportSummary({ services }: GroomingReportSummaryProps) {
  /* ── Estado de filtros (por defecto: este mes) ── */
  const [dateFilters, setDateFilters] = useState<DateFilters>({
    dateRange: "month",
    customFrom: "",
    customTo: "",
  });

  /* ── Filtrar servicios por fecha ── */
  const filteredServices = useMemo(() => {
    const { startDate, endDate } = getFilterDates(dateFilters);

    return services.filter((service) => {
      const serviceDate = new Date(service.date);
      return serviceDate >= startDate && serviceDate <= endDate;
    });
  }, [services, dateFilters]);

  /* ── Calcular estadísticas de servicios filtrados ── */
  const stats = useMemo(() => {
    let paidUSD = 0;
    let paidBs = 0;
    let paidBsInUSD = 0;
    let pendingUSD = 0;

    filteredServices.forEach((service) => {
      const cost = service.cost || 0;
      const { paymentInfo } = service;

      paidUSD += paymentInfo.amountPaidUSD;
      paidBs += paymentInfo.amountPaidBs;

      if (paymentInfo.amountPaidBs > 0 && paymentInfo.exchangeRate > 0) {
        paidBsInUSD += paymentInfo.amountPaidBs / paymentInfo.exchangeRate;
      }

      if (!paymentInfo.isPaid) {
        const totalPaidInUSD =
          paymentInfo.amountPaidUSD +
          (paymentInfo.exchangeRate > 0
            ? paymentInfo.amountPaidBs / paymentInfo.exchangeRate
            : 0);
        const pending = cost - totalPaidInUSD;
        if (pending > 0) pendingUSD += pending;
      }
    });

    const totalCobrado = paidUSD + paidBsInUSD;

    return { paidUSD, paidBs, paidBsInUSD, totalCobrado, pendingUSD };
  }, [filteredServices]);

  /* ── Handlers ── */
  const handleDateRangeChange = (dateRange: DateRangeType) => {
    setDateFilters((prev) => ({
      ...prev,
      dateRange,
      ...(dateRange !== "custom" ? { customFrom: "", customTo: "" } : {}),
    }));
  };

  const handleCustomFromChange = (customFrom: string) => {
    setDateFilters((prev) => ({ ...prev, customFrom }));
  };

  const handleCustomToChange = (customTo: string) => {
    setDateFilters((prev) => ({ ...prev, customTo }));
  };

  /* ── Formateo ── */
  const formatUSD = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);

  const formatBs = (amount: number) =>
    `Bs. ${amount.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const hasPaidBs = stats.paidBs > 0;
  const hasPending = stats.pendingUSD > 0;

  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm overflow-hidden">

      {/* ── Header con selector de período ── */}
      <div className="px-6 py-5 border-b border-surface-200 dark:border-slate-700/50 bg-linear-to-r from-biovet-50 to-transparent dark:from-biovet-950/30 dark:to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Total */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-biovet-500 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Cobrado
                </p>
                <span className="text-[10px] text-biovet-600 dark:text-biovet-400 font-medium bg-biovet-100 dark:bg-biovet-900 px-1.5 py-0.5 rounded">
                  {getPeriodLabel(dateFilters)}
                </span>
              </div>
              <p className="text-3xl font-bold font-heading text-biovet-600 dark:text-biovet-300 tabular-nums">
                {formatUSD(stats.totalCobrado)}
              </p>
            </div>
          </div>

          {/* Selector de fecha */}
          <DateRangeSelector
            dateRange={dateFilters.dateRange}
            customFrom={dateFilters.customFrom}
            customTo={dateFilters.customTo}
            onDateRangeChange={handleDateRangeChange}
            onCustomFromChange={handleCustomFromChange}
            onCustomToChange={handleCustomToChange}
          />
        </div>

        {/* Detalle del total */}
        <p className="text-xs text-surface-500 dark:text-slate-400 mt-2 ml-15">
          <span className="text-success-600 dark:text-success-400 font-medium">
            {formatUSD(stats.paidUSD)}
          </span>
          {" USD + "}
          <span className="text-biovet-500 dark:text-biovet-400 font-medium">
            {formatUSD(stats.paidBsInUSD)}
          </span>
          {" (Bs convertidos)"}
          {filteredServices.length > 0 && (
            <span className="text-surface-400 dark:text-slate-500 ml-2">
              • {filteredServices.length} servicio{filteredServices.length !== 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>

      {/* ── Desglose ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-surface-200 dark:divide-slate-700/50">

        {/* Cobrado USD */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-success-50 dark:bg-success-950 flex items-center justify-center border border-success-200 dark:border-success-800">
              <DollarSign className="w-4 h-4 text-success-600 dark:text-success-400" />
            </div>
            <p className="text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
              Cobrado USD
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-200 tabular-nums">
            {formatUSD(stats.paidUSD)}
          </p>
        </div>

        {/* Cobrado Bolívares */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-biovet-50 dark:bg-biovet-950 flex items-center justify-center border border-biovet-200 dark:border-biovet-800">
              <Banknote className="w-4 h-4 text-biovet-600 dark:text-biovet-400" />
            </div>
            <p className="text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
              Cobrado Bs
            </p>
          </div>
          {hasPaidBs ? (
            <>
              <p className="text-2xl font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                {formatUSD(stats.paidBsInUSD)}
              </p>
              <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5 tabular-nums">
                {formatBs(stats.paidBs)}
              </p>
            </>
          ) : (
            <p className="text-2xl font-bold text-surface-400 dark:text-slate-600">
              —
            </p>
          )}
        </div>

        {/* Pendiente */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                hasPending
                  ? "bg-warning-50 dark:bg-warning-950 border-warning-200 dark:border-warning-800"
                  : "bg-surface-100 dark:bg-dark-200 border-surface-300 dark:border-slate-700"
              }`}
            >
              <Clock
                className={`w-4 h-4 ${
                  hasPending
                    ? "text-warning-600 dark:text-warning-400"
                    : "text-surface-400 dark:text-slate-500"
                }`}
              />
            </div>
            <p className="text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
              Pendiente
            </p>
          </div>
          <p
            className={`text-2xl font-bold tabular-nums ${
              hasPending
                ? "text-warning-600 dark:text-warning-400"
                : "text-surface-400 dark:text-slate-600"
            }`}
          >
            {hasPending ? formatUSD(stats.pendingUSD) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}