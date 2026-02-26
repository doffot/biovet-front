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
      {/* Selector de producto del inventario */}
      {isInternal && (
        <div className="p-4 bg-biovet-50/30 dark:bg-dark-300 rounded-2xl border border-biovet-100 space-y-3">
          <label className="text-[11px] font-bold text-biovet-600 uppercase flex items-center gap-2">
            <Package size={14} /> Producto en Inventario
          </label>
          <select
            {...register("productId")}
            className="w-full bg-white dark:bg-dark-200 border-slate-200 rounded-lg p-2.5 text-sm dark:text-white"
          >
            <option value="">-- Seleccionar producto --</option>
            {vaccineProducts.map((p) => (
              <option key={String(p._id)} value={String(p._id)}>
                {p.name} — ${p.salePrice}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tipo de Vacuna */}
      <div>
        <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-2">
          <Syringe size={14} /> Tipo de Vacuna
        </label>
        <select
          {...register("vaccineType")}
          className="w-full bg-slate-50 dark:bg-dark-300 border-none rounded-xl p-3 text-sm dark:text-white font-medium"
        >
          <option value="">-- Seleccionar tipo --</option>
          {vaccineTypesList.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Input condicional si selecciona "Otra" */}
      {vaccineType === "Otra" && (
        <div className="animate-in fade-in slide-in-from-top-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">
            Nombre de la Vacuna
          </label>
          <input
            type="text"
            {...register("customVaccineName")}
            placeholder="Ej. Parvovirus Refuerzo"
            className="w-full bg-slate-50 dark:bg-dark-300 border-none rounded-xl p-3 text-sm dark:text-white"
          />
        </div>
      )}

      {/* Fecha y Costo (Costo sin valueAsNumber para evitar errores de Vercel) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5  flex items-center gap-2">
            <Calendar size={14} /> Fecha
          </label>
          <input
            type="date"
            {...register("vaccinationDate")}
            className="w-full bg-slate-50 dark:bg-dark-300 border-none rounded-xl p-3 text-sm dark:text-white"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-biovet-600 uppercase mb-1.5  flex items-center gap-2">
            <DollarSign size={14} /> Costo Total
          </label>
          <div
            className={`flex items-center p-3 rounded-xl transition-colors ${isInternal ? "bg-slate-50 dark:bg-dark-300/50" : "bg-orange-50/50"}`}
          >
            <span className="text-slate-400 font-bold mr-1">$</span>
            <input
              type="number"
              {...register("cost")}
              readOnly={isInternal && !!selectedProduct}
              className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 w-full dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Próxima Cita */}
      <div>
        <label className="text-[11px] font-bold text-biovet-600 uppercase mb-1.5  flex items-center gap-2">
          <Clock size={14} /> Próxima Dosis{" "}
          {!isInternal && (
            <span className="text-[9px] lowercase opacity-60">
              (Auto {isPuppy ? "+21d" : "+1y"})
            </span>
          )}
        </label>
        <input
          type="date"
          {...register("nextVaccinationDate")}
          className="w-full bg-biovet-50/50 dark:bg-biovet-900/10 border-biovet-100 rounded-xl p-3 text-sm dark:text-white"
          readOnly={!isInternal}
        />
      </div>
    </div>
  );
}
