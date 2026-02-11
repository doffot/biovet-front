// src/components/labexam/ObservationsTab.tsx
import type { LabExamFormData } from "@/types/labExam";
import {
  FileText,
  Microscope,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

interface ObservationsTabProps {
  register: UseFormRegister<LabExamFormData>;
  errors: FieldErrors<LabExamFormData>;
  isPending: boolean;
  onSubmit: () => void;
}

export function ObservationsTab({
  register,
  errors,
}: ObservationsTabProps) {
  return (
    <div className="space-y-4">
      {/* Header minimalista */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-dark-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-biovet-500 to-biovet-600 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Observaciones Finales
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Añade notas clínicas importantes
            </p>
          </div>
        </div>
      </div>

      {/* Grid de 2 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hemotrópico */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Microscope className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
            Hemotrópico
            <span className="text-[9px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-1.5 py-0.5 rounded border border-purple-100 dark:border-purple-800">
              Opcional
            </span>
          </label>
          <textarea
            {...register("hemotropico")}
            placeholder="Ej: Mycoplasma hemofelis observado..."
            className={`w-full bg-surface-50 dark:bg-dark-100 border rounded-lg px-3 py-2 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 resize-none transition-all text-slate-700 dark:text-slate-200 ${
              errors.hemotropico
                ? "border-danger-500 focus:border-danger-600 focus:ring-danger-500/20"
                : "border-surface-200 dark:border-slate-700 hover:border-purple-500/50 focus:border-purple-500 focus:ring-purple-500/20"
            }`}
            rows={4}
          />
          {errors.hemotropico && (
            <p className="text-[10px] text-danger-500 dark:text-danger-400 flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5" />
              {errors.hemotropico.message}
            </p>
          )}
        </div>

        {/* Observación General */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <FileText className="w-3.5 h-3.5 text-warning-500 dark:text-warning-400" />
            Observaciones Clínicas
            <span className="text-[9px] font-medium text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-900/20 px-1.5 py-0.5 rounded border border-warning-100 dark:border-warning-800">
              Opcional
            </span>
          </label>
          <textarea
            {...register("observacion")}
            placeholder="Ej: Muestra con ligera hemólisis..."
            className={`w-full bg-surface-50 dark:bg-dark-100 border rounded-lg px-3 py-2 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 resize-none transition-all text-slate-700 dark:text-slate-200 ${
              errors.observacion
                ? "border-danger-500 focus:border-danger-600 focus:ring-danger-500/20"
                : "border-surface-200 dark:border-slate-700 hover:border-warning-500/50 focus:border-warning-500 focus:ring-warning-500/20"
            }`}
            rows={4}
          />
          {errors.observacion && (
            <p className="text-[10px] text-danger-500 dark:text-danger-400 flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5" />
              {errors.observacion.message}
            </p>
          )}
        </div>
      </div>

      {/* Tip compacto */}
      <div className="p-2.5 rounded-lg bg-biovet-50 dark:bg-biovet-950/20 border border-biovet-100 dark:border-biovet-800 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-biovet-500 dark:text-biovet-400 shrink-0" />
        <p className="text-[11px] text-biovet-700 dark:text-biovet-300">
          Las observaciones ayudan a correlacionar hallazgos de laboratorio con
          la clínica.
        </p>
      </div>
    </div>
  );
}