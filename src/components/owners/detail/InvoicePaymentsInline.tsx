// src/components/owners/detail/InvoicePaymentsInline.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircle2, XCircle, AlertTriangle, 
  RotateCcw, Loader2, CreditCard as CreditCardIcon 
} from 'lucide-react';

import { getPaymentsByInvoice, cancelPayment } from '@/api/paymentAPI';
import { getPaymentMethodName, formatPaymentAmount } from '@/types/payment';
import { toast } from '@/components/Toast';
import { formatDateTime } from '@/utils/ownerHelpers';

interface InvoicePaymentsInlineProps {
  invoiceId: string;
}

export function InvoicePaymentsInline({ invoiceId }: InvoicePaymentsInlineProps) {
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // ==================== QUERY ====================
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments", "invoice", invoiceId],
    queryFn: () => getPaymentsByInvoice(invoiceId),
    enabled: !!invoiceId,
  });

  // ==================== MUTATION ====================
  const cancelMutation = useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) => 
      cancelPayment(paymentId, reason),
    onSuccess: (data) => {
      toast.success(data.msg);
      queryClient.invalidateQueries({ queryKey: ["payments", "invoice", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["owner"] });
      setShowCancelConfirm(null);
      setCancelReason("");
      setCancellingId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setCancellingId(null);
    },
  });

  // ==================== HANDLERS ====================
  const handleCancel = (paymentId: string) => {
    setCancellingId(paymentId);
    cancelMutation.mutate({ 
      paymentId, 
      reason: cancelReason || "Anulación solicitada" 
    });
  };

  // ==================== LOADING STATE ====================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4 sm:py-6">
        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 animate-spin" />
      </div>
    );
  }

  // ==================== EMPTY STATE ====================
  if (payments.length === 0) {
    return (
      <div className="text-center py-4 sm:py-6">
        <CreditCardIcon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-slate-300 mb-1" />
        <p className="text-xs sm:text-sm text-slate-500">Sin pagos registrados</p>
      </div>
    );
  }

  // ==================== COMPUTED ====================
  const activePayments = payments.filter((p) => p.status === "active");
  const cancelledPayments = payments.filter((p) => p.status === "cancelled");

  // ==================== RENDER ====================
  return (
    <div className="space-y-2 py-2">
      {/* Header */}
      <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase mb-2 sm:mb-3">
        {activePayments.length} pago{activePayments.length !== 1 ? "s" : ""} activo{activePayments.length !== 1 ? "s" : ""}
        {cancelledPayments.length > 0 && (
          <span className="text-slate-400">
            {" "}• {cancelledPayments.length} anulado{cancelledPayments.length !== 1 ? "s" : ""}
          </span>
        )}
      </p>

      {/* Active Payments */}
      {activePayments.map((payment) => (
        <div 
          key={payment._id} 
          className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 
                     bg-white dark:bg-dark-200 rounded-lg sm:rounded-xl 
                     border border-surface-200 dark:border-slate-700"
        >
          {/* Icon */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 
                          flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                {formatPaymentAmount(payment)}
              </span>
              {payment.currency === "Bs" && (
                <span className="text-[9px] sm:text-[10px] text-slate-400">
                  ≈ ${payment.amountUSD.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-slate-400 flex-wrap">
              <CreditCardIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
              <span className="truncate">{getPaymentMethodName(payment)}</span>
              <span className="hidden xs:inline">•</span>
              <span className="hidden xs:inline">{formatDateTime(payment.createdAt)}</span>
            </div>
            {payment.reference && (
              <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">
                Ref: {payment.reference}
              </p>
            )}
          </div>
          
          {/* Cancel Button */}
          <button
            onClick={() => setShowCancelConfirm(payment._id)}
            disabled={cancellingId === payment._id}
            className="p-1 sm:p-1.5 rounded-md sm:rounded-lg 
                       hover:bg-red-50 dark:hover:bg-red-900/20 
                       text-slate-400 hover:text-red-500 
                       transition-colors flex-shrink-0"
            title="Anular pago"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      ))}

      {/* Divider */}
      {cancelledPayments.length > 0 && activePayments.length > 0 && (
        <div className="flex items-center gap-2 py-1.5 sm:py-2">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase">Anulados</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>
      )}

      {/* Cancelled Payments */}
      {cancelledPayments.map((payment) => (
        <div 
          key={payment._id} 
          className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 
                     bg-slate-100 dark:bg-dark-100 rounded-lg sm:rounded-xl 
                     opacity-60"
        >
          {/* Icon */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-700 
                          flex items-center justify-center flex-shrink-0">
            <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-slate-400 line-through">
                {formatPaymentAmount(payment)}
              </span>
              <span className="px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold 
                               bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                Anulado
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400">
              {formatDateTime(payment.createdAt)}
            </p>
            {payment.cancelledReason && (
              <p className="text-[9px] sm:text-[10px] text-red-400 mt-0.5 truncate">
                {payment.cancelledReason}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <CancelConfirmModal 
          isOpen={!!showCancelConfirm}
          onClose={() => { 
            setShowCancelConfirm(null); 
            setCancelReason(""); 
          }}
          onConfirm={() => handleCancel(showCancelConfirm)}
          isLoading={cancellingId === showCancelConfirm}
          reason={cancelReason}
          onReasonChange={setCancelReason}
        />
      )}
    </div>
  );
}

// ==================== CANCEL CONFIRM MODAL ====================
interface CancelConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  reason: string;
  onReasonChange: (reason: string) => void;
}

function CancelConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading, 
  reason, 
  onReasonChange 
}: CancelConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-dark-200 rounded-xl sm:rounded-2xl shadow-2xl 
                      max-w-sm sm:max-w-md w-full p-4 sm:p-6 mx-4">
        
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 dark:bg-red-900/30 
                          flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">
              ¿Anular este pago?
            </h4>
            <p className="text-xs sm:text-sm text-slate-500">
              El saldo de la factura será recalculado
            </p>
          </div>
        </div>

        {/* Reason Input */}
        <div className="mb-3 sm:mb-4">
          <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Razón (opcional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Ej: Error en el monto..."
            className="w-full px-3 py-2 sm:py-2.5 
                       border border-surface-200 dark:border-slate-700 
                       rounded-lg sm:rounded-xl text-xs sm:text-sm 
                       focus:ring-2 focus:ring-red-500/20 focus:border-red-500 
                       bg-white dark:bg-dark-100
                       placeholder:text-slate-400"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 sm:py-2.5 
                       bg-surface-100 dark:bg-dark-100 
                       hover:bg-surface-200 dark:hover:bg-dark-300 
                       text-slate-700 dark:text-slate-300 
                       rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm
                       transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2 sm:py-2.5 
                       bg-red-600 hover:bg-red-700 text-white 
                       rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm
                       transition-colors disabled:opacity-50 
                       flex items-center justify-center gap-1.5 sm:gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> 
                <span className="hidden xs:inline">Anulando...</span>
                <span className="xs:hidden">...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
                Anular
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}