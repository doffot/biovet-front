// src/components/owners/detail/OwnerTimeline.tsx
import { ClipboardList, PawPrint } from 'lucide-react';
import { 
  formatRelativeDate, 
  formatCurrency, 
  getServiceConfig, 
  getStatusConfig,
  type TimelineItem,
} from '@/utils/ownerHelpers';

interface OwnerTimelineProps {
  items: TimelineItem[];
  isLoading: boolean;
  onViewAll: () => void;
}

export function OwnerTimeline({ items, isLoading, onViewAll }: OwnerTimelineProps) {
  if (isLoading) {
    return <TimelineSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <ClipboardList size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
        <p className="text-sm text-slate-500">Sin actividad</p>
      </div>
    );
  }

  return (
    <div className="relative py-2">
      {/* Línea vertical del timeline */}
      <div className="absolute left-6 sm:left-7 top-0 bottom-0 w-px bg-surface-200 dark:bg-slate-800" />
      
      {items.slice(0, 15).map((item) => {
        const config = getServiceConfig(item.type);
        const statusConfig = getStatusConfig(item.status);
        const Icon = config.icon;
        
        return (
          <div 
            key={item.id} 
            className="relative px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-surface-50 dark:hover:bg-dark-100 transition-colors group"
          >
            <div className={`absolute left-3 sm:left-4 w-5 h-5 sm:w-6 sm:h-6 rounded-full ${config.bgColor} flex items-center justify-center z-10 ring-2 ring-white dark:ring-dark-200`}>
              <Icon size={10} className={config.color} />
            </div>
            
            <div className="ml-8 sm:ml-10">
              <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                <span className={`text-[9px] sm:text-[10px] font-bold uppercase ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-400">
                  {formatRelativeDate(item.date)}
                </span>
              </div>
              
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-1 group-hover:text-biovet-500 transition-colors">
                {item.description}
              </p>
              
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] sm:text-[10px] text-slate-400 flex items-center gap-1">
                  <PawPrint size={8} className="sm:w-2.5 sm:h-2.5" /> 
                  <span className="truncate max-w-20 sm:max-w-none">{item.patientName}</span>
                </span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className={`text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded ${statusConfig.bgColor} ${statusConfig.color}`}>
                    {item.status}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
                    {formatCurrency(item.amount, item.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {items.length > 15 && (
        <button 
          onClick={onViewAll}
          className="w-full py-2 sm:py-3 text-[10px] sm:text-xs font-bold text-biovet-500 hover:text-biovet-600 text-center"
        >
          Ver todo ({items.length})
        </button>
      )}
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-2 sm:gap-3 animate-pulse">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-surface-200 dark:bg-slate-700 rounded-full flex-shrink:0" />
          <div className="flex-1 space-y-1.5 sm:space-y-2">
            <div className="h-2.5 sm:h-3 w-12 sm:w-16 bg-surface-200 dark:bg-slate-700 rounded" />
            <div className="h-3 sm:h-4 w-full bg-surface-100 dark:bg-slate-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}