// src/components/labexam/LabExamMobileCard.tsx
import { Link } from "react-router-dom";
import { PawPrint, Calendar, Eye, Trash2, Download, Loader2 } from "lucide-react";
import { formatExamDate, getHematocritLabel, getHematocritStatus } from "@/utils/labExamHelpers";
import type { LabExam } from "@/types/labExam";

interface LabExamMobileCardProps {
  exam: LabExam;
  onDelete: () => void;
  onDownload: () => void;
  isGeneratingPdf: boolean;
  isPDFReady: boolean;
}

export function LabExamMobileCard({
  exam,
  onDelete,
  onDownload,
  isGeneratingPdf,
  isPDFReady,
}: LabExamMobileCardProps) {
  const hematocritStatus = getHematocritStatus(exam.hematocrit, exam.species);
  const isAltered = hematocritStatus !== "normal";

  return (
    <div
      className={`p-4 space-y-3 hover:bg-surface-50/50 dark:hover:bg-dark-200/30 transition-colors ${
        isAltered ? "bg-danger-50/30 dark:bg-danger-950/10" : ""
      }`}
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-biovet-500/10 flex items-center justify-center shrink-0">
            <PawPrint className="w-4 h-4 text-biovet-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
              {exam.patientName}
            </p>
            <p className="text-[11px] text-surface-500 dark:text-slate-400">
              {exam.breed || "Sin raza"} · {exam.species}
            </p>
          </div>
        </div>

        {/* Hematocrito */}
        <div className="text-right shrink-0">
          <p
            className={`text-base font-bold ${
              isAltered
                ? "text-danger-500 dark:text-danger-400"
                : "text-biovet-500 dark:text-biovet-400"
            }`}
          >
            {exam.hematocrit}%
          </p>
          {isAltered && (
            <p className="text-[10px] text-danger-500 dark:text-danger-400 font-medium">
              {getHematocritLabel(hematocritStatus)}
            </p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-surface-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatExamDate(exam.date)}
          </span>
          <span>
            WBC: {exam.whiteBloodCells}{" "}
            <span className="text-[10px]">x10³/μL</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Ver */}
          <Link
            to={`/lab/${exam._id}/edit`}
            className="p-1.5 rounded-lg bg-surface-50 dark:bg-dark-200 text-surface-500 dark:text-slate-400 border border-surface-300 dark:border-slate-700 hover:text-biovet-500 transition-all"
            title="Ver"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>

          {/* Descargar PDF */}
          <button
            onClick={onDownload}
            disabled={isGeneratingPdf || !isPDFReady}
            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="PDF"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Eliminar */}
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950 border border-danger-200 dark:border-danger-800 transition-all cursor-pointer"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}