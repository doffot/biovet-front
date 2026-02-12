import { CreditCard, DollarSign, FileText, Settings, Globe } from "lucide-react";
import type { PaymentMethodFormData } from "@/types/payment";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

interface Props {
  register: UseFormRegister<PaymentMethodFormData>;
  errors: FieldErrors<PaymentMethodFormData>;
}

export default function PaymentMethodForm({ register, errors }: Props) {
  return (
    <div className="space-y-6">
      
      {/* Sección 1: Datos Básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        
        {/* Nombre */}
        <div>
          <label className="label flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-biovet-500" />
            Nombre del Método <span className="text-danger-500">*</span>
          </label>
          <input
            {...register("name", { required: "Requerido" })}
            className={`input ${errors.name ? "input-error" : ""}`}
            placeholder="Ej: Zelle, Pago Móvil, Efectivo USD"
          />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        {/* Moneda */}
        <div>
          <label className="label flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            Moneda <span className="text-danger-500">*</span>
          </label>
          <select
            {...register("currency", { required: "Requerido" })}
            className={`input ${errors.currency ? "input-error" : ""}`}
          >
            <option value="">Seleccionar...</option>
            <option value="USD">Dólares (USD)</option>
            <option value="Bs">Bolívares (Bs)</option>
          </select>
          {errors.currency && <p className="error-text">{errors.currency.message}</p>}
        </div>

        {/* Modo de Pago */}
        <div>
          <label className="label flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            Modo / Tipo <span className="text-danger-500">*</span>
          </label>
          <select
            {...register("paymentMode", { required: "Requerido" })}
            className={`input ${errors.paymentMode ? "input-error" : ""}`}
          >
            <option value="">Seleccionar...</option>
            <option value="Transferencia">Transferencia Bancaria</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Zelle">Zelle</option>
            <option value="Pago Móvil">Pago Móvil</option>
            <option value="Tarjeta">Tarjeta de Débito/Crédito</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.paymentMode && <p className="error-text">{errors.paymentMode.message}</p>}
        </div>

        {/* Requiere Referencia */}
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-surface-200 dark:border-dark-50 rounded-xl w-full hover:bg-surface-50 dark:hover:bg-dark-100 transition-colors">
            <input 
              type="checkbox" 
              {...register("requiresReference")} 
              className="w-5 h-5 text-biovet-500 rounded focus:ring-biovet-500 border-gray-300"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 select-none">
              Requiere Nro. de Referencia
            </span>
          </label>
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="label flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          Descripción / Datos de Pago <span className="text-slate-400 text-[10px] ml-1">(Opcional)</span>
        </label>
        <textarea
          rows={3}
          {...register("description")}
          className="input resize-none py-2"
          placeholder="Ej: Banco Mercantil, Cuenta: 0105..., Titular: ..."
        />
        <p className="text-[10px] text-slate-400 mt-1">
          Esta información aparecerá al momento de registrar un cobro.
        </p>
      </div>

      {/* Configuración Avanzada (Visual) */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl flex gap-3 items-start">
        <Settings className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase mb-1">Configuración</h4>
          <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
            Los métodos de pago activos aparecerán en la lista desplegable al momento de facturar. Puedes desactivarlos o eliminarlos si ya no los usas.
          </p>
        </div>
      </div>
    </div>
  );
}