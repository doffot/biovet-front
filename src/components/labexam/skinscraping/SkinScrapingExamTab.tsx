// src/components/labexam/skinscraping/SkinScrapingExamTab.tsx
import {
  Scissors,
  Calendar,
  Stethoscope,
  DollarSign,
  Percent,
  AlertCircle,
} from "lucide-react";
import { Controller } from "react-hook-form";
import { SCRAPING_TYPE_OPTIONS } from "@/constants/skinScraping";
import type {
  UseFormRegister,
  UseFormWatch,
  FieldErrors,
  Control,
} from "react-hook-form";
import type { SkinScrapingFormData } from "@/types/labExam/skinScraping";

interface SkinScrapingExamTabProps {
  register: UseFormRegister<SkinScrapingFormData>;
  watch: UseFormWatch<SkinScrapingFormData>;
  control: Control<SkinScrapingFormData>;
  errors: FieldErrors<SkinScrapingFormData>;
  cost: number;
  discount: number;
  totalCost: number;
}

export function SkinScrapingExamTab({
  register,
  control,
  errors,
  cost,
  discount,
  totalCost,
}: SkinScrapingExamTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-surface-200 dark:border-dark-100">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <Scissors className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Datos del Examen
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configura los parámetros del raspado
          </p>
        </div>
      </div>

      {/* Tipo de Raspado - Botones Inline */}
      {/* Tipo de Raspado - Botones Compactos */}
<Controller
  name="type"
  control={control}
  rules={{ required: "Selecciona un tipo de raspado" }}
  render={({ field }) => (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
        Tipo de Raspado <span className="text-danger-500">*</span>
      </label>

      <div className="flex gap-2">
        {SCRAPING_TYPE_OPTIONS.map((option) => {
          const isSelected = field.value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => field.onChange(option.value)}
              className={`
                px-5 py-2 rounded-lg text-sm font-medium
                border transition-all duration-200
                ${isSelected
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-white dark:bg-dark-100 text-slate-600 dark:text-slate-300 border-surface-300 dark:border-dark-50 hover:border-amber-400"
                }
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {errors.type && (
        <p className="text-xs text-danger-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errors.type.message}
        </p>
      )}
    </div>
  )}
/>

      {/* Campos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fecha */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            Fecha <span className="text-danger-500">*</span>
          </label>
          <input
            type="date"
            {...register("date", { required: "Requerido" })}
            className={`input ${errors.date ? "input-error" : ""}`}
          />
          {errors.date && (
            <p className="error-text flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              {errors.date.message}
            </p>
          )}
        </div>

        {/* Veterinario */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-amber-500" />
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
            <DollarSign className="w-3.5 h-3.5 text-amber-500" />
            Costo <span className="text-danger-500">*</span>
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
                min: { value: 0.01, message: "> 0" },
              })}
              className={`input pl-7 ${errors.cost ? "input-error" : ""}`}
              placeholder="0.00"
            />
          </div>
          {errors.cost && (
            <p className="error-text flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              {errors.cost.message}
            </p>
          )}
        </div>

        {/* Descuento */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <Percent className="w-3.5 h-3.5 text-success-500" />
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
              {...register("discount", { valueAsNumber: true })}
              className="input pl-7"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-dark-100 rounded-xl border border-surface-200 dark:border-dark-50">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase">
            Total
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
              ${totalCost.toFixed(2)}
            </span>
            {discount > 0 && (
              <span className="text-sm line-through text-slate-400 ml-2">
                ${cost.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-400 italic max-w-32">
          * No afecta inventario
        </p>
      </div>
    </div>
  );
}