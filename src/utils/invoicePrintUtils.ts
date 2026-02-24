// src/utils/invoicePrintUtils.ts
import type { Invoice } from "../types/invoice";
import { formatCurrency, formatDate, getItemTypeLabel } from "./reportUtils";

export function printInvoice(invoice: Invoice): void {
  const ownerName = invoice.ownerName || 
    (typeof invoice.ownerId === "object" && invoice.ownerId?.name) || 
    "—";

  const patientName = typeof invoice.patientId === "object" && invoice.patientId?.name 
    ? invoice.patientId.name 
    : "—";

  const items = invoice.items || [];
  const total = invoice.total || 0;
  const paidUSD = invoice.amountPaidUSD || 0;
  const paidBs = invoice.amountPaidBs || 0;

  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        <div style="font-weight: 500;">${item.description}</div>
        <div style="font-size: 12px; color: #666;">${getItemTypeLabel(item.type)}</div>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.cost, invoice.currency)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: 500;">${formatCurrency(item.cost * item.quantity, invoice.currency)}</td>
    </tr>
  `).join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Factura ${invoice._id?.slice(-8).toUpperCase()}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; padding: 20px; }
        .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #0A7EA4; }
        .header h1 { font-size: 24px; color: #0A7EA4; margin-bottom: 4px; }
        .header p { font-size: 12px; color: #666; }
        .info { display: flex; justify-content: space-between; margin-bottom: 24px; }
        .info-block { }
        .info-block h3 { font-size: 10px; text-transform: uppercase; color: #888; margin-bottom: 4px; }
        .info-block p { font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background: #f5f5f5; padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; color: #666; }
        th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: center; }
        th:nth-child(3), th:nth-child(4) { text-align: right; }
        .total-row { background: #f9f9f9; }
        .total-row td { padding: 12px 8px; font-weight: 600; }
        .summary { background: #f5f5f5; padding: 16px; border-radius: 8px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .summary-row:last-child { margin-bottom: 0; padding-top: 8px; border-top: 1px solid #ddd; font-weight: 600; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-pending { background: #fee2e2; color: #991b1b; }
        .status-canceled { background: #e5e7eb; color: #374151; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FACTURA</h1>
        <p>#${invoice._id?.slice(-8).toUpperCase()} • ${formatDate(invoice.date)}</p>
      </div>

      <div class="info">
        <div class="info-block">
          <h3>Cliente</h3>
          <p>${ownerName}</p>
        </div>
        <div class="info-block">
          <h3>Paciente</h3>
          <p>${patientName}</p>
        </div>
        <div class="info-block">
          <h3>Estado</h3>
          <span class="status ${
            invoice.paymentStatus === 'Pagado' ? 'status-paid' : 
            invoice.paymentStatus === 'Cancelado' ? 'status-canceled' : 
            'status-pending'
          }">
            ${invoice.paymentStatus === 'Pagado' ? 'Pagado' : 
              invoice.paymentStatus === 'Cancelado' ? 'Cancelado' : 'Debe'}
          </span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Servicio</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="3" style="text-align: right; padding: 12px 8px;">Total</td>
            <td style="text-align: right; padding: 12px 8px; color: #0A7EA4; font-size: 16px;">
              ${formatCurrency(total, invoice.currency)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div class="summary">
        ${paidUSD > 0 ? `
          <div class="summary-row">
            <span>Pagado USD:</span>
            <span>${formatCurrency(paidUSD, 'USD')}</span>
          </div>
        ` : ''}
        ${paidBs > 0 ? `
          <div class="summary-row">
            <span>Pagado Bs:</span>
            <span>${formatCurrency(paidBs, 'Bs')}</span>
          </div>
        ` : ''}
        <div class="summary-row">
          <span>Total:</span>
          <span>${formatCurrency(total, invoice.currency)}</span>
        </div>
      </div>

      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}