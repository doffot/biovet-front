// src/components/owners/detail/tabs/TransactionsTab.tsx
import { useState} from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { 
  History, Search, X, Filter, Calendar,
  CheckCircle2, AlertTriangle, ChevronDown, ChevronUp,
  ArrowUpRight, ArrowDownLeft, Loader2,
  CreditCard as CreditCardIcon,
  FileText
} from 'lucide-react';

import type { Invoice } from '@/types/invoice';
import type { Patient } from '@/types/patient';
import type { Owner } from '@/types/owner';
import { getPatientName } from '@/types/invoice';

import { formatCurrency, getStatusConfig } from '@/utils/ownerHelpers';
import { InvoicePaymentsInline } from '../InvoicePaymentsInline';
import { createPayment } from '@/api/paymentAPI';
import { toast } from '@/components/Toast';
import { PaymentModal, type PaymentServiceItem } from '@/components/payment/PaymentModal';

type FilterType = "all" | "pending" | "paid";

interface TransactionsTabProps {
  invoices: Invoice[];
  patients: Patient[];
  owner?: Owner;
  isLoading: boolean;
  creditBalance: number;
  totalDebt: number;
}

export function TransactionsTab({ 
  invoices, 
  owner, 
  isLoading, 
  creditBalance, 
  totalDebt 
}: TransactionsTabProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);

  // Estados del Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payAllMode, setPayAllMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mutación para crear pagos
  const { mutateAsync: createPaymentAsync } = useMutation({
    mutationFn: createPayment,
  });

  // --- HELPERS ---
  const getPendingAmountUSD = (invoice: Invoice) => {
    const paid = (invoice.amountPaidUSD || 0) + ((invoice.amountPaidBs || 0) / (invoice.exchangeRate || 1));
    const pending = invoice.total - paid;
    return Math.max(0, pending);
  };

  const getInvoiceDescription = (invoice: Invoice): string => {
    if (!invoice.items?.length) return "Factura";
    const descriptions = invoice.items.map((i) => i.description);
    if (descriptions.length <= 2) return descriptions.join(", ");
    return `${descriptions.slice(0, 2).join(", ")} +${descriptions.length - 2}`;
  };

  const getModalServices = (): PaymentServiceItem[] => {
    if (payAllMode) {
      return [{
        description: "Pago total de deuda pendiente",
        quantity: 1,
        unitPrice: totalDebt,
        total: totalDebt
      }];
    }
    if (selectedInvoice) {
      return selectedInvoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.cost,
        total: item.cost * item.quantity
      }));
    }
    return [];
  };

  const getModalAmount = () => {
    if (payAllMode) return totalDebt;
    if (selectedInvoice) return getPendingAmountUSD(selectedInvoice);
    return 0;
  };

  const getModalPatient = () => {
    if (
      selectedInvoice && 
      selectedInvoice.patientId && 
      typeof selectedInvoice.patientId === 'object'
    ) {
      return { 
        name: selectedInvoice.patientId.name,
      };
    }
    return undefined;
  };

  // --- FILTROS ---
  const filteredInvoices = invoices.filter((inv) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const patientName = getPatientName(inv).toLowerCase();
      const description = inv.items?.map(i => i.description).join(" ").toLowerCase() || "";
      if (!patientName.includes(search) && !description.includes(search)) return false;
    }
    if (filter === "pending") return inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial";
    if (filter === "paid") return inv.paymentStatus === "Pagado";
    return true;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const groupedByDate = sortedInvoices.reduce((acc, invoice) => {
    const date = new Date(invoice.date).toLocaleDateString("es-ES", { 
      year: "numeric", month: "long", day: "numeric" 
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(invoice);
    return acc;
  }, {} as Record<string, Invoice[]>);

  const pendingInvoices = invoices.filter(
    inv => inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial"
  );

  // --- HANDLERS ---
  const handleOpenPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPayAllMode(false);
    setShowPaymentModal(true);
  };

  const handleOpenPayAll = () => {
    setSelectedInvoice(null);
    setPayAllMode(true);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async (paymentData: any) => {
    setIsProcessing(true);
    try {
      const exchangeRate = paymentData.exchangeRate || 1;
      const isPayingInBs = paymentData.addAmountPaidBs > 0;

      //  PAGO INDIVIDUAL
      if (selectedInvoice) {
        const payload: any = {
          invoiceId: selectedInvoice._id,
          currency: isPayingInBs ? "Bs" : "USD",
          exchangeRate,
          amount: isPayingInBs ? paymentData.addAmountPaidBs : paymentData.addAmountPaidUSD,
        };

        
        if (paymentData.paymentMethodId) {
          payload.paymentMethod = paymentData.paymentMethodId; // ← ¡Así debe ser!
        }
        if (paymentData.reference) {
          payload.reference = paymentData.reference;
        }
        if (paymentData.creditAmountUsed && paymentData.creditAmountUsed > 0) {
          payload.creditAmountUsed = paymentData.creditAmountUsed;
        }

        await createPaymentAsync(payload);
        toast.success("Pago Registrado", "La factura ha sido actualizada correctamente.");
      }

     
      else if (payAllMode) {
        let successCount = 0;
        for (const invoice of pendingInvoices) {
          const pendingUSD = getPendingAmountUSD(invoice);
          if (pendingUSD <= 0.001) continue;

          let amountToSend = isPayingInBs ? pendingUSD * exchangeRate : pendingUSD;

          const payload: any = {
            invoiceId: invoice._id,
            currency: isPayingInBs ? "Bs" : "USD",
            exchangeRate,
            amount: amountToSend,
          };

         
          if (paymentData.paymentMethodId) {
            payload.paymentMethod = paymentData.paymentMethodId;
          }
          if (paymentData.reference) {
            payload.reference = paymentData.reference;
          }
         

          await createPaymentAsync(payload);
          successCount++;
        }

        if (successCount > 0) {
          toast.success("Pago Masivo Exitoso", `Se han pagado ${successCount} facturas.`);
        }
      }

     
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["owner"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPayAllMode(false);

    } catch (error: any) {
      console.error("Error en pago:", error);
      toast.error("Error", error.message || "No se pudo procesar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-slate-800 p-12 flex justify-center">
        <Loader2 className="w-8 h-8 text-biovet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl sm:rounded-2xl border border-surface-200 dark:border-slate-800 overflow-hidden shadow-sm">
      
      {/* Header */}
      <div className="px-6 py-5 bg-surface-50/50 dark:bg-dark-100/50 border-b border-surface-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-biovet-50 dark:bg-biovet-950/30 rounded-xl">
              <History className="w-5 h-5 text-biovet-500" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">Transacciones</h3>
              <p className="text-xs text-slate-500">{invoices.length} registros</p>
            </div>
          </div>
          
          {pendingInvoices.length > 1 && (
            <button
              onClick={handleOpenPayAll}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2.5 bg-biovet-500 hover:bg-biovet-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-biovet-500/20 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCardIcon className="w-4 h-4" />}
              <span>Pagar Todo ({formatCurrency(totalDebt)})</span>
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-biovet-500/20 focus:border-biovet-500 transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>
          
          <div className="flex gap-1 bg-surface-100 dark:bg-dark-100 p-1 rounded-xl">
            {[
              { value: "all", label: "Todas", icon: Filter },
              { value: "pending", label: "Pendientes", icon: AlertTriangle },
              { value: "paid", label: "Pagadas", icon: CheckCircle2 },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value as FilterType)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all flex-1 ${
                  filter === opt.value
                    ? "bg-biovet-500 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white dark:hover:bg-dark-200"
                }`}
              >
                <opt.icon className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="divide-y divide-surface-100 dark:divide-slate-800 max-h-150 overflow-y-auto scrollbar-thin">
        {Object.keys(groupedByDate).length === 0 ? (
          <EmptyState />
        ) : (
          Object.entries(groupedByDate).map(([date, dateInvoices]) => (
            <div key={date}>
              <div className="px-6 py-3 bg-surface-50 dark:bg-dark-100 sticky top-0 z-10 flex items-center gap-2 text-xs text-slate-500 font-bold">
                <Calendar className="w-3.5 h-3.5 text-biovet-500" />
                {date}
              </div>
              {dateInvoices.map((invoice) => (
                <InvoiceRow 
                  key={invoice._id}
                  invoice={invoice}
                  isExpanded={expandedInvoice === invoice._id}
                  onToggleExpand={() => setExpandedInvoice(expandedInvoice === invoice._id ? null : invoice._id!)}
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
        <div className="px-6 py-4 bg-surface-50 dark:bg-dark-100 border-t border-surface-200 dark:border-slate-800 flex justify-between items-center text-sm">
          <span className="text-slate-500">{invoices.length} Facturas</span>
          {totalDebt > 0 && (
            <span className="text-red-500 font-bold">Total Pendiente: {formatCurrency(totalDebt)}</span>
          )}
        </div>
      )}

      {/* MODAL DE PAGO */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => { 
          if (!isProcessing) {
            setShowPaymentModal(false); 
            setSelectedInvoice(null); 
            setPayAllMode(false); 
          }
        }}
        amountUSD={getModalAmount()}
        creditBalance={creditBalance}
        title={payAllMode ? "Pagar Deuda Total" : "Pagar Factura"}
        subtitle={payAllMode 
          ? `${pendingInvoices.length} facturas pendientes` 
          : selectedInvoice ? `Factura #${selectedInvoice._id?.slice(-6)}` : undefined
        }
        services={getModalServices()}
        patient={getModalPatient()}
        owner={owner ? { name: owner.name, phone: owner.contact } : undefined}
        onConfirm={handlePaymentConfirm}
        allowPartial={!payAllMode}
      />
    </div>
  );
}

// ==================== SUB-COMPONENTES ====================

interface InvoiceRowProps {
  invoice: Invoice;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onPay: () => void;
  getPendingAmountUSD: (invoice: Invoice) => number;
  getInvoiceDescription: (invoice: Invoice) => string;
}

function InvoiceRow({ 
  invoice, isExpanded, onToggleExpand, onPay, getPendingAmountUSD, getInvoiceDescription 
}: InvoiceRowProps) {
  const status = getStatusConfig(invoice.paymentStatus);
  const StatusIcon = status.icon;
  const pendingAmount = getPendingAmountUSD(invoice);
  const isPending = invoice.paymentStatus === "Pendiente" || invoice.paymentStatus === "Parcial";

  return (
    <div className="border-b border-surface-100 dark:border-slate-800 last:border-0">
      <div className="px-6 py-4 hover:bg-surface-50 dark:hover:bg-dark-100/50 transition-colors">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${
            isPending ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"
          }`}>
            {isPending ? <ArrowUpRight className="w-5 h-5 text-red-500" /> : <ArrowDownLeft className="w-5 h-5 text-emerald-500" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-800 dark:text-white truncate">{getPatientName(invoice)}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${status.bgColor} ${status.color} ${status.borderColor}`}>
                <StatusIcon className="w-3 h-3" />
                {invoice.paymentStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{getInvoiceDescription(invoice)}</p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className={`font-bold text-sm ${isPending ? "text-slate-800 dark:text-white" : "text-emerald-500"}`}>
                {isPending ? "-" : "+"}${invoice.total.toFixed(2)}
              </p>
              {pendingAmount > 0.01 && (
                <p className="text-[11px] text-red-500 font-bold">Debe: ${pendingAmount.toFixed(2)}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={onToggleExpand} className={`p-2 rounded-lg border transition-all ${isExpanded ? "bg-biovet-50 text-biovet-500 border-biovet-200 dark:bg-biovet-950/30" : "text-slate-400 border-transparent hover:bg-surface-100"}`}>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {pendingAmount > 0.01 && (
                <button onClick={onPay} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all">
                  Pagar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-4">
          <div className="ml-11 pl-4 border-l-2 border-biovet-200 dark:border-biovet-800">
            <InvoicePaymentsInline invoiceId={invoice._id!} />
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
      <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Sin transacciones</p>
      <p className="text-xs text-slate-400">No hay registros que mostrar</p>
    </div>
  );
}