// src/components/labexam/GeneralTab.tsx
import type { LabExamFormData } from "@/types/labExam";
import {
  Calendar,
  DollarSign,
  Stethoscope,
  Droplets,
  Activity,
  Beaker,
  CircleDot,
  AlertCircle,
  CheckCircle2,
  Percent,
} from "lucide-react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";

interface GeneralTabProps {
  species: "canino" | "felino";
  register: UseFormRegister<LabExamFormData>;
  errors: FieldErrors<LabExamFormData>;
  watch: UseFormWatch<LabExamFormData>;
}

const normalValues = {
  canino: {
    hematocrit: [37, 55],
    whiteBloodCells: [6000, 17000],
    totalProtein: [5.4, 7.8],
    platelets: [200000, 500000],
  },
  felino: {
    hematocrit: [30, 45],
    whiteBloodCells: [5000, 19500],
    totalProtein: [5.7, 8.9],
    platelets: [300000, 800000],
  },
};

export function GeneralTab({
  species,
  register,
  errors,
  watch,
}: GeneralTabProps) {
  const currentNormalValues = normalValues[species];

  const hemogramFields = [
    {
      name: "hematocrit" as const,
      label: "Hematocrito",
      unit: "%",
      step: "0.1",
      rangeKey: "hematocrit" as const,
      icon: Droplets,
      color: "text-danger-500",
      bgColor: "bg-danger-50 dark:bg-danger-950",
    },
    {
      name: "whiteBloodCells" as const,
      label: "Glóbulos Blancos",
      unit: "cél/µL",
      step: "1",
      rangeKey: "whiteBloodCells" as const,
      icon: Activity,
      color: "text-biovet-500",
      bgColor: "bg-biovet-50 dark:bg-biovet-950",
    },
    {
      name: "totalProtein" as const,
      label: "Proteína Total",
      unit: "g/dL",
      step: "0.1",
      rangeKey: "totalProtein" as const,
      icon: Beaker,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      name: "platelets" as const,
      label: "Plaquetas",
      unit: "cél/µL",
      step: "1",
      rangeKey: "platelets" as const,
      icon: CircleDot,
      color: "text-warning-500",
      bgColor: "bg-warning-50 dark:bg-warning-950",
    },
  ];

  const getValueStatus = (
    value: number | undefined,
    rangeKey: keyof typeof normalValues.canino
  ) => {
    if (value === undefined || value === null || value === 0) return "empty";
    const range = currentNormalValues[rangeKey];
    if (value < range[0]) return "low";
    if (value > range[1]) return "high";
    return "normal";
  };

  const cost = watch("cost") || 0;
  const discount = watch("discount") || 0;
  const totalCost = Math.max(0, cost - discount);

  return (
    <div className="space-y-5">
      {/* Información del Examen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Fecha */}
        <div className="relative">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-biovet-500" />
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

        {/* Costo */}
        <div className="relative">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <DollarSign className="w-3.5 h-3.5 text-success-500" />
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
                required: "Requerido",
                min: { value: 0.01, message: "Mayor a 0" },
                valueAsNumber: true,
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
        <div className="relative">
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
                min: { value: 0, message: "No puede ser negativo" },
              })}
              className="input pl-7"
              placeholder="0.00"
            />
          </div>
          {discount > 0 && (
            <p className="mt-1 text-[10px] text-success-600 dark:text-success-400 font-medium">
              Total: ${totalCost.toFixed(2)}
            </p>
          )}
        </div>

        {/* Veterinario */}
        <div className="relative">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-biovet-400" />
            Veterinario
          </label>
          <input
            type="text"
            {...register("treatingVet")}
            className="input"
            placeholder="Dr. Nombre"
          />
        </div>
      </div>

      {/* Valores del Hemograma */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-biovet-500"></div>
            Valores del Hemograma
          </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {hemogramFields.map((field) => {
            const Icon = field.icon;
            const value = watch(field.name);
            const status = getValueStatus(value, field.rangeKey);
            const range = currentNormalValues[field.rangeKey];
            const hasError = errors[field.name];

            // Clases dinámicas según estado
            let borderClass =
              "border-surface-200 dark:border-dark-100 hover:border-slate-300 dark:hover:border-slate-600";
            if (hasError) borderClass = "border-danger-500/50";
            else if (status === "low" || status === "high")
              borderClass = "border-warning-500/50";
            else if (status === "normal")
              borderClass = "border-success-500/50";

            let inputTextClass = "text-slate-700 dark:text-slate-200";
            if (hasError) inputTextClass = "text-danger-500";
            else if (status === "low" || status === "high")
              inputTextClass = "text-warning-600 dark:text-warning-400";
            else if (status === "normal")
              inputTextClass = "text-success-600 dark:text-success-400";

            return (
              <div
                key={field.name}
                className={`relative p-3 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-dark-200 ${borderClass}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg ${field.bgColor} flex items-center justify-center`}
                  >
                    <Icon className={`w-4 h-4 ${field.color}`} />
                  </div>
                  {status !== "empty" && (
                    <div
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        status === "normal"
                          ? "bg-success-50 dark:bg-success-950 text-success-600 dark:text-success-400"
                          : status === "low"
                          ? "bg-biovet-50 dark:bg-biovet-950 text-biovet-600 dark:text-biovet-400"
                          : "bg-danger-50 dark:bg-danger-950 text-danger-600 dark:text-danger-400"
                      }`}
                    >
                      {status === "normal" ? (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5" /> OK
                        </>
                      ) : status === "low" ? (
                        <>
                          <AlertCircle className="w-2.5 h-2.5" /> Bajo
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-2.5 h-2.5" /> Alto
                        </>
                      )}
                    </div>
                  )}
                </div>

                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 truncate">
                  {field.label}
                </label>

                <div className="relative">
                  <input
                    type="number"
                    step={field.step}
                    {...register(field.name, {
                      required: "Requerido",
                      min: { value: 0, message: "≥0" },
                      valueAsNumber: true,
                    })}
                    className={`w-full px-2 py-1.5 pr-12 rounded-lg border bg-transparent text-sm font-semibold transition-all
                      ${
                        hasError
                          ? "border-danger-500 focus:border-danger-600 focus:ring-danger-500/20"
                          : status === "low" || status === "high"
                          ? "border-warning-500/50 focus:border-warning-500 focus:ring-warning-500/20"
                          : status === "normal"
                          ? "border-success-500/50 focus:border-success-500 focus:ring-success-500/20"
                          : "border-surface-300 dark:border-dark-100 focus:border-biovet-500 focus:ring-biovet-500/20"
                      } focus:outline-none focus:ring-2 ${inputTextClass}`}
                    placeholder="0"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium pointer-events-none">
                    {field.unit}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500">
                    Ref: {range[0]} - {range[1]}
                  </span>
                  {hasError && (
                    <span className="text-[9px] text-danger-500 font-medium">
                      {errors[field.name]?.message}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}