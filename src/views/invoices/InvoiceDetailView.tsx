// src/views/invoices/InvoiceDetailView.tsx
import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, Printer, AlertTriangle, RefreshCw,  
  DollarSign, CheckCircle2, Clock, Ban, Trash2 
} from "lucide-react";
import { getInvoiceById, cancelInvoice, deleteInvoice } from "../../api/invoiceAPI";
import { createPayment } from "../../api/paymentAPI"; 
import { PaymentModal } from "../../components/payment/PaymentModal";
import { toast } from "../../components/Toast";
import { InvoiceHeader } from "../../components/invoices/detail/InvoiceHeader";
import { InvoiceClientInfo } from "../../components/invoices/detail/InvoiceClientInfo";
import { InvoiceItemsTable } from "../../components/invoices/detail/InvoiceItemsTable";
import { InvoicePaymentSummary } from "../../components/invoices/detail/InvoicePaymentSummary";
import { InvoiceActions } from "../../components/invoices/detail/InvoiceActions";
import { printInvoice } from "@/utils/invoicePrintUtils";
import ConfirmationModal from "@/components/ConfirmationModal";

function LoadingState() {
  return (
    <div className="h-screen flex items-center justify-center bg-surface-100 dark:bg-dark-300">
      <div className="text-center">
        <RefreshCw className="w-10 h-10 text-biovet-500 animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-500 font-ui">Cargando factura...</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="h-screen flex items-center justify-center bg-surface-100 dark:bg-dark-300 p-4">
      <div className="text-center max-w-md w-full bg-white dark:bg-dark-100 p-8 rounded-2xl shadow-xl border border-danger-100 dark:border-danger-900">
        <AlertTriangle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-bold text-slate-800 dark:text-white mb-2">Error de carga</h2>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <button onClick={onRetry} className="btn-primary w-full">
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      </div>
    </div>
  );
}

