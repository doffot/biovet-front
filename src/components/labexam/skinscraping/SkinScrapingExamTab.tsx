// src/components/labexam/skinscraping/SkinScrapingExamTab.tsx
import {
  Scissors,
  Calendar,
  Stethoscope,
  DollarSign,
  Percent,
  AlertCircle,
  Layers,
  Layers2,
} from "lucide-react";
import { SCRAPING_TYPE_OPTIONS } from "@/constants/skinScraping";
import type {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import type { SkinScrapingFormData } from "@/types/labExam/skinScraping";

interface SkinScrapingExamTabProps {
  register: UseFormRegister<SkinScrapingFormData>;
  watch: UseFormWatch<SkinScrapingFormData>;
  setValue: UseFormSetValue<SkinScrapingFormData>;
  errors: FieldErrors<SkinScrapingFormData>;
  cost: number;
  discount: number;
  totalCost: number;
}

export function SkinScrapingExamTab({
  register,
  watch,
  setValue,
  errors,
  cost,
  discount,
  totalCost,
}: SkinScrapingExamTabProps) {
  const selectedType = watch("type");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-surface-200 dark:border-dark-100">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-500 to-amber-600 flex items-center justify-center">
          <Scissors className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Datos del Examen
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Selecciona el tipo de raspado cutáneo
          </p>
        </div>
      </div>

      {/* Tipo de Raspado */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Tipo de Raspado
          <span className="text-danger-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SCRAPING_TYPE_OPTIONS.map((option) => {
            const isSelected = selectedType === option.value;
            const Icon = option.value === "superficial" ? Layers : Layers2;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue("type", option.value)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
                    : "border-slate-200 dark:border-dark-100 hover:border-amber-300 dark:hover:border-amber-700"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 dark:bg-dark-100 text-slate-400"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p
                    className={`font-bold text-sm ${
                      isSelected
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {option.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        {errors.type && (
          <p className="text-xs text-danger-600 dark:text-danger-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.type.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fecha */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
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
            <Stethoscope className="w-3.5 h-3.5 text-amber-400" />
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
            <span className="text-lg font-black text-amber-600">$</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">
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
