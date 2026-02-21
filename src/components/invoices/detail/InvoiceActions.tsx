// src/components/invoices/detail/InvoiceActions.tsx
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
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-3 space-y-2">
      {/* Título */}
      <h3 className="text-xs font-semibold text-[var(--color-vet-muted)] uppercase tracking-wide mb-3">
        Acciones
      </h3>

      {/* Registrar Pago */}
      {canPay && (
        <button
          onClick={onPay}
          disabled={isPaying}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] rounded-lg hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isPaying ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Registrar Pago</span>
            </>
          )}
        </button>
      )}

      {/* Botones secundarios en grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Cancelar Factura */}
        {canCancel && (
          <button
            onClick={onCancel}
            disabled={isCanceling}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:border-amber-300 dark:hover:border-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCanceling ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-amber-700 dark:border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>Cancelando...</span>
              </>
            ) : (
              <>
                <Ban className="w-3.5 h-3.5" />
                <span>Anular</span>
              </>
            )}
          </button>
        )}

        {/* Eliminar Factura */}
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 hover:border-red-300 dark:hover:border-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-red-700 dark:border-red-400 border-t-transparent rounded-full animate-spin" />
              <span>Eliminando...</span>
            </>
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