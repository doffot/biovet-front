// src/views/inventory/components/ProductPagination.tsx

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function ProductPagination({
  currentPage,
  totalPages,
  startIndex,
  itemsPerPage,
  totalItems,
  onPageChange,
}: ProductPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="shrink-0 px-4 py-3 bg-surface-50 dark:bg-dark-200 border-t border-surface-300 dark:border-slate-700 flex items-center justify-between">
      <p className="text-[11px] text-surface-500 dark:text-slate-400 font-medium">
        {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} de{" "}
        {totalItems}
      </p>
      <div className="flex gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-surface-100 dark:hover:bg-dark-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          Anterior
        </button>

        <div className="flex items-center gap-1">
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-biovet-500 text-white shadow-sm"
                      : "border border-surface-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-biovet-400"
                  }`}
                >
                  {page}
                </button>
              );
            }
            if (page === currentPage - 2 || page === currentPage + 2) {
              return (
                <span
                  key={page}
                  className="text-surface-400 dark:text-slate-500 px-1 text-xs"
                >
                  ...
                </span>
              );
            }
            return null;
          })}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-surface-100 dark:hover:bg-dark-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}