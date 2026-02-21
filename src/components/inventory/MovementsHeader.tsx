// src/views/inventory/components/MovementsHeader.tsx

import { ArrowLeft } from "lucide-react";

interface MovementsHeaderProps {
  totalCount: string;
  onBack: () => void;
}

export function MovementsHeader({
  totalCount,
  onBack,
}: MovementsHeaderProps) {
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
              Movimientos
            </h1>
            <p className="text-[13px] text-biovet-500 font-medium">
              {totalCount}
            </p>
          </div>
        </div>
      </div>

      <div className="border border-biovet-200/50 dark:border-biovet-800/30" />
    </>
  );
}