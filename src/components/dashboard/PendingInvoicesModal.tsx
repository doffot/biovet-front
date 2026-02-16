import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  Search,
  ChevronRight,
  PawPrint,
  FileWarning,
} from "lucide-react";
import type { Invoice } from "../../types/invoice";
import { getOwnerName, getPatientName, getOwnerId } from "../../types/invoice";

interface PendingInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
}

export function PendingInvoicesModal({
  isOpen,
  onClose,
  invoices,
}: PendingInvoicesModalProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "Pendiente" | "Parcial"
  >("all");

  if (!isOpen) return null;

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      getOwnerName(invoice).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getPatientName(invoice).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || invoice.paymentStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalPendingUSD = filteredInvoices.reduce((acc, inv) => {
    if (inv.currency === "USD") {
      return acc + (inv.total - (inv.amountPaid || 0));
    }
    return acc;
  }, 0);

  const totalPendingBs = filteredInvoices.reduce((acc, inv) => {
    if (inv.currency === "Bs") {
      return acc + (inv.total - (inv.amountPaid || 0));
    }
    return acc;
  }, 0);

  const handleGoToOwner = (invoice: Invoice) => {
    const ownerId = getOwnerId(invoice);
    if (ownerId) {
      onClose();
      navigate(`/owners/${ownerId}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: "USD" | "Bs") => {
    if (currency === "USD") {
      return `$${amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
    }
    return `Bs ${amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-2xl 
                        bg-white dark:bg-dark-100 
                        border border-surface-300 dark:border-slate-700 
                        rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-surface-300 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 
                              bg-warning-50 dark:bg-warning-950 
                              rounded-xl 
                              border border-warning-200 dark:border-warning-800"
              >
                <CreditCard className="h-6 w-6 text-warning-500 dark:text-warning-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-surface-800 dark:text-white">
                  Facturas por Cobrar
                </h2>
                <p className="text-sm text-surface-500 dark:text-slate-400">
                  {filteredInvoices.length}{" "}
                  {filteredInvoices.length === 1
                    ? "factura pendiente"
                    : "facturas pendientes"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 
                         hover:bg-surface-100 dark:hover:bg-dark-200 
                         rounded-lg transition-colors group"
            >
              <X
                className="h-5 w-5 
                              text-surface-500 dark:text-slate-400 
                              group-hover:text-surface-800 dark:group-hover:text-white 
                              transition-colors"
              />
            </button>
          </div>

          {/* Resumen de totales */}
          <div
            className="grid grid-cols-2 gap-3 p-4 
                          bg-surface-50 dark:bg-dark-200 
                          border-b border-surface-300 dark:border-slate-700"
          >
            {/* Total USD */}
            <div
              className="bg-white dark:bg-dark-100 
                            backdrop-blur-sm rounded-xl p-4 
                            border border-warning-200 dark:border-warning-800 
                            shadow-sm"
            >
              <p className="text-xs text-surface-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                Total pendiente USD
              </p>
              <p className="text-2xl font-bold text-warning-500 dark:text-warning-400 mt-1">
                $
                {totalPendingUSD.toLocaleString("es-VE", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* Total Bs */}
            <div
              className="bg-white dark:bg-dark-100 
                            backdrop-blur-sm rounded-xl p-4 
                            border border-warning-200 dark:border-warning-800 
                            shadow-sm"
            >
              <p className="text-xs text-surface-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                Total pendiente Bs
              </p>
              <p className="text-2xl font-bold text-warning-500 dark:text-warning-400 mt-1">
                Bs{" "}
                {totalPendingBs.toLocaleString("es-VE", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-4 border-b border-surface-300 dark:border-slate-700 flex gap-3">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por cliente o paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Select de estado */}
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as typeof filterStatus)
              }
              className="input w-auto"
            >
              <option value="all">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Parcial">Parcial</option>
            </select>
          </div>

          {/* Lista de facturas */}
          <div className="max-h-80 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredInvoices.length === 0 ? (
              /* Estado vacío */
              <div className="text-center py-10">
                <div
                  className="w-16 h-16 
                                bg-surface-100 dark:bg-dark-200 
                                rounded-full flex items-center justify-center mx-auto mb-4 
                                border border-surface-300 dark:border-slate-700"
                >
                  <FileWarning className="h-8 w-8 text-surface-500 dark:text-slate-500" />
                </div>
                <p className="text-surface-800 dark:text-slate-200 font-medium">
                  No se encontraron facturas
                </p>
                <p className="text-sm text-surface-500 dark:text-slate-400 mt-1">
                  Intenta con otros términos de búsqueda
                </p>
              </div>
            ) : (
              filteredInvoices.map((invoice) => {
                const remaining = invoice.total - (invoice.amountPaid || 0);
                const isParcial = invoice.paymentStatus === "Parcial";
                const ownerId = getOwnerId(invoice);

                return (
                  <div
                    key={invoice._id}
                    onClick={() => ownerId && handleGoToOwner(invoice)}
                    className={`
                      bg-white/40 dark:bg-dark-100/40 
                      backdrop-blur-sm border rounded-xl p-4
                      transition-all duration-300 group
                      ${
                        ownerId
                          ? "cursor-pointer border-surface-300 dark:border-slate-700 hover:border-biovet-400 dark:hover:border-biovet-600 hover:shadow-sm hover:shadow-biovet-500/10"
                          : "opacity-60 border-surface-300 dark:border-slate-700"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Cliente y paciente */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <div className="flex items-center gap-1.5 text-surface-800 dark:text-white font-semibold">
                            <User className="h-4 w-4 text-biovet-500 dark:text-biovet-400 shrink-0" />
                            <span className="truncate">
                              {getOwnerName(invoice)}
                            </span>
                          </div>
                          <span className="text-surface-400 dark:text-slate-600">
                            •
                          </span>
                          <div className="flex items-center gap-1 text-surface-500 dark:text-slate-400">
                            <PawPrint className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {getPatientName(invoice)}
                            </span>
                          </div>
                        </div>

                        {/* Fecha y estado */}
                        <div className="flex items-center gap-3 text-sm mb-2 flex-wrap">
                          <span className="flex items-center gap-1 text-surface-500 dark:text-slate-400">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            {formatDate(invoice.date)}
                          </span>
                          <span
                            className={`badge ${
                              isParcial ? "badge-warning" : "badge-danger"
                            }`}
                          >
                            {invoice.paymentStatus}
                          </span>
                        </div>

                        {/* Montos */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                          <span className="text-surface-500 dark:text-slate-400">
                            Total:{" "}
                            <span className="font-medium text-surface-800 dark:text-white">
                              {formatCurrency(invoice.total, invoice.currency)}
                            </span>
                          </span>
                          {isParcial && (
                            <span className="text-success-500 dark:text-success-400">
                              Pagado:{" "}
                              <span className="font-medium">
                                {formatCurrency(
                                  invoice.amountPaid || 0,
                                  invoice.currency
                                )}
                              </span>
                            </span>
                          )}
                          <span className="text-warning-500 dark:text-warning-400 font-semibold flex items-center gap-0.5">
                            <DollarSign className="h-3.5 w-3.5" />
                            Pendiente:{" "}
                            {formatCurrency(remaining, invoice.currency)}
                          </span>
                        </div>
                      </div>

                      {/* Flecha indicadora */}
                      {ownerId && (
                        <div className="ml-3 flex items-center">
                          <div
                            className="p-2 rounded-lg 
                                          bg-surface-50 dark:bg-dark-200 
                                          group-hover:bg-biovet-50 dark:group-hover:bg-biovet-950 
                                          transition-colors 
                                          border border-surface-300 dark:border-slate-700 
                                          group-hover:border-biovet-200 dark:group-hover:border-biovet-800"
                          >
                            <ChevronRight
                              className="h-5 w-5 
                                            text-surface-500 dark:text-slate-400 
                                            group-hover:text-biovet-500 dark:group-hover:text-biovet-400 
                                            transition-colors"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            className="p-4 
                          border-t border-surface-300 dark:border-slate-700 
                          bg-surface-50 dark:bg-dark-200 
                          rounded-b-2xl"
          >
            <button onClick={onClose} className="btn-primary w-full">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}