// src/components/labexam/quicktest/QuickTestResultsTab.tsx
import { Beaker, FileText, TestTube2, Sparkles, AlertCircle } from "lucide-react";
import { RESULT_OPTIONS } from "@/constants/quickTest";
import type { UseFormRegister, UseFormWatch, FieldErrors } from "react-hook-form";
import type { QuickTestFormData } from "@/types/labExam/quickTest";

interface QuickTestResultsTabProps {
  register: UseFormRegister<QuickTestFormData>;
  watch: UseFormWatch<QuickTestFormData>;
  errors: FieldErrors<QuickTestFormData>;
}

export function QuickTestResultsTab({
  register,
  watch,
  errors,
}: QuickTestResultsTabProps) {
  const testName = watch("testName");
  const results = watch("results");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-surface-200 dark:border-dark-100">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
          <TestTube2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Resultados del Test
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registra el resultado obtenido
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre del Test (readonly - viene del producto) */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <Beaker className="w-3.5 h-3.5 text-cyan-500" />
            Nombre del Test
          </label>
          <input
            type="text"
            {...register("testName")}
            readOnly
            className="input bg-slate-50 dark:bg-dark-100 cursor-not-allowed"
            placeholder="Selecciona un producto en la pestaña anterior..."
          />
        </div>

        {/* Resultado */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-cyan-500" />
            Resultado
            <span className="text-danger-500">*</span>
          </label>
          <select
            {...register("results", { required: "Requerido" })}
            className={`input ${errors.results ? "input-error" : ""}`}
          >
            <option value="">Seleccionar...</option>
            {RESULT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.results && (
            <p className="error-text flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.results.message}
            </p>
          )}
        </div>
      </div>

      {/* Preview del resultado */}
      {testName && results && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-100 border border-slate-200 dark:border-dark-50">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Vista previa
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="font-bold text-slate-700 dark:text-white">
              {testName}
            </span>
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                results?.toLowerCase() === "positivo"
                  ? "bg-danger-100 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400"
                  : results?.toLowerCase() === "negativo"
                    ? "bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {results?.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-800 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 shrink-0" />
        <p className="text-[11px] text-cyan-700 dark:text-cyan-300">
          Test rápido para diagnóstico preliminar. Se recomienda confirmar con exámenes de laboratorio complementarios.
        </p>
      </div>
    </div>
  );
}