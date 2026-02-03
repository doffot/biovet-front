// src/components/payments/PaymentHistory.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  History,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  CreditCard,
  RotateCcw,
} from "lucide-react";
import { getPaymentsByInvoice, cancelPayment } from "../../api/paymentAPI";
import {
  type Payment,
  getPaymentMethodName,
  getCreatorName,
  getCancelledByName,
  formatPaymentAmount,
} from "../../types/payment";
import { toast } from "../Toast";

interface PaymentHistoryProps {
  invoiceId: string;
  invoiceTotal: number;
  isOpen: boolean;
  onClose: () => void;
  onPaymentCancelled?: () => void;
}

export function PaymentHistory({
  invoiceId,
  invoiceTotal,
  isOpen,
  onClose,
  onPaymentCancelled,
}: PaymentHistoryProps) {
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments", "invoice", invoiceId],
    queryFn: () => getPaymentsByInvoice(invoiceId),
    enabled: isOpen && !!invoiceId,
  });

  const { mutate: cancelPaymentMutation } = useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
      cancelPayment(paymentId, reason),
    onSuccess: (data) => {
      toast.success(data.msg);
      queryClient.invalidateQueries({ queryKey: ["payments", "invoice", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
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
      reason: cancelReason || "Anulación solicitada por el usuario",
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

  const totalPaidUSD = activePayments.reduce((sum, p) => sum + p.amountUSD, 0);
  const remainingUSD = Math.max(0, invoiceTotal - totalPaidUSD);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Historial de Pagos</h3>
              <p className="text-white/80 text-sm">
                {payments.length} pago{payments.length !== 1 ? "s" : ""} registrado
                {payments.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase">Total Factura</p>
              <p className="text-lg font-bold text-gray-900">${invoiceTotal.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase">Pagado</p>
              <p className="text-lg font-bold text-emerald-600">${totalPaidUSD.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase">Pendiente</p>
              <p className={`text-lg font-bold ${remainingUSD > 0 ? "text-red-600" : "text-gray-400"}`}>
                ${remainingUSD.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de pagos */}
        <div className="overflow-y-auto max-h-[50vh] p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No hay pagos registrados</p>
            </div>
          ) : (
            <>
              {/* Pagos activos */}
              {activePayments.map((payment) => (
                <PaymentCard
                  key={payment._id}
                  payment={payment}
                  formatDate={formatDate}
                  onCancel={() => setShowCancelConfirm(payment._id)}
                  isCancelling={cancellingId === payment._id}
                />
              ))}

              {/* Separador si hay pagos cancelados */}
              {cancelledPayments.length > 0 && activePayments.length > 0 && (
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 uppercase">Anulados</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              )}

              {/* Pagos cancelados */}
              {cancelledPayments.map((payment) => (
                <PaymentCard
                  key={payment._id}
                  payment={payment}
                  formatDate={formatDate}
                  isCancelled
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal de confirmación de cancelación */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">¿Anular este pago?</h4>
                <p className="text-sm text-gray-500">Esta acción actualizará el saldo de la factura</p>
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
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Anulando...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Anular Pago
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
function PaymentCard({
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
      className={`p-4 rounded-xl border transition-all ${
        isCancelled
          ? "bg-gray-50 border-gray-200 opacity-60"
          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isCancelled ? "bg-gray-200" : "bg-emerald-100"
            }`}
          >
            {isCancelled ? (
              <XCircle className="w-5 h-5 text-gray-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-bold ${isCancelled ? "text-gray-400 line-through" : "text-gray-900"}`}>
                {formatPaymentAmount(payment)}
              </span>
              {payment.currency === "Bs" && (
                <span className="text-xs text-gray-500">
                  (≈ ${payment.amountUSD.toFixed(2)})
                </span>
              )}
              {isCancelled && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
                  Anulado
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                {getPaymentMethodName(payment)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(payment.createdAt)}
              </span>
            </div>

            {payment.reference && (
              <p className="text-xs text-gray-400 mt-1">Ref: {payment.reference}</p>
            )}

            <p className="text-[10px] text-gray-400 mt-1">
              Por: {getCreatorName(payment)}
            </p>

            {isCancelled && payment.cancelledReason && (
              <p className="text-xs text-red-500 mt-1">
                Razón: {payment.cancelledReason}
              </p>
            )}

            {isCancelled && payment.cancelledAt && (
              <p className="text-[10px] text-gray-400">
                Anulado el {formatDate(payment.cancelledAt)} por {getCancelledByName(payment)}
              </p>
            )}
          </div>
        </div>

        {!isCancelled && onCancel && (
          <button
            onClick={onCancel}
            disabled={isCancelling}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Anular pago"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}