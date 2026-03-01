// src/components/deworming/DewormingDetailModal.tsx

import { 
  Bug, 
  Calendar,
  Clock,
  Check,
  Syringe,
  DollarSign,
  Building2,
  Home,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Pill
} from "lucide-react";
import DetailModal from "@/components/ui/DetailModal";
import type { Deworming } from "@/types/deworming";

interface DewormingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deworming: Deworming | null;
  triggerRect?: DOMRect | null;
}

export default function DewormingDetailModal({
  isOpen,
  onClose,
  deworming,
  triggerRect,
}: DewormingDetailModalProps) {
  if (!deworming) return null;

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

  const isPending = deworming.nextApplicationDate 
    ? new Date(deworming.nextApplicationDate) > new Date() 
    : false;

  const getDaysRemaining = () => {
    if (!deworming.nextApplicationDate) return null;
    const today = new Date();
    const nextDate = new Date(deworming.nextApplicationDate);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  // Estilos según tipo de desparasitación (sin emojis)
  const getTypeConfig = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("interna")) {
      return {
        bg: "bg-purple-50 dark:bg-purple-950/30",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-800",
        Icon: Pill
      };
    }
    if (t.includes("externa")) {
      return {
        bg: "bg-blue-50 dark:bg-blue-950/30",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-800",
        Icon: Sparkles
      };
    }
    return {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
      Icon: ShieldCheck
    };
  };

  const typeConfig = getTypeConfig(deworming.dewormingType);
  const TypeIcon = typeConfig.Icon;

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="Desparasitación"
      subtitle={formatDate(deworming.applicationDate)}
      icon={<Bug size={24} />}
      headerColor="amber"
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
      {/* Producto Principal */}
      <div className={`${typeConfig.bg} p-5 rounded-2xl border ${typeConfig.border}`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl ${typeConfig.bg} border ${typeConfig.border} flex items-center justify-center ${typeConfig.text} shrink-0`}>
            <TypeIcon size={28} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
              {deworming.productName}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Badge Tipo */}
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${typeConfig.bg} ${typeConfig.text} border ${typeConfig.border}`}>
                {deworming.dewormingType}
              </span>
              {/* Badge Fuente */}
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                  deworming.source === "Interno"
                    ? "bg-biovet-50 text-biovet-600 border-biovet-200 dark:bg-biovet-950/30 dark:text-biovet-400 dark:border-biovet-800"
                    : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-dark-100 dark:text-slate-400 dark:border-dark-50"
                }`}
              >
                {deworming.source === "Interno" ? <Building2 size={12} /> : <Home size={12} />}
                {deworming.source}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Información */}
      <div className="grid grid-cols-2 gap-3">
        {/* Dosis */}
        {deworming.dose && (
          <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50">
            <div className="flex items-center gap-2 mb-1">
              <Syringe size={14} className="text-amber-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Dosis
              </span>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              {deworming.dose}
            </p>
          </div>
        )}

        {/* Costo */}
        <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-success-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Costo
            </span>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-white">
            {deworming.cost > 0 ? `$${deworming.cost.toFixed(2)}` : "Sin costo"}
          </p>
        </div>

        {/* Fecha Aplicación */}
        <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-biovet-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Aplicación
            </span>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-white">
            {formatShortDate(deworming.applicationDate)}
          </p>
        </div>

        {/* Próxima Aplicación */}
        {deworming.nextApplicationDate && (
          <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50">
            <div className="flex items-center gap-2 mb-1">
              {isPending ? (
                <Clock size={14} className="text-warning-500" />
              ) : (
                <Check size={14} className="text-success-500" />
              )}
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Próxima
              </span>
            </div>
            <p className={`text-sm font-bold ${isPending ? "text-warning-600 dark:text-warning-400" : "text-success-600 dark:text-success-400"}`}>
              {formatShortDate(deworming.nextApplicationDate)}
            </p>
          </div>
        )}
      </div>

      {/* Alerta de Próxima Aplicación */}
      {deworming.nextApplicationDate && isPending && daysRemaining !== null && (
        <div
          className={`p-4 rounded-2xl border flex gap-3 items-start ${
            daysRemaining <= 7
              ? "bg-danger-50 dark:bg-danger-950/20 border-danger-200 dark:border-danger-800"
              : daysRemaining <= 30
              ? "bg-warning-50 dark:bg-warning-950/20 border-warning-200 dark:border-warning-800"
              : "bg-biovet-50 dark:bg-biovet-950/20 border-biovet-200 dark:border-biovet-800"
          }`}
        >
          <AlertCircle
            size={18}
            className={`mt-0.5 shrink-0 ${
              daysRemaining <= 7
                ? "text-danger-500"
                : daysRemaining <= 30
                ? "text-warning-500"
                : "text-biovet-500"
            }`}
          />
          <div>
            <p
              className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                daysRemaining <= 7
                  ? "text-danger-600 dark:text-danger-400"
                  : daysRemaining <= 30
                  ? "text-warning-600 dark:text-warning-400"
                  : "text-biovet-600 dark:text-biovet-400"
              }`}
            >
              {daysRemaining <= 7 ? "¡Atención!" : "Recordatorio"}
            </p>
            <p
              className={`text-sm italic leading-relaxed ${
                daysRemaining <= 7
                  ? "text-danger-800 dark:text-danger-200"
                  : daysRemaining <= 30
                  ? "text-warning-800 dark:text-warning-200"
                  : "text-biovet-800 dark:text-biovet-200"
              }`}
            >
              {daysRemaining <= 0
                ? "La próxima aplicación está vencida"
                : daysRemaining === 1
                ? "La próxima aplicación es mañana"
                : `Faltan ${daysRemaining} días para la próxima aplicación`}
            </p>
          </div>
        </div>
      )}
    </DetailModal>
  );
}