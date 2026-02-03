// src/components/owners/detail/tabs/GeneralTab.tsx
import { User, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import type { Owner } from '@/types/owner';
import { formatCurrency } from '@/utils/ownerHelpers';

interface GeneralTabProps {
  owner?: Owner;
}

export function GeneralTab({ owner }: GeneralTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
      {/* Información Personal */}
      <div className="bg-white dark:bg-dark-200 p-5 sm:p-6 lg:p-8 border border-surface-200 dark:border-slate-800 rounded-xl sm:rounded-2xl">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
          <User size={18} className="text-biovet-500 sm:w-5 sm:h-5" /> 
          Información Personal
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <InfoRow label="Nombre Completo" value={owner?.name} />
          <InfoRow label="Teléfono" value={owner?.contact} icon={<Phone size={12} className="sm:w-3.5 sm:h-3.5" />} />
          <InfoRow label="Email" value={owner?.email} icon={<Mail size={12} className="sm:w-3.5 sm:h-3.5" />} />
          <InfoRow label="Dirección" value={owner?.address} icon={<MapPin size={12} className="sm:w-3.5 sm:h-3.5" />} />
          <InfoRow label="ID Nacional" value={owner?.nationalId} />
        </div>
      </div>

      {/* Balance de Cuenta */}
      <div className="bg-white dark:bg-dark-200 p-5 sm:p-6 lg:p-8 border border-surface-200 dark:border-slate-800 rounded-xl sm:rounded-2xl">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
          <CreditCard size={18} className="text-biovet-500 sm:w-5 sm:h-5" /> 
          Balance de Cuenta
        </h3>
        <div className={`p-4 sm:p-6 rounded-lg sm:rounded-xl ${
          (owner?.creditBalance || 0) > 0 ? 'bg-success-50 dark:bg-success-950/20' 
          : (owner?.creditBalance || 0) < 0 ? 'bg-danger-50 dark:bg-danger-950/20'
          : 'bg-slate-50 dark:bg-slate-800/30'
        }`}>
          <p className="text-xs sm:text-sm text-slate-500 mb-1">Crédito a Favor</p>
          <p className={`text-2xl sm:text-3xl font-black ${
            (owner?.creditBalance || 0) > 0 ? 'text-success-600 dark:text-success-400' 
            : (owner?.creditBalance || 0) < 0 ? 'text-danger-600 dark:text-danger-400'
            : 'text-slate-500'
          }`}>
            {formatCurrency(owner?.creditBalance || 0)}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2.5 sm:py-3 border-b border-surface-100 dark:border-slate-800 last:border-0">
      <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 sm:gap-2">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </span>
      <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 text-right max-w-[50%] truncate">
        {value || <span className="text-slate-300 dark:text-slate-600">No especificado</span>}
      </span>
    </div>
  );
}