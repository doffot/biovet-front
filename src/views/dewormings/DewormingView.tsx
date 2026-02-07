// src/components/dewormings/DewormingView.tsx
import { useQuery } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { getDewormingsByPatient } from "@/api/dewormingAPI";
import {
  Plus,
  Check,
  AlertCircle,
  Loader2,
  Bug,
  Shield,
} from "lucide-react";
import type { Patient } from "@/types/patient";

export default function DewormingView() {
  const contextData = useOutletContext<any>();
  const patient: Patient = contextData.patient || contextData;

  const { data: dewormings = [], isLoading } = useQuery({
    queryKey: ["dewormings", patient._id],
    queryFn: () => getDewormingsByPatient(patient._id),
    enabled: !!patient._id,
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(dateStr));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const sortedDewormings = [...dewormings].sort(
    (a, b) =>
      new Date(b.applicationDate).getTime() -
      new Date(a.applicationDate).getTime(),
  );

  const getDewormingStyle = (type: string) => {
    switch (type) {
      case "Interna":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200";
      case "Externa":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200";
      case "Ambas":
        return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200";
    }
  };

  const getDewormingIcon = (type: string) => {
    switch (type) {
      case "Externa":
        return <Shield size={16} strokeWidth={2.5} />;
      default:
        return <Bug size={16} strokeWidth={2.5} />;
    }
  };

  if (isLoading)
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-biovet-500 w-8 h-8" />
      </div>
    );

  return (
    <div className="flex flex-col bg-surface-50 dark:bg-dark-300 min-h-screen lg:min-h-0 lg:h-[calc(100vh-14rem)] lg:rounded-2xl lg:border lg:border-surface-200 lg:dark:border-dark-100 lg:overflow-hidden">
      
      {/* Header */}
      <div className="sticky top-0 lg:static z-40 bg-white dark:bg-dark-200 border-b border-surface-200 dark:border-dark-100 px-4 py-3 shadow-sm shrink-0">
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            {/* Info Mascota (Móvil) */}
            <div className="lg:hidden">
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none">
                {patient.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Desparasitaciones
              </p>
            </div>

            {/* Título Desktop */}
            <h1 className="hidden lg:block text-xl font-bold font-heading text-slate-800 dark:text-white">
              Control de Desparasitación
            </h1>
          </div>

          <button className="btn-primary shadow-lg shadow-biovet-500/20 active:scale-95 transition-transform rounded-full lg:rounded-xl w-10 h-10 lg:w-auto lg:h-auto p-0 lg:px-5 lg:py-2.5 flex items-center justify-center gap-2">
            <Plus size={20} />
            <span className="hidden lg:inline font-bold">Nueva Desparasitación</span>
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-4 pb-24">
        <div className="max-w-3xl mx-auto relative pl-4 lg:pl-0">
          {/* Línea vertical de timeline */}
          <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-dark-100 z-0"></div>

          <div className="space-y-6 relative">
            {sortedDewormings.length === 0 ? (
              <div className="text-center py-20 ml-10 border-2 border-dashed border-slate-200 dark:border-dark-100 rounded-2xl">
                <Bug className="w-12 h-12 mx-auto text-slate-300 mb-2 opacity-50" />
                <p className="text-slate-400 font-medium">
                  No hay desparasitaciones registradas
                </p>
              </div>
            ) : (
              sortedDewormings.map((deworming) => {
                const isPending =
                  deworming.nextApplicationDate &&
                  new Date(deworming.nextApplicationDate) > new Date();
                const style = getDewormingStyle(deworming.dewormingType);

                return (
                  <div
                    key={deworming._id}
                    className="relative flex items-start gap-5 group"
                  >
                    {/* Icono en timeline */}
                    <div
                      className={`
                        shrink-0 relative z-10
                        w-10 h-10 rounded-full flex items-center justify-center 
                        border-4 border-surface-50 dark:border-dark-300 shadow-sm
                        ${style}
                      `}
                    >
                      {getDewormingIcon(deworming.dewormingType)}
                    </div>

                    {/* Tarjeta de información */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-white dark:bg-dark-200 p-4 rounded-2xl rounded-tl-sm shadow-sm border border-surface-200 dark:border-dark-100 hover:shadow-md transition-all duration-200">
                        
                        {/* Cabecera */}
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-base leading-tight">
                              {deworming.productName}
                            </h3>
                            <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${style}`}>
                              {deworming.dewormingType}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500 bg-surface-50 dark:bg-dark-100 px-2 py-0.5 rounded-md border border-surface-100 dark:border-dark-50 shrink-0 ml-2">
                            {formatDate(deworming.applicationDate)}
                          </span>
                        </div>

                        {/* Detalles */}
                        <div className="flex flex-wrap gap-3 mb-3 text-xs">
                          <span className="text-slate-600 dark:text-slate-300">
                            <span className="font-medium">Dosis:</span> {deworming.dose}
                          </span>
                          {deworming.cost > 0 && (
                            <span className="text-slate-600 dark:text-slate-300 font-mono">
                              {formatCurrency(deworming.cost)}
                            </span>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-dashed border-surface-100 dark:border-dark-100">
                          <span
                            className={`
                              text-xs font-bold flex items-center gap-1.5
                              ${isPending ? "text-warning-600" : "text-success-600"}
                            `}
                          >
                            {isPending ? (
                              <>
                                <AlertCircle size={14} /> Próxima:{" "}
                                {formatDate(deworming.nextApplicationDate!)}
                              </>
                            ) : (
                              <>
                                <Check size={14} /> Aplicada
                              </>
                            )}
                          </span>

                          {/* Badge de tipo */}
                          <div className="flex items-center gap-1">
                            {deworming.dewormingType === "Ambas" && (
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Completa
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}