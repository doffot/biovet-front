import { Pill, Clock, Calendar, DollarSign, Activity, AlertCircle } from "lucide-react";
import type { TreatmentFormData } from "@/types/treatment";
import { treatmentTypes, routeTypes, statusTypes } from "@/types/treatment";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";

interface TreatmentFormProps {
  register: UseFormRegister<TreatmentFormData>;
  errors: FieldErrors<TreatmentFormData>;
  control?: Control<TreatmentFormData>; // Opcional, si usas Controller
  watch: any; // Para mostrar/ocultar campos "Otro"
}

export default function TreatmentForm({ register, errors, watch }: TreatmentFormProps) {
  const typeValue = watch("treatmentType");
  const routeValue = watch("route");

  return (
    <div className="space-y-6">
      
      {/* Sección 1: Datos Básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        
        {/* Nombre Producto */}
        <div>
          <label className="label flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5 text-cyan-500" />
            Producto / Medicamento <span className="text-danger-500">*</span>
          </label>
          <input
            {...register("productName", { required: "Requerido" })}
            className={`input ${errors.productName ? "input-error" : ""}`}
            placeholder="Ej: Amoxicilina 500mg"
          />
          {errors.productName && <p className="error-text">{errors.productName.message}</p>}
        </div>

        {/* Tipo Tratamiento */}
        <div>
          <label className="label flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-biovet-500" />
            Tipo <span className="text-danger-500">*</span>
          </label>
          <select
            {...register("treatmentType", { required: "Requerido" })}
            className={`input ${errors.treatmentType ? "input-error" : ""}`}
          >
            <option value="">Seleccionar...</option>
            {treatmentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.treatmentType && <p className="error-text">{errors.treatmentType.message}</p>}
        </div>

        {/* Tipo "Otro" (Condicional) */}
        {typeValue === "Otro" && (
          <div className="animate-fade-in">
            <label className="label">Especifique Tipo <span className="text-danger-500">*</span></label>
            <input
              {...register("treatmentTypeOther", { required: "Especifique el tipo" })}
              className={`input ${errors.treatmentTypeOther ? "input-error" : ""}`}
            />
            {errors.treatmentTypeOther && <p className="error-text">{errors.treatmentTypeOther.message}</p>}
          </div>
        )}

        {/* Vía Admin */}
        <div>
          <label className="label">Vía de Administración <span className="text-danger-500">*</span></label>
          <select
            {...register("route", { required: "Requerido" })}
            className={`input ${errors.route ? "input-error" : ""}`}
          >
            <option value="">Seleccionar...</option>
            {routeTypes.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          {errors.route && <p className="error-text">{errors.route.message}</p>}
        </div>

        {/* Vía "Otro" (Condicional) */}
        {routeValue === "Otro" && (
          <div className="animate-fade-in">
            <label className="label">Especifique Vía <span className="text-danger-500">*</span></label>
            <input
              {...register("routeOther", { required: "Especifique la vía" })}
              className={`input ${errors.routeOther ? "input-error" : ""}`}
            />
            {errors.routeOther && <p className="error-text">{errors.routeOther.message}</p>}
          </div>
        )}
      </div>

      {/* Sección 2: Posología */}
      <div className="p-4 bg-surface-50 dark:bg-dark-100 rounded-xl border border-surface-200 dark:border-dark-50 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
          <Clock size={14} /> Posología
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Dosis <span className="text-danger-500">*</span></label>
            <input
              {...register("dose", { required: "Requerido" })}
              className={`input ${errors.dose ? "input-error" : ""}`}
              placeholder="Ej: 1 tableta, 2ml"
            />
            {errors.dose && <p className="error-text">{errors.dose.message}</p>}
          </div>

          <div>
            <label className="label">Frecuencia <span className="text-danger-500">*</span></label>
            <input
              {...register("frequency", { required: "Requerido" })}
              className={`input ${errors.frequency ? "input-error" : ""}`}
              placeholder="Ej: Cada 8 horas"
            />
            {errors.frequency && <p className="error-text">{errors.frequency.message}</p>}
          </div>

          <div>
            <label className="label">Duración <span className="text-danger-500">*</span></label>
            <input
              {...register("duration", { required: "Requerido" })}
              className={`input ${errors.duration ? "input-error" : ""}`}
              placeholder="Ej: Por 5 días"
            />
            {errors.duration && <p className="error-text">{errors.duration.message}</p>}
          </div>
        </div>
      </div>

      {/* Sección 3: Fechas y Costo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Inicio <span className="text-danger-500">*</span>
          </label>
          <input
            type="date"
            {...register("startDate", { required: "Requerido" })}
            className={`input ${errors.startDate ? "input-error" : ""}`}
          />
          {errors.startDate && <p className="error-text">{errors.startDate.message}</p>}
        </div>

        <div>
          <label className="label">Fin (Opcional)</label>
          <input
            type="date"
            {...register("endDate")}
            className="input"
          />
        </div>

        <div>
          <label className="label flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            Costo Total <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register("cost", { 
                required: "Requerido", 
                valueAsNumber: true,
                min: { value: 0, message: "Debe ser positivo" }
              })}
              className={`input pl-7 ${errors.cost ? "input-error" : ""}`}
              placeholder="0.00"
            />
          </div>
          {errors.cost && <p className="error-text">{errors.cost.message}</p>}
        </div>
      </div>

      {/* Estado */}
      <div>
        <label className="label">Estado del Tratamiento <span className="text-danger-500">*</span></label>
        <div className="flex gap-4">
          {statusTypes.map((status) => (
            <label key={status} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={status}
                {...register("status", { required: true })}
                className="accent-cyan-500 w-4 h-4"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{status}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="label flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          Observaciones <span className="text-slate-400 text-[10px] ml-1">(Opcional)</span>
        </label>
        <textarea
          rows={2}
          {...register("observations")}
          className="input resize-none h-auto py-2"
          placeholder="Notas adicionales..."
        />
      </div>
    </div>
  );
}