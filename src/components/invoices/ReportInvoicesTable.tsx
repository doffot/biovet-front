import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, ChevronLeft, ChevronRight, ChevronDown, Eye, Filter } from "lucide-react";
import type { Invoice, InvoiceStatus } from "../../types/invoice";
import type { FilterState, StatusFilter, PaymentCurrencyFilter } from "../../types/reportTypes";
import { formatCurrency, formatDate, getItemTypeLabel } from "../../utils/reportUtils";
import { DateRangeSelector } from "./DateRangeSelector";
import { exportToCSV } from "@/utils/exportUtils";

interface ReportInvoicesTableProps {
  invoices: Invoice[];
  filters: FilterState;
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
}

const PAGE_SIZE = 8;

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const isPaid = status === "Pagado";
  const isPending = status === "Pendiente" || status === "Parcial";
  const isCanceled = status === "Cancelado";

  let bgColor = "bg-vet-light text-vet-muted border-border";
  let label: string = status;

  if (isPaid) {
    bgColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  } else if (isPending) {
    bgColor = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    label = "Debe";
  } else if (isCanceled) {
    bgColor = "bg-vet-light text-vet-muted border-border";
  }

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded border ${bgColor}`}>
      {label}
    </span>
  );
}

export function ReportInvoicesTable({
  invoices,
  filters,
  onUpdateFilter,
  onResetFilters,
}: ReportInvoicesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const totalPages = Math.ceil(invoices.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentInvoices = invoices.slice(startIndex, endIndex);

  const allCurrentSelected = currentInvoices.length > 0 && 
    currentInvoices.every((inv) => inv._id && selectedIds.has(inv._id));

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setCurrentPage(1);
    onUpdateFilter(key, value);
  };

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
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleExportCSV = () => {
    const toExport = selectedIds.size > 0
      ? invoices.filter((inv) => inv._id && selectedIds.has(inv._id))
      : invoices;
    exportToCSV(toExport, "reporte-facturas");
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const selectClasses = `
    appearance-none bg-card border border-border rounded-lg
    px-3 py-2 pr-8 text-sm text-vet-text w-full
    focus:outline-none focus:ring-2 focus:ring-vet-primary focus:border-vet-primary
    cursor-pointer
  `;

  const getOwnerInfo = (invoice: Invoice): { name: string; phone: string } => {
    const name = invoice.ownerName ||
      (typeof invoice.ownerId === "object" && invoice.ownerId?.name) ||
      "—";
    const phone = invoice.ownerPhone ||
      (typeof invoice.ownerId === "object" && invoice.ownerId?.contact) ||
      "";
    return { name, phone };
  };

  const getPatientName = (invoice: Invoice): string => {
    if (!invoice.patientId) return "";
    if (typeof invoice.patientId === "object" && invoice.patientId?.name) {
      return invoice.patientId.name;
    }
    return "";
  };

  const getMainService = (invoice: Invoice): string => {
    if (!invoice.items || invoice.items.length === 0) return "—";
    return getItemTypeLabel(invoice.items[0].type);
  };

  const activeFiltersCount = [
    filters.status !== "all",
    filters.paymentCurrency !== "all",
    filters.itemType !== "",
    filters.dateRange !== "all"
  ].filter(Boolean).length;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Toolbar Desktop */}
      <div className="hidden lg:flex px-4 py-3 border-b border-border flex-wrap items-center justify-between gap-3 bg-vet-light/50">
        <div className="flex flex-wrap items-center gap-2">
          <DateRangeSelector
            dateRange={filters.dateRange}
            customFrom={filters.customFrom}
            customTo={filters.customTo}
            onDateRangeChange={(value) => {
              setCurrentPage(1);
              onUpdateFilter("dateRange", value);
            }}
            onCustomFromChange={(value) => onUpdateFilter("customFrom", value)}
            onCustomToChange={(value) => onUpdateFilter("customTo", value)}
          />

          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value as StatusFilter)}
              className={selectClasses}
            >
              <option value="all">Todos los estados</option>
              <option value="Pagado">Pagado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Parcial">Parcial</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.paymentCurrency}
              onChange={(e) => handleFilterChange("paymentCurrency", e.target.value as PaymentCurrencyFilter)}
              className={selectClasses}
            >
              <option value="all">Todos los pagos</option>
              <option value="usd">USD</option>
              <option value="bs">Bolívares</option>
              <option value="mixed">Mixto</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.itemType}
              onChange={(e) => handleFilterChange("itemType", e.target.value)}
              className={selectClasses}
            >
              <option value="">Todos los servicios</option>
              <option value="consulta">Consulta</option>
              <option value="grooming">Peluquería</option>
              <option value="vacuna">Vacuna</option>
              <option value="labExam">Laboratorio</option>
              <option value="producto">Producto</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted pointer-events-none" />
          </div>

          <button
            onClick={() => {
              setCurrentPage(1);
              onResetFilters();
            }}
            className="text-sm text-vet-muted hover:text-vet-text px-3 py-2"
          >
            Limpiar
          </button>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-vet-muted">
                {selectedIds.size} seleccionada{selectedIds.size > 1 ? "s" : ""}
              </span>
              <button
                onClick={clearSelection}
                className="text-sm text-vet-primary hover:text-vet-accent"
              >
                Deseleccionar
              </button>
            </div>
          )}
          <button
            onClick={handleExportCSV}
            disabled={invoices.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-vet-text bg-card hover:bg-hover border border-border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">
              {selectedIds.size > 0 ? `Exportar (${selectedIds.size})` : "Exportar CSV"}
            </span>
          </button>
        </div>
      </div>

      {/* Toolbar Mobile */}
      <div className="lg:hidden px-4 py-3 border-b border-border bg-vet-light/50 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-vet-text bg-card hover:bg-hover border border-border rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold text-white bg-vet-primary rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            onClick={handleExportCSV}
            disabled={invoices.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-vet-text bg-card hover:bg-hover border border-border rounded-lg transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Filters Panel */}
        {showMobileFilters && (
          <div className="space-y-3 pt-3 border-t border-border">
            <DateRangeSelector
              dateRange={filters.dateRange}
              customFrom={filters.customFrom}
              customTo={filters.customTo}
              onDateRangeChange={(value) => {
                setCurrentPage(1);
                onUpdateFilter("dateRange", value);
              }}
              onCustomFromChange={(value) => onUpdateFilter("customFrom", value)}
              onCustomToChange={(value) => onUpdateFilter("customTo", value)}
            />

            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value as StatusFilter)}
                className={selectClasses}
              >
                <option value="all">Todos los estados</option>
                <option value="Pagado">Pagado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Parcial">Parcial</option>
                <option value="Cancelado">Cancelado</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filters.paymentCurrency}
                onChange={(e) => handleFilterChange("paymentCurrency", e.target.value as PaymentCurrencyFilter)}
                className={selectClasses}
              >
                <option value="all">Todos los pagos</option>
                <option value="usd">USD</option>
                <option value="bs">Bolívares</option>
                <option value="mixed">Mixto</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filters.itemType}
                onChange={(e) => handleFilterChange("itemType", e.target.value)}
                className={selectClasses}
              >
                <option value="">Todos los servicios</option>
                <option value="consulta">Consulta</option>
                <option value="grooming">Peluquería</option>
                <option value="vacuna">Vacuna</option>
                <option value="labExam">Laboratorio</option>
                <option value="producto">Producto</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted pointer-events-none" />
            </div>

            <button
              onClick={() => {
                setCurrentPage(1);
                onResetFilters();
                setShowMobileFilters(false);
              }}
              className="w-full px-4 py-2 text-sm font-medium text-vet-primary border border-vet-primary rounded-lg hover:bg-vet-primary/10 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between px-3 py-2 bg-vet-primary/10 border border-vet-primary/30 rounded-lg">
            <span className="text-sm font-medium text-vet-primary">
              {selectedIds.size} seleccionada{selectedIds.size > 1 ? "s" : ""}
            </span>
            <button
              onClick={clearSelection}
              className="text-sm font-medium text-vet-primary hover:text-vet-secondary"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Table / Cards */}
      {invoices.length === 0 ? (
        <div className="py-16 text-center bg-vet-light/30">
          <p className="text-vet-muted">No hay facturas para mostrar</p>
          <p className="text-sm text-vet-muted mt-1">Ajusta los filtros o el período</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-vet-light">
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allCurrentSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-border text-vet-primary focus:ring-vet-primary cursor-pointer bg-card"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-vet-muted uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-vet-muted uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-vet-muted uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-vet-muted uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-vet-muted uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-vet-muted uppercase tracking-wider hidden lg:table-cell">
                    USD
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-vet-muted uppercase tracking-wider hidden lg:table-cell">
                    Bs
                  </th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {currentInvoices.map((invoice) => {
                  const { name, phone } = getOwnerInfo(invoice);
                  const patientName = getPatientName(invoice);
                  const mainService = getMainService(invoice);
                  const paidUSD = invoice.amountPaidUSD || 0;
                  const paidBs = invoice.amountPaidBs || 0;
                  const isSelected = invoice._id ? selectedIds.has(invoice._id) : false;

                  return (
                    <tr
                      key={invoice._id}
                      className={`
                        border-b border-border hover:bg-hover transition-colors
                        ${isSelected ? "bg-vet-primary/5" : ""}
                      `}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => invoice._id && toggleSelect(invoice._id)}
                          className="w-4 h-4 rounded border-border text-vet-primary focus:ring-vet-primary cursor-pointer bg-card"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-vet-muted whitespace-nowrap">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-vet-text truncate max-w-45]">
                            {name}
                          </p>
                          {phone && (
                            <p className="text-xs text-vet-muted mt-0.5">{phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-vet-text">{mainService}</p>
                          {patientName && (
                            <p className="text-xs text-vet-muted mt-0.5">{patientName}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={invoice.paymentStatus} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-vet-text tabular-nums">
                          {formatCurrency(invoice.total || 0, invoice.currency)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        <span className={`text-sm tabular-nums ${paidUSD > 0 ? "text-emerald-500 font-medium" : "text-vet-muted"}`}>
                          {paidUSD > 0 ? formatCurrency(paidUSD, "USD") : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        <span className={`text-sm tabular-nums ${paidBs > 0 ? "text-vet-primary font-medium" : "text-vet-muted"}`}>
                          {paidBs > 0 ? formatCurrency(paidBs, "Bs") : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/invoices/${invoice._id}`}
                          className="p-1.5 inline-flex text-vet-muted hover:text-vet-primary transition-colors rounded-md hover:bg-hover"
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

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {currentInvoices.map((invoice) => {
              const { name, phone } = getOwnerInfo(invoice);
              const patientName = getPatientName(invoice);
              const mainService = getMainService(invoice);
              const paidUSD = invoice.amountPaidUSD || 0;
              const paidBs = invoice.amountPaidBs || 0;
              const isSelected = invoice._id ? selectedIds.has(invoice._id) : false;

              return (
                <div
                  key={invoice._id}
                  className={`p-4 ${isSelected ? "bg-vet-primary/5" : ""}`}
                >
                  {/* Header: Checkbox + Date + Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => invoice._id && toggleSelect(invoice._id)}
                        className="mt-0.5 w-5 h-5 rounded border-border text-vet-primary focus:ring-vet-primary cursor-pointer bg-card"
                      />
                      <div>
                        <p className="text-sm font-medium text-vet-text">{name}</p>
                        {phone && <p className="text-xs text-vet-muted mt-0.5">{phone}</p>}
                        {patientName && (
                          <p className="text-xs text-vet-muted mt-0.5">🐾 {patientName}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={invoice.paymentStatus} />
                      <p className="text-xs text-vet-muted mt-1">{formatDate(invoice.date)}</p>
                    </div>
                  </div>

                  {/* Service */}
                  <div className="mb-3">
                    <p className="text-xs text-vet-muted mb-1">Servicio</p>
                    <p className="text-sm text-vet-text">{mainService}</p>
                  </div>

                  {/* Amounts */}
                  <div className="flex items-end justify-between pt-3 border-t border-border">
                    <div className="space-y-1">
                      {paidUSD > 0 && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          USD: <span className="font-medium">{formatCurrency(paidUSD, "USD")}</span>
                        </p>
                      )}
                      {paidBs > 0 && (
                        <p className="text-xs text-vet-primary">
                          Bs: <span className="font-medium">{formatCurrency(paidBs, "Bs")}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold text-vet-text">
                        {formatCurrency(invoice.total || 0, invoice.currency)}
                      </p>
                      <Link
                        to={`/invoices/${invoice._id}`}
                        className="p-2 text-vet-primary bg-vet-primary/10 rounded-lg hover:bg-vet-primary/20 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-vet-light/30">
              <p className="text-sm text-vet-muted">
                {startIndex + 1}–{Math.min(endIndex, invoices.length)} de {invoices.length}
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 text-vet-muted hover:text-vet-text disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="hidden sm:flex items-center gap-0.5">
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
                            <span className="px-2 text-vet-muted">...</span>
                          )}
                          <button
                            onClick={() => goToPage(page)}
                            className={`
                              w-8 h-8 text-sm font-medium rounded-lg transition-colors
                              ${currentPage === page
                                ? "bg-vet-primary text-white shadow-soft"
                                : "text-vet-text hover:bg-hover border border-transparent hover:border-border"
                              }
                            `}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>

                {/* Mobile: Simple page indicator */}
                <div className="sm:hidden px-3 py-1 text-sm font-medium text-vet-text bg-card border border-border rounded-lg">
                  {currentPage} / {totalPages}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 text-vet-muted hover:text-vet-text disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}