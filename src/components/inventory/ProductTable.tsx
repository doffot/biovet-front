// src/views/inventory/components/ProductTable.tsx


import type { ProductWithInventory } from "@/types/inventory";
import { ProductRow } from "./ProductRow";

const HEADERS = [
  { label: "Producto", align: "text-left" },
  { label: "Categoría", align: "text-left", hidden: "hidden sm:table-cell" },
  { label: "Precio", align: "text-left", hidden: "hidden md:table-cell" },
  { label: "Stock", align: "text-center" },
  { label: "Estado", align: "text-center", hidden: "hidden lg:table-cell" },
  { label: "Acciones", align: "text-center" },
];

interface ProductTableProps {
  products: ProductWithInventory[];
  onEdit: (product: ProductWithInventory) => void;
  onDelete: (product: ProductWithInventory) => void;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
}: ProductTableProps) {
  return (
    <div className="hidden lg:block flex-1 overflow-auto custom-scrollbar relative">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700 z-10">
          <tr>
            {HEADERS.map((h) => (
              <th
                key={h.label}
                className={`px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider ${h.align} ${h.hidden || ""}`}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200 dark:divide-slate-700/50">
          {products.map((product) => (
            <ProductRow
              key={product._id}
              product={product}
              onEdit={() => onEdit(product)}
              onDelete={() => onDelete(product)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}