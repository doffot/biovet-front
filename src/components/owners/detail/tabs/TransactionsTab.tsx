// src/components/owners/detail/tabs/TransactionsTab.tsx
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  History, Search, X, Filter, Calendar, FileText,
  CheckCircle2, AlertTriangle, ChevronDown, ChevronUp,
  ArrowUpRight, ArrowDownLeft, Loader2,
  CreditCard as CreditCardIcon
} from 'lucide-react';

import type { Invoice } from '@/types/invoice';
import type { Patient } from '@/types/patient';
import type { Owner } from '@/types/owner';
import { getPatientName } from '@/types/invoice';

import { formatCurrency, getStatusConfig } from '@/utils/ownerHelpers';
import { InvoicePaymentsInline } from '../InvoicePaymentsInline';

// ==================== TYPES ====================
type FilterType = "all" | "pending" | "paid";

interface TransactionsTabProps {
  invoices: Invoice[];
  patients: Patient[];
  owner?: Owner;
  isLoading: boolean;
  creditBalance: number;
  totalDebt: number;
}

// ==================== COMPONENT ====================
export function TransactionsTab({ 
  invoices, 
  patients, 
  owner, 
  isLoading, 
  creditBalance, 
  totalDebt 
}: TransactionsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);

  // TODO: Descomentar cuando tengas el PaymentModal
  // const [showPaymentModal, setShowPaymentModal] = useState(false);
  // const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  // const [payAllMode, setPayAllMode] = useState(false);

  // ==================== HELPERS ====================
  const getPendingAmountUSD = (invoice: Invoice) => {
    const pending = invoice.total - (invoice.amountPaid || 0);
    if (invoice.currency === 'Bs' && invoice.exchangeRate) {
      return pending / invoice.exchangeRate;
    }
    return pending;
  };

  const getInvoiceDescription = (invoice: Invoice): string => {
    if (!invoice.items?.length) return "Factura";
    const descriptions = invoice.items.map((i) => i.description);
    if (descriptions.length <= 2) return descriptions.join(", ");
    return `${descriptions.slice(0, 2).join(", ")} +${descriptions.length - 2}`;
  };

  // ==================== FILTERING ====================
  const filteredInvoices = invoices.filter((inv) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const patientName = getPatientName(inv).toLowerCase();
      const description = inv.items?.map(i => i.description).join(" ").toLowerCase() || "";
      if (!patientName.includes(search) && !description.includes(search)) {
        return false;
      }
    }
    if (filter === "pending") {
      return inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial";
    }
    if (filter === "paid") {
      return inv.paymentStatus === "Pagado";
    }
    return true;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const groupedByDate = sortedInvoices.reduce((acc, invoice) => {
    const date = new Date(invoice.date).toLocaleDateString("es-ES", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(invoice);
    return acc;
  }, {} as Record<string, Invoice[]>);

  const pendingInvoices = invoices.filter(
    inv => inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial"
  );

  // ==================== HANDLERS ====================
  const handleOpenPayment = (invoice: Invoice) => {
    // TODO: Implementar cuando tengas el PaymentModal
    console.log('Abrir pago para:', invoice._id);
  };

  const handleOpenPayAll = () => {
    // TODO: Implementar cuando tengas el PaymentModal
    console.log('Pagar todo');
  };

  // ==================== LOADING STATE ====================
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-200 rounded-xl sm:rounded-2xl border border-surface-200 dark:border-slate-800 p-8 sm:p-12">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-biovet-500 animate-spin" />
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl sm:rounded-2xl border border-surface-200 dark:border-slate-800 overflow-hidden shadow-sm">
      
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 bg-surface-50/50 dark:bg-dark-100/50 border-b border-surface-200 dark:border-slate-800">
        
        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-biovet-50 dark:bg-biovet-950/30 rounded-lg sm:rounded-xl">
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-biovet-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">
                Transacciones
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500">
                {invoices.length} registros
              </p>
            </div>
          </div>
          
          {/* Pay All Button */}
          {pendingInvoices.length > 1 && (
            <button
              onClick={handleOpenPayAll}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 
                         bg-biovet-500 hover:bg-biovet-600 text-white 
                         text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl 
                         transition-all shadow-lg shadow-biovet-500/20
                         w-full sm:w-auto"
            >
              <CreditCardIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="sm:hidden">Pagar Todo ({formatCurrency(totalDebt)})</span>
              <span className="hidden sm:inline">Pagar Todo ({formatCurrency(totalDebt)})</span>
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 
                         text-xs sm:text-sm bg-white dark:bg-dark-200 
                         border border-surface-200 dark:border-slate-700 
                         rounded-lg sm:rounded-xl 
                         focus:ring-2 focus:ring-biovet-500/20 focus:border-biovet-500 
                         transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")} 
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-1 bg-surface-100 dark:bg-dark-100 p-1 rounded-lg sm:rounded-xl">
            {[
              { value: "all", label: "Todas", shortLabel: "Todo", icon: Filter },
              { value: "pending", label: "Pendientes", shortLabel: "Pend.", icon: AlertTriangle },
              { value: "paid", label: "Pagadas", shortLabel: "Pag.", icon: CheckCircle2 },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value as FilterType)}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 
                           px-2 sm:px-3 py-1.5 sm:py-2 
                           text-[10px] sm:text-xs font-bold rounded-md sm:rounded-lg 
                           transition-all flex-1 sm:flex-none ${
                  filter === opt.value
                    ? "bg-biovet-500 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white dark:hover:bg-dark-200"
                }`}
              >
                <opt.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="sm:hidden">{opt.shortLabel}</span>
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="divide-y divide-surface-100 dark:divide-slate-800 max-h-[500px] sm:max-h-[600px] overflow-y-auto scrollbar-thin">
        {Object.keys(groupedByDate).length === 0 ? (
          <EmptyState />
        ) : (
          Object.entries(groupedByDate).map(([date, dateInvoices]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="px-4 sm:px-6 py-2 sm:py-3 bg-surface-50 dark:bg-dark-100 sticky top-0 z-10">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500 font-bold">
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-biovet-500" />
                  <span>{date}</span>
                </div>
              </div>

              {/* Invoices for this date */}
              {dateInvoices.map((invoice) => (
                <InvoiceRow 
                  key={invoice._id}
                  invoice={invoice}
                  isExpanded={expandedInvoice === invoice._id}
                  onToggleExpand={() => setExpandedInvoice(
                    expandedInvoice === invoice._id ? null : invoice._id!
                  )}
                  onPay={() => handleOpenPayment(invoice)}
                  getPendingAmountUSD={getPendingAmountUSD}
                  getInvoiceDescription={getInvoiceDescription}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {invoices.length > 0 && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-surface-50 dark:bg-dark-100 border-t border-surface-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-slate-500">
                {invoices.length} Factura{invoices.length !== 1 ? "s" : ""}
              </span>
              {pendingInvoices.length > 0 && (
                <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 animate-pulse" />
                  {pendingInvoices.length} Pendiente{pendingInvoices.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {totalDebt > 0 && (
              <span className="text-red-500 font-bold">
                Total Pendiente: {formatCurrency(totalDebt)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* TODO: Payment Modal - Descomentar cuando esté listo */}
      {/* 
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => { 
          setShowPaymentModal(false); 
          setSelectedInvoice(null); 
          setPayAllMode(false); 
        }}
        amountUSD={modalAmount}
        creditBalance={creditBalance}
        title={payAllMode ? "Pagar Deuda Total" : "Pagar Factura"}
        subtitle={payAllMode 
          ? `${pendingInvoices.length} facturas pendientes` 
          : selectedInvoice ? getInvoiceDescription(selectedInvoice) : undefined
        }
        services={modalServices}
        patient={modalPatient}
        owner={modalOwner}
        onConfirm={handlePaymentConfirm}
      /> 
      */}
    </div>
  );
}

// ==================== INVOICE ROW COMPONENT ====================
interface InvoiceRowProps {
  invoice: Invoice;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onPay: () => void;
  getPendingAmountUSD: (invoice: Invoice) => number;
  getInvoiceDescription: (invoice: Invoice) => string;
}

function InvoiceRow({ 
  invoice, 
  isExpanded, 
  onToggleExpand, 
  onPay,
  getPendingAmountUSD,
  getInvoiceDescription 
}: InvoiceRowProps) {
  const status = getStatusConfig(invoice.paymentStatus);
  const StatusIcon = status.icon;
  const pendingAmount = getPendingAmountUSD(invoice);
  const isPending = invoice.paymentStatus === "Pendiente" || invoice.paymentStatus === "Parcial";

  return (
    <div className="border-b border-surface-100 dark:border-slate-800 last:border-0">
      {/* Main Row */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-surface-50 dark:hover:bg-dark-100/50 transition-colors">
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Status Icon */}
          <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center border flex-shrink-0 ${
            isPending 
              ? "bg-red-500/10 border-red-500/20" 
              : "bg-emerald-500/10 border-emerald-500/20"
          }`}>
            {isPending 
              ? <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" /> 
              : <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            }
          </div>

          {/* Invoice Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white truncate">
                {getPatientName(invoice)}
              </span>
              <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 
                               rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold border 
                               ${status.bgColor} ${status.color} ${status.borderColor}`}>
                <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="hidden xs:inline">{invoice.paymentStatus}</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {getInvoiceDescription(invoice)}
            </p>
          </div>

          {/* Amount & Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            
            {/* Amount */}
            <div className="text-right">
              <p className={`font-bold text-xs sm:text-sm ${
                isPending ? "text-slate-800 dark:text-white" : "text-emerald-500"
              }`}>
                {isPending ? "-" : "+"}${invoice.total.toFixed(2)}
              </p>
              {pendingAmount > 0.01 && (
                <p className="text-[9px] sm:text-[11px] text-red-500 font-bold">
                  Debe: ${pendingAmount.toFixed(2)}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Expand Button */}
              <button
                onClick={onToggleExpand}
                className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg border transition-all ${
                  isExpanded 
                    ? "bg-biovet-50 text-biovet-500 border-biovet-200 dark:bg-biovet-950/30 dark:border-biovet-800" 
                    : "text-slate-400 hover:bg-surface-100 dark:hover:bg-dark-100 border-transparent"
                }`}
              >
                {isExpanded 
                  ? <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
                  : <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                }
              </button>

              {/* Pay Button */}
              {pendingAmount > 0.01 && (
                <button
                  onClick={onPay}
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2 
                             bg-emerald-500 hover:bg-emerald-600 text-white 
                             text-[10px] sm:text-sm font-bold rounded-md sm:rounded-xl 
                             transition-all shadow-md shadow-emerald-500/20"
                >
                  Pagar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Payment History */}
      {isExpanded && (
        <div className="px-4 sm:px-6 pb-3 sm:pb-4">
          <div className="ml-9 sm:ml-11 pl-3 sm:pl-4 border-l-2 border-biovet-200 dark:border-biovet-800">
            <InvoicePaymentsInline invoiceId={invoice._id!} />
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== EMPTY STATE ====================
function EmptyState() {
  return (
    <div className="text-center py-12 sm:py-16">
      <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2 sm:mb-3" />
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-bold mb-1">
        Sin transacciones
      </p>
      <p className="text-xs sm:text-sm text-slate-400">
        No hay registros que mostrar
      </p>
    </div>
  );
}