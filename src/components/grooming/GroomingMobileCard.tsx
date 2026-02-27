// src/components/grooming/GroomingMobileCard.tsx

import { Calendar, Eye, Edit, CreditCard, CheckCircle, Clock, AlertCircle, Scissors, Bath, Sparkles, PawPrint } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactElement } from "react";

interface GroomingMobileCardProps {
  service: any;
  getPatientName: (patientId: any) => string;
  getPatientSpecies: (patientId: any) => string;
  getPatientBreed: (patientId: any) => string;
  formatDate: (dateString: string) => string;
  formatCurrency: (amount: number, currency: string) => string;
  onEdit: () => void;
  onPayment: () => void; // ← NUEVO
}

const SERVICE_ICONS: Record<string, ReactElement> = {
  "Corte": <Scissors className="w-4 h-4 text-biovet-500" />,
  "Baño": <Bath className="w-4 h-4 text-biovet-500" />,
  "Corte y Baño": <Sparkles className="w-4 h-4 text-biovet-500" />,
};

const getServiceIcon = (serviceType: string): ReactElement => {
  return SERVICE_ICONS[serviceType] || <PawPrint className="w-4 h-4 text-slate-400" />;
};

const getPaymentStatusConfig = (status: string) => {
  switch (status) {
    case "Pagado":
      return { badge: "badge badge-success", icon: <CheckCircle className="w-3 h-3" /> };
    case "Parcial":
      return { badge: "badge badge-biovet", icon: <Clock className="w-3 h-3" /> };
    case "Pendiente":
      return { badge: "badge badge-warning", icon: <Clock className="w-3 h-3" /> };
    default:
      return { badge: "badge badge-neutral", icon: <AlertCircle className="w-3 h-3" /> };
  }
};

export function GroomingMobileCard({
  service,
  getPatientName,
  getPatientSpecies,
  getPatientBreed,
  formatDate,
  onEdit,
  onPayment, // ← NUEVO
}: GroomingMobileCardProps) {
  const paymentInfo = service.paymentInfo || {};
  const serviceCost = Number(service.cost) || 0;
  const statusConfig = getPaymentStatusConfig(paymentInfo.paymentStatus || "Sin facturar");
  const canPay = paymentInfo.paymentStatus === "Pendiente" || paymentInfo.paymentStatus === "Parcial";

  const getPatientId = (patientId: any): string => {
    if (!patientId) return "";
    if (typeof patientId === "string") return patientId;
    return patientId._id || "";
  };

  const patientId = getPatientId(service.patientId);

  return (
    <div className="p-4 hover:bg-surface-50 dark:hover:bg-dark-200/50 transition-colors">
      {/* Header: Fecha y Estado */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(service.date)}</span>
        </div>
        <span className={`${statusConfig.badge} text-[10px]`}>
          {statusConfig.icon}
          {paymentInfo.paymentStatus || "Sin facturar"}
        </span>
      </div>

      {/* Paciente y Servicio */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-biovet-100 dark:bg-biovet-900/50 rounded-xl flex items-center justify-center shrink-0">
          {getServiceIcon(service.service)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {getPatientName(service.patientId)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {getPatientSpecies(service.patientId)}
            {getPatientBreed(service.patientId) && ` • ${getPatientBreed(service.patientId)}`}
          </p>
          <p className="text-xs text-biovet-600 dark:text-biovet-400 mt-0.5">
            {service.service}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-biovet-600 dark:text-biovet-400">
            ${serviceCost.toFixed(2)}
          </p>
          {paymentInfo.paymentStatus === "Parcial" && (
            <p className="text-[10px] text-warning-600 dark:text-warning-400">
              Resta: ${(serviceCost - (paymentInfo.amountPaid || 0)).toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Especificaciones */}
      {service.specifications && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
          {service.specifications}
        </p>
      )}

      {/* Acciones */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-200 dark:border-slate-700">
  {/* Ver */}
  <Link
    to={`/patients/${patientId}/grooming/${service._id}`}
    className="p-1.5 rounded-lg bg-surface-50 dark:bg-dark-50 border border-surface-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-surface-100 dark:hover:bg-dark-100 transition-colors"
    title="Ver"
  >
    <Eye className="w-4 h-4" />
  </Link>
  
  {/* Editar */}
  <button
    onClick={onEdit}
    className="p-1.5 rounded-lg bg-biovet-50 dark:bg-biovet-950 border border-biovet-200 dark:border-biovet-800 text-biovet-500 hover:bg-biovet-100 dark:hover:bg-biovet-900 transition-colors"
    title="Editar"
  >
    <Edit className="w-4 h-4" />
  </button>
  
  {/* Cobrar */}
  {canPay && (
    <button
      onClick={onPayment}
      className="p-1.5 rounded-lg bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800 text-warning-600 dark:text-warning-400 hover:bg-warning-100 dark:hover:bg-warning-900 transition-colors"
      title="Cobrar"
    >
      <CreditCard className="w-4 h-4" />
    </button>
  )}
</div>
    </div>
  );
}