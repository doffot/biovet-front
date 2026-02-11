import { Pill, Plus, Trash2, Calendar, FileText, StickyNote } from "lucide-react";
import type { RecipeFormData } from "@/types/recipe";
import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";

interface Props {
  register: UseFormRegister<RecipeFormData>;
  control: Control<RecipeFormData>;
  errors: FieldErrors<RecipeFormData>;
}

export default function RecipeForm({ register, control, errors }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "medications",
  });

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
            {errors.issueDate && <p className="error-text">{errors.issueDate.message}</p>}
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: MEDICAMENTOS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-surface-200 dark:border-dark-100 pb-2">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Pill size={16} /> Medicamentos
          </h3>
          <button
            type="button"
            onClick={() => append({ name: "", presentation: "", source: "farmacia", instructions: "", quantity: "" })}
            className="text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus size={14} /> Agregar Medicamento
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="relative bg-surface-50 dark:bg-dark-100 p-4 rounded-xl border border-surface-200 dark:border-dark-50 group">
              <div className="absolute top-2 right-2">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Eliminar medicamento"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                <div>
                  <label className="label text-[10px]">Nombre Comercial / Genérico <span className="text-danger-500">*</span></label>
                  <input
                    {...register(`medications.${index}.name`, { required: "Requerido" })}
                    className="input h-9 text-sm"
                    placeholder="Ej: Amoxicilina 500mg"
                  />
                </div>
                <div>
                  <label className="label text-[10px]">Presentación <span className="text-danger-500">*</span></label>
                  <input
                    {...register(`medications.${index}.presentation`, { required: "Requerido" })}
                    className="input h-9 text-sm"
                    placeholder="Ej: Jarabe, Tabletas"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="label text-[10px]">Origen <span className="text-danger-500">*</span></label>
                  <select
                    {...register(`medications.${index}.source`, { required: "Requerido" })}
                    className="input h-9 text-sm"
                  >
                    <option value="farmacia">Farmacia Externa</option>
                    <option value="veterinario">Venta Veterinaria</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label text-[10px]">Cantidad a Dispensar</label>
                  <input
                    {...register(`medications.${index}.quantity`)}
                    className="input h-9 text-sm"
                    placeholder="Ej: 1 frasco, 10 tabletas"
                  />
                </div>
              </div>

              <div>
                <label className="label text-[10px]">Indicaciones / Modo de Uso <span className="text-danger-500">*</span></label>
                <textarea
                  {...register(`medications.${index}.instructions`, { required: "Requerido" })}
                  rows={2}
                  className="input resize-none py-2 text-sm"
                  placeholder="Ej: Dar 5ml cada 12 horas por 7 días..."
                />
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-surface-200 dark:border-dark-50 rounded-xl">
              <Pill className="w-8 h-8 mx-auto text-slate-300 mb-2 opacity-50" />
              <p className="text-xs text-slate-400">No hay medicamentos agregados a la receta.</p>
            </div>
          )}
          {errors.medications && <p className="error-text text-center">{errors.medications.message}</p>}
        </div>
      </div>

      {/* SECCIÓN 3: NOTAS */}
      <div>
        <label className="label flex items-center gap-1.5">
          <StickyNote className="w-3.5 h-3.5 text-amber-500" />
          Notas Adicionales <span className="text-slate-400 text-[10px] ml-1">(Opcional)</span>
        </label>
        <textarea
          rows={3}
          {...register("notes")}
          className="input resize-none py-2"
          placeholder="Recomendaciones generales, dieta, cuidados..."
        />
      </div>
    </div>
  );
}