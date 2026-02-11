import { X, Calendar, FlaskConical, FileText, Beaker, AlertCircle, BadgeDollarSign } from "lucide-react";
import type { LabExam } from "../../types/labExam";

interface LabExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: LabExam;
}

export default function LabExamModal({
  isOpen,
  onClose,
  exam,
}: LabExamModalProps) {
  if (!isOpen) return null;

  const cost = exam?.cost ?? 0;
  const discount = exam?.discount ?? 0;
  const totalPaid = cost - discount;

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="bg-white dark:bg-dark-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] flex flex-col border border-surface-200 dark:border-dark-100 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-dark-100 bg-surface-50/50 dark:bg-dark-300/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center border border-purple-100 dark:border-purple-800">
              <FlaskConical className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base font-heading">
                Hemograma Completo
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  ${totalPaid.toFixed(2)}
                </p>
                {discount > 0 && (
                  <span className="text-[10px] bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-800">
                    Desc. -${discount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface-200 dark:hover:bg-dark-100 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar bg-white dark:bg-dark-200">
          
          {/* Sección Financiera Rápida */}
          {discount > 0 && (
            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-xl">
              <div className="flex items-center gap-2">
                <BadgeDollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  Ahorro aplicado
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                -${discount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Fecha */}
          <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-dark-300 rounded-xl border border-surface-200 dark:border-dark-100">
            <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                Fecha Realización
              </p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {formatDate(exam.date)}
              </p>
            </div>
          </div>

          {/* Resultados principales */}
          <div className="grid grid-cols-2 gap-3">
            {/* Hematocrito */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Beaker className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-300 uppercase">
                  Hematocrito
                </p>
              </div>
              <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                {(exam?.hematocrit ?? 0)}%
              </p>
            </div>

            {/* Leucocitos */}
            <div className="p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Beaker className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                <p className="text-[10px] font-bold text-purple-600 dark:text-purple-300 uppercase">
                  Leucocitos
                </p>
              </div>
              <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
                {(exam?.whiteBloodCells ?? 0).toLocaleString()}
              </p>
            </div>

            {/* Proteínas Totales */}
            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Beaker className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-300 uppercase">
                  P. Total
                </p>
              </div>
              <p className="text-lg font-bold text-amber-800 dark:text-amber-200">
                {(exam?.totalProtein ?? 0)}
                <span className="text-xs font-normal opacity-60 ml-1">g/dL</span>
              </p>
            </div>

            {/* Plaquetas */}
            <div className="p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Beaker className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-300 uppercase">
                  Plaquetas
                </p>
              </div>
              <p className="text-lg font-bold text-rose-800 dark:text-rose-200">
                {(exam?.platelets ?? 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Hemotrópicos */}
          {exam.hemotropico && (
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-red-600 dark:text-red-300 uppercase">
                  Hallazgos Hemotrópicos
                </p>
                <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">
                  {exam.hemotropico}
                </p>
              </div>
            </div>
          )}

          {/* Observaciones */}
          {exam.observacion && (
            <div className="flex items-start gap-3 p-3 bg-surface-50 dark:bg-dark-300 border border-surface-200 dark:border-dark-100 rounded-xl">
              <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Notas del Laboratorio
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-200 italic">
                  "{exam.observacion}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-200 dark:border-dark-100 bg-surface-50/50 dark:bg-dark-300/50">
          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-bold text-slate-700 dark:text-slate-200 bg-surface-200 dark:bg-dark-100 hover:bg-surface-300 dark:hover:bg-dark-50 rounded-xl transition-all active:scale-[0.98]"
          >
            Cerrar Reporte
          </button>
        </div>
      </div>

      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}