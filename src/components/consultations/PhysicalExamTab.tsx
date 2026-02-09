import { useFormContext } from "react-hook-form";
import { Section } from "./form-fields";

export default function PhysicalExamTab() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6">
      <Section title="Signos vitales">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="label">Temperatura (°C) *</label>
            <input
              {...register("temperature", { required: "Campo obligatorio" })}
              className={`input ${errors.temperature ? "border-red-500" : ""}`}
              placeholder="38.5"
            />
            {errors.temperature && (
              <p className="text-red-500 text-xs mt-1">{errors.temperature.message as string}</p>
            )}
          </div>
          <div>
            <label className="label">Frec. Cardíaca (lpm) *</label>
            <input
              {...register("heartRate", { required: "Campo obligatorio" })}
              className={`input ${errors.heartRate ? "border-red-500" : ""}`}
              placeholder="120"
            />
            {errors.heartRate && (
              <p className="text-red-500 text-xs mt-1">{errors.heartRate.message as string}</p>
            )}
          </div>
          <div>
            <label className="label">Frec. Resp. (rpm) *</label>
            <input
              {...register("respiratoryRate", { required: "Campo obligatorio" })}
              className={`input ${errors.respiratoryRate ? "border-red-500" : ""}`}
              placeholder="20"
            />
            {errors.respiratoryRate && (
              <p className="text-red-500 text-xs mt-1">{errors.respiratoryRate.message as string}</p>
            )}
          </div>
          <div>
            <label className="label">Peso (kg) *</label>
            <input
              {...register("weight", { required: "Campo obligatorio" })}
              className={`input ${errors.weight ? "border-red-500" : ""}`}
              placeholder="5.5"
            />
            {errors.weight && (
              <p className="text-red-500 text-xs mt-1">{errors.weight.message as string}</p>
            )}
          </div>
        </div>
        <div className="mt-2 flex gap-4 text-xs text-slate-500 italic">
          <span>Ref Temp: 38-39.2°C</span>
          <span>Ref FC: 60-140 lpm</span>
        </div>
      </Section>

      <Section title="Otros parámetros">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Ganglios linfáticos</label>
            <input {...register("lymphNodes")} className="input" placeholder="Normal, inflamados..." />
          </div>
          <div>
            <label className="label">Tiempo de relleno capilar (TRC)</label>
            <input {...register("capillaryRefillTime")} className="input" placeholder="< 2 segundos" />
          </div>
        </div>
      </Section>

      <Section title="Evaluación por sistemas">
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label className="label">Sistema Tegumentario</label>
            <textarea {...register("integumentarySystem")} className="input min-h-15" placeholder="Piel, pelo, ectoparásitos..." rows={2} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Sistema Cardiovascular</label>
              <textarea {...register("cardiovascularSystem")} className="input min-h-15" placeholder="Auscultación, pulso..." rows={2} />
            </div>
            <div>
              <label className="label">Sistema Respiratorio</label>
              <textarea {...register("respiratorySystem")} className="input min-h-15" placeholder="Ruidos pulmonares..." rows={2} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Sistema Gastrointestinal</label>
              <textarea {...register("gastrointestinalSystem")} className="input min-h-15" placeholder="Palpación abdominal..." rows={2} />
            </div>
            <div>
              <label className="label">Sistema Nervioso</label>
              <textarea {...register("nervousSystem")} className="input min-h-15" placeholder="Reflejos, estado mental..." rows={2} />
            </div>
          </div>
          
          <div>
            <label className="label">Sistema Musculoesquelético</label>
            <textarea {...register("musculoskeletalSystem")} className="input min-h-15" placeholder="Marcha, articulaciones..." rows={2} />
          </div>
        </div>
      </Section>
    </div>
  );
}