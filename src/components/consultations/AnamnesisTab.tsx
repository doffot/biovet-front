import { Controller, useFormContext } from "react-hook-form";
import { Section } from "./form-fields";

export default function AnamnesisTab() {
  const { register, control, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6">
      {/* MOTIVO DE CONSULTA */}
      <Section title="Motivo de consulta">
        <div className="space-y-3">
          <div>
            <label className="label">¿Qué lo trae hoy a la clínica? *</label>
            <textarea
              {...register("reasonForVisit", { required: "Campo obligatorio" })}
              className={`input min-h-20 ${errors.reasonForVisit ? "border-red-500" : ""}`}
              placeholder="Describa el motivo de la visita..."
              rows={3}
            />
            {errors.reasonForVisit && (
              <p className="text-red-500 text-xs mt-1">{errors.reasonForVisit.message as string}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">¿Cuándo comenzaron los síntomas? *</label>
              <input
                {...register("symptomOnset", { required: "Campo obligatorio" })}
                className={`input ${errors.symptomOnset ? "border-red-500" : ""}`}
                placeholder="Ej: Hace 3 días"
              />
              {errors.symptomOnset && (
                <p className="text-red-500 text-xs mt-1">{errors.symptomOnset.message as string}</p>
              )}
            </div>
            
            <div>
              <label className="label">¿Ha empeorado, mejorado o se mantiene estable? *</label>
              <select
                {...register("symptomEvolution", { required: "Seleccione una opción" })}
                className={`input ${errors.symptomEvolution ? "border-red-500" : ""}`}
              >
                <option value="">Seleccionar...</option>
                <option value="empeorado">Empeorado</option>
                <option value="mejorado">Mejorado</option>
                <option value="estable">Estable</option>
              </select>
              {errors.symptomEvolution && (
                <p className="text-red-500 text-xs mt-1">{errors.symptomEvolution.message as string}</p>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* DATOS GENERALES */}
      <Section title="Datos generales">
        <div className="space-y-3">
          {/* isNeutered con Controller */}
          <Controller
            name="isNeutered"
            control={control}
            rules={{ validate: (value) => value !== undefined || "Seleccione una opción" }}
            render={({ field, fieldState }) => (
              <div>
                <label className="label">¿Está esterilizado/castrado? *</label>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => field.onChange(true)}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all
                      ${field.value === true 
                        ? "bg-biovet-500 text-white border border-biovet-600 shadow-sm" 
                        : fieldState.error
                          ? "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-red-500 hover:bg-surface-100"
                          : "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-surface-200 dark:border-slate-700 hover:bg-surface-100"
                      }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange(false)}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all
                      ${field.value === false 
                        ? "bg-biovet-500 text-white border border-biovet-600 shadow-sm" 
                        : fieldState.error
                          ? "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-red-500 hover:bg-surface-100"
                          : "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-surface-200 dark:border-slate-700 hover:bg-surface-100"
                      }`}
                  >
                    No
                  </button>
                </div>
                {fieldState.error && (
                  <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">¿Con cuántos animales convive?</label>
              <input {...register("cohabitantAnimals")} className="input" placeholder="Ej: 2 perros, 1 gato" />
            </div>
            <div>
              <label className="label">¿Contacto con animales callejeros?</label>
              <input {...register("contactWithStrays")} className="input" placeholder="Sí/No, frecuencia..." />
            </div>
            <div>
              <label className="label">¿Tipo de alimentación?</label>
              <input {...register("feeding")} className="input" placeholder="Marca, tipo, frecuencia..." />
            </div>
          </div>
        </div>
      </Section>

      {/* SISTEMA DIGESTIVO */}
      <Section title="Sistema digestivo">
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">¿Cómo está de apetito? *</label>
              <select
                {...register("appetite", { required: "Seleccione una opción" })}
                className={`input ${errors.appetite ? "border-red-500" : ""}`}
              >
                <option value="">Seleccionar...</option>
                <option value="Normal">Normal</option>
                <option value="Mucho">Aumentado</option>
                <option value="Poco">Disminuido</option>
                <option value="Nada">Sin apetito</option>
              </select>
              {errors.appetite && (
                <p className="text-red-500 text-xs mt-1">{errors.appetite.message as string}</p>
              )}
            </div>
            <div>
              <label className="label">¿Vómitos? ¿Frecuencia? ¿Contenido?</label>
              <input {...register("vomiting")} className="input" placeholder="Alimento, bilis, sangre..." />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium mb-2">Heces:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label text-xs">Frecuencia</label>
                <input {...register("bowelMovementFrequency")} className="input" placeholder="Ej: 2 veces al día" />
              </div>
              <div>
                <label className="label text-xs">Consistencia</label>
                <select {...register("stoolConsistency")} className="input">
                  <option value="">Seleccionar...</option>
                  <option value="normal">Normal</option>
                  <option value="dura">Dura</option>
                  <option value="pastosa">Pastosa</option>
                  <option value="líquida">Líquida</option>
                </select>
              </div>
              <div>
                <label className="label text-xs">¿Sangre, moco o parásitos?</label>
                <input {...register("bloodOrParasitesInStool")} className="input" placeholder="Sí/No, descripción..." />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* SISTEMA URINARIO */}
      <Section title="Sistema urinario">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">¿Orina con normalidad?</label>
            <input {...register("normalUrination")} className="input" placeholder="Sí/No, observaciones..." />
          </div>
          <div>
            <label className="label">¿Frecuencia y cantidad?</label>
            <input {...register("urineFrequencyAndAmount")} className="input" placeholder="Ej: 3-4 veces" />
          </div>
          <div>
            <label className="label">¿Color de la orina?</label>
            <input {...register("urineColor")} className="input" placeholder="Normal, rojiza, oscura..." />
          </div>
          <div>
            <label className="label">¿Dolor o dificultad al orinar?</label>
            <input {...register("painOrDifficultyUrinating")} className="input" placeholder="Sí/No, descripción..." />
          </div>
        </div>
      </Section>

      {/* SISTEMA RESPIRATORIO */}
      <Section title="Sistema respiratorio">
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">¿Tos? ¿Severidad y frecuencia?</label>
              <input {...register("cough")} className="input" placeholder="Seca, húmeda, frecuencia..." />
            </div>
            <div>
              <label className="label">¿Estornudos? ¿Con secreción?</label>
              <input {...register("sneezing")} className="input" placeholder="Clara, purulenta..." />
            </div>
          </div>
          
          {/* breathingDifficulty con Controller */}
          <Controller
            name="breathingDifficulty"
            control={control}
            rules={{ validate: (value) => value !== undefined || "Seleccione una opción" }}
            render={({ field, fieldState }) => (
              <div>
                <label className="label">¿Dificultad para respirar? *</label>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => field.onChange(true)}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all
                      ${field.value === true 
                        ? "bg-biovet-500 text-white border border-biovet-600 shadow-sm" 
                        : fieldState.error
                          ? "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-red-500 hover:bg-surface-100"
                          : "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-surface-200 dark:border-slate-700 hover:bg-surface-100"
                      }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange(false)}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all
                      ${field.value === false 
                        ? "bg-biovet-500 text-white border border-biovet-600 shadow-sm" 
                        : fieldState.error
                          ? "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-red-500 hover:bg-surface-100"
                          : "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-surface-200 dark:border-slate-700 hover:bg-surface-100"
                      }`}
                  >
                    No
                  </button>
                </div>
                {fieldState.error && (
                  <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </Section>

      {/* PIEL Y PELAJE */}
      <Section title="Piel y pelaje">
        <div className="space-y-3">
          {/* itchingOrExcessiveLicking con Controller */}
          <Controller
            name="itchingOrExcessiveLicking"
            control={control}
            rules={{ validate: (value) => value !== undefined || "Seleccione una opción" }}
            render={({ field, fieldState }) => (
              <div>
                <label className="label">¿Picazón, rascado excesivo o lamido? *</label>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => field.onChange(true)}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all
                      ${field.value === true 
                        ? "bg-biovet-500 text-white border border-biovet-600 shadow-sm" 
                        : fieldState.error
                          ? "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-red-500 hover:bg-surface-100"
                          : "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-surface-200 dark:border-slate-700 hover:bg-surface-100"
                      }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange(false)}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all
                      ${field.value === false 
                        ? "bg-biovet-500 text-white border border-biovet-600 shadow-sm" 
                        : fieldState.error
                          ? "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-red-500 hover:bg-surface-100"
                          : "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-surface-200 dark:border-slate-700 hover:bg-surface-100"
                      }`}
                  >
                    No
                  </button>
                </div>
                {fieldState.error && (
                  <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />
          
          <div>
            <label className="label">¿Caída de pelo, caspa o lesiones?</label>
            <input {...register("hairLossOrSkinLesions")} className="input" placeholder="Descripción..." />
          </div>
        </div>
      </Section>

      {/* OJOS Y OÍDOS */}
      <Section title="Ojos y oídos">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">¿Secreción ocular?</label>
            <input {...register("eyeDischarge")} className="input" placeholder="Clara, purulenta..." />
          </div>
          <div>
            <label className="label">Oídos: ¿Sacudidas, olor, secreción?</label>
            <input {...register("earIssues")} className="input" placeholder="Descripción..." />
          </div>
        </div>
      </Section>

      {/* ESTADO GENERAL */}
      <Section title="Estado general">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* feverSigns con Controller */}
          <Controller
            name="feverSigns"
            control={control}
            rules={{ validate: (value) => value !== undefined || "Seleccione una opción" }}
            render={({ field, fieldState }) => (
              <div>
                <label className="label">¿Ha notado signos de fiebre? *</label>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => field.onChange(true)}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all
                      ${field.value === true 
                        ? "bg-biovet-500 text-white border border-biovet-600 shadow-sm" 
                        : fieldState.error
                          ? "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-red-500 hover:bg-surface-100"
                          : "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-surface-200 dark:border-slate-700 hover:bg-surface-100"
                      }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange(false)}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all
                      ${field.value === false 
                        ? "bg-biovet-500 text-white border border-biovet-600 shadow-sm" 
                        : fieldState.error
                          ? "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-red-500 hover:bg-surface-100"
                          : "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-surface-200 dark:border-slate-700 hover:bg-surface-100"
                      }`}
                  >
                    No
                  </button>
                </div>
                {fieldState.error && (
                  <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />
          
          {/* lethargyOrWeakness con Controller */}
          <Controller
            name="lethargyOrWeakness"
            control={control}
            rules={{ validate: (value) => value !== undefined || "Seleccione una opción" }}
            render={({ field, fieldState }) => (
              <div>
                <label className="label">¿Letargo, debilidad o falta de energía? *</label>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => field.onChange(true)}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all
                      ${field.value === true 
                        ? "bg-biovet-500 text-white border border-biovet-600 shadow-sm" 
                        : fieldState.error
                          ? "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-red-500 hover:bg-surface-100"
                          : "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-surface-200 dark:border-slate-700 hover:bg-surface-100"
                      }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange(false)}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all
                      ${field.value === false 
                        ? "bg-biovet-500 text-white border border-biovet-600 shadow-sm" 
                        : fieldState.error
                          ? "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-red-500 hover:bg-surface-100"
                          : "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-surface-200 dark:border-slate-700 hover:bg-surface-100"
                      }`}
                  >
                    No
                  </button>
                </div>
                {fieldState.error && (
                  <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </Section>

      {/* TRATAMIENTO ACTUAL */}
      <Section title="Tratamiento actual">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">¿Está bajo algún tratamiento?</label>
            <input {...register("currentTreatment")} className="input" placeholder="Descripción..." />
          </div>
          <div>
            <label className="label">¿Toma medicamentos?</label>
            <input {...register("medications")} className="input" placeholder="Nombre, dosis..." />
          </div>
        </div>
      </Section>

      {/* HISTORIAL MÉDICO */}
      <Section title="Historial médico">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">¿Enfermedades previas?</label>
            <input {...register("previousIllnesses")} className="input" placeholder="Alergias, diabetes..." />
          </div>
          <div>
            <label className="label">¿Cirugías anteriores?</label>
            <input {...register("previousSurgeries")} className="input" placeholder="Descripción..." />
          </div>
        </div>
      </Section>

      {/* OBSERVACIONES */}
      <Section title="Observaciones generales">
        <div>
          <label className="label">Alergias, reacciones adversas y observaciones</label>
          <textarea
            {...register("adverseReactions")}
            className="input min-h-20"
            placeholder="Reacciones a medicamentos, alergias..."
            rows={3}
          />
        </div>
      </Section>
    </div>
  );
}