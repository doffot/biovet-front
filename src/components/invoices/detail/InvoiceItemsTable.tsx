import type { InvoiceItem } from "../../../types/invoice";
import { getItemTypeLabel, formatCurrency } from "../../../utils/reportUtils";

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  currency: "USD" | "Bs";
}

export function InvoiceItemsTable({ items, currency }: InvoiceItemsTableProps) {
  const total = items.reduce((sum, item) => sum + item.cost * item.quantity, 0);

  return (
    <div className="bg-white dark:bg-dark-100 border border-surface-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-surface-100 dark:border-slate-800 bg-surface-50 dark:bg-dark-200/50">
        <h3 className="text-sm font-heading font-bold text-slate-800 dark:text-white uppercase tracking-wider">
          Detalle de Servicios
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-100 dark:border-slate-800 bg-white dark:bg-dark-100">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Servicio / Producto
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Cant.
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Precio Unit.
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-slate-800">
            {items.map((item, index) => (
              <tr 
                key={`${item.resourceId}-${index}`} 
                className="hover:bg-surface-50 dark:hover:bg-dark-200 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-heading font-bold text-slate-800 dark:text-white">
                      {item.description}
                    </p>
                    <p className="text-[11px] text-biovet-500 font-medium">
                      {getItemTypeLabel(item.type)}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-surface-100 dark:bg-dark-200 px-2.5 py-1 rounded-md">
                    {item.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {formatCurrency(item.cost, currency)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-heading font-black text-slate-800 dark:text-white">
                    {formatCurrency(item.cost * item.quantity, currency)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-surface-50 dark:bg-dark-200/50 border-t-2 border-surface-100 dark:border-slate-800">
              <td colSpan={3} className="px-6 py-5 text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Detalle</span>
              </td>
              <td className="px-6 py-5 text-right">
                <span className="text-lg font-heading font-black text-biovet-500">
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