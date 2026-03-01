// src/components/vaccinations/VaccinationDetailModal.tsx

import { 
  Syringe, 
  Calendar, 
  FlaskConical, 
  DollarSign, 
  Clock, 
  Check,
  AlertCircle,
  Building2,
  Home,
} from "lucide-react";
import DetailModal from "@/components/ui/DetailModal";
import type { Vaccination } from "@/types/vaccination";

interface VaccinationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaccination: Vaccination | null;
  triggerRect?: DOMRect | null;
}

export default function VaccinationDetailModal({
  isOpen,
  onClose,
  vaccination,
  triggerRect,
}: VaccinationDetailModalProps) {
  if (!vaccination) return null;

  const formatDate = (date: string | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const isPending = vaccination.nextVaccinationDate && 
    new Date(vaccination.nextVaccinationDate) > new Date();

  const getVaccineColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("rabia")) return { 
      bg: "bg-red-50 dark:bg-red-950/30", 
      text: "text-red-600 dark:text-red-400",
      border: "border-red-200 dark:border-red-800" 
    };
    if (t.includes("sextuple") || t.includes("múltiple")) return { 
      bg: "bg-blue-50 dark:bg-blue-950/30", 
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800" 
    };
    if (t.includes("parvo")) return { 
      bg: "bg-purple-50 dark:bg-purple-950/30", 
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800" 
    };
    if (t.includes("tos") || t.includes("kennel")) return { 
      bg: "bg-amber-50 dark:bg-amber-950/30", 
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800" 
    };
    return { 
      bg: "bg-biovet-50 dark:bg-biovet-950/30", 
      text: "text-biovet-600 dark:text-biovet-400",
      border: "border-biovet-200 dark:border-biovet-800" 
    };
  };

  const vaccineStyle = getVaccineColor(vaccination.vaccineType);

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={vaccination.vaccineType}
      subtitle={formatDate(vaccination.vaccinationDate)}
      icon={<Syringe size={24} />}
      headerColor="biovet"
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
      {/* Tipo de vacuna con color */}
      <div className={`p-4 rounded-2xl border ${vaccineStyle.bg} ${vaccineStyle.border}`}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1.5 text-slate-500">
          <Syringe size={12} /> Tipo de Vacuna
        </p>
        <p className={`font-bold text-xl font-heading ${vaccineStyle.text}`}>
          {vaccination.vaccineType}
        </p>
      </div>

      {/* Información básica */}
      <div className="grid grid-cols-2 gap-3">
        {/* Fuente */}
        <div className="p-4 bg-surface-50 dark:bg-dark-100 rounded-2xl border border-surface-200 dark:border-dark-50">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5">Fuente</p>
          <div className={`flex items-center gap-1.5 text-sm font-bold ${vaccination.source === 'internal' ? 'text-biovet-600 dark:text-biovet-400' : 'text-slate-600 dark:text-slate-400'}`}>
            {vaccination.source === 'internal' ? <Building2 size={14} /> : <Home size={14} />}
            {vaccination.source === 'internal' ? 'Interno' : 'Externo'}
          </div>
        </div>

        {/* Costo */}
        {vaccination.cost !== undefined && vaccination.cost > 0 && (
          <div className="p-4 bg-success-50 dark:bg-success-950/20 rounded-2xl border border-success-200 dark:border-success-800">
            <p className="text-[10px] text-success-600 dark:text-success-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <DollarSign size={10} /> Costo
            </p>
            <p className="font-bold text-lg text-success-700 dark:text-success-300 font-heading">
              ${vaccination.cost.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Detalles del producto */}
      {(vaccination.laboratory || vaccination.batchNumber) && (
        <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <FlaskConical size={12} /> Detalles del Producto
          </h3>
          <div className="space-y-2 text-sm">
            {vaccination.laboratory && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Laboratorio:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{vaccination.laboratory}</span>
              </div>
            )}
            {vaccination.batchNumber && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Lote:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">{vaccination.batchNumber}</span>
              </div>
            )}
            {vaccination.expirationDate && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Vencimiento:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{formatDate(vaccination.expirationDate)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fechas */}
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-dark-200 border border-surface-200 dark:border-dark-50 rounded-2xl">
        <div className="flex items-center gap-2 flex-1">
          <Calendar size={16} className="text-biovet-500" /> 
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Aplicación</p>
            <p className="text-sm font-bold text-slate-700 dark:text-white">
              {formatDate(vaccination.vaccinationDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Próxima dosis */}
      {vaccination.nextVaccinationDate && (
        <div className={`p-4 rounded-2xl border ${isPending ? 'bg-warning-50 dark:bg-warning-950/20 border-warning-200 dark:border-warning-800' : 'bg-success-50 dark:bg-success-950/20 border-success-200 dark:border-success-800'}`}>
          <div className="flex items-center gap-2 mb-2">
            {isPending ? (
              <Clock size={16} className="text-warning-500" />
            ) : (
              <Check size={16} className="text-success-500" />
            )}
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
              {isPending ? 'Refuerzo Pendiente' : 'Refuerzo Completado'}
            </p>
          </div>
          <p className={`font-bold text-lg font-heading ${isPending ? 'text-warning-700 dark:text-warning-300' : 'text-success-700 dark:text-success-300'}`}>
            {formatDate(vaccination.nextVaccinationDate)}
          </p>
        </div>
      )}

      {/* Aplicado por */}
      {vaccination.appliedBy && (
        <div className="bg-surface-50 dark:bg-dark-100 p-3 rounded-xl border border-surface-200 dark:border-dark-50 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Aplicado por:</span>
          <span className="ml-2 font-bold text-slate-700 dark:text-slate-200">{vaccination.appliedBy}</span>
        </div>
      )}

      {/* Observaciones */}
      {vaccination.observations && (
        <div className="bg-warning-50 dark:bg-warning-950/20 p-4 rounded-2xl border border-warning-200 dark:border-warning-800 flex gap-3 items-start">
          <AlertCircle size={18} className="text-warning-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-black text-warning-600 dark:text-warning-400 uppercase tracking-widest mb-1">
              Observaciones
            </p>
            <p className="text-sm text-warning-800 dark:text-warning-200 italic leading-relaxed">
              "{vaccination.observations}"
            </p>
          </div>
        </div>
      )}
    </DetailModal>
  );
}