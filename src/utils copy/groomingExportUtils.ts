// src/utils/groomingExportUtils.ts

import type { EnrichedGroomingService } from "../view/grooming/GroomingReportView";

export function exportGroomingToCSV(
  services: EnrichedGroomingService[],
  filename: string
): void {
  if (services.length === 0) return;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const headers = [
    "Fecha",
    "Cliente",
    "Teléfono",
    "Mascota",
    "Servicio",
    "Estado",
    "Costo",
    "Pagado USD",
    "Pagado Bs",
  ];

  const rows = services.map((service) => {
    return [
      formatDate(service.date),
      `"${service.ownerName.replace(/"/g, '""')}"`,
      service.ownerPhone || "",
      `"${service.patientName.replace(/"/g, '""')}"`,
      service.service,
      service.paymentInfo.paymentStatus,
      (service.cost || 0).toFixed(2),
      (service.paymentInfo.amountPaidUSD || 0).toFixed(2),
      (service.paymentInfo.amountPaidBs || 0).toFixed(2),
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