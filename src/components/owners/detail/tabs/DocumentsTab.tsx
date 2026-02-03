// src/components/owners/detail/tabs/DocumentsTab.tsx
import { FileText, Plus } from 'lucide-react';

export function DocumentsTab() {
  return (
    <div className="bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-800 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-surface-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-50/30 dark:bg-dark-100/30">
        <h3 className="font-bold text-slate-700 dark:text-slate-200">Documentos</h3>
        <button className="btn-primary text-xs sm:text-sm w-full sm:w-auto">
          <Plus size={14} className="sm:w-4 sm:h-4" /> Subir Documento
        </button>
      </div>
      <div className="p-8 sm:p-12 text-center">
        <FileText size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3 sm:mb-4 sm:w-12 sm:h-12" />
        <h3 className="text-base sm:text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">
          Sin documentos
        </h3>
        <p className="text-xs sm:text-sm text-slate-400">
          Los documentos subidos aparecerán aquí
        </p>
      </div>
    </div>
  );
}