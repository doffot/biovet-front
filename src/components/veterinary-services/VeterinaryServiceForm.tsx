
import { Calendar, DollarSign, FileText, BriefcaseMedical, Plus, Trash2, Box } from "lucide-react";
import type { VeterinaryServiceFormData } from "@/types/veterinaryService";
import { useFieldArray, type Control, type FieldErrors, type UseFormRegister, type UseFormWatch } from "react-hook-form";

interface Props {
  register: UseFormRegister<VeterinaryServiceFormData>;
  errors: FieldErrors<VeterinaryServiceFormData>;
  control: Control<VeterinaryServiceFormData>;
  watch: UseFormWatch<VeterinaryServiceFormData>;
}

export default function VeterinaryServiceForm({ register, errors, control, watch }: Props) {
  // Manejo de productos dinámicos
  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  // Cálculos en tiempo real
  const products = watch("products") || [];
  const vetFee = Number(watch("veterinarianFee")) || 0;
  const discount = Number(watch("discount")) || 0;

  const productsTotal = products.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
  const total = productsTotal + vetFee - discount;

  return (
    <div className="space-y-8">
      
      {/* SECCIÓN 1: DATOS GENERALES */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-surface-200 dark:border-dark-100 pb-2">
          Información del Servicio
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre del Servicio */}
          <div>
            <label className="label flex items-center gap-1.5">
              <BriefcaseMedical className="w-3.5 h-3.5 text-biovet-500" />
              Nombre del Servicio <span className="text-danger-500">*</span>
            </label>
            <input
              {...register("serviceName", { required: "Requerido" })}
              className={`input ${errors.serviceName ? "input-error" : ""}`}
              placeholder="Ej: Cirugía Menor, Limpieza Dental..."
            />
            {errors.serviceName && <p className="error-text">{errors.serviceName.message}</p>}
          </div>

          {/* Fecha */}
          <div>
            <label className="label flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Fecha <span className="text-danger-500">*</span>
            </label>
            <input
              type="date"
              {...register("serviceDate", { required: "Requerido" })}
              className={`input ${errors.serviceDate ? "input-error" : ""}`}
            />
            {errors.serviceDate && <p className="error-text">{errors.serviceDate.message}</p>}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="label flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Descripción
          </label>
          <textarea
            {...register("description")}
            rows={2}
            className="input resize-none h-auto py-2"
            placeholder="Detalles breves del procedimiento..."
          />
        </div>
      </div>

      {/* SECCIÓN 2: PRODUCTOS E INSUMOS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-surface-200 dark:border-dark-100 pb-2">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Insumos Utilizados</h3>
          <button
            type="button"
            onClick={() => append({ productName: "", quantity: 1, unitPrice: 0, productId: "", isFullUnit: false })}
            className="text-xs font-bold text-biovet-600 hover:bg-biovet-50 dark:hover:bg-biovet-900/20 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus size={14} /> Agregar Item
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-3 items-start bg-surface-50 dark:bg-dark-100 p-3 rounded-xl border border-surface-200 dark:border-dark-50 relative group">
              
              {/* Nombre Producto */}
              <div className="col-span-5 sm:col-span-5">
                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Producto</label>
                <input
                  {...register(`products.${index}.productName` as const, { required: "Requerido" })}
                  className="input py-1.5 text-xs h-8"
                  placeholder="Nombre del insumo"
                />
              </div>

              {/* Cantidad */}
              <div className="col-span-2 sm:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Cant.</label>
                <input
                  type="number"
                  step="0.1"
                  {...register(`products.${index}.quantity` as const, { valueAsNumber: true })}
                  className="input py-1.5 text-xs h-8 text-center px-1"
                />
              </div>

              {/* Precio Unitario */}
              <div className="col-span-3 sm:col-span-3">
                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Precio U.</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">$</span>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`products.${index}.unitPrice` as const, { valueAsNumber: true })}
                    className="input py-1.5 text-xs h-8 pl-5 pr-1 text-right"
                  />
                </div>
              </div>

              {/* Botón Eliminar */}
              <div className="col-span-2 sm:col-span-2 flex items-end justify-center h-full pb-1">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-surface-200 dark:border-dark-50 rounded-xl">
              <Box className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs text-slate-400">No hay insumos registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 3: COSTOS */}
      <div className="bg-surface-50 dark:bg-dark-100 p-5 rounded-2xl border border-surface-200 dark:border-dark-50 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
          <DollarSign size={14} /> Resumen de Costos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Honorarios Veterinarios</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                {...register("veterinarianFee", { valueAsNumber: true, min: 0 })}
                className="input pl-7 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="label">Descuento</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                {...register("discount", { valueAsNumber: true, min: 0 })}
                className="input pl-7 text-emerald-600"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-dark-200 p-3 rounded-xl border border-surface-200 dark:border-dark-50 flex flex-col justify-center items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Estimado</span>
            <span className="text-xl font-bold text-slate-800 dark:text-white">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="label">Notas Adicionales <span className="text-slate-400 text-[10px] ml-1">(Opcional)</span></label>
        <textarea
          rows={2}
          {...register("notes")}
          className="input resize-none h-auto py-2"
          placeholder="Observaciones internas..."
        />
      </div>
    </div>
  );
}