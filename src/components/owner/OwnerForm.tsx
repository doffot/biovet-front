import { User, CreditCard, Phone, Mail, MapPin } from 'lucide-react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

export type OwnerFormInputs = {
  name: string;
  countryCode: string;
  phone: string;
  email: string;
  address: string;
  nationalId: string;
};

type OwnerFormProps = {
  register: UseFormRegister<OwnerFormInputs>;
  errors: FieldErrors<OwnerFormInputs>;
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

// Componente para mensaje de error con altura fija
const ErrorMessage = ({ message }: { message?: string }) => (
  <div className="h-5 mt-1">
    {message && (
      <p className="text-sm text-danger-500 flex items-center gap-1">
        <span className="inline-block w-1 h-1 bg-danger-500 rounded-full"></span>
        {message}
      </p>
    )}
  </div>
);

export default function OwnerForm({ register, errors }: OwnerFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        
        {/* Nombre Completo */}
        <div className="md:col-span-2">
          <label htmlFor="name" className="label">
            Nombre Completo <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-slate-400" />
            </div>
            <input
              id="name"
              type="text"
              placeholder="Ej: Juan Pérez García"
              className={`input pl-10 ${
                errors.name 
                  ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100 dark:focus:ring-danger-900' 
                  : ''
              }`}
              {...register('name', {
                required: 'El nombre es obligatorio',
                minLength: {
                  value: 2,
                  message: 'El nombre debe tener al menos 2 caracteres',
                },
                maxLength: {
                  value: 100,
                  message: 'El nombre es demasiado largo',
                },
              })}
            />
          </div>
          <ErrorMessage message={errors.name?.message} />
        </div>

        {/* Cédula / ID Nacional */}
        <div>
          <label htmlFor="nationalId" className="label">
            Cédula / ID Nacional
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CreditCard size={18} className="text-slate-400" />
            </div>
            <input
              id="nationalId"
              type="text"
              placeholder="Ej: 10317721"
              className={`input pl-10 ${
                errors.nationalId 
                  ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100 dark:focus:ring-danger-900' 
                  : ''
              }`}
              {...register('nationalId', {
                maxLength: {
                  value: 20,
                  message: 'El ID nacional es demasiado largo',
                },
              })}
            />
          </div>
          <ErrorMessage message={errors.nationalId?.message} />
        </div>

        {/* WhatsApp */}
        <div>
          <label htmlFor="phone" className="label">
            <span className="flex items-center gap-2">
              WhatsApp <span className="text-danger-500">*</span>
              <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </span>
          </label>
          <div className="flex gap-2">
            <select
              className={`input w-28 px-2 shrink-0 ${
                errors.countryCode 
                  ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100 dark:focus:ring-danger-900' 
                  : ''
              }`}
              {...register('countryCode', {
                required: 'Requerido',
              })}
            >
              {countryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.code}
                </option>
              ))}
            </select>
            
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-slate-400" />
              </div>
              <input
                id="phone"
                type="tel"
                placeholder="Ej: 4121234567"
                className={`input pl-10 ${
                  errors.phone 
                    ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100 dark:focus:ring-danger-900' 
                    : ''
                }`}
                {...register('phone', {
                  required: 'El número es obligatorio',
                  minLength: {
                    value: 7,
                    message: 'Mínimo 7 dígitos',
                  },
                  maxLength: {
                    value: 15,
                    message: 'Máximo 15 dígitos',
                  },
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'Solo números',
                  },
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
              <Mail size={18} className="text-slate-400" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="Ej: cliente@email.com"
              className={`input pl-10 ${
                errors.email 
                  ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100 dark:focus:ring-danger-900' 
                  : ''
              }`}
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

        {/* Dirección */}
        <div>
          <label htmlFor="address" className="label">
            Dirección
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin size={18} className="text-slate-400" />
            </div>
            <input
              id="address"
              type="text"
              placeholder="Ej: Av. Principal #123, Ciudad"
              className={`input pl-10 ${
                errors.address 
                  ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100 dark:focus:ring-danger-900' 
                  : ''
              }`}
              {...register('address', {
                maxLength: {
                  value: 200,
                  message: 'La dirección es demasiado larga',
                },
              })}
            />
          </div>
          <ErrorMessage message={errors.address?.message} />
        </div>

      </div>
    </div>
  );
}