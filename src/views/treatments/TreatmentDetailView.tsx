import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  X, 
  Calendar, 
  DollarSign, 
  Pill, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Activity,
  CheckCircle2,
  Syringe
} from "lucide-react";
import { getTreatmentById } from "@/api/treatmentAPI";

export default function TreatmentDetailView() {
  const { treatmentId } = useParams<{ treatmentId: string }>();
  const navigate = useNavigate();

  const { data: treatment, isLoading } = useQuery({
    queryKey: ["treatment", treatmentId],
    queryFn: () => getTreatmentById(treatmentId!),
    enabled: !!treatmentId,
  });

  const handleClose = () => navigate(-1);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Loader2 className="animate-spin text-white w-10 h-10" />
      </div>
    );
  }

  if (!treatment) return null;

  // Configuración visual según estado
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Activo":
        return { 
          color: "text-emerald-600 dark:text-emerald-400", 
          bg: "bg-emerald-100 dark:bg-emerald-900/30", 
          border: "border-emerald-200 dark:border-emerald-800",
          icon: Activity 
        };
      case "Completado":
        return { 
          color: "text-blue-600 dark:text-blue-400", 
          bg: "bg-blue-100 dark:bg-blue-900/30", 
          border: "border-blue-200 dark:border-blue-800",
          icon: CheckCircle2 
        };
      case "Suspendido":
        return { 
          color: "text-red-600 dark:text-red-400", 
          bg: "bg-red-100 dark:bg-red-900/30", 
          border: "border-red-200 dark:border-red-800",
          icon: AlertCircle 
        };
      default:
        return { 
          color: "text-slate-600 dark:text-slate-400", 
          bg: "bg-slate-100 dark:bg-slate-800", 
          border: "border-slate-200 dark:border-slate-700",
          icon: Clock 
        };
    }
  };

  const statusInfo = getStatusConfig(treatment.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" 
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-dark-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-surface-200 dark:border-dark-100" 
        onClick={e => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className="bg-cyan-50 dark:bg-dark-300 p-6 border-b border-cyan-100 dark:border-dark-100 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 shadow-sm">
              <Pill size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-white leading-tight">
                {treatment.productName}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                <span className="bg-white dark:bg-dark-100 px-2 py-0.5 rounded border border-surface-200 dark:border-dark-50 text-xs font-semibold uppercase tracking-wide">
                  {treatment.treatmentType}
                </span>
                <span className="text-xs flex items-center gap-1">
                  <Syringe size={12} /> {treatment.route}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          
          {/* Grid de Estado y Costo */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-xl border flex flex-col justify-center ${statusInfo.bg} ${statusInfo.border}`}>
              <p className={`text-[10px] uppercase font-bold mb-1 flex items-center gap-1.5 ${statusInfo.color}`}>
                <StatusIcon size={12} /> Estado Actual
              </p>
              <p className={`font-bold text-sm ${statusInfo.color}`}>
                {treatment.status}
              </p>
            </div>
            
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex flex-col justify-center">
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold mb-1 flex items-center gap-1.5">
                <DollarSign size={12} /> Costo Total
              </p>
              <p className="font-bold text-emerald-700 dark:text-emerald-300 text-lg">
                ${treatment.cost.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Posología Detallada */}
          <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-xl border border-surface-200 dark:border-dark-50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Clock size={12} /> Posología
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-surface-200 dark:divide-dark-50">
              <div className="px-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Dosis</p>
                <p className="text-sm font-bold text-slate-700 dark:text-white truncate" title={treatment.dose}>
                  {treatment.dose}
                </p>
              </div>
              <div className="px-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Frecuencia</p>
                <p className="text-sm font-bold text-slate-700 dark:text-white truncate" title={treatment.frequency}>
                  {treatment.frequency}
                </p>
              </div>
              <div className="px-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Duración</p>
                <p className="text-sm font-bold text-slate-700 dark:text-white truncate" title={treatment.duration}>
                  {treatment.duration}
                </p>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-dark-200 border border-surface-200 dark:border-dark-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-cyan-500" /> 
              <span className="font-medium">Inicio:</span> 
              <span>{new Date(treatment.startDate).toLocaleDateString()}</span>
            </div>
            {treatment.endDate && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Fin:</span> 
                <span>{new Date(treatment.endDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Observaciones */}
          {treatment.observations && (
            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30 flex gap-3 items-start">
              <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase mb-1">
                  Observaciones Clínicas
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200 italic leading-relaxed">
                  "{treatment.observations}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-surface-50/50 dark:bg-dark-300/50 border-t border-surface-200 dark:border-dark-100">
          <button 
            onClick={handleClose} 
            className="w-full py-3 rounded-xl bg-white dark:bg-dark-100 border border-surface-200 dark:border-dark-50 text-slate-600 dark:text-slate-300 font-bold hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors shadow-sm active:scale-[0.99]"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
}