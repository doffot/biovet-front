// src/components/owners/detail/OwnerSidebar.tsx
import { Mail, Phone, MoreHorizontal, Clock, X } from 'lucide-react';
import { OwnerBalanceCards } from './OwnerBalanceCards';
import { OwnerTimeline } from './OwnerTimeline';
import type { Owner } from '@/types/owner';
import type { TimelineItem, DebtInfo,  } from '@/utils/ownerHelpers';

interface OwnerSidebarProps {
  owner: Owner | undefined;
  creditBalance: number;
  debtInfo: DebtInfo;
  timelineItems: TimelineItem[];
  isLoadingTimeline: boolean;
  onViewAllTransactions: () => void;
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
  isMobileOpen = false,
  onMobileClose
}: OwnerSidebarProps) {
  const initials = owner?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

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
        <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
          <button 
            className="btn-icon-primary w-9 h-9 sm:w-10 sm:h-10"
            onClick={() => owner?.email && window.open(`mailto:${owner.email}`)}
            disabled={!owner?.email}
            title={owner?.email || 'Sin email'}
          >
            <Mail size={16} className="sm:w-4.5 sm:h-4.5" />
          </button>
          <button 
            className="btn-icon-primary bg-success-600 border-success-700 w-9 h-9 sm:w-10 sm:h-10"
            onClick={() => owner?.contact && window.open(`tel:${owner.contact}`)}
            title={owner?.contact}
          >
            <Phone size={16} className="sm:w-4.5 sm:h-4.5" />
          </button>
          <button className="btn-icon-neutral w-9 h-9 sm:w-10 sm:h-10">
            <MoreHorizontal size={16} className="sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </div>

      {/* Balance y Deuda */}
      <OwnerBalanceCards creditBalance={creditBalance} debtInfo={debtInfo} />

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