// src/components/grooming/GroomingTable.tsx

import { Calendar, User, Eye, Edit, CheckCircle, Clock, AlertCircle, Scissors, Bath, Sparkles, PawPrint, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactElement } from "react";

interface GroomingTableProps {
  services: any[];
  getPatientName: (patientId: any) => string;
  getPatientSpecies: (patientId: any) => string;
  getPatientBreed: (patientId: any) => string;
  formatDate: (dateString: string) => string;
  formatCurrency: (amount: number, currency: string) => string;
  onEdit: (service: any) => void;
  onPayment: (service: any) => void; // ← NUEVO
}

const SERVICE_ICONS: Record<string, ReactElement> = {
  "Corte": <Scissors className="w-3.5 h-3.5 text-biovet-500" />,
  "Baño": <Bath className="w-3.5 h-3.5 text-biovet-500" />,
  "Corte y Baño": <Sparkles className="w-3.5 h-3.5 text-biovet-500" />,
};

const getServiceIcon = (serviceType: string): ReactElement => {
  return SERVICE_ICONS[serviceType] || <PawPrint className="w-3.5 h-3.5 text-slate-400" />;
};

const getPaymentBadge = (status: string) => {
  switch (status) {
    case "Pagado":
      return { class: "badge badge-success", icon: <CheckCircle className="w-3 h-3" /> };
    case "Parcial":
      return { class: "badge badge-biovet", icon: <Clock className="w-3 h-3" /> };
    case "Pendiente":
      return { class: "badge badge-warning", icon: <Clock className="w-3 h-3" /> };
    default:
      return { class: "badge badge-neutral", icon: <AlertCircle className="w-3 h-3" /> };
  }
};

const HEADERS = [
  { label: "Fecha", icon: Calendar },
  { label: "Paciente", icon: User },
  { label: "Servicio", icon: Scissors },
  { label: "Pago", icon: CreditCard },
  { label: "Monto", align: "text-right" },
  { label: "Acciones", align: "text-center" },
];

export function GroomingTable({
  services,
  getPatientName,
  getPatientSpecies,
  getPatientBreed,
  formatDate,
  formatCurrency,
  onEdit,
  onPayment, // ← NUEVO
}: GroomingTableProps) {
  const getPatientId = (patientId: any): string => {
    if (!patientId) return "";
    if (typeof patientId === "string") return patientId;
    return patientId._id || "";
  };

  return (
    <div className="hidden lg:block flex-1 overflow-auto custom-scrollbar relative">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700 z-10">
          <tr>
            {HEADERS.map((h) => (
              <th
                key={h.label}
                className={`px-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${h.align || "text-left"}`}
              >
                <div className={`flex items-center gap-1.5 ${h.align === "text-center" ? "justify-center" : h.align === "text-right" ? "justify-end" : ""}`}>
                  {h.icon && <h.icon className="w-3.5 h-3.5" />}
                  {h.label}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200 dark:divide-slate-700/50">
          {services.map((service) => {
            const paymentInfo = service.paymentInfo || {};
            const serviceCost = Number(service.cost) || 0;
            const patientId = getPatientId(service.patientId);
            const badge = getPaymentBadge(paymentInfo.paymentStatus || "Sin facturar");
            const canPay = paymentInfo.paymentStatus === "Pendiente" || paymentInfo.paymentStatus === "Parcial";

            return (
              <tr key={service._id} className="group hover:bg-surface-50/70 dark:hover:bg-dark-200/30 transition-colors">
                {/* Fecha */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    {formatDate(service.date)}
                  </span>
                </td>

                {/* Paciente */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-linear-to-br from-biovet-500 to-biovet-600 rounded-lg flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-30">
                        {getPatientName(service.patientId)}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-30">
                        {getPatientSpecies(service.patientId)}
                        {getPatientBreed(service.patientId) && ` • ${getPatientBreed(service.patientId)}`}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Servicio */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-biovet-50 dark:bg-biovet-950 border border-biovet-200 dark:border-biovet-800 rounded-md flex items-center justify-center">
                      {getServiceIcon(service.service)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-slate-700 dark:text-white truncate block max-w-25">
                        {service.service}
                      </span>
                      {service.specifications && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-25">
                          {service.specifications}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Estado Pago */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className={badge.class}>
                      {badge.icon}
                      {paymentInfo.paymentStatus || "Sin facturar"}
                    </span>
                    {paymentInfo.amountPaid > 0 && (
                      <span className="text-[10px] text-success-600 dark:text-success-400 flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5" />
                        {formatCurrency(paymentInfo.amountPaid, paymentInfo.currency || "USD")}
                      </span>
                    )}
                  </div>
                </td>

                {/* Monto */}
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-sm font-bold text-biovet-600 dark:text-biovet-400">
                      ${serviceCost.toFixed(2)}
                    </span>
                    {paymentInfo.paymentStatus === "Parcial" && (
                      <>
                        <span className="text-[10px] text-warning-600 dark:text-warning-400">
                          Pendiente: ${(serviceCost - paymentInfo.amountPaid).toFixed(2)}
                        </span>
                        <div className="w-14 h-1 bg-surface-200 dark:bg-dark-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-biovet-500 rounded-full"
                            style={{ width: `${(paymentInfo.amountPaid / serviceCost) * 100}%` }}
                          />
                        </div>
                      </>
                    )}
                    {paymentInfo.paymentStatus === "Pendiente" && (
                      <span className="text-[10px] text-warning-600 dark:text-warning-400">Por cobrar</span>
                    )}
                    {paymentInfo.paymentStatus === "Pagado" && (
                      <span className="text-[10px] text-success-600 dark:text-success-400 flex items-center gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5" />
                        Completado
                      </span>
                    )}
                  </div>
                </td>

                {/* Acciones */}
                <td className="px-4 py-3">
  <div className="flex items-center justify-center gap-1.5">
    {/* Ver */}
    <Link
      to={`/patients/${patientId}/grooming/${service._id}`}
      className="p-1.5 rounded-lg bg-surface-50 dark:bg-dark-50 border border-surface-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-surface-100 dark:hover:bg-dark-100 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      title="Ver"
    >
      <Eye className="w-4 h-4" />
    </Link>
    
    {/* Editar */}
    <button
      onClick={() => onEdit(service)}
      className="p-1.5 rounded-lg bg-biovet-50 dark:bg-biovet-950 border border-biovet-200 dark:border-biovet-800 text-biovet-500 hover:bg-biovet-100 dark:hover:bg-biovet-900 transition-colors"
      title="Editar"
    >
      <Edit className="w-4 h-4" />
    </button>
    
    {/* Cobrar */}
    {canPay && (
      <button
        onClick={() => onPayment(service)}
        className="p-1.5 rounded-lg bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800 text-warning-600 dark:text-warning-400 hover:bg-warning-100 dark:hover:bg-warning-900 transition-colors"
        title="Cobrar"
      >
        <CreditCard className="w-4 h-4" />
      </button>
    )}
  </div>
</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}