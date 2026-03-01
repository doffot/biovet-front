// src/components/treatments/TreatmentDetailModal.tsx

import { 
  Pill, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  Activity,
  CheckCircle2,
  Clock,
  Syringe,
  X
} from "lucide-react";
import DetailModal from "@/components/ui/DetailModal";
import type { Treatment } from "@/types/treatment";

interface TreatmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  treatment: Treatment | null;
  triggerRect?: DOMRect | null;
}

export default function TreatmentDetailModal({
  isOpen,
  onClose,
  treatment,
  triggerRect,
}: TreatmentDetailModalProps) {
  if (!treatment) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Activo":
        return { 
          color: "text-success-600 dark:text-success-400", 
          bg: "bg-success-50 dark:bg-success-950/30", 
          border: "border-success-200 dark:border-success-800",
          icon: Activity 
        };
      case "Completado":
        return { 
          color: "text-biovet-600 dark:text-biovet-400", 
          bg: "bg-biovet-50 dark:bg-biovet-950/30", 
          border: "border-biovet-200 dark:border-biovet-800",
          icon: CheckCircle2 
        };
      case "Suspendido":
        return { 
          color: "text-danger-600 dark:text-danger-400", 
          bg: "bg-danger-50 dark:bg-danger-950/30", 
          border: "border-danger-200 dark:border-danger-800",
          icon: X 
        };
      default:
        return { 
          color: "text-surface-600 dark:text-surface-400", 
          bg: "bg-surface-100 dark:bg-dark-100", 
          border: "border-surface-200 dark:border-dark-50",
          icon: Clock 
        };
    }
  };

  const statusInfo = getStatusConfig(treatment.status);
  const StatusIcon = statusInfo.icon;

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={treatment.productName}
      subtitle={`${treatment.treatmentType === "Otro" ? treatment.treatmentTypeOther : treatment.treatmentType} • ${treatment.route}`}
      icon={<Pill size={24} />}
      headerColor="blue"
      triggerRect={triggerRect}
      footer={
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white dark:bg-dark-100 border border-surface-200 dark:border-dark-50 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors active:scale-[0.98]"
        >
          Cerrar
        </button>
      }
    >
      {/* Estado y Costo */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-4 rounded-2xl border ${statusInfo.bg} ${statusInfo.border}`}>
          <p className={`text-[10px] uppercase font-black tracking-widest mb-1.5 flex items-center gap-1.5 ${statusInfo.color}`}>
            <StatusIcon size={12} /> Estado
          </p>
          <p className={`font-bold text-base ${statusInfo.color}`}>
            {treatment.status}
          </p>
        </div>
        
        <div className="p-4 bg-success-50 dark:bg-success-950/20 rounded-2xl border border-success-200 dark:border-success-800">
          <p className="text-[10px] text-success-600 dark:text-success-400 uppercase font-black tracking-widest mb-1.5 flex items-center gap-1.5">
            <DollarSign size={12} /> Costo
          </p>
          <p className="font-bold text-success-700 dark:text-success-300 text-xl font-heading">
            ${treatment.cost.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Posología */}
      <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Syringe size={12} /> Posología
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-dark-50">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Dosis</p>
            <p className="text-sm font-bold text-slate-700 dark:text-white truncate" title={treatment.dose}>
              {treatment.dose}
            </p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-dark-50">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Frecuencia</p>
            <p className="text-sm font-bold text-slate-700 dark:text-white truncate" title={treatment.frequency}>
              {treatment.frequency}
            </p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-dark-50">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Duración</p>
            <p className="text-sm font-bold text-slate-700 dark:text-white truncate" title={treatment.duration}>
              {treatment.duration}
            </p>
          </div>
        </div>
      </div>

      {/* Fechas */}
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-dark-200 border border-surface-200 dark:border-dark-50 rounded-2xl">
        <div className="flex items-center gap-2 flex-1">
          <Calendar size={16} className="text-blue-500" /> 
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Inicio</p>
            <p className="text-sm font-bold text-slate-700 dark:text-white">
              {new Date(treatment.startDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        {treatment.endDate && (
          <div className="flex items-center gap-2 flex-1">
            <Calendar size={16} className="text-slate-400" /> 
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Fin</p>
              <p className="text-sm font-bold text-slate-700 dark:text-white">
                {new Date(treatment.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Observaciones */}
      {treatment.observations && (
        <div className="bg-warning-50 dark:bg-warning-950/20 p-4 rounded-2xl border border-warning-200 dark:border-warning-800 flex gap-3 items-start">
          <AlertCircle size={18} className="text-warning-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-black text-warning-600 dark:text-warning-400 uppercase tracking-widest mb-1">
              Observaciones
            </p>
            <p className="text-sm text-warning-800 dark:text-warning-200 italic leading-relaxed">
              "{treatment.observations}"
            </p>
          </div>
        </div>
      )}
    </DetailModal>
  );
}