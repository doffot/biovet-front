// src/components/payment/PaymentModal.tsx
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  X, CheckCircle2, Wallet, CreditCard, TrendingDown, Banknote,
  Phone, User, PawPrint, Receipt, Sparkles,Loader2
} from "lucide-react";
import { getBCVRate } from "@/utils/exchangeRateService";
import { getPaymentMethods } from "@/api/paymentAPI";
import { toast } from "../Toast";

export interface PaymentServiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentPatientInfo {
  name: string;
  photo?: string | null;
}

export interface PaymentOwnerInfo {
  name: string;
  phone?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: {
    paymentMethodId?: string;
    reference?: string;
    addAmountPaidUSD: number;
    addAmountPaidBs: number;
    exchangeRate: number;
    isPartial: boolean;
    creditAmountUsed?: number;
  }) => void;
  amountUSD: number;
  creditBalance?: number;
  services?: PaymentServiceItem[];
  patient?: PaymentPatientInfo;
  owner?: PaymentOwnerInfo;
  title?: string;
  subtitle?: string;
  allowPartial?: boolean;
}

export function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  amountUSD,
  creditBalance = 0,
  services = [],
  patient,
  owner,
  title = "Procesar Pago",
  allowPartial = true,
}: PaymentModalProps) {
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [reference, setReference] = useState("");
  const [useCredit, setUseCredit] = useState(false);
  const [creditAmount, setCreditAmount] = useState<string>("");
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [bcvRate, setBcvRate] = useState<number | null>(null);
  const [manualRate, setManualRate] = useState<string>("");
  const [useManualRate, setUseManualRate] = useState(false);
  const [isLoadingRate, setIsLoadingRate] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: paymentMethods = [], isLoading: isLoadingMethods } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: getPaymentMethods,
    enabled: isOpen,
  });

  // Cargar tasa BCV
  useEffect(() => {
    if (isOpen) {
      setIsLoadingRate(true);
      getBCVRate()
        .then((rate) => {
          setBcvRate(rate);
          setIsLoadingRate(false);
        })
        .catch(() => {
          setBcvRate(null);
          setIsLoadingRate(false);
          setUseManualRate(true);
        });
    }
  }, [isOpen]);

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSelectedMethodId("");
      setReference("");
      setUseCredit(false);
      setCreditAmount("");
      setIsPartialPayment(false);
      setCustomAmount("");
      setManualRate("");
      setUseManualRate(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  // --- CÁLCULOS CORREGIDOS ---
  const selectedMethod = useMemo(
    () => paymentMethods.find((m) => m._id === selectedMethodId),
    [paymentMethods, selectedMethodId]
  );

  const isBsMethod = selectedMethod?.currency === "Bs" || selectedMethod?.currency === "VES";
  
  // Asegurar que amountUSD sea positivo
  const validAmountUSD = Math.max(0, amountUSD);
  const maxCredit = Math.min(creditBalance, validAmountUSD);

  // Parsear crédito de forma segura
  const parsedCreditAmount = creditAmount.trim() === "" ? 0 : parseFloat(creditAmount);
  const effectiveCredit = useCredit && creditAmount.trim() !== "" 
    ? Math.min(Math.max(0, parsedCreditAmount), maxCredit)
    : 0;

  const remainingAfterCredit = Math.max(0, validAmountUSD - effectiveCredit);
  const creditCoversAll = effectiveCredit >= validAmountUSD - 0.01; // tolerancia

  // Monto a pagar (solo si no está cubierto por crédito)
  const paymentAmount = useMemo(() => {
    if (creditCoversAll) return 0;
    if (isPartialPayment) {
      const custom = customAmount.trim() === "" ? 0 : parseFloat(customAmount);
      return Math.min(Math.max(0, custom), remainingAfterCredit);
    }
    return remainingAfterCredit;
  }, [creditCoversAll, isPartialPayment, customAmount, remainingAfterCredit]);

  const currentRate = useManualRate ? (parseFloat(manualRate) || 0) : (bcvRate || 0);
  const totalBs = currentRate > 0 ? paymentAmount * currentRate : 0;

  // --- VALIDACIÓN CORREGIDA ---
  const needsPaymentMethod = !creditCoversAll && paymentAmount > 0;
  const needsRate = needsPaymentMethod && isBsMethod && currentRate <= 0;
  const invalidPartialAmount = isPartialPayment && (
    parseFloat(customAmount) <= 0 || 
    parseFloat(customAmount) > remainingAfterCredit
  );

  
  const canSubmit =
    (effectiveCredit > 0 || paymentAmount > 0) &&
    (!needsPaymentMethod || selectedMethodId) &&
    !needsRate &&
    !invalidPartialAmount &&
    !isProcessing;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsProcessing(true);
    try {
      let addAmountPaidUSD = 0;
      let addAmountPaidBs = 0;

      if (paymentAmount > 0 && selectedMethodId) {
        if (isBsMethod) {
          addAmountPaidBs = parseFloat(totalBs.toFixed(2));
        } else {
          addAmountPaidUSD = parseFloat(paymentAmount.toFixed(2));
        }
      }

      await onConfirm({
        paymentMethodId: selectedMethodId || undefined,
        reference: reference || undefined,
        addAmountPaidUSD,
        addAmountPaidBs,
        exchangeRate: currentRate || 1,
        isPartial: isPartialPayment || (useCredit && !creditCoversAll && !selectedMethodId),
        creditAmountUsed: effectiveCredit > 0 ? effectiveCredit : undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      toast.error("Error", "Ocurrió un problema al procesar el pago.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const activePaymentMethods = paymentMethods.filter((m) => m.isActive);
  const canUseCredit = creditBalance > 0 && validAmountUSD > 0;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-dark-200 border border-surface-200 dark:border-dark-100 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-linear-to-r from-biovet-500 to-biovet-600 p-6 shrink-0 relative overflow-hidden">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 pr-8 relative z-10">
            <div className="shrink-0">
              {patient?.photo ? (
                <img
                  src={patient.photo}
                  alt={patient.name}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-white/30 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-md">
                  <PawPrint className="w-7 h-7 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white font-heading truncate">{title}</h2>
              {patient && (
                <p className="text-biovet-100 text-sm font-medium mt-0.5">{patient.name}</p>
              )}
              {owner && (
                <div className="flex items-center gap-3 mt-1 text-white/80 text-xs">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{owner.name}</span>
                  {owner.phone && (
                    <span className="flex items-center gap-1 opacity-75"><Phone className="w-3 h-3" />{owner.phone}</span>
                  )}
                </div>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className="text-biovet-100 text-[10px] uppercase tracking-wide font-bold">Monto Total</p>
              <p className="text-2xl font-black text-white tracking-tight">${validAmountUSD.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-surface-50 dark:bg-dark-300">
          
          {/* Servicios */}
          {services.length > 0 && (
            <div className="bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-dark-100 overflow-hidden shadow-sm">
              <div className="px-4 py-2 bg-surface-50 dark:bg-dark-100 border-b border-surface-200 dark:border-dark-100 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-biovet-500" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Detalle de servicios</span>
              </div>
              <div className="divide-y divide-surface-100 dark:divide-dark-50">
                {services.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm hover:bg-surface-50 dark:hover:bg-dark-100/50">
                    <div className="col-span-7 text-slate-700 dark:text-slate-200 font-medium">
                      {item.quantity > 1 && (
                        <span className="inline-flex items-center justify-center min-w-5 h-5 rounded bg-surface-200 dark:bg-dark-50 text-[10px] font-bold text-slate-600 dark:text-slate-300 mr-2 px-1">x{item.quantity}</span>
                      )}
                      <span className="truncate">{item.description}</span>
                    </div>
                    <div className="col-span-2 text-right text-slate-500 dark:text-slate-400 text-xs mt-0.5">${item.unitPrice.toFixed(2)}</div>
                    <div className="col-span-3 text-right font-bold text-slate-800 dark:text-white">${item.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sección de Crédito - SOLO si es posible usarlo */}
          {canUseCredit && (
            <div className={`rounded-xl border p-4 transition-all duration-300 ${
              useCredit 
                ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-900/10 shadow-sm" 
                : "border-surface-200 dark:border-dark-100 bg-white dark:bg-dark-200"
            }`}>
              <label className="flex items-center justify-between cursor-pointer select-none">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${
                    useCredit 
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30" 
                      : "bg-surface-100 dark:bg-dark-100 text-slate-400"
                  }`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${useCredit ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-200"}`}>
                      Usar saldo a favor
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Disponible: <span className="font-bold text-emerald-600 dark:text-emerald-400">${creditBalance.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
                
                <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${useCredit ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-dark-50'}`}>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={useCredit}
                    disabled={!canUseCredit}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setUseCredit(checked);
                      if (checked) {
                        // ✅ Inicializar con el máximo permitido
                        setCreditAmount(maxCredit.toFixed(2));
                      } else {
                        setCreditAmount("");
                      }
                    }}
                  />
                  <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-200 ease-in-out ${useCredit ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </label>

              {useCredit && (
                <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-800/30 flex items-center gap-3">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Monto a aplicar:</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={maxCredit}
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      className="w-full pl-6 pr-3 py-2 bg-white dark:bg-dark-100 border border-emerald-300 dark:border-emerald-800 rounded-lg text-sm font-bold text-emerald-700 dark:text-emerald-300 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={() => setCreditAmount(maxCredit.toFixed(2))}
                    className="px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                  >
                    Máximo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Métodos de pago - Solo si hay monto a pagar */}
          {!creditCoversAll && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-biovet-500" /> Método de pago
                </p>
                {allowPartial && (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPartialPayment}
                      onChange={(e) => {
                        setIsPartialPayment(e.target.checked);
                        if (!e.target.checked) setCustomAmount("");
                      }}
                      className="w-4 h-4 text-amber-500 bg-white dark:bg-dark-100 border-surface-300 dark:border-dark-50 rounded focus:ring-amber-500"
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Pago parcial</span>
                  </label>
                )}
              </div>

              {isLoadingMethods ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-biovet-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {activePaymentMethods.map((method) => {
                    const isSelected = selectedMethodId === method._id;
                    const isBs = method.currency === "Bs" || method.currency === "VES";
                    return (
                      <button
                        key={method._id}
                        onClick={() => setSelectedMethodId(isSelected ? "" : method._id)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                          isSelected
                            ? "border-biovet-500 bg-biovet-50 dark:bg-biovet-950/30 shadow-md"
                            : "border-surface-200 dark:border-dark-50 bg-white dark:bg-dark-200 hover:border-biovet-300 dark:hover:border-biovet-800"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected ? "bg-biovet-500 text-white" : "bg-surface-100 dark:bg-dark-100 text-slate-400"
                        }`}>
                          {isBs ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                        </div>
                        <div className="text-center">
                          <p className={`text-xs font-bold truncate w-full ${isSelected ? "text-biovet-700 dark:text-biovet-300" : "text-slate-700 dark:text-slate-300"}`}>
                            {method.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">{isBs ? "Bolívares" : method.currency}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {isPartialPayment && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-500">Monto a abonar</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={remainingAfterCredit}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className={`w-full pl-7 pr-3 py-3 bg-white dark:bg-dark-100 border rounded-xl text-lg font-bold text-slate-800 dark:text-white focus:ring-2 outline-none ${
                        invalidPartialAmount
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-amber-300 dark:border-amber-800 focus:border-amber-500 focus:ring-amber-200 dark:focus:ring-amber-900/30"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                    Máximo permitido: ${remainingAfterCredit.toFixed(2)}
                  </p>
                </div>
              )}

              {selectedMethodId && isBsMethod && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400">Tasa de Cambio</span>
                    {isLoadingRate ? (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : (
                      <button
                        onClick={() => setUseManualRate(!useManualRate)}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 dark:hover:text-blue-300 underline"
                      >
                        {useManualRate ? "Usar BCV" : "Tasa Manual"}
                      </button>
                    )}
                  </div>

                  {useManualRate ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">Bs.</span>
                      <input
                        type="number"
                        step="0.01"
                        value={manualRate}
                        onChange={(e) => setManualRate(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-dark-100 border border-blue-300 dark:border-blue-800 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-200 outline-none"
                        placeholder="Ej: 45.50"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-xs text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-lg">
                      <span>Tasa BCV:</span>
                      <span className="font-bold text-sm">Bs. {currentRate.toFixed(2)}</span>
                    </div>
                  )}

                  {currentRate > 0 && paymentAmount > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800/30">
                      <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Monto a cobrar en Bolívares:</p>
                      <p className="text-2xl font-black text-blue-700 dark:text-blue-300">
                        Bs. {totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedMethodId && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">
                    Referencia / Comprobante <span className="font-normal opacity-70">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-dark-200 border border-surface-300 dark:border-dark-50 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-biovet-500/20 focus:border-biovet-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="Ej: 12345678"
                  />
                </div>
              )}
            </div>
          )}

          {/* Resumen Final */}
          <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-surface-200 dark:border-dark-100 shadow-sm mt-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-biovet-500" /> Resumen Final
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Factura:</span>
                <span className="font-medium text-slate-800 dark:text-white">${validAmountUSD.toFixed(2)}</span>
              </div>
              {effectiveCredit > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> Crédito aplicado:</span>
                  <span className="font-bold">-${effectiveCredit.toFixed(2)}</span>
                </div>
              )}
              {paymentAmount > 0 && selectedMethodId && (
                <div className="flex justify-between text-biovet-600 dark:text-biovet-400">
                  <span>Pago {selectedMethod?.name}:</span>
                  <span className="font-bold">
                    {isBsMethod && currentRate > 0
                      ? `Bs. ${totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`
                      : `$${paymentAmount.toFixed(2)}`}
                  </span>
                </div>
              )}
              <div className="pt-3 mt-3 border-t border-dashed border-surface-200 dark:border-dark-50 flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-white">Total a pagar:</span>
                <span className="text-xl font-black text-biovet-600 dark:text-biovet-400">
                  ${(effectiveCredit + paymentAmount).toFixed(2)}
                </span>
              </div>
              {isPartialPayment && paymentAmount > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-500 text-xs font-medium bg-amber-50 dark:bg-amber-900/10 px-2 py-1 rounded-lg">
                  <span>Quedará pendiente:</span>
                  <span>${(validAmountUSD - effectiveCredit - paymentAmount).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-200 dark:border-dark-100 flex gap-3 shrink-0 bg-white dark:bg-dark-200">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 rounded-xl border border-surface-300 dark:border-dark-50 text-slate-600 dark:text-slate-300 font-bold hover:bg-surface-50 dark:hover:bg-dark-100 transition-all duration-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
              canSubmit
                ? "bg-linear-to-r from-biovet-500 to-biovet-600 hover:from-biovet-600 hover:to-biovet-700 text-white shadow-biovet-500/20 transform active:scale-95"
                : "bg-surface-100 dark:bg-dark-100 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {creditCoversAll
                  ? "Aplicar Crédito"
                  : isPartialPayment
                    ? "Registrar Abono"
                    : "Pagar Total"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}