// src/components/owners/detail/OwnerSidebar.tsx
import { Mail, Phone, MessageCircle, Trash2, Clock, X } from 'lucide-react';
import { OwnerTimeline } from './OwnerTimeline';
import type { Owner } from '@/types/owner';
import type { TimelineItem, DebtInfo } from '@/utils/ownerHelpers';

interface OwnerSidebarProps {
  owner: Owner | undefined;
  creditBalance: number;
  debtInfo: DebtInfo;
  timelineItems: TimelineItem[];
  isLoadingTimeline: boolean;
  onViewAllTransactions: () => void;
  onDelete: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function OwnerSidebar({ 
  owner, 
  creditBalance, 
  debtInfo, 
  timelineItems, 
  isLoadingTimeline,
  onViewAllTransactions,
  onDelete,
  isMobileOpen = false,
  onMobileClose
}: OwnerSidebarProps) {
  const initials = owner?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  // Abrir WhatsApp con mensaje predeterminado
  const handleWhatsApp = () => {
    if (!owner?.contact) return;
    const phone = owner.contact.replace(/\D/g, '');
    const message = encodeURIComponent(
      `¡Hola ${owner.name}! 👋\n\nLe escribimos desde BioVet Track para...`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  // Abrir cliente de correo
  const handleEmail = () => {
    if (!owner?.email) return;
    const subject = encodeURIComponent(`Información importante - BioVet Track`);
    const body = encodeURIComponent(
      `Estimado/a ${owner.name},\n\nEsperamos que se encuentre bien.\n\n[Escriba su mensaje aquí]\n\nSaludos cordiales,\nBioVet Track`
    );
    window.open(`mailto:${owner.email}?subject=${subject}&body=${body}`, '_blank');
  };

  // Llamar por teléfono
  const handleCall = () => {
    if (!owner?.contact) return;
    window.open(`tel:${owner.contact}`, '_self');
  };

  const sidebarContent = (
    <>
      {/* Header móvil con botón cerrar */}
      {onMobileClose && (
        <div className="flex items-center justify-between p-4 border-b border-surface-100 dark:border-slate-800 md:hidden">
          <span className="font-bold text-slate-800 dark:text-white">Perfil</span>
          <button 
            onClick={onMobileClose}
            className="p-2 hover:bg-surface-100 dark:hover:bg-dark-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>
      )}

      {/* Avatar e Info */}
      <div className="p-4 sm:p-6 flex flex-col items-center border-b border-surface-100 dark:border-slate-800/50">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-biovet-500 text-white rounded-full mb-2 sm:mb-3 flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg">
          {initials}
        </div>
        <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 text-center">
          {owner?.name}
        </h1>
        {owner?.nationalId && (
          <p className="text-[10px] sm:text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
            ID: {owner.nationalId}
          </p>
        )}
        
        {/* Botones de acción */}
        <div className="flex gap-2 mt-3">
          {/* WhatsApp */}
          <button 
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleWhatsApp}
            disabled={!owner?.contact}
            title="Enviar WhatsApp"
          >
            <MessageCircle size={16} />
          </button>

          {/* Email */}
          <button 
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-biovet-50 dark:bg-biovet-900/20 text-biovet-600 dark:text-biovet-400 flex items-center justify-center hover:bg-biovet-100 dark:hover:bg-biovet-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleEmail}
            disabled={!owner?.email}
            title={owner?.email || 'Sin email registrado'}
          >
            <Mail size={16} />
          </button>

          {/* Llamar */}
          <button 
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCall}
            disabled={!owner?.contact}
            title={owner?.contact || 'Sin teléfono'}
          >
            <Phone size={16} />
          </button>

          {/* Eliminar */}
          <button 
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-danger-50 dark:bg-danger-900/20 text-danger-500 dark:text-danger-400 flex items-center justify-center hover:bg-danger-100 dark:hover:bg-danger-900/40 transition-colors"
            onClick={onDelete}
            title="Eliminar propietario"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Balance y Deuda */}
      <div className="p-3 sm:p-4 border-b border-surface-100 dark:border-slate-800">
        <div className="flex gap-2 sm:gap-3">
          {/* Card de Crédito */}
          <div className="flex-1 p-3 bg-linear-to-r from-success-50 to-success-100/50 dark:from-success-950/20 dark:to-success-900/20 rounded-lg border border-success-200/50 dark:border-success-800/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] sm:text-[10px] font-medium text-success-700 dark:text-success-400 uppercase tracking-wider mb-0.5">
                  Crédito
                </p>
                <p className="text-sm sm:text-base font-bold text-success-800 dark:text-success-300">
                  ${creditBalance.toFixed(2)}
                </p>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-success-500/10 dark:bg-success-500/20 flex items-center justify-center">
                <span className="text-success-600 dark:text-success-400 text-xs sm:text-sm">+</span>
              </div>
            </div>
          </div>

          {/* Card de Deuda */}
          <div className="flex-1 p-3 bg-linear-to-r from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/20 rounded-lg border border-red-200/50 dark:border-red-800/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] sm:text-[10px] font-medium text-red-700 dark:text-red-400 uppercase tracking-wider mb-0.5">
                  Deuda
                </p>
                <p className="text-sm sm:text-base font-bold text-red-800 dark:text-red-300">
                  ${debtInfo.totalDebt.toFixed(2)}
                </p>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 text-[10px] sm:text-xs font-bold">
                  {debtInfo.pendingCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Header */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-surface-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-[10px] sm:text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
          <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
          Actividad
        </h3>
        <span className="text-[9px] sm:text-[10px] font-bold text-biovet-500 bg-biovet-50 dark:bg-biovet-950/30 px-1.5 sm:px-2 py-0.5 rounded-full">
          {timelineItems.length}
        </span>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <OwnerTimeline 
          items={timelineItems} 
          isLoading={isLoadingTimeline}
          onViewAll={onViewAllTransactions}
        />
      </div>
    </>
  );

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-80 lg:w-96 bg-white dark:bg-dark-200 border-r border-surface-200 dark:border-slate-800 flex-col shadow-sm">
        {sidebarContent}
      </aside>

      {/* Sidebar Mobile - Overlay */}
      {isMobileOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onMobileClose}
          />
          <aside className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white dark:bg-dark-200 z-50 flex flex-col shadow-xl md:hidden animate-slide-in-left">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}