// src/views/sales/components/SalesPagination.tsx

interface SalesPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function SalesPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: SalesPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="shrink-0 px-4 py-3 bg-surface-50 dark:bg-dark-200 border-t border-surface-300 dark:border-slate-700 flex items-center justify-between">
      <p className="text-[11px] text-surface-500 dark:text-slate-400 font-medium">
        Pág. {page}/{totalPages} · {totalItems} ventas
      </p>
      <div className="flex gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-surface-100 dark:hover:bg-dark-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-surface-100 dark:hover:bg-dark-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}