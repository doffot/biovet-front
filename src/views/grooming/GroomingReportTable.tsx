// src/views/reports/GroomingReportTable.tsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  ChevronDown,
  Eye,
  Scissors,
  RefreshCw,
} from "lucide-react";

import type { EnrichedGroomingService } from "./GroomingReportView";
import type { DateRangeType } from "@/types/reportTypes";
import { DateRangeSelector } from "@/components/invoices/DateRangeSelector";

interface GroomingReportTableProps {
  services: EnrichedGroomingService[];
}

interface DateFilters {
  dateRange: DateRangeType;
  customFrom: string;
  customTo: string;
}

type StatusFilter =
  | "all"
  | "Pagado"
  | "Pendiente"
  | "Parcial"
  | "Sin facturar";
type ServiceTypeFilter = "" | "Baño" | "Corte" | "Corte y Baño";

const PAGE_SIZE = 8;

/* ──────────────────────────────────────────
   STATUS BADGE – usa clases badge del global
   ────────────────────────────────────────── */
const STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  Pagado: {
    label: "Pagado",
    badgeClass: "badge badge-success",
  },
  Pendiente: {
    label: "Debe",
    badgeClass: "badge badge-danger",
  },
  Parcial: {
    label: "Debe",
    badgeClass: "badge badge-danger",
  },
  "Sin facturar": {
    label: "Sin facturar",
    badgeClass: "badge badge-neutral",
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["Sin facturar"];
  return <span className={config.badgeClass}>{config.label}</span>;
}

/* ──────────────────────────────────────────
   DATE FILTER HELPER
   ────────────────────────────────────────── */
