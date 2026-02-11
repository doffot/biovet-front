// src/components/payment/PaymentMethodForm.tsx
import React from "react";
import { CreditCard, Wallet, Building, Smartphone, Landmark } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { PaymentMethodFormData } from "../../types/payment";

type PaymentMethodFormProps = {
  register: UseFormRegister<PaymentMethodFormData>;
  errors: FieldErrors<PaymentMethodFormData>;
};

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ 
  register, 
  errors 
}) => {
  // Modalidades de pago
  const paymentModes = [
    { value: "cash", label: "Efectivo", icon: Wallet },
    { value: "card", label: "Tarjeta", icon: CreditCard },
    { value: "bank", label: "Transferencia", icon: Building },
    { value: "mobile", label: "Pago Móvil", icon: Smartphone },
    { value: "digital", label: "Billetera Digital", icon: Landmark },
  ];

  // Monedas de Latinoamérica e internacionales
  const currencies = [
    // Latinoamérica
    { value: "USD", label: "USD - Dólar Estadounidense" },
    { value: "MXN", label: "MXN - Peso Mexicano" },
    { value: "BRL", label: "BRL - Real Brasileño" },
    { value: "ARS", label: "ARS - Peso Argentino" },
    { value: "CLP", label: "CLP - Peso Chileno" },
    { value: "COP", label: "COP - Peso Colombiano" },
    { value: "PEN", label: "PEN - Sol Peruano" },
    { value: "VES", label: "VES - Bolívar Soberano" },
    { value: "GTQ", label: "GTQ - Quetzal Guatemalteco" },
    { value: "DOP", label: "DOP - Peso Dominicano" },
    { value: "CRC", label: "CRC - Colón Costarricense" },
    { value: "PAB", label: "PAB - Balboa Panameño" },
    { value: "PYG", label: "PYG - Guaraní Paraguayo" },
    { value: "UYU", label: "UYU - Peso Uruguayo" },
    { value: "BOB", label: "BOB - Boliviano" },
    { value: "HNL", label: "HNL - Lempira Hondureño" },
    { value: "NIO", label: "NIO - Córdoba Nicaragüense" },
    { value: "SVC", label: "SVC - Colón Salvadoreño" },
    
    // Internacionales
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - Libra Esterlina" },
    { value: "CAD", label: "CAD - Dólar Canadiense" },
    { value: "JPY", label: "JPY - Yen Japonés" },
    { value: "CNY", label: "CNY - Yuan Chino" },
  ];

  return (
    <div className="space-y-4">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del método *
        </label>
        <input
          type="text"
          placeholder="Ej: Pago Móvil, Transferencia Banesco, etc."
          {...register("name")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        {errors.name && (
          <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción (opcional)
        </label>
        <textarea
          placeholder="Breve descripción del método de pago..."
          rows={2}
          {...register("description")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
        />
        {errors.description && (
          <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Modalidad de Pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Modalidad de pago *
        </label>
        <select
          {...register("paymentMode")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">Selecciona una modalidad</option>
          {paymentModes.map((mode) => {
            // const Icon = mode.icon;
            return (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            );
          })}
        </select>
        {errors.paymentMode && (
          <p className="text-red-600 text-xs mt-1">{errors.paymentMode.message}</p>
        )}
      </div>

      {/* Moneda */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Moneda *
        </label>
        <select
          {...register("currency")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">Selecciona una moneda</option>
          {currencies.map((currency) => (
            <option key={currency.value} value={currency.value}>
              {currency.label}
            </option>
          ))}
        </select>
        {errors.currency && (
          <p className="text-red-600 text-xs mt-1">{errors.currency.message}</p>
        )}
      </div>

      {/* Requiere Referencia */}
      <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
        <input
          type="checkbox"
          id="requiresReference"
          {...register("requiresReference")}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="requiresReference" className="text-sm text-gray-700">
          Este método requiere número de referencia
          <p className="text-gray-500 text-xs mt-1">
            Ej: Número de transferencia, referencia de pago móvil, etc.
          </p>
        </label>
      </div>
    </div>
  );
};

export default PaymentMethodForm;