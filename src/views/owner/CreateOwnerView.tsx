// src/views/owners/CreateOwnerView.tsx
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, User, CreditCard, Phone, Mail, MapPin, AlertCircle, Clock } from "lucide-react";
import { createOwner } from "@/api/OwnerAPI";
import { toast } from "@/components/Toast";
import { useAuth } from "@/hooks/useAuth"; // Importamos useAuth
import type { OwnerFormData } from "@/types/owner";

export type OwnerFormInputs = {
  name: string;
  countryCode: string;
  phone: string;
  email: string;
  address: string;
  nationalId: string;
};

const countryCodes = [
  { code: '+58', country: 'VE', flag: '🇻🇪' },
  { code: '+1', country: 'US/CA', flag: '🇺🇸' },
  { code: '+52', country: 'MX', flag: '🇲🇽' },
  { code: '+34', country: 'ES', flag: '🇪🇸' },
  { code: '+57', country: 'CO', flag: '🇨🇴' },
  { code: '+54', country: 'AR', flag: '🇦🇷' },
  { code: '+56', country: 'CL', flag: '🇨🇱' },
  { code: '+51', country: 'PE', flag: '🇵🇪' },
  { code: '+593', country: 'EC', flag: '🇪🇨' },
  { code: '+591', country: 'BO', flag: '🇧🇴' },
  { code: '+595', country: 'PY', flag: '🇵🇾' },
  { code: '+598', country: 'UY', flag: '🇺🇾' },
  { code: '+55', country: 'BR', flag: '🇧🇷' },
  { code: '+506', country: 'CR', flag: '🇨🇷' },
  { code: '+507', country: 'PA', flag: '🇵🇦' },
  { code: '+502', country: 'GT', flag: '🇬🇹' },
  { code: '+503', country: 'SV', flag: '🇸🇻' },
  { code: '+504', country: 'HN', flag: '🇭🇳' },
  { code: '+505', country: 'NI', flag: '🇳🇮' },
  { code: '+809', country: 'DO', flag: '🇩🇴' },
];

const ErrorMessage = ({ message }: { message?: string }) => (
  <>
    {message && (
      <p className="text-xs text-danger-500 mt-1">{message}</p>
    )}
  </>
);

export default function CreateOwnerView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Obtenemos el estado del plan
  const { plan } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OwnerFormInputs>({
    defaultValues: {
      name: "",
      countryCode: "+58",
      phone: "",
      email: "",
      address: "",
      nationalId: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createOwner,
    onSuccess: (data) => {
      toast.success("¡Creado!", data.msg || "Propietario registrado correctamente");
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      navigate("/owners");
    },
    onError: (error: Error) => {
      toast.error("Error", error.message);
    },
  });

  const handleForm = (formData: OwnerFormInputs) => {
    // VALIDACIÓN DE BLOQUEO
    if (plan.isBlocked) {
      toast.warning("Acceso restringido", plan.blockReason, { persistent: true });
      return;
    }

    const ownerData: OwnerFormData = {
      name: formData.name,
      contact: `${formData.countryCode}${formData.phone}`,
      email: formData.email || null,
      address: formData.address || null,
      nationalId: formData.nationalId || null,
    };
    mutate(ownerData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="btn-icon-neutral">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
            Nuevo Propietario
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Registra un nuevo cliente en el sistema
          </p>
        </div>
      </div>

      {/* BANNER DE BLOQUEO */}
      {plan.isBlocked && (
        <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-xl flex items-center gap-3 text-danger-700 animate-in fade-in slide-in-from-top-4 duration-500">
          {plan.isTimeExpired ? <Clock className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <div>
            <p className="text-sm font-bold">
              {plan.isTimeExpired ? "Periodo de Prueba Expirado" : "Límite Alcanzado"}
            </p>
            <p className="text-xs opacity-90">{plan.blockReason}</p>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit(handleForm)} noValidate>
        <div className={`bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-all ${plan.isBlocked ? 'opacity-60 pointer-events-none grayscale-[0.5]' : ''}`}>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              
              {/* Columna Izquierda - Información Personal */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-surface-200 dark:border-slate-700">
                  <User size={16} className="text-biovet-500" />
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Información Personal
                  </h3>
                </div>

                {/* Nombre */}
                <div>
                  <label htmlFor="name" className="label">
                    Nombre Completo <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-slate-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      placeholder="Juan Pérez García"
                      className={`input pl-9 py-2 ${errors.name ? 'input-error' : ''}`}
                      {...register('name', {
                        required: 'El nombre es obligatorio',
                        minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                      })}
                    />
                  </div>
                  <ErrorMessage message={errors.name?.message} />
                </div>

                {/* Cédula */}
                <div>
                  <label htmlFor="nationalId" className="label">
                    Cédula / ID Nacional
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard size={16} className="text-slate-400" />
                    </div>
                    <input
                      id="nationalId"
                      type="text"
                      placeholder="12345678"
                      className={`input pl-9 py-2 ${errors.nationalId ? 'input-error' : ''}`}
                      {...register('nationalId', {
                        maxLength: { value: 20, message: 'Máximo 20 caracteres' },
                      })}
                    />
                  </div>
                  <ErrorMessage message={errors.nationalId?.message} />
                </div>

                {/* Dirección */}
                <div>
                  <label htmlFor="address" className="label">
                    Dirección
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin size={16} className="text-slate-400" />
                    </div>
                    <input
                      id="address"
                      type="text"
                      placeholder="Av. Principal #123"
                      className={`input pl-9 py-2 ${errors.address ? 'input-error' : ''}`}
                      {...register('address', {
                        maxLength: { value: 200, message: 'Máximo 200 caracteres' },
                      })}
                    />
                  </div>
                  <ErrorMessage message={errors.address?.message} />
                </div>
              </div>

              {/* Columna Derecha - Contacto */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-surface-200 dark:border-slate-700">
                  <Phone size={16} className="text-success-500" />
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Información de Contacto
                  </h3>
                </div>

                {/* WhatsApp */}
                <div>
                  <label htmlFor="phone" className="label">
                    <span className="flex items-center gap-2">
                      WhatsApp <span className="text-danger-500">*</span>
                      <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      className={`input w-24 px-2 py-2 shrink-0 ${errors.countryCode ? 'input-error' : ''}`}
                      {...register('countryCode', { required: 'Requerido' })}
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={16} className="text-slate-400" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="4121234567"
                        className={`input pl-9 py-2 w-full ${errors.phone ? 'input-error' : ''}`}
                        {...register('phone', {
                          required: 'Requerido',
                          minLength: { value: 7, message: 'Mínimo 7 dígitos' },
                          pattern: { value: /^[0-9]+$/, message: 'Solo números' },
                        })}
                      />
                    </div>
                  </div>
                  <ErrorMessage message={errors.countryCode?.message || errors.phone?.message} />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="label">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-slate-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="cliente@email.com"
                      className={`input pl-9 py-2 ${errors.email ? 'input-error' : ''}`}
                      {...register('email', {
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email inválido',
                        },
                      })}
                    />
                  </div>
                  <ErrorMessage message={errors.email?.message} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="px-6 py-4 bg-surface-50 dark:bg-dark-300 border-t border-surface-200 dark:border-slate-700 flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="text-danger-500">*</span> Campos obligatorios
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isPending || plan.isBlocked} 
                className={`btn-primary ${plan.isBlocked ? 'bg-slate-400 cursor-not-allowed shadow-none' : ''}`}
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : plan.isBlocked ? (
                  "Plan Agotado"
                ) : (
                  <>
                    <Save size={18} />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}