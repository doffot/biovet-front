import { useQuery } from "@tanstack/react-query";
import { getPatientHistory } from "@/api/patientAPI";
import {
  Loader2,
  Activity,
  Stethoscope,
  Syringe,
  FlaskConical,
  Scissors,
  Pill,
  Bug,
  FileText,
  Calendar,
  ScanLine,
  ClipboardList,
  Clock,
  CalendarCheck,
  Briefcase,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PauseCircle,
  TrendingUp,
} from "lucide-react";

// Interfaz que coincide con lo que devuelve el backend
interface HistoryEntry {
  _id: string;
  type: 'appointment' | 'consultation' | 'deworming' | 'grooming' | 'vaccination' | 
        'recipe' | 'treatment' | 'labExam' | 'medicalStudy' | 'veterinaryService';
  date: Date | string;
  title: string;
  description: string;
  observations?: string;
  status?: string;
  cost?: number;
  discount?: number;
  nextDate?: Date | string;
  details?: string;
  veterinarian?: string;
}

export function PatientMedicalLog({ patientId }: { patientId: string }) {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["history", patientId],
    queryFn: () => getPatientHistory(patientId) as Promise<HistoryEntry[]>,
    enabled: !!patientId,
  });

  const getCategoryConfig = (type: string) => {
    const configs: Record<string, { icon: typeof Activity; color: string; bg: string; label: string }> = {
      consultation: { 
        icon: Stethoscope, 
        color: "text-blue-500", 
        bg: "bg-blue-50 dark:bg-blue-950/30", 
        label: "Consulta" 
      },
      labExam: { 
        icon: FlaskConical, 
        color: "text-purple-500", 
        bg: "bg-purple-50 dark:bg-purple-950/30", 
        label: "Laboratorio" 
      },
      vaccination: { 
        icon: Syringe, 
        color: "text-emerald-500", 
        bg: "bg-emerald-50 dark:bg-emerald-950/30", 
        label: "Vacuna" 
      },
      deworming: { 
        icon: Bug, 
        color: "text-amber-500", 
        bg: "bg-amber-50 dark:bg-amber-950/30", 
        label: "Desparasitación" 
      },
      grooming: { 
        icon: Scissors, 
        color: "text-pink-500", 
        bg: "bg-pink-50 dark:bg-pink-950/30", 
        label: "Estética" 
      },
      medicalStudy: { 
        icon: ScanLine, 
        color: "text-indigo-500", 
        bg: "bg-indigo-50 dark:bg-indigo-950/30", 
        label: "Estudio" 
      },
      recipe: { 
        icon: Pill, 
        color: "text-rose-500", 
        bg: "bg-rose-50 dark:bg-rose-950/30", 
        label: "Receta" 
      },
      treatment: { 
        icon: Activity, 
        color: "text-cyan-500", 
        bg: "bg-cyan-50 dark:bg-cyan-950/30", 
        label: "Tratamiento" 
      },
      appointment: { 
        icon: CalendarCheck, 
        color: "text-teal-500", 
        bg: "bg-teal-50 dark:bg-teal-950/30", 
        label: "Cita" 
      },
      veterinaryService: { 
        icon: Briefcase, 
        color: "text-violet-500", 
        bg: "bg-violet-50 dark:bg-violet-950/30", 
        label: "Servicio" 
      },
    };
    
    return configs[type] || { 
      icon: FileText, 
      color: "text-slate-500", 
      bg: "bg-slate-50 dark:bg-dark-100", 
      label: "Registro" 
    };
  };

  const getStatusConfig = (status?: string) => {
    if (!status) return null;
    
    const statusConfigs: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
      "Completada": { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
      "Completado": { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
      "Aplicada": { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
      "Emitida": { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
      "Activo": { icon: TrendingUp, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
      "Programada": { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
      "Pendiente": { icon: PauseCircle, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
      "Borrador": { icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
      "Cancelada": { icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
      "Cancelado": { icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
      "Suspendido": { icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
      "No asistió": { icon: XCircle, color: "text-gray-600", bg: "bg-gray-50 dark:bg-gray-950/30" },
      "Aplicada externamente": { icon: CheckCircle2, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-950/30" },
    };
    
    return statusConfigs[status] || null;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", { 
      day: "2-digit", 
      month: "short", 
      year: "numeric" 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderEventContent = (item: HistoryEntry) => {
    const statusConfig = getStatusConfig(item.status);
    const cost = item.cost || 0;
    const discount = item.discount || 0;
    const hasCost = cost > 0;
    const hasDiscount = discount > 0;
    const finalCost = cost - discount;

    return (
      <div className="mt-3 space-y-3">
        <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
          {item.description}
        </p>

        {item.details && (
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {item.details}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {statusConfig && item.status && (
            <span className={`flex items-center gap-1 text-[10px] ${statusConfig.bg} ${statusConfig.color} px-2 py-1 rounded-full font-bold border border-current/20`}>
              <statusConfig.icon size={10} />
              {item.status}
            </span>
          )}

          {item.nextDate && (
            <span className="flex items-center gap-1 text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-2 py-1 rounded-full font-semibold border border-emerald-200/50 dark:border-emerald-800/50">
              <Clock size={10} />
              Próxima: {formatDate(item.nextDate)}
            </span>
          )}
        </div>

        {item.observations && !["N/A", "Sin observaciones", "Sin información", ""].includes(item.observations) && (
          <div className="relative pl-3 border-l-2 border-slate-200 dark:border-slate-700 py-1">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
              "{item.observations}"
            </p>
          </div>
        )}

        {hasCost && (
          <div className="flex items-center justify-between bg-slate-100/50 dark:bg-dark-300/30 rounded-xl px-3 py-2 border border-slate-200/50 dark:border-dark-50">
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-green-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {hasDiscount ? "Total con descuento:" : "Costo:"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(cost)}
                </span>
              )}
              <span className="text-sm font-bold text-slate-700 dark:text-white">
                {formatCurrency(finalCost)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const stats = {
    total: history.length,
    totalSpent: history.reduce((sum, item) => sum + ((item.cost || 0) - (item.discount || 0)), 0),
    thisMonth: history.filter(item => {
      const itemDate = new Date(item.date);
      const now = new Date();
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }).length,
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col h-64 bg-white dark:bg-dark-200 rounded-3xl border border-dashed border-slate-300 dark:border-dark-100 items-center justify-center p-10 text-center">
        <Activity className="text-slate-300 mb-4" size={48} />
        <h3 className="text-slate-500 font-medium">Historial vacío</h3>
        <p className="text-xs text-slate-400 mt-1">
          No hay registros médicos para este paciente aún.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-200 lg:rounded-3xl border border-slate-200 dark:border-dark-100 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-100 dark:border-dark-100 bg-slate-50/50 dark:bg-dark-200/50">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-tight italic">
            <ClipboardList className="text-blue-500" size={18} />
            Historial Clínico
          </h3>
          <span className="text-[10px] font-bold bg-white dark:bg-dark-100 border border-slate-200 dark:border-dark-50 px-3 py-1 rounded-full text-slate-500 uppercase shadow-sm">
            {stats.total} Eventos
          </span>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 text-[10px] bg-white dark:bg-dark-100 border border-slate-200 dark:border-dark-50 px-2.5 py-1.5 rounded-lg shadow-sm">
            <Calendar size={10} className="text-blue-400" />
            <span className="text-slate-500">Este mes:</span>
            <span className="font-bold text-slate-700 dark:text-white">{stats.thisMonth}</span>
          </div>
          {stats.totalSpent > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] bg-white dark:bg-dark-100 border border-slate-200 dark:border-dark-50 px-2.5 py-1.5 rounded-lg shadow-sm">
              <DollarSign size={10} className="text-green-400" />
              <span className="text-slate-500">Invertido:</span>
              <span className="font-bold text-green-600">{formatCurrency(stats.totalSpent)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24 custom-scrollbar">
        <div className="relative space-y-6 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-linear-to-b before:from-blue-200 before:via-slate-200 before:to-slate-100 dark:before:from-blue-900/50 dark:before:via-dark-100 dark:before:to-dark-100">
          {history.map((item, i) => {
            const config = getCategoryConfig(item.type);
            const Icon = config.icon;

            return (
              <div key={item._id || i} className="relative pl-12 group">
                <div 
                  className={`absolute left-0 top-0 w-8 h-8 rounded-full ${config.bg} ${config.color} flex items-center justify-center border-4 border-white dark:border-dark-200 z-10 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-current/20`}
                >
                  <Icon size={14} strokeWidth={2.5} />
                </div>

                <div className="bg-slate-50 dark:bg-dark-100/50 p-4 rounded-2xl border border-slate-100 dark:border-dark-50 transition-all duration-300 hover:bg-white dark:hover:bg-dark-100 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 hover:border-blue-200 dark:hover:border-blue-900/50 hover:-translate-y-0.5">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${config.bg} ${config.color} w-fit`}>
                        {config.label}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                        {item.title}
                      </h4>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-white dark:bg-dark-200 px-2 py-1 rounded-lg border border-slate-100 dark:border-dark-50 shadow-sm shrink-0">
                      <Calendar size={10} className="text-blue-400" />
                      {formatDate(item.date)}
                    </div>
                  </div>

                  {renderEventContent(item)}

                  {item.veterinarian && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-50 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
                        {item.veterinarian.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {item.veterinarian}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}