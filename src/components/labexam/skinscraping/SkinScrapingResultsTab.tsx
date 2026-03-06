// src/components/labexam/skinscraping/SkinScrapingResultsTab.tsx
import { FileText, Scissors, Sparkles, AlertCircle } from "lucide-react";
import type { UseFormRegister, UseFormWatch, FieldErrors } from "react-hook-form";
import type { SkinScrapingFormData } from "@/types/labExam/skinScraping";

interface SkinScrapingResultsTabProps {
  register: UseFormRegister<SkinScrapingFormData>;
  watch: UseFormWatch<SkinScrapingFormData>;
  errors: FieldErrors<SkinScrapingFormData>;
}

export function SkinScrapingResultsTab({
  register,
  watch,
  errors,
}: SkinScrapingResultsTabProps) {
  const scrapingType = watch("type");
  const results = watch("results");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-surface-200 dark:border-dark-100">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-500 to-amber-600 flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Resultados del Raspado
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Describe los hallazgos del examen
          </p>
        </div>
      </div>

      {/* Tipo seleccionado */}
      {scrapingType && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-800">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              Raspado {scrapingType === "superficial" ? "Superficial" : "Profundo"}
            </span>
          </div>
        </div>
      )}

      {/* Resultados */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
          <FileText className="w-3.5 h-3.5 text-amber-500" />
          Resultados / Hallazgos
          <span className="text-danger-500">*</span>
        </label>
        <textarea
          {...register("results", { required: "Los resultados son obligatorios" })}
          rows={6}
          className={`input resize-none ${errors.results ? "input-error" : ""}`}
          placeholder="Describe los hallazgos microscópicos: presencia de ácaros (Demodex, Sarcoptes), huevos, larvas, hifas fúngicas, levaduras, células inflamatorias, etc."
        />
        {errors.results && (
          <p className="error-text flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" />
            {errors.results.message}
          </p>
        )}
      </div>

      {/* Preview */}
      {scrapingType && results && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-100 border border-slate-200 dark:border-dark-50">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Vista previa
          </p>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-white">
              Raspado {scrapingType === "superficial" ? "Superficial" : "Profundo"}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
              {results}
            </p>
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
        <p className="text-[11px] text-amber-700 dark:text-amber-300">
          El raspado superficial detecta parásitos en capas externas. El profundo llega hasta el sangrado capilar para detectar Demodex y ácaros profundos.
        </p>
      </div>
    </div>
  );
}