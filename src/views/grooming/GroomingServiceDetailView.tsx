import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  X, 
  Calendar, 
  DollarSign, 
  User, 
  FileText, 
  Scissors, 
  Loader2,
  StickyNote
} from "lucide-react";
import { getGroomingServiceById } from "@/api/groomingAPI";

export default function GroomingServiceDetailView() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const { data: service, isLoading } = useQuery({
    queryKey: ["groomingService", serviceId],
    queryFn: () => getGroomingServiceById(serviceId!),
    enabled: !!serviceId,
  });

  const handleClose = () => navigate(-1);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Loader2 className="animate-spin text-white w-10 h-10" />
      </div>
    );
  }

  if (!service) return null;

  // Manejo seguro del nombre del peluquero (puede venir poblado o solo ID)
  const groomerName = typeof service.groomer === 'object' && service.groomer 
    ? `${service.groomer.name} ${service.groomer.lastName || ''}` 
    : 'No asignado';

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
        <div className="bg-pink-50 dark:bg-dark-300 p-6 border-b border-pink-100 dark:border-dark-100 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-500 border border-pink-200 dark:border-pink-800 shadow-sm">
              <Scissors size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-white leading-tight">
                {service.service}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                <Calendar size={14} />
                <span>
                  {new Date(service.date).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
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
          
          {/* Grid de Info Clave */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-surface-50 dark:bg-dark-100 rounded-xl border border-surface-200 dark:border-dark-50">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center gap-1.5">
                <User size={12} /> Peluquero
              </p>
              <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm truncate">
                {groomerName}
              </p>
            </div>
            
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold mb-1 flex items-center gap-1.5">
                <DollarSign size={12} /> Costo Total
              </p>
              <p className="font-bold text-emerald-700 dark:text-emerald-300 text-lg">
                ${service.cost.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Especificaciones */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <FileText size={14} className="text-pink-500" /> 
              Especificaciones del Servicio
            </h3>
            <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-xl border border-surface-200 dark:border-dark-50 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {service.specifications}
            </div>
          </div>

          {/* Observaciones (Condicional) */}
          {service.observations && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <StickyNote size={14} className="text-amber-500" /> 
                Observaciones Adicionales
              </h3>
              <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-800/30 text-sm text-amber-800 dark:text-amber-200 italic">
                "{service.observations}"
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-surface-50/50 dark:bg-dark-300/50 border-t border-surface-200 dark:border-dark-100">
          <button 
            onClick={handleClose} 
            className="w-full py-3 rounded-xl bg-white dark:bg-dark-100 border border-surface-200 dark:border-dark-50 text-slate-600 dark:text-slate-300 font-bold hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors shadow-sm"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
}