const getFilterDates = (
  filters: DateFilters
): { startDate: Date; endDate: Date } => {
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

/* ──────────────────────────────────────────
   EXPORT CSV
   ────────────────────────────────────────── */
function exportGroomingToCSV(
  data: EnrichedGroomingService[],
  filename: string
) {
  if (data.length === 0) return;

  const headers = [
    "Fecha",
    "Cliente",
    "Teléfono",
    "Paciente",
    "Servicio",
    "Estado",
    "Costo USD",
    "Pagado USD",
    "Pagado Bs",
  ];

  const rows = data.map((s) => [
    new Date(s.date).toLocaleDateString("es-ES"),
    s.ownerName || "",
    s.ownerPhone || "",
    s.patientName || "",
    s.service || "",
    s.paymentInfo.paymentStatus,
    (s.cost || 0).toFixed(2),
    s.paymentInfo.amountPaidUSD.toFixed(2),
    s.paymentInfo.amountPaidBs.toFixed(2),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/* ──────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────── */
export function GroomingReportTable({
  services,
}: GroomingReportTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dateFilters, setDateFilters] = useState<DateFilters>({
    dateRange: "month",
    customFrom: "",
    customTo: "",
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [serviceTypeFilter, setServiceTypeFilter] =
    useState<ServiceTypeFilter>("");

  /* ── Filtrado ── */
  const filteredServices = useMemo(() => {
    const { startDate, endDate } = getFilterDates(dateFilters);

    return services.filter((service) => {
      const serviceDate = new Date(service.date);
      if (serviceDate < startDate || serviceDate > endDate) return false;
      if (
        statusFilter !== "all" &&
        service.paymentInfo.paymentStatus !== statusFilter
      )
        return false;
      if (serviceTypeFilter && service.service !== serviceTypeFilter)
        return false;
      return true;
    });
  }, [services, dateFilters, statusFilter, serviceTypeFilter]);

  /* ── Paginación ── */
  const totalPages = Math.ceil(filteredServices.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentServices = filteredServices.slice(startIndex, endIndex);

  const allCurrentSelected =
    currentServices.length > 0 &&
    currentServices.every((s) => s._id && selectedIds.has(s._id));

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  /* ── Selección ── */
  const toggleSelectAll = () => {
    const newSelected = new Set(selectedIds);
    if (allCurrentSelected) {
      currentServices.forEach((s) => {
        if (s._id) newSelected.delete(s._id);
      });
    } else {
      currentServices.forEach((s) => {
        if (s._id) newSelected.add(s._id);
      });
    }
    setSelectedIds(newSelected);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const clearSelection = () => setSelectedIds(new Set());

  /* ── Export ── */
  const handleExportCSV = () => {
    const toExport =
      selectedIds.size > 0
        ? filteredServices.filter((s) => s._id && selectedIds.has(s._id))
        : filteredServices;
    exportGroomingToCSV(toExport, "reporte-peluqueria");
  };

  /* ── Reset ── */
  const resetFilters = () => {
    setDateFilters({ dateRange: "month", customFrom: "", customTo: "" });
    setStatusFilter("all");
    setServiceTypeFilter("");
    setCurrentPage(1);
  };

  /* ── Date handlers ── */
  const handleDateRangeChange = (dateRange: DateRangeType) => {
    setCurrentPage(1);
    setDateFilters((prev) => ({
      ...prev,
      dateRange,
      ...(dateRange !== "custom" ? { customFrom: "", customTo: "" } : {}),
    }));
  };

  const handleCustomFromChange = (customFrom: string) =>
    setDateFilters((prev) => ({ ...prev, customFrom }));

  const handleCustomToChange = (customTo: string) =>
    setDateFilters((prev) => ({ ...prev, customTo }));

  /* ── Formateo ── */
  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatCurrency = (
    amount: number,
    currency: "USD" | "Bs" = "USD"
  ): string => {
    if (currency === "Bs") {
      return `Bs. ${amount.toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getPatientId = (service: EnrichedGroomingService): string => {
    if (!service.patientId) return "";
    if (typeof service.patientId === "string") return service.patientId;
    return service.patientId._id || "";
  };

  /* ════════════════════════════════════════
     RENDER
     ════════════════════════════════════════ */
  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm overflow-hidden">

      {/* ── TOOLBAR ── */}
      <div className="px-4 py-3 border-b border-surface-300 dark:border-slate-700 bg-surface-50 dark:bg-dark-200 flex flex-wrap items-center justify-between gap-3">

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          <DateRangeSelector
            dateRange={dateFilters.dateRange}
            customFrom={dateFilters.customFrom}
            customTo={dateFilters.customTo}
            onDateRangeChange={handleDateRangeChange}
            onCustomFromChange={handleCustomFromChange}
            onCustomToChange={handleCustomToChange}
          />

          {/* Select Estado */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setCurrentPage(1);
              }}
              className="input sm:w-44 pr-8 appearance-none"
            >
              <option value="all">Todos los estados</option>
              <option value="Pagado">Pagado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Parcial">Parcial</option>
              <option value="Sin facturar">Sin facturar</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-slate-500 pointer-events-none" />
          </div>

          {/* Select Tipo servicio */}
          <div className="relative">
            <select
              value={serviceTypeFilter}
              onChange={(e) => {
                setServiceTypeFilter(e.target.value as ServiceTypeFilter);
                setCurrentPage(1);
              }}
              className="input sm:w-44 pr-8 appearance-none"
            >
              <option value="">Todos los servicios</option>
              <option value="Baño">Baño</option>
              <option value="Corte">Corte</option>
              <option value="Corte y Baño">Corte y Baño</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-slate-500 pointer-events-none" />
          </div>

          {/* Limpiar filtros */}
          <button onClick={resetFilters} className="btn-ghost text-xs px-3! py-2! gap-1.5!">
            <RefreshCw className="w-3.5 h-3.5" />
            Limpiar
          </button>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 dark:text-slate-400">
                {selectedIds.size} seleccionado
                {selectedIds.size > 1 ? "s" : ""}
              </span>
              <button
                onClick={clearSelection}
                className="text-xs font-medium text-biovet-500 hover:text-biovet-600 dark:text-biovet-400 dark:hover:text-biovet-300 cursor-pointer transition-colors"
              >
                Deseleccionar
              </button>
            </div>
          )}

          <button
            onClick={handleExportCSV}
            disabled={filteredServices.length === 0}
            className="btn-secondary text-xs px-3! py-2!"
          >
            <Download className="w-3.5 h-3.5" />
            {selectedIds.size > 0
              ? `Exportar (${selectedIds.size})`
              : "Exportar CSV"}
          </button>
        </div>
      </div>

      {/* ── EMPTY STATE ── */}
      {filteredServices.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-14 h-14 mx-auto mb-3 bg-surface-100 dark:bg-dark-200 rounded-full flex items-center justify-center border border-surface-300 dark:border-slate-700">
            <Scissors className="w-7 h-7 text-surface-400 dark:text-slate-500" />
          </div>
          <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
            No hay servicios para mostrar
          </p>
          <p className="text-surface-500 dark:text-slate-400 text-xs">
            Ajusta los filtros o el período
          </p>
        </div>
      ) : (
        <>
          {/* ── TABLE ── */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700 z-10">
                <tr>
                  {/* Checkbox */}
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allCurrentSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-surface-300 dark:border-slate-600 text-biovet-500 focus:ring-biovet-400 cursor-pointer accent-biovet-500"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                    Servicio
                  </th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                    Costo
                  </th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                    USD
                  </th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                    Bs
                  </th>
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-surface-200 dark:divide-slate-700/50">
                {currentServices.map((service) => {
                  const isSelected = service._id
                    ? selectedIds.has(service._id)
                    : false;
                  const paidUSD = service.paymentInfo.amountPaidUSD;
                  const paidBs = service.paymentInfo.amountPaidBs;
                  const patientId = getPatientId(service);

                  return (
                    <tr
                      key={service._id}
                      className={`
                        transition-colors
                        hover:bg-surface-50 dark:hover:bg-dark-200/50
                        ${isSelected ? "bg-biovet-50/40 dark:bg-biovet-950/20" : ""}
                      `}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            service._id && toggleSelect(service._id)
                          }
                          className="w-4 h-4 rounded border-surface-300 dark:border-slate-600 text-biovet-500 focus:ring-biovet-400 cursor-pointer accent-biovet-500"
                        />
                      </td>

                      {/* Fecha */}
                      <td className="px-4 py-3 text-sm text-surface-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(service.date)}
                      </td>

                      {/* Cliente */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-45">
                          {service.ownerName}
                        </p>
                        {service.ownerPhone && (
                          <p className="text-[11px] text-surface-500 dark:text-slate-400 mt-0.5">
                            {service.ownerPhone}
                          </p>
                        )}
                      </td>

                      {/* Servicio */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-slate-700 dark:text-slate-200">
                          {service.service}
                        </p>
                        <p className="text-[11px] text-surface-500 dark:text-slate-400 mt-0.5">
                          {service.patientName}
                        </p>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3 text-center">
                        <StatusBadge
                          status={service.paymentInfo.paymentStatus}
                        />
                      </td>

                      {/* Costo */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                          {formatCurrency(service.cost || 0)}
                        </span>
                      </td>

                      {/* Pagado USD */}
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span
                          className={`text-sm tabular-nums ${
                            paidUSD > 0
                              ? "text-success-600 dark:text-success-400 font-medium"
                              : "text-surface-400 dark:text-slate-600"
                          }`}
                        >
                          {paidUSD > 0
                            ? formatCurrency(paidUSD, "USD")
                            : "—"}
                        </span>
                      </td>

                      {/* Pagado Bs */}
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span
                          className={`text-sm tabular-nums ${
                            paidBs > 0
                              ? "text-biovet-500 dark:text-biovet-300 font-medium"
                              : "text-surface-400 dark:text-slate-600"
                          }`}
                        >
                          {paidBs > 0
                            ? formatCurrency(paidBs, "Bs")
                            : "—"}
                        </span>
                      </td>

                      {/* Acción ver */}
                      <td className="px-4 py-3">
                        <Link
                          to={`/patients/${patientId}/grooming-services/${service._id}`}
                          className="
                            inline-flex items-center justify-center
                            w-8 h-8 rounded-lg
                            text-surface-400 dark:text-slate-500
                            hover:text-biovet-500 dark:hover:text-biovet-400
                            hover:bg-biovet-50 dark:hover:bg-biovet-950
                            transition-colors cursor-pointer
                          "
                          title="Ver servicio"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── PAGINACIÓN ── */}
          {totalPages > 1 && (
            <div className="shrink-0 px-4 py-3 bg-surface-50 dark:bg-dark-200 border-t border-surface-300 dark:border-slate-700 flex items-center justify-between">
              <p className="text-[11px] text-surface-500 dark:text-slate-400 font-medium">
                {startIndex + 1}–
                {Math.min(endIndex, filteredServices.length)} de{" "}
                {filteredServices.length}
              </p>

              <div className="flex gap-1.5">
                {/* Anterior */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="
                    px-3 py-1.5 text-xs font-medium rounded-lg
                    border border-surface-300 dark:border-slate-700
                    text-slate-700 dark:text-slate-200
                    hover:bg-surface-100 dark:hover:bg-dark-50
                    disabled:opacity-40 disabled:pointer-events-none
                    transition-colors cursor-pointer
                  "
                >
                  Anterior
                </button>

                {/* Números */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalPages <= 5) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, index, arr) => {
                      const prevPage = arr[index - 1];
                      const showEllipsis =
                        prevPage && page - prevPage > 1;

                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsis && (
                            <span className="text-surface-400 dark:text-slate-500 px-1 text-xs">
                              …
                            </span>
                          )}
                          <button
                            onClick={() => goToPage(page)}
                            className={`
                              w-8 h-8 rounded-lg text-xs font-medium
                              transition-all cursor-pointer
                              ${
                                currentPage === page
                                  ? "bg-biovet-500 text-white shadow-sm"
                                  : "border border-surface-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-biovet-400 dark:hover:border-biovet-500"
                              }
                            `}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>

                {/* Siguiente */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="
                    px-3 py-1.5 text-xs font-medium rounded-lg
                    border border-surface-300 dark:border-slate-700
                    text-slate-700 dark:text-slate-200
                    hover:bg-surface-100 dark:hover:bg-dark-50
                    disabled:opacity-40 disabled:pointer-events-none
                    transition-colors cursor-pointer
                  "
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}