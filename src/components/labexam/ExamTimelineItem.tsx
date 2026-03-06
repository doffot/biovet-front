import { Trash2, Printer, ChevronRight } from "lucide-react";
import type { LabExam } from "@/types/labExam";
import { getExamConfig, hasPDFSupport } from "./config/examConfig";
import ExamValues from "./ExamValues";
import ExamObservations from "./ExamObservations";

interface ExamTimelineItemProps {
  exam: LabExam;
  onView: (exam: LabExam, e: React.MouseEvent<HTMLButtonElement>) => void;
  onPrint: (exam: LabExam) => void;
  onDelete: (exam: LabExam) => void;
}

export default function ExamTimelineItem({
  exam,
  onView,
  onPrint,
  onDelete,
}: ExamTimelineItemProps) {
  const config = getExamConfig(exam.examType);
  const Icon = config.icon;

  return (
    <div className="relative flex gap-6 md:gap-8 group animate-fade-in">
      {/* Icono Timeline */}
      <div
        className={`relative z-10 shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-lg border ${config.borderColor} ${config.bgColor} flex items-center justify-center ${config.color} shadow-sm transition-transform group-hover:scale-110`}
      >
        <Icon size={14} strokeWidth={2.5} />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {config.name}
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {new Date(exam.date).toLocaleDateString()}
              </span>
              {exam.treatingVet && (
                <span className="text-slate-400">• {exam.treatingVet}</span>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-1">
            {hasPDFSupport(exam.examType) && (
              <button
                onClick={() => onPrint(exam)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title="Generar PDF"
              >
                <Printer size={18} />
              </button>
            )}
            <button
              onClick={() => onDelete(exam)}
              className="p-2 text-slate-400 hover:text-danger-500 transition-colors"
              title="Eliminar"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Valores específicos del examen */}
        <ExamValues exam={exam} config={config} />

        {/* Observaciones/Resultados */}
        <ExamObservations exam={exam} />

        {/* Botón Ver Detalle */}
        <div className="mt-3 flex justify-end">
          <button
            onClick={(e) => onView(exam, e)}
            className={`${config.textColor} hover:opacity-80 font-bold text-sm flex items-center gap-1 transition-colors`}
          >
            Ver Detalle <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}