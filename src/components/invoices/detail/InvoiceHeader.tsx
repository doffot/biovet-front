import type { Invoice, InvoiceStatus } from "../../../types/invoice";
import { formatDate } from "../../../utils/reportUtils";

interface InvoiceHeaderProps {
  invoice: Invoice;
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  // Usamos tus clases .badge-success, .badge-danger y .badge-neutral definidas en tu CSS
  const config: Record<InvoiceStatus, { className: string; label: string }> = {
    Pagado: { className: "badge-success", label: "Pagado" },
    Pendiente: { className: "badge-danger", label: "Debe" },
    Parcial: { className: "badge-danger", label: "Debe" },
    Cancelado: { className: "badge-neutral", label: "Cancelado" },
  };

  const { className, label } = config[status] || config.Pendiente;

  return (
    <span className={`badge ${className} px-4 py-2 uppercase tracking-widest text-[10px]`}>
      {label}
    </span>
  );
}

export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  return (
    <div className="bg-white dark:bg-dark-100 border border-surface-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="label mb-0 text-[10px] uppercase tracking-[0.15em] opacity-60">
            Fecha de emisión
          </p>
          <p className="text-base font-heading font-bold text-slate-800 dark:text-white">
            {formatDate(invoice.date)}
          </p>
        </div>

        <StatusBadge status={invoice.paymentStatus} />
      </div>
    </div>
  );
}