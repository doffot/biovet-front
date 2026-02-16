// src/components/owners/detail/tabs/GeneralTab.tsx
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Edit3,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Owner } from "@/types/owner";
import type { Invoice } from "@/types/invoice";
import { getPatientName } from "@/types/invoice";
import { getInvoices } from "@/api/invoiceAPI";
import { createPayment } from "@/api/paymentAPI";
import { formatCurrency, getStatusConfig, formatDate } from "@/utils/ownerHelpers";
import { toast } from "@/components/Toast";
import { PaymentModal, type PaymentServiceItem } from "@/components/payment/PaymentModal";
import EditOwnerModal from "../../EditOwnerModal";

interface GeneralTabProps {
  owner?: Owner;
}

export function GeneralTab({ owner }: GeneralTabProps) {
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPendingInvoices, setShowPendingInvoices] = useState(false);

  // Query facturas
  const { data: invoicesResponse, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["invoices", { ownerId: owner?._id }],
    queryFn: () => getInvoices({ ownerId: owner!._id }),
    enabled: !!owner?._id,
  });

  const invoices = invoicesResponse?.invoices || [];

  const { mutateAsync: createPaymentAsync } = useMutation({
    mutationFn: createPayment,
  });

  // ==================== COMPUTED ====================
  const pendingInvoices = useMemo(
    () => invoices.filter((inv) => inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial"),
    [invoices]
  );

  const totalDebt = useMemo(
    () =>
      pendingInvoices.reduce((sum, inv) => {
        const remaining = inv.total - (inv.amountPaid || 0);
        if (inv.currency === "Bs" && inv.exchangeRate) return sum + remaining / inv.exchangeRate;
        return sum + remaining;
      }, 0),
    [pendingInvoices]
  );

  const totalPaid = useMemo(
    () =>
      invoices.reduce((sum, inv) => {
        const paid = inv.amountPaid || 0;
        if (inv.currency === "Bs" && inv.exchangeRate) return sum + paid / inv.exchangeRate;
        return sum + paid;
      }, 0),
    [invoices]
  );

  const getPendingAmountUSD = (invoice: Invoice) => {
    const paid = (invoice.amountPaidUSD || 0) + ((invoice.amountPaidBs || 0) / (invoice.exchangeRate || 1));
    return Math.max(0, invoice.total - paid);
  };

  const selectedInvoices = useMemo(
    () => pendingInvoices.filter((inv) => selectedInvoiceIds.has(inv._id!)),
    [pendingInvoices, selectedInvoiceIds]
  );

  const selectedTotalUSD = useMemo(
    () => selectedInvoices.reduce((sum, inv) => sum + getPendingAmountUSD(inv), 0),
    [selectedInvoices]
  );

  // ==================== SELECTION ====================
  const toggleInvoice = (invoiceId: string) => {
    setSelectedInvoiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(invoiceId)) next.delete(invoiceId);
      else next.add(invoiceId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedInvoiceIds.size === pendingInvoices.length) {
      setSelectedInvoiceIds(new Set());
    } else {
      setSelectedInvoiceIds(new Set(pendingInvoices.map((inv) => inv._id!)));
    }
  };

  const allSelected = pendingInvoices.length > 0 && selectedInvoiceIds.size === pendingInvoices.length;

  // ==================== PAYMENT ====================
  const handleOpenPayment = () => {
    if (selectedInvoiceIds.size === 0) {
      toast.warning("Selecciona facturas", "Debes seleccionar al menos una factura.");
      return;
    }
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const getModalServices = (): PaymentServiceItem[] => {
    if (selectedInvoices.length === 1) {
      return selectedInvoices[0].items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.cost,
        total: item.cost * item.quantity,
      }));
    }
    return selectedInvoices.map((inv) => ({
      description: `Factura #${inv._id?.slice(-6)} — ${getPatientName(inv)}`,
      quantity: 1,
      unitPrice: getPendingAmountUSD(inv),
      total: getPendingAmountUSD(inv),
    }));
  };

  const getModalPatient = () => {
    if (selectedInvoices.length === 1) {
      const inv = selectedInvoices[0];
      if (inv.patientId && typeof inv.patientId === "object") {
        return { name: inv.patientId.name };
      }
    }
    return undefined;
  };

  const handlePaymentConfirm = async (paymentData: any) => {
    setIsProcessing(true);
    try {
      const exchangeRate = paymentData.exchangeRate || 1;
      const isPayingInBs = paymentData.addAmountPaidBs > 0;
      let successCount = 0;

      for (const invoice of selectedInvoices) {
        const pendingUSD = getPendingAmountUSD(invoice);
        if (pendingUSD <= 0.001) continue;

        const payload: any = {
          invoiceId: invoice._id,
          currency: isPayingInBs ? "Bs" : "USD",
          exchangeRate,
          amount: isPayingInBs ? pendingUSD * exchangeRate : pendingUSD,
        };

        if (paymentData.paymentMethodId) payload.paymentMethod = paymentData.paymentMethodId;
        if (paymentData.reference) payload.reference = paymentData.reference;
        if (paymentData.creditAmountUsed && paymentData.creditAmountUsed > 0 && successCount === 0) {
          payload.creditAmountUsed = paymentData.creditAmountUsed;
        }

        await createPaymentAsync(payload);
        successCount++;
      }

      if (successCount > 0) {
        toast.success(
          "Pago Registrado",
          successCount === 1
            ? "La factura ha sido actualizada."
            : `Se pagaron ${successCount} facturas.`
        );
      }

      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["owner"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });

      setSelectedInvoiceIds(new Set());
      setShowPaymentModal(false);
    } catch (error: any) {
      toast.error("Error", error.message || "No se pudo procesar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!owner) return null;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* ============================================
            INFO PERSONAL
            ============================================ */}
        <div className="bg-white dark:bg-dark-200 p-5 sm:p-6 border border-surface-200 dark:border-slate-800 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-biovet-500 flex items-center justify-center text-white">
                <User size={18} />
              </div>
              Información Personal
            </h3>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-9 h-9 rounded-lg border border-surface-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-biovet-50 dark:hover:bg-biovet-950 hover:text-biovet-500 dark:hover:text-biovet-400 hover:border-biovet-200 dark:hover:border-biovet-800 transition-all"
            >
              <Edit3 size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <DetailRow label="Nombre" value={owner.name} icon={<User size={15} />} />
            <DetailRow label="Teléfono" value={owner.contact} icon={<Phone size={15} />} />
            <DetailRow label="Email" value={owner.email} icon={<Mail size={15} />} />
            <DetailRow label="Dirección" value={owner.address} icon={<MapPin size={15} />} />
            <DetailRow label="ID Nacional" value={owner.nationalId} icon={<CreditCard size={15} />} />
          </div>
        </div>

        {/* ============================================
            ESTADO DE CUENTA + FACTURAS PENDIENTES
            ============================================ */}
        <div className="bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-5 sm:p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-biovet-500 flex items-center justify-center text-white">
                <CreditCard size={18} />
              </div>
              Estado de Cuenta
            </h3>

            {/* Cards resumen */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div
                className={`p-3 sm:p-4 rounded-xl text-center border ${
                  (owner.creditBalance || 0) >= 0
                    ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20"
                    : "bg-danger-50/50 dark:bg-danger-500/5 border-danger-100 dark:border-danger-500/20"
                }`}
              >
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Crédito</p>
                <p className={`text-lg sm:text-2xl font-black ${(owner.creditBalance || 0) >= 0 ? "text-emerald-500" : "text-danger-500"}`}>
                  {formatCurrency(owner.creditBalance || 0)}
                </p>
              </div>

              <div className="p-3 sm:p-4 rounded-xl text-center border bg-surface-50 dark:bg-dark-100 border-surface-200 dark:border-slate-700">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Pagado</p>
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500 hidden sm:block" />
                  <p className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalPaid)}
                  </p>
                </div>
              </div>

              <div
                className={`p-3 sm:p-4 rounded-xl text-center border ${
                  totalDebt > 0
                    ? "bg-danger-50/50 dark:bg-danger-500/5 border-danger-100 dark:border-danger-500/20"
                    : "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20"
                }`}
              >
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Deuda</p>
                <div className="flex items-center justify-center gap-1">
                  <TrendingDown className={`w-3.5 h-3.5 hidden sm:block ${totalDebt > 0 ? "text-danger-500" : "text-emerald-500"}`} />
                  <p className={`text-lg sm:text-2xl font-black ${totalDebt > 0 ? "text-danger-600 dark:text-danger-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {formatCurrency(totalDebt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Acordeón Facturas Pendientes ---- */}
          {isLoadingInvoices ? (
            <div className="px-5 pb-5 flex justify-center">
              <Loader2 className="w-5 h-5 text-biovet-500 animate-spin" />
            </div>
          ) : pendingInvoices.length > 0 ? (
            <>
              {/* Toggle */}
              <button
                onClick={() => setShowPendingInvoices(!showPendingInvoices)}
                className="w-full px-5 py-3 border-t border-surface-200 dark:border-slate-800 flex items-center justify-between hover:bg-surface-50 dark:hover:bg-dark-100/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-danger-500" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {pendingInvoices.length} factura{pendingInvoices.length !== 1 ? "s" : ""} pendiente{pendingInvoices.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs font-bold text-danger-500">
                    {formatCurrency(totalDebt)}
                  </span>
                </div>
                {showPendingInvoices ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Lista expandible */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showPendingInvoices ? "max-h-150 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {/* Seleccionar todo + Pagar */}
                <div className="px-5 py-3 border-t border-surface-100 dark:border-slate-800 bg-surface-50/50 dark:bg-dark-100/30 flex items-center justify-between">
                  <button
                    onClick={toggleAll}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-biovet-500 transition-colors"
                  >
                    <div
                      className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all ${
                        allSelected
                          ? "bg-biovet-500 border-biovet-500 text-white"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {allSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                    {allSelected ? "Deseleccionar" : "Seleccionar todo"}
                  </button>

                  {selectedInvoiceIds.size > 0 && (
                    <button
                      onClick={handleOpenPayment}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 active:scale-95"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CreditCard className="w-3.5 h-3.5" />
                      )}
                      Pagar ({formatCurrency(selectedTotalUSD)})
                    </button>
                  )}
                </div>

                {/* Facturas */}
                <div className="divide-y divide-surface-100 dark:divide-slate-800 max-h-80 overflow-y-auto scrollbar-thin">
                  {pendingInvoices.map((invoice) => {
                    const pending = getPendingAmountUSD(invoice);
                    const status = getStatusConfig(invoice.paymentStatus);
                    const StatusIcon = status.icon;
                    const isSelected = selectedInvoiceIds.has(invoice._id!);

                    return (
                      <div
                        key={invoice._id}
                        onClick={() => toggleInvoice(invoice._id!)}
                        className={`px-5 py-3 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-biovet-50/50 dark:bg-biovet-950/10"
                            : "hover:bg-surface-50 dark:hover:bg-dark-100/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Checkbox */}
                          <div
                            className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                              isSelected
                                ? "bg-biovet-500 border-biovet-500 text-white"
                                : "border-slate-300 dark:border-slate-600"
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                                {getPatientName(invoice)}
                              </span>
                              <span
                                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold border ${status.bgColor} ${status.color} ${status.borderColor}`}
                              >
                                <StatusIcon className="w-2.5 h-2.5" />
                                {invoice.paymentStatus}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {invoice.items?.map((i) => i.description).slice(0, 2).join(", ")}
                              {(invoice.items?.length || 0) > 2 && ` +${(invoice.items?.length || 0) - 2}`}
                              <span className="mx-1">·</span>
                              {formatDate(invoice.date)}
                            </p>
                          </div>

                          {/* Monto */}
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-white">
                              ${invoice.total.toFixed(2)}
                            </p>
                            {pending > 0.01 && pending < invoice.total && (
                              <p className="text-[10px] text-danger-500 font-bold">
                                ${pending.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer selección */}
                {selectedInvoiceIds.size > 0 && (
                  <div className="px-5 py-2.5 bg-biovet-50 dark:bg-biovet-950/20 border-t border-biovet-200 dark:border-biovet-800 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-biovet-700 dark:text-biovet-400">
                      {selectedInvoiceIds.size} seleccionada{selectedInvoiceIds.size !== 1 ? "s" : ""}
                    </span>
                    <span className="text-sm font-black text-biovet-700 dark:text-biovet-400">
                      {formatCurrency(selectedTotalUSD)}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Sin deudas inline */
            <div className="px-5 py-4 border-t border-surface-200 dark:border-slate-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sin facturas pendientes</p>
                <p className="text-[11px] text-slate-400">Al día con todos los pagos</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================
          MODALES
          ============================================ */}
      <EditOwnerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        owner={owner}
      />

      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handleClosePaymentModal}
          amountUSD={selectedTotalUSD}
          creditBalance={owner.creditBalance || 0}
          title={selectedInvoices.length === 1 ? "Pagar Factura" : `Pagar ${selectedInvoices.length} Facturas`}
          subtitle={
            selectedInvoices.length === 1
              ? `Factura #${selectedInvoices[0]._id?.slice(-6)}`
              : `${formatCurrency(selectedTotalUSD)} en total`
          }
          services={getModalServices()}
          patient={getModalPatient()}
          owner={{ name: owner.name, phone: owner.contact }}
          onConfirm={handlePaymentConfirm}
          allowPartial={selectedInvoices.length === 1}
        />
      )}
    </>
  );
}

// ==================== SUB-COMPONENTES ====================

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-surface-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
        <span
          className={`text-sm font-semibold truncate ${
            value ? "text-slate-800 dark:text-slate-200" : "text-slate-300 dark:text-slate-600"
          }`}
        >
          {value || "No registrado"}
        </span>
      </div>
    </div>
  );
}