import { useState } from "react";
import { createPortal } from "react-dom"; // 1. Importar el Portal
import { useNavigate } from "react-router-dom";
import {
  X,
  CreditCard,
  Search,
  ChevronRight,
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

  // 2. Definimos el contenido en una constante
  const modalHTML = (
    <div className="fixed inset-0 z-9999 overflow-y-auto">
      {/* Backdrop - Ahora cubrirá TODO el layout */}
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
                        rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
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
              className="p-2 hover:bg-surface-100 dark:hover:bg-dark-200 rounded-lg transition-colors group"
            >
              <X className="h-5 w-5 text-surface-500 dark:text-slate-400 group-hover:text-surface-800 dark:group-hover:text-white" />
            </button>
          </div>

          {/* Totales */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700">
            <div className="bg-white dark:bg-dark-100 rounded-xl p-4 border border-warning-200 dark:border-warning-800 shadow-sm">
              <p className="text-[10px] text-surface-500 dark:text-slate-400 font-bold uppercase tracking-widest">Total USD</p>
              <p className="text-2xl font-bold text-warning-500 mt-1">${totalPendingUSD.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white dark:bg-dark-100 rounded-xl p-4 border border-warning-200 dark:border-warning-800 shadow-sm">
              <p className="text-[10px] text-surface-500 dark:text-slate-400 font-bold uppercase tracking-widest">Total Bs</p>
              <p className="text-2xl font-bold text-warning-500 mt-1">Bs {totalPendingBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-4 border-b border-surface-300 dark:border-slate-700 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 h-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="input w-auto h-10 text-sm"
            >
              <option value="all">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Parcial">Parcial</option>
            </select>
          </div>

          {/* Lista */}
          <div className="max-h-100 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white dark:bg-dark-100">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-10">
                <FileWarning className="h-10 w-10 text-surface-300 mx-auto mb-2" />
                <p className="text-surface-500">No hay facturas pendientes</p>
              </div>
            ) : (
              filteredInvoices.map((invoice) => {
                const remaining = invoice.total - (invoice.amountPaid || 0);
                const ownerId = getOwnerId(invoice);
                return (
                  <div
                    key={invoice._id}
                    onClick={() => ownerId && handleGoToOwner(invoice)}
                    className="flex items-center justify-between p-4 bg-surface-50 dark:bg-dark-200/50 border border-surface-200 dark:border-slate-700 rounded-xl hover:border-biovet-500 transition-all cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{getOwnerName(invoice)}</span>
                        <span className="badge badge-warning text-[10px]">{invoice.paymentStatus}</span>
                      </div>
                      <div className="flex gap-3 text-xs text-slate-500">
                        <span>{formatDate(invoice.date)}</span>
                        <span>•</span>
                        <span>{getPatientName(invoice)}</span>
                      </div>
                      <div className="mt-2 text-sm font-semibold text-warning-600">
                        Pendiente: {formatCurrency(remaining, invoice.currency)}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-biovet-500 transition-colors" />
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-surface-300 dark:border-slate-700 bg-surface-50 dark:bg-dark-200">
            <button onClick={onClose} className="btn-primary w-full py-3">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 3. Retornar usando el Portal hacia el body
  return createPortal(modalHTML, document.body);
}