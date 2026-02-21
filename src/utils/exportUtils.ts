// src/utils/exportUtils.ts
import type { Invoice } from "../types/invoice";
import { formatDate, getItemTypeLabel } from "./reportUtils";

export function exportToCSV(invoices: Invoice[], filename: string): void {
  if (invoices.length === 0) return;

  const headers = [
    "Fecha",
    "Cliente",
    "Estado",
    "Total",
    "Moneda",
    "Pagado USD",
    "Pagado Bs",
    "Servicios",
  ];

  const rows = invoices.map((invoice) => {
    const ownerName =
      invoice.ownerName ||
      (typeof invoice.ownerId === "object" && invoice.ownerId?.name) ||
      "";

    const services =
      invoice.items?.map((item) => getItemTypeLabel(item.type)).join("; ") || "";

    return [
      formatDate(invoice.date),
      `"${ownerName.replace(/"/g, '""')}"`,
      invoice.paymentStatus,
      (invoice.total || 0).toFixed(2),
      invoice.currency,
      (invoice.amountPaidUSD || 0).toFixed(2),
      (invoice.amountPaidBs || 0).toFixed(2),
      `"${services}"`,
    ];
  });

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join(
    "\n"
  );

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}