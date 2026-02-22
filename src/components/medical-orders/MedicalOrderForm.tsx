// src/components/medicalOrders/MedicalOrderForm.tsx
import {
  ClipboardList,
  Plus,
  Trash2,
  Calendar,
  FileText,
  StickyNote,
  Stethoscope,
  AlertTriangle,
} from "lucide-react";
import type { MedicalOrderFormData } from "@/types/medicalOrder";
import { STUDY_TYPE_LABELS, PRIORITY_LABELS } from "@/types/medicalOrder";
import {
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";

interface Props {
  register: UseFormRegister<MedicalOrderFormData>;
  control: Control<MedicalOrderFormData>;
  errors: FieldErrors<MedicalOrderFormData>;
}

export default function MedicalOrderForm({ register, control, errors }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "studies",
  });

  const selectStyles = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  };

  return (
    <div className="space-y-8">
      {/* SECCIÓN 1: DATOS GENERALES */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-surface-200 dark:border-dark-100 pb-2 flex items-center gap-2">
          <FileText size={16} /> Información General
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Fecha de Emisión <span className="text-danger-500">*</span>
            </label>
            <input
              type="date"
              {...register("issueDate", { required: "Requerido" })}
              className={`input ${errors.issueDate ? "input-error" : ""}`}
            />
            {errors.issueDate && (
              <p className="error-text">{errors.issueDate.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: ESTUDIOS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-surface-200 dark:border-dark-100 pb-2">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Stethoscope size={16} /> Estudios Solicitados
          </h3>
          <button
            type="button"
            onClick={() =>
              append({
                type: "ecografia",
                name: "",
                region: "",
                reason: "",
                priority: "normal",
                instructions: "",
              })
            }
            className="text-xs font-bold text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus size={14} /> Agregar Estudio
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="relative bg-surface-50 dark:bg-dark-100 p-4 rounded-xl border border-surface-200 dark:border-dark-50 group"
            >
              {/* Botón eliminar */}
              <div className="absolute top-2 right-2">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Eliminar estudio"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Fila 1: Tipo y Prioridad */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pr-8">
                <div className="md:col-span-2">
                  <label className="label text-[10px]">
                    Tipo de Estudio <span className="text-danger-500">*</span>
                  </label>
                  <select
                    {...register(`studies.${index}.type`, { required: "Requerido" })}
                    className="input text-sm appearance-none bg-size-[16px_16px] bg-position-[right_12px_center] bg-no-repeat pr-10"
                    style={selectStyles}
                  >
                    {Object.entries(STUDY_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-[10px] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-warning-500" />
                    Prioridad
                  </label>
                  <select
                    {...register(`studies.${index}.priority`)}
                    className="input text-sm appearance-none bg-size-[16px_16px] bg-position-[right_12px_center] bg-no-repeat pr-10"
                    style={selectStyles}
                  >
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fila 2: Nombre y Región */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label text-[10px]">
                    Nombre del Estudio <span className="text-danger-500">*</span>
                  </label>
                  <input
                    {...register(`studies.${index}.name`, { required: "Requerido" })}
                    className="input text-sm"
                    placeholder="Ej: Ecografía abdominal completa"
                  />
                </div>
                <div>
                  <label className="label text-[10px]">
                    Región Anatómica{" "}
                    <span className="text-slate-400 text-[10px]">(Opcional)</span>
                  </label>
                  <input
                    {...register(`studies.${index}.region`)}
                    className="input text-sm"
                    placeholder="Ej: Abdomen, Tórax, MPD"
                  />
                </div>
              </div>

              {/* Fila 3: Motivo */}
              <div className="mb-4">
                <label className="label text-[10px]">
                  Motivo / Indicación Clínica <span className="text-danger-500">*</span>
                </label>
                <textarea
                  {...register(`studies.${index}.reason`, { required: "Requerido" })}
                  rows={2}
                  className="input resize-none py-2 text-sm"
                  placeholder="Ej: Descartar masa abdominal, evaluar hígado y riñones..."
                />
              </div>

              {/* Fila 4: Instrucciones */}
              <div>
                <label className="label text-[10px]">
                  Instrucciones Especiales{" "}
                  <span className="text-slate-400 text-[10px]">(Opcional)</span>
                </label>
                <input
                  {...register(`studies.${index}.instructions`)}
                  className="input text-sm"
                  placeholder="Ej: Ayuno de 12 horas, sedación requerida..."
                />
              </div>
            </div>
          ))}

          {/* Empty state */}
          {fields.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-surface-200 dark:border-dark-50 rounded-xl">
              <ClipboardList className="w-8 h-8 mx-auto text-slate-300 mb-2 opacity-50" />
              <p className="text-xs text-slate-400">
                No hay estudios agregados a la orden.
              </p>
            </div>
          )}

          {/* Error general del array */}
          {errors.studies && (
            <p className="error-text text-center">{errors.studies.message}</p>
          )}
        </div>
      </div>

      {/* SECCIÓN 3: HISTORIA CLÍNICA */}
      <div>
        <label className="label flex items-center gap-1.5">
          <StickyNote className="w-3.5 h-3.5 text-amber-500" />
          Historia Clínica Relevante{" "}
          <span className="text-slate-400 text-[10px] ml-1">(Opcional)</span>
        </label>
        <textarea
          rows={3}
          {...register("clinicalHistory")}
          className="input resize-none py-2"
          placeholder="Antecedentes, síntomas actuales, medicación en curso..."
        />
      </div>
    </div>
  );
}