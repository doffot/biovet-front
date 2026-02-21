// src/components/invoices/detail/InvoicePaymentSummary.tsx
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

  // Calcular lo pagado en USD equivalente
  const paidBsInUSD = paidBs / exchangeRate;
  const totalPaidUSD = paidUSD + paidBsInUSD;
  const remaining = Math.max(0, total - totalPaidUSD);

  const isPaid = invoice.paymentStatus === "Pagado";
  const isCanceled = invoice.paymentStatus === "Cancelado";

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-md p-4">
      <h3 className="text-sm font-semibold text-[var(--color-vet-text)] mb-4">
        Resumen de Pago
      </h3>

      <div className="space-y-3">
        {/* Total factura */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-vet-muted)]">Total factura</span>
          <span className="text-sm font-medium text-[var(--color-vet-text)]">
            {formatCurrency(total, invoice.currency)}
          </span>
        </div>

        {/* Pagado USD */}
        {paidUSD > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-vet-muted)]">Pagado en USD</span>
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {formatCurrency(paidUSD, "USD")}
            </span>
          </div>
        )}

        {/* Pagado Bs */}
        {paidBs > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-vet-muted)]">Pagado en Bs</span>
            <span className="text-sm font-medium text-[var(--color-vet-primary)]">
              {formatCurrency(paidBs, "Bs")}
            </span>
          </div>
        )}

        {/* Tasa de cambio si pagó en Bs */}
        {paidBs > 0 && (
          <div className="flex items-center justify-between text-xs text-[var(--color-vet-muted)]">
            <span>Tasa aplicada</span>
            <span>Bs. {exchangeRate.toFixed(2)} / USD</span>
          </div>
        )}

        {/* Separador */}
        <div className="border-t border-[var(--color-border)] pt-3">
          {/* Pendiente o Pagado */}
          {isCanceled ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--color-vet-muted)]">Estado</span>
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Cancelado</span>
            </div>
          ) : isPaid ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--color-vet-text)]">Estado</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Pagado ✓</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--color-vet-text)]">Pendiente</span>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatCurrency(remaining, invoice.currency)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}