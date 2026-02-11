// src/components/appointment/AppointmentForm.tsx

import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import type { CreateAppointmentForm } from "../../types/appointment";
import { appointmentTypesValues } from "../../types/appointment";

interface AppointmentFormProps {
  onSubmit: (data: CreateAppointmentForm) => void;
  isSubmitting: boolean;
  initialType?: typeof appointmentTypesValues[number];
  initialReason?: string;
  initialObservations?: string;
  initialDate?: string;
}

export default function AppointmentForm({
  onSubmit,
  isSubmitting,
  initialType = "Consulta",
  initialReason = "",
  initialObservations = "",
  initialDate = "",
}: AppointmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAppointmentForm>({
    defaultValues: {
      type: initialType,
      reason: initialReason,
      observations: initialObservations,
      date: initialDate,
    },
  });

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200 shadow">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Tipo de cita */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Tipo de cita *
          </label>
          <select
            {...register("type", {
              required: "El tipo de cita es requerido",
            })}
            className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-slate-900 transition-all ${
              errors.type
                ? "border-red-400 bg-red-50"
                : "border-slate-300 hover:border-emerald-400 focus:border-emerald-500 focus:bg-white"
            }`}
          >
            <option value="">Selecciona un tipo</option>
            {appointmentTypesValues.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-2 text-red-600 text-sm font-semibold">
              ⚠️ {errors.type.message}
            </p>
          )}
        </div>

        {/* Motivo */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Motivo / Detalle *
          </label>
          <textarea
            {...register("reason", {
              required: "El motivo es requerido",
              minLength: { value: 2, message: "Mínimo 2 caracteres" },
              maxLength: { value: 200, message: "Máximo 200 caracteres" },
            })}
            placeholder="Ej: Control postoperatorio, Vacuna antirrábica..."
            rows={3}
            className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-slate-900 resize-none transition-all ${
              errors.reason
                ? "border-red-400 bg-red-50"
                : "border-slate-300 hover:border-emerald-400 focus:border-emerald-500 focus:bg-white"
            }`}
          />
          {errors.reason && (
            <p className="mt-2 text-red-600 text-sm font-semibold">
              ⚠️ {errors.reason.message}
            </p>
          )}
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Observaciones
          </label>
          <textarea
            {...register("observations", {
              maxLength: { value: 500, message: "Máximo 500 caracteres" },
            })}
            placeholder="Notas adicionales (opcional)..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 bg-white text-slate-900 resize-none transition-all hover:border-emerald-400 focus:border-emerald-500 focus:bg-white"
          />
          {errors.observations && (
            <p className="mt-2 text-red-600 text-sm font-semibold">
              ⚠️ {errors.observations.message}
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4 w-[40%]">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 px-4 py-3 rounded-lg border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar 
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}