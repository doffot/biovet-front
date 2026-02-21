// src/components/invoices/detail/InvoiceHeader.tsx
import type { Invoice, InvoiceStatus } from "../../../types/invoice";
import { formatDate } from "../../../utils/reportUtils";

interface InvoiceHeaderProps {
  invoice: Invoice;
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const config: Record<InvoiceStatus, { bg: string; label: string }> = {
    Pagado: { bg: "bg-emerald-600 dark:bg-emerald-500", label: "Pagado" },
    Pendiente: { bg: "bg-red-600 dark:bg-red-500", label: "Debe" },
    Parcial: { bg: "bg-red-600 dark:bg-red-500", label: "Debe" },
    Cancelado: { bg: "bg-gray-500 dark:bg-gray-600", label: "Cancelado" },
  };

  const { bg, label } = config[status] || config.Pendiente;

  return (
    <span className={`inline-block px-3 py-1.5 text-sm font-semibold text-white rounded-md ${bg}`}>
      {label}
    </span>
  );
}

export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--color-vet-muted)] uppercase tracking-wide mb-1">
            Fecha de emisión
          </p>
          <p className="text-sm font-medium text-[var(--color-vet-text)]">
            {formatDate(invoice.date)}
          </p>
        </div>

        <StatusBadge status={invoice.paymentStatus} />
      </div>
    </div>
  );
}