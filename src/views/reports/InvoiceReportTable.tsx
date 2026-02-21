// src/views/reports/InvoiceReportTable.tsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  ChevronDown,
  Eye,
  FileText,
  RefreshCw,
} from "lucide-react";

import { DateRangeSelector } from "@/components/invoices/DateRangeSelector";
import type { EnrichedInvoice } from "./InvoiceReportView";
import type { DateRangeType } from "@/types/reportTypes";
import { getOwnerName, getPatientName } from "@/types/invoice";

interface InvoiceReportTableProps {
  invoices: EnrichedInvoice[];
}

interface DateFilters {
  dateRange: DateRangeType;
  customFrom: string;
  customTo: string;
}

type StatusFilter = "all" | "Pagado" | "Pendiente" | "Parcial" | "Cancelado";

const PAGE_SIZE = 10;

/* ── Status Badge Config ── */
const STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  Pagado: { label: "Pagado", badgeClass: "badge badge-success" },
  Pendiente: { label: "Pendiente", badgeClass: "badge badge-danger" },
  Parcial: { label: "Parcial", badgeClass: "badge badge-warning" },
  Cancelado: { label: "Cancelado", badgeClass: "badge badge-neutral" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["Pendiente"];
  return <span className={config.badgeClass}>{config.label}</span>;
}

/* ── Helper para calcular fechas ── */
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

