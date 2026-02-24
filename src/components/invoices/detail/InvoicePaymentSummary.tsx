import type { Invoice } from "../../../types/invoice";
import { formatCurrency } from "../../../utils/reportUtils";

interface InvoicePaymentSummaryProps {
  invoice: Invoice;
}

export function InvoicePaymentSummary({ invoice }: InvoicePaymentSummaryProps) {
  const paidUSD = invoice.amountPaidUSD || 0;
  const paidBs = invoice.amountPaidBs || 0;
  const total = invoice.total || 0;
  const exchangeRate = invoice.exchangeRate || 1;

  // Calcular lo pagado en USD equivalente (Lógica intacta)
  const paidBsInUSD = paidBs / exchangeRate;
  const totalPaidUSD = paidUSD + paidBsInUSD;
  const remaining = Math.max(0, total - totalPaidUSD);

  const isPaid = invoice.paymentStatus === "Pagado";
  const isCanceled = invoice.paymentStatus === "Cancelado";

  return (
    <div className="bg-white dark:bg-dark-100 border border-surface-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
      <h3 className="text-sm font-heading font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">
        Resumen de Pago
      </h3>

      <div className="space-y-4">
        {/* Total factura */}
        <div className="flex items-center justify-between pb-2 border-b border-surface-50 dark:border-slate-800/50">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total factura</span>
          <span className="text-sm font-heading font-bold text-slate-800 dark:text-white">
            {formatCurrency(total, invoice.currency)}
          </span>
        </div>

        {/* Pagado USD */}
        {paidUSD > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pagado en USD</span>
            <span className="text-sm font-heading font-bold text-success-600 dark:text-success-400">
              {formatCurrency(paidUSD, "USD")}
            </span>
          </div>
        )}

        {/* Pagado Bs */}
        {paidBs > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pagado en Bs</span>
            <span className="text-sm font-heading font-bold text-biovet-500">
              {formatCurrency(paidBs, "Bs")}
            </span>
          </div>
        )}

        {/* Tasa de cambio */}
        {paidBs > 0 && (
          <div className="flex items-center justify-between px-3 py-2 bg-surface-50 dark:bg-dark-200 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tasa Aplicada</span>
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-300">
              Bs. {exchangeRate.toFixed(2)} / USD
            </span>
          </div>
        )}

        {/* Estado Final */}
        <div className="mt-6 pt-4 border-t-2 border-dashed border-surface-100 dark:border-slate-800">
          {isCanceled ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</span>
              <span className="badge badge-neutral">Cancelado</span>
            </div>
          ) : isPaid ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</span>
              <div className="text-right">
                <span className="block text-sm font-heading font-black text-success-600 dark:text-success-400">
                  Totalmente Pagado
                </span>
                <span className="text-[10px] text-success-500/70 font-bold uppercase tracking-tighter">Verificado ✓</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Pendiente</span>
              <span className="text-xl font-heading font-black text-danger-500 animate-pulse">
                {formatCurrency(remaining, invoice.currency)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}