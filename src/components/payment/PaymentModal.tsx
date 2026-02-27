// src/components/payment/PaymentModal.tsx
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  X, CheckCircle2, Wallet, CreditCard, TrendingDown, Banknote,
  Phone, User,  Receipt, Loader2, DollarSign
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

  const selectedMethod = useMemo(
    () => paymentMethods.find((m) => m._id === selectedMethodId),
    [paymentMethods, selectedMethodId]
  );

  const isBsMethod = selectedMethod?.currency === "Bs" || selectedMethod?.currency === "VES";
  const validAmountUSD = Math.max(0, amountUSD);
  const maxCredit = Math.min(creditBalance, validAmountUSD);

  const parsedCreditAmount = creditAmount.trim() === "" ? 0 : parseFloat(creditAmount);
  const effectiveCredit = useCredit && creditAmount.trim() !== "" 
    ? Math.min(Math.max(0, parsedCreditAmount), maxCredit)
    : 0;

  const remainingAfterCredit = Math.max(0, validAmountUSD - effectiveCredit);
  const creditCoversAll = effectiveCredit >= validAmountUSD - 0.01;

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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-dark-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-surface-200 dark:border-slate-700">
        
        {/* ═══════════════════════════════════════
            HEADER - Simplificado
            ═══════════════════════════════════════ */}
        <div className="shrink-0 p-4 border-b border-surface-200 dark:border-slate-700">
          {/* Fila superior: Título y X */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-biovet-100 dark:bg-biovet-900/50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-biovet-600 dark:text-biovet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                  {title}
                </h2>
                {patient && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {patient.name}
                  </p>
                )}
              </div>
            </div>
            
            {/* Botón X más grande y accesible */}
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 -m-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-surface-100 dark:hover:text-slate-300 dark:hover:bg-dark-100 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Info del cliente + Monto */}
          <div className="flex items-center justify-between gap-4 p-3 bg-surface-50 dark:bg-dark-100 rounded-xl">
            {owner && (
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 min-w-0">
                <User className="w-4 h-4 shrink-0" />
                <span className="truncate">{owner.name}</span>
                {owner.phone && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{owner.phone}</span>
                  </>
                )}
              </div>
            )}
            <div className="text-right shrink-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Total</p>
              <p className="text-xl font-bold text-biovet-600 dark:text-biovet-400 font-heading">
                ${validAmountUSD.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            CONTENIDO SCROLLEABLE
            ═══════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          
          {/* Servicios */}
          {services.length > 0 && (
            <div className="bg-surface-50 dark:bg-dark-100 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Servicios
                </span>
              </div>
              <div className="space-y-2">
                {services.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      {item.quantity > 1 && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-surface-200 dark:bg-dark-50 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          x{item.quantity}
                        </span>
                      )}
                      <span className="text-slate-700 dark:text-slate-300 truncate">
                        {item.description}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white shrink-0 ml-2">
                      ${item.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sección de Crédito */}
          {canUseCredit && (
            <div className={`rounded-xl border p-4 transition-all ${
              useCredit 
                ? "border-success-300 dark:border-success-700 bg-success-50 dark:bg-success-950/30" 
                : "border-surface-200 dark:border-slate-700 bg-white dark:bg-dark-100"
            }`}>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    useCredit 
                      ? "bg-success-500 text-white" 
                      : "bg-surface-100 dark:bg-dark-50 text-slate-400"
                  }`}>
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${
                      useCredit 
                        ? "text-success-700 dark:text-success-400" 
                        : "text-slate-700 dark:text-slate-300"
                    }`}>
                      Usar saldo a favor
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Disponible: <span className="font-semibold text-success-600 dark:text-success-400">${creditBalance.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
                
                {/* Switch */}
                <div 
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    useCredit ? 'bg-success-500' : 'bg-surface-300 dark:bg-slate-600'
                  }`}
                  onClick={() => {
                    const newValue = !useCredit;
                    setUseCredit(newValue);
                    if (newValue) {
                      setCreditAmount(maxCredit.toFixed(2));
                    } else {
                      setCreditAmount("");
                    }
                  }}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    useCredit ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </label>

              {useCredit && (
                <div className="mt-3 pt-3 border-t border-success-200 dark:border-success-800/50 flex items-center gap-2">
                  <span className="text-sm text-success-700 dark:text-success-400 shrink-0">Aplicar:</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-success-600 font-medium">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={maxCredit}
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      className="input pl-7 text-sm border-success-300 dark:border-success-700 focus:border-success-500 focus:ring-success-200"
                    />
                  </div>
                  <button
                    onClick={() => setCreditAmount(maxCredit.toFixed(2))}
                    className="px-3 py-2 text-xs font-semibold text-success-700 dark:text-success-400 bg-success-100 dark:bg-success-900/50 rounded-lg hover:bg-success-200 dark:hover:bg-success-900 transition-colors"
                  >
                    Máx
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Métodos de pago */}
          {!creditCoversAll && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-biovet-500" />
                  Método de pago
                </p>
                {allowPartial && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPartialPayment}
                      onChange={(e) => {
                        setIsPartialPayment(e.target.checked);
                        if (!e.target.checked) setCustomAmount("");
                      }}
                      className="w-4 h-4 text-warning-500 bg-white dark:bg-dark-100 border-surface-300 dark:border-slate-600 rounded focus:ring-warning-500"
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Pago parcial</span>
                  </label>
                )}
              </div>

              {isLoadingMethods ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-biovet-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activePaymentMethods.map((method) => {
                    const isSelected = selectedMethodId === method._id;
                    const isBs = method.currency === "Bs" || method.currency === "VES";
                    return (
                      <button
                        key={method._id}
                        onClick={() => setSelectedMethodId(isSelected ? "" : method._id)}
                        className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                          isSelected
                            ? "border-biovet-500 bg-biovet-50 dark:bg-biovet-950/30"
                            : "border-surface-200 dark:border-slate-700 bg-white dark:bg-dark-100 hover:border-biovet-300 dark:hover:border-biovet-700"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected 
                            ? "bg-biovet-500 text-white" 
                            : "bg-surface-100 dark:bg-dark-50 text-slate-400"
                        }`}>
                          {isBs ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                        </div>
                        <div className="text-left min-w-0">
                          <p className={`text-xs font-semibold truncate ${
                            isSelected 
                              ? "text-biovet-700 dark:text-biovet-300" 
                              : "text-slate-700 dark:text-slate-300"
                          }`}>
                            {method.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {isBs ? "Bs" : method.currency}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Monto parcial */}
              {isPartialPayment && (
                <div className="bg-warning-50 dark:bg-warning-950/30 border border-warning-200 dark:border-warning-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-warning-600 dark:text-warning-400" />
                    <span className="text-sm font-semibold text-warning-700 dark:text-warning-400">Monto a abonar</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={remainingAfterCredit}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="0.00"
                      className={`input pl-7 text-lg font-semibold ${
                        invalidPartialAmount
                          ? "border-danger-300 focus:border-danger-500 focus:ring-danger-200"
                          : "border-warning-300 dark:border-warning-700 focus:border-warning-500 focus:ring-warning-200"
                      }`}
                    />
                  </div>
                  <p className="text-xs text-warning-600 dark:text-warning-400 mt-2">
                    Máximo: ${remainingAfterCredit.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Tasa de cambio para Bs */}
              {selectedMethodId && isBsMethod && (
                <div className="bg-biovet-50 dark:bg-biovet-950/30 border border-biovet-200 dark:border-biovet-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-biovet-700 dark:text-biovet-400">Tasa de Cambio</span>
                    {isLoadingRate ? (
                      <Loader2 className="w-4 h-4 text-biovet-500 animate-spin" />
                    ) : (
                      <button
                        onClick={() => setUseManualRate(!useManualRate)}
                        className="text-xs font-medium text-biovet-600 dark:text-biovet-400 hover:underline"
                      >
                        {useManualRate ? "Usar BCV" : "Tasa Manual"}
                      </button>
                    )}
                  </div>

                  {useManualRate ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Bs.</span>
                      <input
                        type="number"
                        step="0.01"
                        value={manualRate}
                        onChange={(e) => setManualRate(e.target.value)}
                        placeholder="Ej: 45.50"
                        className="input pl-9 text-sm"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-sm bg-biovet-100 dark:bg-biovet-900/50 px-3 py-2 rounded-lg">
                      <span className="text-biovet-600 dark:text-biovet-400">Tasa BCV:</span>
                      <span className="font-bold text-biovet-700 dark:text-biovet-300">Bs. {currentRate.toFixed(2)}</span>
                    </div>
                  )}

                  {currentRate > 0 && paymentAmount > 0 && (
                    <div className="mt-3 pt-3 border-t border-biovet-200 dark:border-biovet-800">
                      <p className="text-xs text-biovet-600 dark:text-biovet-400 mb-1">Total en Bolívares:</p>
                      <p className="text-xl font-bold text-biovet-700 dark:text-biovet-300 font-heading">
                        Bs. {totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Referencia */}
              {selectedMethodId && (
                <div>
                  <label className="label">
                    Referencia <span className="font-normal text-slate-400">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ej: 12345678"
                    className="input text-sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════
            FOOTER - Resumen + Botones
            ═══════════════════════════════════════ */}
        <div className="shrink-0 border-t border-surface-200 dark:border-slate-700 bg-surface-50 dark:bg-dark-100 p-4 space-y-3">
          {/* Resumen compacto */}
          <div className="flex items-center justify-between text-sm">
            <div className="space-y-1">
              {effectiveCredit > 0 && (
                <div className="flex items-center gap-2 text-success-600 dark:text-success-400">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Crédito: -${effectiveCredit.toFixed(2)}</span>
                </div>
              )}
              {paymentAmount > 0 && selectedMethodId && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>
                    {selectedMethod?.name}: {isBsMethod && currentRate > 0
                      ? `Bs. ${totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`
                      : `$${paymentAmount.toFixed(2)}`
                    }
                  </span>
                </div>
              )}
              {isPartialPayment && paymentAmount > 0 && (
                <div className="text-xs text-warning-600 dark:text-warning-400">
                  Pendiente: ${(validAmountUSD - effectiveCredit - paymentAmount).toFixed(2)}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase">Total a pagar</p>
              <p className="text-2xl font-bold text-biovet-600 dark:text-biovet-400 font-heading">
                ${(effectiveCredit + paymentAmount).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="btn-primary flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {creditCoversAll
                    ? "Aplicar Crédito"
                    : isPartialPayment
                      ? "Registrar Abono"
                      : "Confirmar Pago"
                  }
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}