export default function InvoiceDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Detectar de dónde viene el usuario
  const fromPendingModal = location.state?.fromPendingModal;
  const returnPath = location.state?.returnPath || "/reports/invoices";

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: invoice, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoiceById(id!),
    enabled: !!id,
  });

  // Función para invalidar todas las queries relacionadas y emitir evento
  const invalidateAndNotify = () => {
    queryClient.invalidateQueries({ queryKey: ["invoice", id] });
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["pendingInvoices"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "invoices"] });
    queryClient.invalidateQueries({ queryKey: ["payments"] });
    
    // Emitir evento global para actualizar componentes suscritos
    window.dispatchEvent(new CustomEvent('invoices-updated'));
  };

  // Función para volver y señalizar actualización
  const goBackWithRefresh = () => {
    invalidateAndNotify();
    
    if (fromPendingModal) {
      navigate(returnPath, { 
        state: { shouldRefreshPending: true },
        replace: true 
      });
    } else {
      navigate(-1);
    }
  };

  const paymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      invalidateAndNotify();
      toast.success("Pago registrado correctamente");
      setShowPaymentModal(false);
      
      // Si viene del modal de pendientes, volver automáticamente
      if (fromPendingModal) {
        setTimeout(() => goBackWithRefresh(), 500);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al registrar el pago");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelInvoice(id!),
    onSuccess: () => {
      invalidateAndNotify();
      toast.success("Factura cancelada exitosamente");
      setShowCancelModal(false);
      
      // Volver después de cancelar
      setTimeout(() => goBackWithRefresh(), 500);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al cancelar la factura");
      setShowCancelModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteInvoice(id!),
    onSuccess: () => {
      invalidateAndNotify();
      toast.success("Factura eliminada permanentemente");
      setShowDeleteModal(false);
      
      // Navegar a la lista (no hay factura a la que volver)
      navigate("/reports/invoices", { replace: true });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al eliminar la factura");
      setShowDeleteModal(false);
    },
  });

  const handlePayment = async (paymentData: {
    paymentMethodId?: string;
    reference?: string;
    addAmountPaidUSD: number;
    addAmountPaidBs: number;
    exchangeRate: number;
    isPartial: boolean;
    creditAmountUsed?: number;
  }) => {
    const isBsPayment = paymentData.addAmountPaidBs > 0;
    await paymentMutation.mutateAsync({
      invoiceId: id!,
      paymentMethod: paymentData.paymentMethodId,  
      amount: isBsPayment ? paymentData.addAmountPaidBs : paymentData.addAmountPaidUSD,
      currency: isBsPayment ? "Bs" : "USD",
      exchangeRate: paymentData.exchangeRate,
      reference: paymentData.reference,
      creditAmountUsed: paymentData.creditAmountUsed,
    });
  };

  const handlePrint = () => { 
    if (invoice) printInvoice(invoice); 
  };
  
  const handleCancel = () => { 
    cancelMutation.mutate(); 
  };
  
  const handleDelete = () => { 
    deleteMutation.mutate(); 
  };

  // Botón de volver inteligente
  const handleGoBack = () => {
    if (fromPendingModal) {
      goBackWithRefresh();
    } else {
      navigate(-1);
    }
  };

  if (isLoading) return <LoadingState />;
  if (isError || !invoice) return <ErrorState message={error instanceof Error ? error.message : "Error"} onRetry={refetch} />;

  const remainingAmount = invoice.total - (invoice.amountPaid || 0);
  const canPay = invoice.paymentStatus !== "Pagado" && invoice.paymentStatus !== "Cancelado";
  const canCancel = invoice.paymentStatus !== "Cancelado";

  const services = invoice.items?.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.cost,
    total: item.cost * item.quantity,
  })) || [];

  const ownerName = invoice.ownerName || (typeof invoice.ownerId === "object" && invoice.ownerId?.name) || "";
  const ownerPhone = invoice.ownerPhone || (typeof invoice.ownerId === "object" && invoice.ownerId?.contact) || "";
  const patientName = typeof invoice.patientId === "object" && invoice.patientId?.name ? invoice.patientId.name : "";

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-300">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark-100/80 backdrop-blur-md border-b border-surface-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleGoBack} 
              className="btn-icon-neutral rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-heading font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Factura <span className="text-biovet-500">#{invoice._id?.slice(-6).toUpperCase()}</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className={`badge ${
                  invoice.paymentStatus === 'Pagado' 
                    ? 'badge-success' 
                    : invoice.paymentStatus === 'Cancelado' 
                      ? 'badge-neutral' 
                      : 'badge-danger'
                }`}>
                  {invoice.paymentStatus}
                </span>
                {fromPendingModal && (
                  <span className="text-xs text-slate-400">• Desde facturas pendientes</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={handlePrint} className="btn-secondary">
            <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
        {/* RESUMEN DE TOTALES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-biovet-500 rounded-2xl p-6 text-white shadow-lg shadow-biovet-500/20">
            <div className="flex items-center gap-2 opacity-80 mb-1 font-ui text-xs font-bold uppercase tracking-widest">
              <DollarSign className="w-4 h-4" /> Total Factura
            </div>
            <p className="text-3xl font-heading font-black">
              {invoice.currency === "USD" ? "$" : "Bs."} {invoice.total.toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-dark-100 border border-surface-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 mb-1 font-ui text-xs font-bold uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4 text-success-500" /> Monto Pagado
            </div>
            <p className="text-3xl font-heading font-black text-slate-800 dark:text-white">
              {invoice.currency === "USD" ? "$" : "Bs."} {(invoice.amountPaid || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-dark-100 border border-surface-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 mb-1 font-ui text-xs font-bold uppercase tracking-widest">
              <Clock className="w-4 h-4 text-danger-500" /> Pendiente
            </div>
            <p className="text-3xl font-heading font-black text-danger-500">
              {invoice.currency === "USD" ? "$" : "Bs."} {remainingAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-dark-100 rounded-2xl border border-surface-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <InvoiceHeader invoice={invoice} />
              <div className="p-6 border-t border-surface-100 dark:border-slate-800">
                <InvoiceClientInfo ownerName={ownerName} ownerPhone={ownerPhone} patientName={patientName} />
              </div>
              <InvoiceItemsTable items={invoice.items || []} currency={invoice.currency} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-dark-100 rounded-2xl border border-surface-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-heading font-bold text-slate-800 dark:text-white mb-4">Resumen de Pago</h3>
              <InvoicePaymentSummary invoice={invoice} />
            </div>
            <div className="bg-white dark:bg-dark-100 rounded-2xl border border-surface-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-heading font-bold text-slate-800 dark:text-white mb-4">Acciones de Gestión</h3>
              <InvoiceActions
                canPay={canPay}
                canCancel={canCancel}
                onPay={() => setShowPaymentModal(true)}
                onCancel={() => setShowCancelModal(true)}
                onDelete={() => setShowDeleteModal(true)}
                isPaying={paymentMutation.isPending}
                isCanceling={cancelMutation.isPending}
                isDeleting={deleteMutation.isPending}
              />
            </div>
          </div>
        </div>
      </main>

      {/* MODALES */}
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        onConfirm={handlePayment}
        amountUSD={remainingAmount} 
        services={services} 
        patient={{ name: patientName }}
        owner={{ name: ownerName, phone: ownerPhone }} 
        title="Registrar Pago" 
        allowPartial={true}
      />

      <ConfirmationModal
        isOpen={showCancelModal} 
        onClose={() => setShowCancelModal(false)} 
        onConfirm={handleCancel}
        title="Cancelar Factura" 
        variant="warning" 
        confirmText="Sí, cancelar factura"
        confirmIcon={Ban} 
        isLoading={cancelMutation.isPending}
        message="¿Estás seguro de que deseas cancelar esta factura? No se podrán registrar más pagos."
      />

      <ConfirmationModal
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={handleDelete}
        title="Eliminar Factura" 
        variant="danger" 
        confirmText="Sí, eliminar permanentemente"
        confirmIcon={Trash2} 
        isLoading={deleteMutation.isPending}
        message="Acción PERMANENTE. Se perderán todos los datos y no se puede deshacer."
      />
    </div>
  );
}