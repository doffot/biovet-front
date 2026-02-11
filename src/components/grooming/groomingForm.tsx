import React from "react";
import { Calendar, DollarSign, User, Scissors, AlignLeft, StickyNote } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { GroomingServiceFormData, GroomerOption } from "../../types/grooming";

type GroomingServiceFormProps = {
  register: UseFormRegister<GroomingServiceFormData>;
  errors: FieldErrors<GroomingServiceFormData>;
  groomers?: GroomerOption[];
};

const GroomingServiceForm: React.FC<GroomingServiceFormProps> = ({
  register,
  errors,
  groomers = [],
}) => {
  return (
    <div className="space-y-6">
      {/* Sección 1: Datos Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        
        {/* Fecha */}
        <div>
          <label className="label flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-biovet-500" />
            Fecha <span className="text-danger-500">*</span>
          </label>
          <input
            type="date"
            {...register("date", { required: "Requerido" })}
            className={`input ${errors.date ? "input-error" : ""}`}
          />
          {errors.date && <p className="error-text">{errors.date.message}</p>}
        </div>

        {/* Servicio */}
        <div>
          <label className="label flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-pink-500" />
            Tipo de Servicio <span className="text-danger-500">*</span>
          </label>
          <select
            {...register("service", { required: "Requerido" })}
            className={`input ${errors.service ? "input-error" : ""}`}
          >
            <option value="">Seleccionar...</option>
            <option value="Corte">Corte</option>
            <option value="Baño">Baño</option>
            <option value="Corte y Baño">Corte y Baño</option>
            <option value="Limpieza de oídos">Limpieza de oídos</option>
            <option value="Corte de uñas">Corte de uñas</option>
          </select>
          {errors.service && <p className="error-text">{errors.service.message}</p>}
        </div>

        {/* Peluquero */}
        <div>
          <label className="label flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-biovet-500" />
            Peluquero <span className="text-danger-500">*</span>
          </label>
          <select
            {...register("groomer", { required: "Requerido" })}
            className={`input ${errors.groomer ? "input-error" : ""}`}
          >
            <option value="">Seleccionar...</option>
            {groomers.map((groomer) => (
              <option key={groomer._id} value={groomer._id}>
                {groomer.name} {groomer.lastName}
              </option>
            ))}
          </select>
          {errors.groomer && <p className="error-text">{errors.groomer.message}</p>}
        </div>

        {/* Costo */}
        <div>
          <label className="label flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            Costo <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("cost", {
                required: "Requerido",
                valueAsNumber: true,
                min: { value: 0, message: "Debe ser positivo" }
              })}
              className={`input pl-7 ${errors.cost ? "input-error" : ""}`}
            />
          </div>
          {errors.cost && <p className="error-text">{errors.cost.message}</p>}
        </div>
      </div>

      {/* Sección 2: Detalles (Full width para aprovechar espacio) */}
      <div className="space-y-4 pt-2 border-t border-surface-200 dark:border-dark-100">
        
        {/* Especificaciones */}
        <div>
          <label className="label flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-biovet-500" />
            Especificaciones del servicio <span className="text-danger-500">*</span>
          </label>
          <textarea
            placeholder="Ej: Corte estilo cachorro, baño medicado con clorhexidina..."
            rows={3}
            maxLength={300}
            {...register("specifications", { required: "Requerido" })}
            className={`input resize-none h-auto py-3 ${errors.specifications ? "input-error" : ""}`}
          />
          {errors.specifications && (
            <p className="error-text">{errors.specifications.message}</p>
          )}
        </div>

        {/* Observaciones */}
        <div>
          <label className="label flex items-center gap-1.5">
            <StickyNote className="w-3.5 h-3.5 text-slate-400" />
            Observaciones <span className="text-slate-400 font-normal text-[10px] ml-1">(Opcional)</span>
          </label>
          <textarea
            placeholder="Notas internas sobre el comportamiento o estado de la mascota..."
            rows={2}
            maxLength={200}
            {...register("observations")}
            className="input resize-none h-auto py-3"
          />
        </div>
      </div>
    </div>
  );
};

export default GroomingServiceForm;