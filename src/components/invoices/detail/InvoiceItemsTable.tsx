// src/components/invoices/detail/InvoiceItemsTable.tsx
import type { InvoiceItem } from "../../../types/invoice";
import { getItemTypeLabel, formatCurrency } from "../../../utils/reportUtils";

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  currency: "USD" | "Bs";
}

export function InvoiceItemsTable({ items, currency }: InvoiceItemsTableProps) {
  const total = items.reduce((sum, item) => sum + item.cost * item.quantity, 0);

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-hover)]">
        <h3 className="text-sm font-semibold text-[var(--color-vet-text)]">Detalle</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">
                Servicio
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">
                Cant.
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">
                Precio
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr 
                key={`${item.resourceId}-${index}`} 
                className="border-b border-[var(--color-border)]"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-vet-text)]">
                      {item.description}
                    </p>
                    <p className="text-xs text-[var(--color-vet-muted)]">
                      {getItemTypeLabel(item.type)}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm text-[var(--color-vet-text)]">{item.quantity}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-[var(--color-vet-text)]">
                    {formatCurrency(item.cost, currency)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-medium text-[var(--color-vet-text)]">
                    {formatCurrency(item.cost * item.quantity, currency)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[var(--color-hover)]">
              <td colSpan={3} className="px-4 py-3 text-right">
                <span className="text-sm font-semibold text-[var(--color-vet-text)]">Total</span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="text-base font-bold text-[var(--color-vet-primary)]">
                  {formatCurrency(total, currency)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}