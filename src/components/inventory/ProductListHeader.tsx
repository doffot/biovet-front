// src/views/inventory/components/ProductListHeader.tsx

import { ArrowLeft, Plus } from "lucide-react";

interface ProductListHeaderProps {
  totalCount: string;
  onBack: () => void;
  onNew: () => void;
}

export function ProductListHeader({
  totalCount,
  onBack,
  onNew,
}: ProductListHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="text-surface-400 hover:text-surface-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white leading-tight">
              Productos
            </h1>
            <p className="text-[13px] text-biovet-500 font-medium">
              {totalCount}
            </p>
          </div>
        </div>

        <button
          onClick={onNew}
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-biovet-500 hover:bg-biovet-600 text-white rounded-lg font-bold text-[13px] transition-all shadow-sm cursor-pointer active:scale-[0.98]"
        >
          <div className="p-0.5 border-2 border-white rounded-full">
            <Plus size={12} strokeWidth={3} />
          </div>
          <span className="hidden sm:inline">Nuevo Producto</span>
        </button>
      </div>

      <div className="border border-biovet-200/50 dark:border-biovet-800/30" />
    </>
  );
}