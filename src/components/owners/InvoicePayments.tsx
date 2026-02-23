// src/components/owners/InvoicePayments.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  Calendar,
  RotateCcw,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { getPaymentsByInvoice, cancelPayment } from "../../api/paymentAPI";
import {
  type Payment,
  getPaymentMethodName,
  getCreatorName,
//   getCancelledByName,
  formatPaymentAmount,
} from "../../types/payment";
import { toast } from "../Toast";

interface InvoicePaymentsProps {
  invoiceId: string;
  onPaymentCancelled?: () => void;
}

export function InvoicePayments({
  invoiceId,
  onPaymentCancelled,
}: InvoicePaymentsProps) {
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments", "invoice", invoiceId],
    queryFn: () => getPaymentsByInvoice(invoiceId),
    enabled: !!invoiceId,
  });

  const { mutate: cancelPaymentMutation } = useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
      cancelPayment(paymentId, reason),
    onSuccess: (data) => {
      toast.success(data.msg);
      queryClient.invalidateQueries({ queryKey: ["payments", "invoice", invoiceId] });
      setShowCancelConfirm(null);
      setCancelReason("");
      setCancellingId(null);
      onPaymentCancelled?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setCancellingId(null);
    },
  });

  const handleCancelPayment = (paymentId: string) => {
    setCancellingId(paymentId);
    cancelPaymentMutation({
      paymentId,
      reason: cancelReason || "Anulación solicitada",
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activePayments = payments.filter((p) => p.status === "active");
  const cancelledPayments = payments.filter((p) => p.status === "cancelled");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-6">
        <CreditCard className="w-8 h-8 mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">No hay pagos registrados</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
        {activePayments.length} pago{activePayments.length !== 1 ? "s" : ""} activo
        {activePayments.length !== 1 ? "s" : ""}
        {cancelledPayments.length > 0 && ` • ${cancelledPayments.length} anulado${cancelledPayments.length !== 1 ? "s" : ""}`}
      </p>

      {/* Pagos activos */}
      {activePayments.map((payment) => (
        <PaymentRow
          key={payment._id}
          payment={payment}
          formatDate={formatDate}
          onCancel={() => setShowCancelConfirm(payment._id)}
          isCancelling={cancellingId === payment._id}
        />
      ))}

      {/* Separador */}
      {cancelledPayments.length > 0 && activePayments.length > 0 && (
        <div className="flex items-center gap-2 py-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[10px] text-gray-400 uppercase">Anulados</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      )}

      {/* Pagos cancelados */}
      {cancelledPayments.map((payment) => (
        <PaymentRow
          key={payment._id}
          payment={payment}
          formatDate={formatDate}
          isCancelled
        />
      ))}

      {/* Modal de confirmación */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">¿Anular este pago?</h4>
                <p className="text-sm text-gray-500">
                  El saldo de la factura será recalculado
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón (opcional)
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ej: Error en el monto, pago duplicado..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelConfirm(null);
                  setCancelReason("");
                }}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleCancelPayment(showCancelConfirm)}
                disabled={cancellingId === showCancelConfirm}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancellingId === showCancelConfirm ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Anulando...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Anular
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente interno para cada pago
function PaymentRow({
  payment,
  formatDate,
  onCancel,
  isCancelling,
  isCancelled,
}: {
  payment: Payment;
  formatDate: (date: string) => string;
  onCancel?: () => void;
  isCancelling?: boolean;
  isCancelled?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
        isCancelled
          ? "bg-gray-100 opacity-60"
          : "bg-white border border-gray-200"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isCancelled ? "bg-gray-200" : "bg-emerald-100"
        }`}
      >
        {isCancelled ? (
          <XCircle className="w-4 h-4 text-gray-400" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`font-semibold ${
              isCancelled ? "text-gray-400 line-through" : "text-gray-900"
            }`}
          >
            {formatPaymentAmount(payment)}
          </span>
          {payment.currency === "Bs" && !isCancelled && (
            <span className="text-[10px] text-gray-400">
              ≈ ${payment.amountUSD.toFixed(2)}
            </span>
          )}
          {isCancelled && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-red-100 text-red-600">
              Anulado
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <span className="flex items-center gap-0.5">
            <CreditCard className="w-3 h-3" />
            {getPaymentMethodName(payment)}
          </span>
          <span>•</span>
          <span className="flex items-center gap-0.5">
            <Calendar className="w-3 h-3" />
            {formatDate(payment.createdAt)}
          </span>
          <span>•</span>
          <span>{getCreatorName(payment)}</span>
        </div>

        {payment.reference && !isCancelled && (
          <p className="text-[10px] text-gray-400">Ref: {payment.reference}</p>
        )}

        {isCancelled && payment.cancelledReason && (
          <p className="text-[10px] text-red-400 mt-0.5">
            {payment.cancelledReason}
          </p>
        )}
      </div>

      {!isCancelled && onCancel && (
        <button
          onClick={onCancel}
          disabled={isCancelling}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 shrink-0"
          title="Anular pago"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}