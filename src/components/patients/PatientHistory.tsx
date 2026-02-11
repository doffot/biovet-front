import { useQuery } from "@tanstack/react-query";
import { getPatientHistory, type HistoryItem } from "@/api/patientAPI";
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
  Thermometer,
} from "lucide-react";

// Interfaces aproximadas de tus modelos para tipar rawData
interface RawData {
  // Receta
  medications?: Array<{ name: string; dose: string; frequency: string; duration: string }>;
  indications?: string;
  
  // Consulta
  reasonForVisit?: string;
  anamnesis?: string;
  symptomOnset?: string;
  definitiveDiagnosis?: string;
  temperature?: number;
  weight?: number;

  // Lab
  observacion?: string;
  hemotropico?: string;
  differentialCount?: any;

  // Vacuna/Desparasitación
  batchNumber?: string;
  nextAppointment?: string;
  product?: string;
}

export function PatientMedicalLog({ patientId }: { patientId: string }) {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["history", patientId],
    queryFn: () => getPatientHistory(patientId),
    enabled: !!patientId,
  });

  const getCategoryConfig = (item: HistoryItem) => {
    switch (item.type) {
      case "consultation": return { icon: Stethoscope, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", label: "Consulta Médica" };
      case "labExam": return { icon: FlaskConical, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30", label: "Laboratorio" };
      case "vaccination": return { icon: Syringe, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", label: "Vacunación" };
      case "deworming": return { icon: Bug, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", label: "Desparasitación" };
      case "grooming": return { icon: Scissors, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/30", label: "Estética" };
      case "study": return { icon: ScanLine, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30", label: "Estudio" };
      case "recipe": return { icon: Pill, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30", label: "Receta" };
      case "treatment": return { icon: Activity, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/30", label: "Tratamiento" };
      default: return { icon: FileText, color: "text-slate-500", bg: "bg-slate-50 dark:bg-dark-100", label: "Registro" };
    }
  };

  // Renderizado inteligente del contenido según el tipo de dato
  const renderEventContent = (item: HistoryItem) => {
    const data = (item.rawData || {}) as RawData;

    /* --- RECETAS --- */
    if (item.type === "recipe") {
      return (
        <div className="mt-2 space-y-2">
          {data.medications && data.medications.length > 0 ? (
            <div className="bg-rose-50 dark:bg-rose-900/10 rounded-lg p-2.5 border border-rose-100 dark:border-rose-800">
              <p className="text-[10px] font-bold text-rose-400 uppercase mb-1.5 flex items-center gap-1">
                <Pill size={10} /> Medicamentos Recetados
              </p>
              <ul className="space-y-1.5">
                {data.medications.map((med, idx) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-200">
                    <span className="font-bold block">{med.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {med.dose} • {med.frequency} • {med.duration}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Ver detalle para indicaciones.</p>
          )}
        </div>
      );
    }

    /* --- CONSULTAS --- */
    if (item.type === "consultation") {
      return (
        <div className="mt-2 space-y-2">
          <p className="text-sm font-medium text-slate-800 dark:text-white leading-tight">
            {item.description}
          </p>
          
          {/* Signos Vitales Mini */}
          {(data.temperature || data.weight) && (
            <div className="flex gap-3 text-[10px] text-slate-500 dark:text-slate-400">
              {data.temperature && <span className="flex items-center gap-1"><Thermometer size={10} /> {data.temperature}°C</span>}
              {data.weight && <span className="flex items-center gap-1"><Activity size={10} /> {data.weight}kg</span>}
            </div>
          )}

          {/* Diagnóstico */}
          {data.definitiveDiagnosis && (
            <div className="bg-blue-50 dark:bg-blue-900/10 p-2 rounded-lg border-l-2 border-blue-400">
              <p className="text-[10px] font-bold text-blue-500 uppercase">Diagnóstico</p>
              <p className="text-xs text-slate-700 dark:text-slate-300">{data.definitiveDiagnosis}</p>
            </div>
          )}
          
          {/* Anamnesis Corta */}
          {data.anamnesis && !data.definitiveDiagnosis && (
             <p className="text-xs text-slate-500 italic border-l-2 border-slate-200 pl-2 line-clamp-3">
               "{data.anamnesis}"
             </p>
          )}
        </div>
      );
    }

    /* --- LABORATORIO --- */
    if (item.type === "labExam") {
      return (
        <div className="mt-2">
          <p className="text-xs text-slate-700 dark:text-slate-200 mb-1.5 font-medium">{item.title}</p>
          
          {(data.observacion || data.hemotropico) && (
            <div className="bg-purple-50 dark:bg-purple-900/10 p-2.5 rounded-lg border border-purple-100 dark:border-purple-800">
              <div className="flex items-start gap-2">
                <ClipboardList size={14} className="text-purple-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  {data.hemotropico && (
                    <p className="text-[11px] text-purple-700 dark:text-purple-300">
                      <span className="font-bold">Hemotrópico:</span> {data.hemotropico}
                    </p>
                  )}
                  {data.observacion && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                      {data.observacion}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    /* --- VACUNAS Y DESPARASITACIÓN --- */
    if (item.type === "vaccination" || item.type === "deworming") {
      return (
        <div className="mt-1.5">
          <p className="text-sm font-bold text-slate-800 dark:text-white">
            {item.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {data.batchNumber && (
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                Lote: {data.batchNumber}
              </span>
            )}
            {data.nextAppointment && (
              <span className="text-[10px] bg-orange-50 dark:bg-orange-900/20 text-orange-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Clock size={10} /> Próxima: {new Date(data.nextAppointment).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      );
    }

    /* --- DEFAULT --- */
    return (
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
        {item.description}
      </p>
    );
  };

  if (isLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-biovet-500" />
      </div>
    );

  if (history.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-dark-200 lg:rounded-3xl border border-surface-200 dark:border-dark-100 items-center justify-center p-10 text-center">
        <div className="w-16 h-16 bg-surface-100 dark:bg-dark-100 rounded-full flex items-center justify-center mb-4">
          <Activity className="text-slate-300 dark:text-slate-600" size={32} />
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 font-medium">Sin historial médico</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Los eventos aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-200 lg:rounded-3xl border border-surface-200 dark:border-dark-100 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-surface-100 dark:border-dark-100 flex justify-between items-center shrink-0">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-tighter italic">
          <Activity className="text-biovet-500" size={18} /> Historial Clínico
        </h3>
        <span className="text-[10px] font-bold bg-surface-100 dark:bg-dark-100 px-3 py-1 rounded-full text-slate-500 uppercase">
          {history.length} Eventos
        </span>
      </div>

      {/* AQUÍ ESTÁ EL ARREGLO DEL SCROLL: pb-24 */}
      <div className="flex-1 overflow-y-auto p-5 pb-24 custom-scrollbar">
        <div className="relative space-y-8 before:absolute before:left-3.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-200 dark:before:bg-dark-100">
          {history.map((item, i) => {
            const config = getCategoryConfig(item);
            const Icon = config.icon;

            return (
              <div key={item._id || i} className="relative pl-10 group">
                {/* Punto Timeline */}
                <div className={`absolute left-0 top-0 w-8 h-8 rounded-full ${config.bg} ${config.color} flex items-center justify-center border-4 border-white dark:border-dark-200 z-10 shadow-sm transition-transform group-hover:scale-110`}>
                  <Icon size={14} strokeWidth={2.5} />
                </div>

                {/* Tarjeta */}
                <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-100 dark:border-dark-50 hover:shadow-md transition-all group-hover:border-biovet-200 dark:group-hover:border-biovet-800">
                  
                  {/* Header Tarjeta */}
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <Calendar size={10} />
                      {new Date(item.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  </div>

                  {/* Contenido Rico */}
                  {renderEventContent(item)}

                  {/* Footer Doctor */}
                  <div className="mt-3 pt-2 border-t border-surface-200 dark:border-dark-50 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Stethoscope size={10} />
                      Dr. {item.veterinarian || "No especificado"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}