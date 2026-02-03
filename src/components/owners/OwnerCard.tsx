import { Link } from 'react-router-dom';
import { Edit, Trash2, Phone, Mail, Calendar, Check, PawPrint } from 'lucide-react';
import type { OwnerWithStats } from '@/types/owner';

type OwnerCardProps = {
  owner: OwnerWithStats;
  isSelected: boolean;
  onSelectChange: (selected: boolean) => void;
  onDelete: () => void;
  onWhatsApp: () => void;
  onNavigate: () => void;
};

export default function OwnerCard({
  owner,
  isSelected,
  onSelectChange,
  onDelete,
  onWhatsApp,
  onNavigate,
}: OwnerCardProps) {
  
  const formatDate = (date: string | null): string => {
    if (!date) return 'Sin visitas';
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    if (diff < 7) return `Hace ${diff} días`;
    if (diff < 30) return `Hace ${Math.floor(diff / 7)} sem`;
    
    return d.toLocaleDateString('es', { day: '2-digit', month: 'short' });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getLastVisitColor = (date: string | null): string => {
    if (!date) return 'text-slate-400 dark:text-slate-500';
    const d = new Date(date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diff < 7) return 'text-success-600 dark:text-success-400';
    if (diff < 30) return 'text-slate-600 dark:text-slate-300';
    return 'text-slate-400 dark:text-slate-500';
  };

  return (
    <div
      className={`
        p-4 transition-colors cursor-pointer
        ${isSelected ? 'bg-biovet-50/50 dark:bg-biovet-950/30' : 'hover:bg-slate-50 dark:hover:bg-dark-50'}
      `}
      onClick={onNavigate}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectChange(!isSelected);
          }}
          className={`
            mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0
            ${isSelected
              ? 'bg-biovet-500 border-biovet-500 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-biovet-400'
            }
          `}
        >
          {isSelected && <Check size={14} />}
        </button>

        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-biovet-100 dark:bg-biovet-900 flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-biovet-600 dark:text-biovet-300">
            {owner.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {owner.name}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWhatsApp();
                }}
                className="flex items-center gap-1 text-sm text-success-600 dark:text-success-400 hover:underline mt-0.5"
              >
                <Phone size={12} />
                {owner.contact}
              </button>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Link
                to={`/owners/${owner._id}/edit`}
                className="p-2 rounded-lg text-slate-400 hover:text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-950"
              >
                <Edit size={16} />
              </Link>
              <button
                onClick={onDelete}
                className="p-2 rounded-lg text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Detalles */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {owner.email && (
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate max-w-45">
                <Mail size={12} />
                {owner.email}
              </span>
            )}
            
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <PawPrint size={12} />
              {owner.petsCount} mascota{owner.petsCount !== 1 ? 's' : ''}
            </span>
            
            <span className={`flex items-center gap-1 ${getLastVisitColor(owner.lastVisit)}`}>
              <Calendar size={12} />
              {formatDate(owner.lastVisit)}
            </span>
          </div>

          {/* Deuda */}
          {owner.totalDebt > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm font-medium text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-950 px-2 py-0.5 rounded border border-danger-200 dark:border-danger-800">
                Deuda: {formatCurrency(owner.totalDebt)}
              </span>
              {owner.pendingInvoices > 0 && (
                <span className="text-xs text-danger-500">
                  ({owner.pendingInvoices} factura{owner.pendingInvoices !== 1 ? 's' : ''})
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}