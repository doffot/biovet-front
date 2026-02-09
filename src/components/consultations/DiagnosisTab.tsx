import { useFormContext } from "react-hook-form";
import { Section } from "./form-fields";

export default function DiagnosisTab() {
  const { register, formState: { errors }, watch } = useFormContext();

  const cost = Number(watch("cost")) || 0;
  const discount = Number(watch("discount")) || 0;
  const total = Math.max(0, cost - discount);

  return (
    <div className="space-y-6">
      <Section title="Diagnóstico">
        <div className="space-y-4">
          <div>
            <label className="label">Diagnóstico presuntivo *</label>
            <textarea
              {...register("presumptiveDiagnosis", { required: "Campo obligatorio" })}
              className={`input min-h-15 ${errors.presumptiveDiagnosis ? "border-red-500" : ""}`}
              placeholder="Diagnóstico inicial..."
              rows={2}
            />
            {errors.presumptiveDiagnosis && (
              <p className="text-red-500 text-xs mt-1">{errors.presumptiveDiagnosis.message as string}</p>
            )}
          </div>
          
          <div>
            <label className="label">Diagnóstico definitivo *</label>
            <textarea
              {...register("definitiveDiagnosis", { required: "Campo obligatorio" })}
              className={`input min-h-15 ${errors.definitiveDiagnosis ? "border-red-500" : ""}`}
              placeholder="Diagnóstico confirmado..."
              rows={2}
            />
            {errors.definitiveDiagnosis && (
              <p className="text-red-500 text-xs mt-1">{errors.definitiveDiagnosis.message as string}</p>
            )}
          </div>
          
          <div>
            <label className="label">Exámenes solicitados</label>
            <textarea {...register("requestedTests")} className="input min-h-15" placeholder="Hemograma, radiografía..." rows={2} />
          </div>
        </div>
      </Section>

      <Section title="Plan de tratamiento">
        <div>
          <label className="label">Tratamiento indicado *</label>
          <textarea
            {...register("treatmentPlan", { required: "Campo obligatorio" })}
            className={`input min-h-25 ${errors.treatmentPlan ? "border-red-500" : ""}`}
            placeholder="Medicamentos, dosis, frecuencia..."
            rows={4}
          />
          {errors.treatmentPlan && (
            <p className="text-red-500 text-xs mt-1">{errors.treatmentPlan.message as string}</p>
          )}
        </div>
      </Section>

      <Section title="Facturación">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Costo ($) *</label>
            <input
              {...register("cost", { required: "Campo obligatorio" })}
              type="number"
              step="0.01"
              className={`input ${errors.cost ? "border-red-500" : ""}`}
              placeholder="0.00"
            />
            {errors.cost && (
              <p className="text-red-500 text-xs mt-1">{errors.cost.message as string}</p>
            )}
          </div>
          <div>
            <label className="label">Descuento ($)</label>
            <input {...register("discount")} type="number" step="0.01" className="input" placeholder="0.00" />
          </div>
          <div>
            <label className="label">Total ($)</label>
            <div className="input bg-surface-100 dark:bg-dark-200 font-bold flex items-center h-10.5 border-biovet-200 dark:border-biovet-900 text-biovet-700 dark:text-biovet-400">
              ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 italic mt-2">
          * Al finalizar, el monto se registrará en el historial financiero.
        </p>
      </Section>
    </div>
  );
}