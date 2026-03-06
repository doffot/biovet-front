// src/components/labexam/quicktest/QuickTestExamTab.tsx
import {
  FlaskConical,
  Calendar,
  Stethoscope,
  Package,
  Percent,
  AlertCircle,
  TestTube2,
} from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { QuickTestFormData } from "@/types/labExam/quickTest";
import type { Product } from "@/types/product";

interface QuickTestExamTabProps {
  register: UseFormRegister<QuickTestFormData>;
  errors: FieldErrors<QuickTestFormData>;
  cost: number;
  discount: number;
  totalCost: number;
  testProducts: Product[];
}

export function QuickTestExamTab({
  register,
  errors,
  cost,
  discount,
  totalCost,
  testProducts,
}: QuickTestExamTabProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-surface-200 dark:border-dark-100">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
          <FlaskConical className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Datos del Examen
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Selecciona el test del inventario
          </p>
        </div>
      </div>

      {/* Producto del inventario */}
      <div className="p-4 bg-cyan-50/50 dark:bg-cyan-950/20 rounded-2xl border border-cyan-100 dark:border-cyan-800 space-y-3">
        <label className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase block items-center gap-2">
          <TestTube2 className="w-4 h-4" />
          Test del Inventario
          <span className="text-danger-500">*</span>
        </label>
        <select
          {...register("productId", { required: "Selecciona un test" })}
          className={`w-full bg-white dark:bg-dark-200 border rounded-xl p-3 text-sm dark:text-white transition-colors ${
            errors.productId
              ? "border-danger-300 dark:border-danger-700"
              : "border-slate-200 dark:border-dark-100"
          }`}
        >
          <option value="">Seleccionar test...</option>
          {testProducts.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} - ${p.salePrice?.toFixed(2)} ({p.stockUnits || 0} en stock)
            </option>
          ))}
        </select>

        {errors.productId && (
          <p className="text-xs text-danger-600 dark:text-danger-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.productId.message}
          </p>
        )}

        {testProducts.length === 0 && (
          <div className="p-3 bg-warning-50 dark:bg-warning-950/30 rounded-lg border border-warning-200 dark:border-warning-800">
            <p className="text-xs text-warning-700 dark:text-warning-400">
              No hay tests en el inventario. Agrega productos con categoría "test".
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fecha */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-500" />
            Fecha
            <span className="text-danger-500">*</span>
          </label>
          <input
            type="date"
            {...register("date", { required: "Requerido" })}
            className={`input ${errors.date ? "input-error" : ""}`}
          />
          {errors.date && (
            <p className="error-text flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.date.message}
            </p>
          )}
        </div>

        {/* Veterinario */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
            Veterinario
          </label>
          <input
            type="text"
            {...register("treatingVet")}
            className="input"
            placeholder="Dr. Nombre"
          />
        </div>

        {/* Cantidad */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <Package className="w-3.5 h-3.5 text-cyan-500" />
            Cantidad
          </label>
          <input
            type="number"
            min="1"
            {...register("quantity", { valueAsNumber: true })}
            className="input"
          />
        </div>

        {/* Descuento */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <Percent className="w-3.5 h-3.5 text-warning-500" />
            Descuento
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register("discount", {
                valueAsNumber: true,
                min: { value: 0, message: "No negativo" },
              })}
              className="input pl-7"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Costo total */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-100 rounded-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            Costo total
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-cyan-600">$</span>
            <span className="text-xl font-black text-cyan-600 dark:text-cyan-400">
              {cost.toFixed(2)}
            </span>
          </div>
          {discount > 0 && (
            <p className="text-[10px] text-success-600 dark:text-success-400 font-medium">
              Total con descuento: ${totalCost.toFixed(2)}
            </p>
          )}
        </div>
        <p className="text-[10px] text-slate-400 italic max-w-50 text-right">
          * Se descontará automáticamente del inventario al guardar.
        </p>
      </div>
    </div>
  );
}