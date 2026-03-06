// src/components/labexam/trichogram/TrichogramExamTab.tsx
import {
  TestTube,
  Calendar,
  Stethoscope,
  DollarSign,
  Percent,
  AlertCircle,
} from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { TrichogramFormData } from "@/types/labExam/trichogram";

interface TrichogramExamTabProps {
  register: UseFormRegister<TrichogramFormData>;
  errors: FieldErrors<TrichogramFormData>;
  cost: number;
  discount: number;
  totalCost: number;
}

export function TrichogramExamTab({
  register,
  errors,
  cost,
  discount,
  totalCost,
}: TrichogramExamTabProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-surface-200 dark:border-dark-100">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-teal-500 to-teal-600 flex items-center justify-center">
          <TestTube className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Datos del Examen
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Información general del tricograma
          </p>
        </div>
      </div>

      {/* Info del examen */}
      <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 rounded-2xl border border-teal-100 dark:border-teal-800">
        <div className="flex items-center gap-2 mb-2">
          <TestTube className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase">
            Tricograma
          </span>
        </div>
        <p className="text-sm text-teal-700 dark:text-teal-300">
          Análisis microscópico del pelo para evaluar la fase del ciclo piloso, 
          alteraciones estructurales y posibles causas de alopecia.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fecha */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-500" />
            Fecha
            <span className="text-danger-500">*</span>
          </label>
          <input
            type="date"
            {...register("date", { required: "Requerido" })}
            className={`input ${errors.date ? "input-error" : ""}`}
          />
          {errors.date && (
            <p className="error-text flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.date.message}
            </p>
          )}
        </div>

        {/* Veterinario */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
            Veterinario
          </label>
          <input
            type="text"
            {...register("treatingVet")}
            className="input"
            placeholder="Dr. Nombre"
          />
        </div>

        {/* Costo */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <DollarSign className="w-3.5 h-3.5 text-teal-500" />
            Costo
            <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register("cost", {
                valueAsNumber: true,
                required: "Requerido",
                min: { value: 0.01, message: "Debe ser mayor a 0" },
              })}
              className={`input pl-7 ${errors.cost ? "input-error" : ""}`}
              placeholder="0.00"
            />
          </div>
          {errors.cost && (
            <p className="error-text flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.cost.message}
            </p>
          )}
        </div>

        {/* Descuento */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <Percent className="w-3.5 h-3.5 text-warning-500" />
            Descuento
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register("discount", {
                valueAsNumber: true,
                min: { value: 0, message: "No negativo" },
              })}
              className="input pl-7"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Resumen de Costo */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-100 rounded-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            Costo total
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-teal-600">$</span>
            <span className="text-xl font-black text-teal-600 dark:text-teal-400">
              {cost.toFixed(2)}
            </span>
          </div>
          {discount > 0 && (
            <p className="text-[10px] text-success-600 dark:text-success-400 font-medium">
              Total con descuento: ${totalCost.toFixed(2)}
            </p>
          )}
        </div>
        <p className="text-[10px] text-slate-400 italic max-w-50 text-right">
          * Este examen no afecta el inventario.
        </p>
      </div>
    </div>
  );
}