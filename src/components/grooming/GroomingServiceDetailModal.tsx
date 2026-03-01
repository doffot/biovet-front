// src/components/grooming/GroomingServiceDetailModal.tsx

import {
  Scissors,
  Calendar,
  DollarSign,
  User,
  FileText,
  StickyNote,
  AlertCircle,
  Sparkles,
  Droplets,
} from "lucide-react";
import DetailModal from "@/components/ui/DetailModal";
import type { GroomingService } from "@/types/grooming";

interface GroomingServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: GroomingService | null;
  paymentInfo?: {
    status: string;
    color: string;
    icon: React.ComponentType<{ size?: number }>;
  };
  triggerRect?: DOMRect | null;
}

export default function GroomingServiceDetailModal({
  isOpen,
  onClose,
  service,
  paymentInfo,
  triggerRect,
}: GroomingServiceDetailModalProps) {
  if (!service) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Obtener nombre del groomer
  const getGroomerName = () => {
    if (!service.groomer) return "No asignado";
    if (typeof service.groomer === "string") return service.groomer;
    return `${service.groomer.name} ${service.groomer.lastName}`;
  };

  // Configuración según tipo de servicio
  const getServiceConfig = (serviceType: string) => {
    switch (serviceType) {
      case "Corte":
        return {
          Icon: Scissors,
          color: "text-pink-600 dark:text-pink-400",
          bg: "bg-pink-100 dark:bg-pink-900/30",
          border: "border-pink-200 dark:border-pink-800",
        };
      case "Baño":
        return {
          Icon: Droplets,
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-100 dark:bg-blue-900/30",
          border: "border-blue-200 dark:border-blue-800",
        };
      case "Corte y Baño":
        return {
          Icon: Sparkles,
          color: "text-purple-600 dark:text-purple-400",
          bg: "bg-purple-100 dark:bg-purple-900/30",
          border: "border-purple-200 dark:border-purple-800",
        };
      default:
        return {
          Icon: Scissors,
          color: "text-pink-600 dark:text-pink-400",
          bg: "bg-pink-100 dark:bg-pink-900/30",
          border: "border-pink-200 dark:border-pink-800",
        };
    }
  };

  const serviceConfig = getServiceConfig(service.service);
  const ServiceIcon = serviceConfig.Icon;
  const PaymentIcon = paymentInfo?.icon || AlertCircle;

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="Servicio de Estética"
      subtitle={formatDate(service.date)}
      icon={<Scissors size={24} />}
      headerColor="pink"
      triggerRect={triggerRect}
      footer={
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-surface-200 dark:bg-dark-50 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-surface-300 dark:hover:bg-dark-100 transition-colors active:scale-[0.98]"
        >
          Cerrar
        </button>
      }
    >
      {/* Tipo de Servicio */}
      <div className="bg-pink-50 dark:bg-pink-950/20 p-5 rounded-2xl border border-pink-200 dark:border-pink-800">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl ${serviceConfig.bg} border ${serviceConfig.border} flex items-center justify-center ${serviceConfig.color} shrink-0`}>
            <ServiceIcon size={28} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
              {service.service}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Servicio de peluquería canina
            </p>
            
            {/* Badge Estado Pago */}
            {paymentInfo && (
              <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-bold ${paymentInfo.color}`}>
                <PaymentIcon size={14} />
                {paymentInfo.status}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Información */}
      <div className="grid grid-cols-2 gap-3">
        {/* Fecha */}
        <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-pink-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Fecha
            </span>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-white">
            {formatShortDate(service.date)}
          </p>
        </div>

        {/* Costo */}
        <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-success-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Costo
            </span>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-white">
            ${service.cost.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Peluquero */}
      <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50">
        <div className="flex items-center gap-2 mb-1">
          <User size={14} className="text-biovet-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Peluquero Asignado
          </span>
        </div>
        <p className="text-sm font-bold text-slate-800 dark:text-white">
          {getGroomerName()}
        </p>
      </div>

      {/* Especificaciones */}
      {service.specifications && (
        <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-200 dark:border-purple-800 flex gap-3 items-start">
          <FileText size={18} className="text-purple-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">
              Especificaciones
            </p>
            <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
              {service.specifications}
            </p>
          </div>
        </div>
      )}

      {/* Observaciones */}
      {service.observations && (
        <div className="bg-warning-50 dark:bg-warning-950/20 p-4 rounded-2xl border border-warning-200 dark:border-warning-800 flex gap-3 items-start">
          <StickyNote size={18} className="text-warning-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-black text-warning-600 dark:text-warning-400 uppercase tracking-widest mb-1">
              Observaciones
            </p>
            <p className="text-sm text-warning-800 dark:text-warning-200 italic leading-relaxed">
              "{service.observations}"
            </p>
          </div>
        </div>
      )}
    </DetailModal>
  );
}