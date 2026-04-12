// src/components/pos/POSHeader.tsx
import { ShoppingCart, ArrowLeft } from "lucide-react";

interface POSHeaderProps {
  productCount: number;
  onBack: () => void;
}

export function POSHeader({ productCount, onBack }: POSHeaderProps) {
  return (
   
    <div className="shrink-0 bg-white dark:bg-dark-100 border-b border-surface-300 dark:border-slate-700 shadow-sm">
      <div className="px-3 sm:px-4">
        <div className="flex items-center gap-3 h-12">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-surface-200 dark:hover:bg-dark-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>

          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-linear-to-br from-biovet-500 to-biovet-700 rounded-lg">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                Punto de Venta
              </h1>
              <p className="text-xs text-surface-500 dark:text-slate-400 leading-tight">
                {productCount} productos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}