/* ── Export CSV ── */
function exportInvoicesToCSV(data: EnrichedInvoice[], filename: string) {
  if (data.length === 0) return;

  const headers = [
    "Fecha",
    "Cliente",
    "Paciente",
    "Items",
    "Total",
    "Estado",
    "Pagado USD",
    "Pagado Bs",
    "Pendiente",
  ];

  const rows = data.map((inv) => {
    const itemsDesc = inv.items.map((i) => i.description).join("; ");
    const totalPaidUSD =
      (inv.amountPaidUSD || 0) +
      ((inv.exchangeRate || 0) > 0
        ? (inv.amountPaidBs || 0) / (inv.exchangeRate || 1)
        : 0);
    const pending = Math.max(0, inv.total - totalPaidUSD);

    return [
      new Date(inv.date).toLocaleDateString("es-ES"),
      getOwnerName(inv),
      getPatientName(inv),
      itemsDesc,
      inv.total.toFixed(2),
      inv.paymentStatus,
      (inv.amountPaidUSD || 0).toFixed(2),
      (inv.amountPaidBs || 0).toFixed(2),
      pending.toFixed(2),
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function InvoiceReportTable({ invoices }: InvoiceReportTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dateFilters, setDateFilters] = useState<DateFilters>({
    dateRange: "month",
    customFrom: "",
    customTo: "",
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  /* ── Filtrado ── */
  const filteredInvoices = useMemo(() => {
    const { startDate, endDate } = getFilterDates(dateFilters);

    return invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.date);
      if (invoiceDate < startDate || invoiceDate > endDate) return false;
      if (statusFilter !== "all" && invoice.paymentStatus !== statusFilter) return false;
      return true;
    });
  }, [invoices, dateFilters, statusFilter]);

  /* ── Paginación ── */
  const totalPages = Math.ceil(filteredInvoices.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  const allCurrentSelected =
    currentInvoices.length > 0 &&
    currentInvoices.every((inv) => inv._id && selectedIds.has(inv._id));

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  /* ── Selección ── */
  const toggleSelectAll = () => {
    const newSelected = new Set(selectedIds);
    if (allCurrentSelected) {
      currentInvoices.forEach((inv) => {
        if (inv._id) newSelected.delete(inv._id);
      });
    } else {
      currentInvoices.forEach((inv) => {
        if (inv._id) newSelected.add(inv._id);
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
        ? filteredInvoices.filter((inv) => inv._id && selectedIds.has(inv._id))
        : filteredInvoices;
    exportInvoicesToCSV(toExport, "reporte-facturacion");
  };

  /* ── Reset ── */
  const resetFilters = () => {
    setDateFilters({ dateRange: "month", customFrom: "", customTo: "" });
    setStatusFilter("all");
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

  const formatCurrency = (amount: number, currency: "USD" | "Bs" = "USD"): string => {
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

  /* ── Helpers ── */
  const getItemsSummary = (invoice: EnrichedInvoice): string => {
    if (invoice.items.length === 1) {
      return invoice.items[0].description;
    }
    return `${invoice.items.length} items`;
  };

  const getOwnerPhone = (invoice: EnrichedInvoice): string | undefined => {
    if (invoice.ownerPhone) return invoice.ownerPhone;
    if (typeof invoice.ownerId === "object" && invoice.ownerId?.contact) {
      return invoice.ownerId.contact;
    }
    return undefined;
  };

  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* ── TOOLBAR ── */}
      <div className="px-4 py-3 border-b border-surface-300 dark:border-slate-700 bg-surface-50 dark:bg-dark-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de fecha */}
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
              <option value="Cancelado">Cancelado</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-slate-500 pointer-events-none" />
          </div>

          {/* Limpiar */}
          <button onClick={resetFilters} className="btn-ghost text-xs !px-3 !py-2 !gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Limpiar
          </button>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 dark:text-slate-400">
                {selectedIds.size} seleccionada{selectedIds.size > 1 ? "s" : ""}
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
            disabled={filteredInvoices.length === 0}
            className="btn-secondary text-xs !px-3 !py-2"
          >
            <Download className="w-3.5 h-3.5" />
            {selectedIds.size > 0 ? `Exportar (${selectedIds.size})` : "Exportar CSV"}
          </button>
        </div>
      </div>

      {/* ── EMPTY STATE ── */}
      {filteredInvoices.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-14 h-14 mx-auto mb-3 bg-surface-100 dark:bg-dark-200 rounded-full flex items-center justify-center border border-surface-300 dark:border-slate-700">
            <FileText className="w-7 h-7 text-surface-400 dark:text-slate-500" />
          </div>
          <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
            No hay facturas para mostrar
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
                    Descripción
                  </th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                    Total
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
                {currentInvoices.map((invoice) => {
                  const isSelected = invoice._id ? selectedIds.has(invoice._id) : false;
                  const paidUSD = invoice.amountPaidUSD || 0;
                  const paidBs = invoice.amountPaidBs || 0;
                  const ownerPhone = getOwnerPhone(invoice);

                  return (
                    <tr
                      key={invoice._id}
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
                          onChange={() => invoice._id && toggleSelect(invoice._id)}
                          className="w-4 h-4 rounded border-surface-300 dark:border-slate-600 text-biovet-500 focus:ring-biovet-400 cursor-pointer accent-biovet-500"
                        />
                      </td>

                      {/* Fecha */}
                      <td className="px-4 py-3 text-sm text-surface-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(invoice.date)}
                      </td>

                      {/* Cliente */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
                          {getOwnerName(invoice)}
                        </p>
                        {ownerPhone && (
                          <p className="text-[11px] text-surface-500 dark:text-slate-400 mt-0.5">
                            {ownerPhone}
                          </p>
                        )}
                      </td>

                      {/* Descripción */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
                          {getItemsSummary(invoice)}
                        </p>
                        <p className="text-[11px] text-surface-500 dark:text-slate-400 mt-0.5">
                          {getPatientName(invoice)}
                        </p>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={invoice.paymentStatus} />
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                          {formatCurrency(invoice.total)}
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
                          {paidUSD > 0 ? formatCurrency(paidUSD, "USD") : "—"}
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
                          {paidBs > 0 ? formatCurrency(paidBs, "Bs") : "—"}
                        </span>
                      </td>

                      {/* Acción ver */}
                      <td className="px-4 py-3">
                        <Link
                          to={`/invoices/${invoice._id}`}
                          className="
                            inline-flex items-center justify-center
                            w-8 h-8 rounded-lg
                            text-surface-400 dark:text-slate-500
                            hover:text-biovet-500 dark:hover:text-biovet-400
                            hover:bg-biovet-50 dark:hover:bg-biovet-950
                            transition-colors cursor-pointer
                          "
                          title="Ver factura"
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
                {startIndex + 1}–{Math.min(endIndex, filteredInvoices.length)} de{" "}
                {filteredInvoices.length}
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
                      const showEllipsis = prevPage && page - prevPage > 1;

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