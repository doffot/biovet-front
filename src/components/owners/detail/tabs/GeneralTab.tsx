// src/components/owners/detail/tabs/GeneralTab.tsx
import { useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Edit3,
} from "lucide-react";
import type { Owner } from "@/types/owner";
import { formatCurrency } from "@/utils/ownerHelpers";
import EditOwnerModal from "../../EditOwnerModal";

interface GeneralTabProps {
  owner?: Owner;
}

export function GeneralTab({ owner }: GeneralTabProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!owner) return null;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Sección Información Detallada */}
        <div className="bg-white dark:bg-dark-200 p-6 sm:p-8 border border-slate-100 dark:border-slate-800 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-biovet-500 flex items-center justify-center text-white">
                <User size={20} />
              </div>
              Información Detallada
            </h3>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="
                w-10 h-10 rounded-full 
                border border-slate-200 dark:border-slate-700 
                flex items-center justify-center 
                text-slate-400 
                hover:bg-biovet-50 dark:hover:bg-biovet-950 
                hover:text-biovet-500 dark:hover:text-biovet-400
                hover:border-biovet-200 dark:hover:border-biovet-800
                transition-all
              "
            >
              <Edit3 size={18} />
            </button>
          </div>

          <div className="space-y-6">
            <DetailRow
              label="Nombre Completo"
              value={owner.name}
              icon={<User size={16} />}
            />
            <DetailRow
              label="Teléfono"
              value={owner.contact}
              icon={<Phone size={16} />}
            />
            <DetailRow
              label="Email"
              value={owner.email}
              icon={<Mail size={16} />}
            />
            <DetailRow
              label="Dirección"
              value={owner.address}
              icon={<MapPin size={16} />}
            />
            <DetailRow
              label="ID Nacional"
              value={owner.nationalId}
              icon={<CreditCard size={16} />}
            />
          </div>
        </div>

        {/* Balance de Cuenta */}
        <div className="bg-white dark:bg-dark-200 p-8 border border-slate-100 dark:border-slate-800 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-biovet-500 flex items-center justify-center text-white">
              <CreditCard size={20} />
            </div>
            Estado de Cuenta
          </h3>

          <div
            className={`p-8 rounded-lg flex flex-col items-center justify-center text-center transition-colors ${
              (owner.creditBalance || 0) >= 0
                ? "bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20"
                : "bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Crédito Disponible
            </p>
            <p
              className={`text-4xl font-black ${
                (owner.creditBalance || 0) >= 0 
                  ? "text-emerald-500" 
                  : "text-rose-500"
              }`}
            >
              {formatCurrency(owner.creditBalance || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      <EditOwnerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        owner={owner}
      />
    </>
  );
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400">
          {icon}
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
            {label}
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {value || "No registrado"}
          </span>
        </div>
      </div>
    </div>
  );
}