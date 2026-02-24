import { CreditCard, Ban, Trash2 } from "lucide-react";

interface InvoiceActionsProps {
  canPay: boolean;
  canCancel: boolean;
  onPay: () => void;
  onCancel: () => void;
  onDelete: () => void;
  isPaying: boolean;
  isCanceling: boolean;
  isDeleting: boolean;
}

export function InvoiceActions({
  canPay,
  canCancel,
  onPay,
  onCancel,
  onDelete,
  isPaying,
  isCanceling,
  isDeleting,
}: InvoiceActionsProps) {
  return (
    <div className="bg-white dark:bg-dark-100 border border-surface-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
      {/* <h3 className="label mb-0 text-[10px] uppercase tracking-[0.15em] opacity-60">
        Acciones de Gestión
      </h3> */}

      {/* Registrar Pago - Usando tu btn-primary */}
      {canPay && (
        <button
          onClick={onPay}
          disabled={isPaying}
          className="btn-primary w-full justify-center py-3 shadow-lg shadow-biovet-500/20"
        >
          {isPaying ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Pagar</span>
            </>
          )}
        </button>
      )}

      {/* Botones secundarios en grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Anular Factura - Estilo Warning */}
        {canCancel && (
          <button
            onClick={onCancel}
            disabled={isCanceling}
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all disabled:opacity-50"
          >
            {isCanceling ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Ban className="w-3.5 h-3.5" />
                <span>Anular</span>
              </>
            )}
          </button>
        )}

        {/* Eliminar Factura - Estilo Danger */}
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-danger-500 dark:text-danger-400 bg-danger-50 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20 rounded-xl hover:bg-danger-100 dark:hover:bg-danger-500/20 transition-all disabled:opacity-50"
        >
          {isDeleting ? (
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}