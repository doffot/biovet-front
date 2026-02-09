import { Package, Syringe, Calendar, DollarSign, Clock } from "lucide-react";
import type { VaccinationFormValues } from "./formSchema";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

interface Props {
  register: UseFormRegister<VaccinationFormValues>;
  errors: FieldErrors<VaccinationFormValues>;
  isInternal: boolean;
  vaccineProducts: any[];
  selectedProduct: string;
  vaccineType: string;
  vaccineTypesList: string[];
  isPuppy: boolean;
}

export function VaccinationMainForm({
  register,
  isInternal,
  vaccineProducts,
  selectedProduct,
  vaccineType,
  vaccineTypesList,
  isPuppy,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Selector de producto */}
      {isInternal && (
        <div className="bg-biovet-50 dark:bg-biovet-950/30 border border-biovet-200 dark:border-biovet-800 rounded-xl p-3 sm:p-4">
          <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-biovet-700 dark:text-biovet-300 mb-2">
            <Package className="w-4 h-4" />
            Producto del inventario <span className="text-danger-500">*</span>
          </label>
          <select {...register("productId")} className="input text-sm">
            <option value="">-- Seleccionar producto --</option>
            {vaccineProducts.map((p) => (
              <option key={p._id} value={p._id}>{p.name} — ${p.salePrice}</option>
            ))}
          </select>
        </div>
      )}

      {/* Tipo */}
      <div>
        <label className="label text-xs sm:text-sm"><Syringe className="w-3.5 h-3.5 inline mr-1.5" />Tipo de Vacuna <span className="text-danger-500">*</span></label>
        <select {...register("vaccineType")} className="input text-sm">
          <option value="">-- Seleccionar tipo --</option>
          {vaccineTypesList.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Otra */}
      {vaccineType === "Otra" && (
        <div>
          <label className="label text-xs sm:text-sm">Especificar vacuna <span className="text-danger-500">*</span></label>
          <input type="text" {...register("customVaccineName")} placeholder="Nombre" className="input text-sm" />
        </div>
      )}

      {/* Fecha/Costo */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="label text-xs sm:text-sm"><Calendar className="w-3.5 h-3.5 inline mr-1.5" />Fecha <span className="text-danger-500">*</span></label>
          <input type="date" {...register("vaccinationDate")} max={new Date().toISOString().split("T")[0]} className="input text-sm" />
        </div>
        <div>
          <label className="label text-xs sm:text-sm"><DollarSign className="w-3.5 h-3.5 inline mr-1.5" />Costo {isInternal && <span className="text-danger-500">*</span>}</label>
          <input type="number" {...register("cost", { valueAsNumber: true })} min="0" step="0.01" className="input text-sm" readOnly={isInternal && !!selectedProduct} />
        </div>
      </div>

      {/* Proxima */}
      <div>
        <label className="label text-xs sm:text-sm"><Clock className="w-3.5 h-3.5 inline mr-1.5" />Próxima Dosis {isInternal && <span className="text-danger-500">*</span>} {!isInternal && <span className="text-slate-400 text-xs">(Auto: {isPuppy ? "+21d" : "+1y"})</span>}</label>
        <input type="date" {...register("nextVaccinationDate")} min={new Date().toISOString().split("T")[0]} className="input text-sm" readOnly={!isInternal} />
      </div>
    </div>
  );
}