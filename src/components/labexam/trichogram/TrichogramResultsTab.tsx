// src/components/labexam/trichogram/TrichogramResultsTab.tsx
import { FileText, TestTube, Sparkles, AlertCircle } from "lucide-react";
import type { UseFormRegister, UseFormWatch, FieldErrors } from "react-hook-form";
import type { TrichogramFormData } from "@/types/labExam/trichogram";

interface TrichogramResultsTabProps {
  register: UseFormRegister<TrichogramFormData>;
  watch: UseFormWatch<TrichogramFormData>;
  errors: FieldErrors<TrichogramFormData>;
}

export function TrichogramResultsTab({
  register,
  watch,
  errors,
}: TrichogramResultsTabProps) {
  const results = watch("results");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-surface-200 dark:border-dark-100">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-teal-500 to-teal-600 flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Resultados del Tricograma
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Describe los hallazgos del análisis de pelo
          </p>
        </div>
      </div>

      {/* Guía de evaluación */}
      <div className="p-3 bg-teal-50 dark:bg-teal-950/20 rounded-xl border border-teal-100 dark:border-teal-800">
        <div className="flex items-center gap-2 mb-2">
          <TestTube className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase">
            Parámetros a evaluar
          </span>
        </div>
        <ul className="text-xs text-teal-700 dark:text-teal-300 space-y-1 ml-6 list-disc">
          <li>Fase del ciclo piloso (anágeno, catágeno, telógeno)</li>
          <li>Proporción de pelos en cada fase</li>
          <li>Alteraciones de la cutícula y corteza</li>
          <li>Presencia de bulbos distróficos</li>
          <li>Puntas fracturadas o dañadas</li>
          <li>Pigmentación anormal</li>
        </ul>
      </div>

      {/* Resultados */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
          <FileText className="w-3.5 h-3.5 text-teal-500" />
          Resultados / Hallazgos
          <span className="text-danger-500">*</span>
        </label>
        <textarea
          {...register("results", { required: "Los resultados son obligatorios" })}
          rows={8}
          className={`input resize-none ${errors.results ? "input-error" : ""}`}
          placeholder="Describe los hallazgos del tricograma:

- Porcentaje de pelos en anágeno/telógeno
- Morfología del bulbo piloso
- Estado de la cutícula
- Presencia de alteraciones estructurales
- Conclusión diagnóstica"
        />
        {errors.results && (
          <p className="error-text flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" />
            {errors.results.message}
          </p>
        )}
      </div>

      {/* Preview */}
      {results && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-100 border border-slate-200 dark:border-dark-50">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Vista previa
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
            {results}
          </p>
        </div>
      )}

      {/* Tip */}
      <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-800 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400 shrink-0" />
        <p className="text-[11px] text-teal-700 dark:text-teal-300">
          El tricograma es útil para diferenciar alopecias endocrinas de otras causas. 
          Un ratio anágeno:telógeno normal es aproximadamente 9:1.
        </p>
      </div>
    </div>
  );
}