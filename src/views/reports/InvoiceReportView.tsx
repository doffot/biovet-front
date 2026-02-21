// src/views/reports/InvoiceReportView.tsx
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { getInvoices } from "@/api/invoiceAPI";
import type { Invoice } from "@/types/invoice";
import { InvoiceReportSummary } from "./InvoiceReportSummary";
import { InvoiceReportTable } from "./InvoiceReportTable";

export type EnrichedInvoice = Invoice;

export function InvoiceReportView() {
  const { data, isLoading } = useQuery({
    queryKey: ["invoices-report"],
    queryFn: () => getInvoices(),
  });

  const invoices = data?.invoices || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-biovet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-biovet-500 flex items-center justify-center shadow-sm">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-heading text-slate-800 dark:text-slate-100">
            Reporte de Facturación
          </h1>
          <p className="text-sm text-surface-500 dark:text-slate-400">
            {invoices.length} factura{invoices.length !== 1 ? "s" : ""} registrada
            {invoices.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── Summary ── */}
      <InvoiceReportSummary invoices={invoices} />

      {/* ── Table ── */}
      <InvoiceReportTable invoices={invoices} />
    </div>
  );
}