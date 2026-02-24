import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  CreditCard,
  Search,
  ChevronRight,
  FileWarning,
  Eye,
  RefreshCw,
} from "lucide-react";
import type { Invoice } from "../../types/invoice";
import { getOwnerName, getPatientName, getOwnerId } from "../../types/invoice";

interface PendingInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  onRefresh?: () => void; 
  isRefreshing?: boolean; 
}

export function PendingInvoicesModal({
  isOpen,
  onClose,
  invoices,
  onRefresh,
  isRefreshing = false,
}: PendingInvoicesModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "Pendiente" | "Parcial">("all");

 
  useEffect(() => {
    const handleInvoicesUpdated = () => {
      onRefresh?.();
    };

    window.addEventListener('invoices-updated', handleInvoicesUpdated);
    return () => window.removeEventListener('invoices-updated', handleInvoicesUpdated);
  }, [onRefresh]);

  // ✅ Detectar si volvimos con señal de refresh
  useEffect(() => {
    if (location.state?.shouldRefreshPending && isOpen) {
      onRefresh?.();
      // Limpiar el state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, isOpen, onRefresh]);

  if (!isOpen) return null;

  // Filtrado reactivo
  const filteredInvoices = invoices.filter((invoice) => {
    const hasDebt = invoice.paymentStatus === "Pendiente" || invoice.paymentStatus === "Parcial";
    if (!hasDebt) return false;

    const matchesSearch =
      getOwnerName(invoice).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getPatientName(invoice).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || invoice.paymentStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Cálculos de totales
  const totalPendingUSD = filteredInvoices.reduce((acc, inv) => {
    if (inv.currency === "USD") {
      const remaining = inv.total - (inv.amountPaid || 0);
      return acc + (remaining > 0 ? remaining : 0);
    }
    return acc;
  }, 0);

  const totalPendingBs = filteredInvoices.reduce((acc, inv) => {
    if (inv.currency === "Bs") {
      const remaining = inv.total - (inv.amountPaid || 0);
      return acc + (remaining > 0 ? remaining : 0);
    }
    return acc;
  }, 0);

  // ✅ Navegación mejorada con contexto
  const handleGoToOwner = (invoice: Invoice) => {
    const ownerId = getOwnerId(invoice);
    if (ownerId) {
      onClose();
      navigate(`/owners/${ownerId}`, {
        state: { fromPendingModal: true, returnPath: location.pathname }
      });
    }
  };

  const handleGoToInvoice = (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation();
    onClose();
    navigate(`/invoices/${invoiceId}`, {
      state: { fromPendingModal: true, returnPath: location.pathname }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: "USD" | "Bs") => {
    const formatted = amount.toLocaleString("es-VE", { minimumFractionDigits: 2 });
    return currency === "USD" ? `$ ${formatted}` : `Bs ${formatted}`;
  };

  const modalHTML = (
    <div className="fixed inset-0 z-9999 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-2xl 
                        bg-white dark:bg-dark-100 
                        border border-surface-300 dark:border-slate-700 
                        rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-surface-300 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-warning-50 dark:bg-warning-950 rounded-xl border border-warning-200 dark:border-warning-800">
                <CreditCard className="h-6 w-6 text-warning-500 dark:text-warning-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  Facturas por Cobrar
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {filteredInvoices.length} {filteredInvoices.length === 1 ? "pendiente" : "pendientes"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* ✅ Botón de refrescar */}
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="p-2 hover:bg-surface-100 dark:hover:bg-dark-200 rounded-lg transition-colors group"
                  title="Actualizar lista"
                >
                  <RefreshCw className={`h-5 w-5 text-slate-400 group-hover:text-biovet-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface-100 dark:hover:bg-dark-200 rounded-lg transition-colors group"
              >
                <X className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white" />
              </button>
            </div>
          </div>

          {/* Resumen de Totales */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-surface-50 dark:bg-dark-200/50 border-b border-surface-300 dark:border-slate-700">
            <div className="bg-white dark:bg-dark-100 rounded-xl p-4 border border-warning-200 dark:border-warning-800 shadow-sm">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Deuda USD</p>
              <p className="text-2xl font-heading font-black text-warning-500 mt-1">
                {formatCurrency(totalPendingUSD, "USD")}
              </p>
            </div>
            <div className="bg-white dark:bg-dark-100 rounded-xl p-4 border border-warning-200 dark:border-warning-800 shadow-sm">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Deuda Bs</p>
              <p className="text-2xl font-heading font-black text-warning-500 mt-1">
                {formatCurrency(totalPendingBs, "Bs")}
              </p>
            </div>
          </div>

          {/* Buscador y Filtros */}
          <div className="p-4 border-b border-surface-300 dark:border-slate-700 flex gap-3 bg-white dark:bg-dark-100">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por cliente o mascota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 h-11 w-full"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="input w-auto h-11 text-sm font-medium"
            >
              <option value="all">Todos los estados</option>
              <option value="Pendiente">Solo Pendientes</option>
              <option value="Parcial">Solo Parciales</option>
            </select>
          </div>

          {/* Lista de Facturas */}
          <div className="max-h-100 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white dark:bg-dark-100 relative">
            {/* ✅ Overlay de carga */}
            {isRefreshing && (
              <div className="absolute inset-0 bg-white/80 dark:bg-dark-100/80 flex items-center justify-center z-10">
                <RefreshCw className="w-8 h-8 text-biovet-500 animate-spin" />
              </div>
            )}

            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <FileWarning className="h-12 w-12 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No se encontraron facturas con deuda</p>
              </div>
            ) : (
              filteredInvoices.map((invoice) => {
                const remaining = invoice.total - (invoice.amountPaid || 0);
                const ownerId = getOwnerId(invoice);
                const invoiceId = invoice._id;

                return (
                  <div
                    key={invoiceId}
                    onClick={() => ownerId && handleGoToOwner(invoice)}
                    className="flex items-center justify-between p-4 bg-surface-50 dark:bg-dark-200/40 border border-surface-200 dark:border-slate-800 rounded-xl hover:border-biovet-500 dark:hover:border-biovet-500 transition-all cursor-pointer group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-700 dark:text-slate-200 truncate">
                          {getOwnerName(invoice)}
                        </span>
                        <span className={`badge ${invoice.paymentStatus === 'Parcial' ? 'badge-warning' : 'badge-danger'} text-[10px]`}>
                          {invoice.paymentStatus}
                        </span>
                      </div>
                      <div className="flex gap-3 text-[11px] text-slate-500 font-medium">
                        <span>{formatDate(invoice.date)}</span>
                        <span>•</span>
                        <span className="text-biovet-500">{getPatientName(invoice)}</span>
                      </div>
                      <div className="mt-2 text-sm font-heading font-black text-warning-600 dark:text-warning-500">
                        Debe: {formatCurrency(remaining, invoice.currency)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                      <button
                        onClick={(e) => invoiceId && handleGoToInvoice(e, invoiceId)}
                        className="flex items-center gap-2 px-4 py-2 bg-biovet-500 hover:bg-biovet-600 text-white text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Pagar</span>
                      </button>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-biovet-500 transition-colors" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-surface-300 dark:border-slate-700 bg-surface-50 dark:bg-dark-200/50">
            <button 
              onClick={onClose} 
              className="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Cerrar Ventana
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalHTML, document.body);
}