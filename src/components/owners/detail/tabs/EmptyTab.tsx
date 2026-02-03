// src/components/owners/detail/tabs/EmptyTab.tsx
import { FileText } from 'lucide-react';

interface EmptyTabProps {
  tabName: string;
}

export function EmptyTab({ tabName }: EmptyTabProps) {
  return (
    <div className="bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
      <FileText size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3 sm:mb-4 sm:w-12 sm:h-12" />
      <h3 className="text-base sm:text-lg font-bold text-slate-600 dark:text-slate-300 mb-2 capitalize">
        {tabName}
      </h3>
      <p className="text-xs sm:text-sm text-slate-400">
        Esta sección estará disponible próximamente
      </p>
    </div>
  );
}