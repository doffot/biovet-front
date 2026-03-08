// src/components/pos/POSProductsPanel.tsx
import { Search, Package } from "lucide-react";
import { POSProductRow } from "./POSProductRow";
import { POSProductCard } from "./POSProductCard";
import type { ProductWithInventory } from "@/types/inventory";

interface POSProductsPanelProps {
  products: ProductWithInventory[];
  searchTerm: string;
  productSaleMode: { [key: string]: boolean };
  onSearchChange: (value: string) => void;
  onAddToCart: (product: ProductWithInventory) => void;
  onSetMode: (productId: string, isFullUnit: boolean) => void;
  isInCart: (productId: string) => boolean;
}

export function POSProductsPanel({
  products,
  searchTerm,
  productSaleMode,
  onSearchChange,
  onAddToCart,
  onSetMode,
  isInCart,
}: POSProductsPanelProps) {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col h-[calc(100vh-180px)] lg:h-[calc(100vh-140px)]">
      {/* Búsqueda - Fixed */}
      <div className="p-3 border-b border-surface-300 dark:border-slate-700 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input pl-9 py-2 text-sm"
          />
        </div>
      </div>

      {/* Contenido con scroll */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {products.length > 0 ? (
          <>
            {/* Desktop Table */}
            <table className="hidden md:table w-full text-sm">
              <thead className="sticky top-0 bg-surface-100 dark:bg-dark-50 border-b border-surface-300 dark:border-slate-700 z-10">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase">
                    Producto
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase">
                    Precio
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase">
                    Stock
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase">
                    Modo
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase w-24">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-slate-700/50">
                {products.map((product) => {
                  if (!product._id) return null;
                  const isFullUnitMode = productSaleMode[product._id] ?? true;

                  return (
                    <POSProductRow
                      key={product._id}
                      product={product}
                      isFullUnitMode={isFullUnitMode}
                      inCart={isInCart(product._id)}
                      onAddToCart={() => onAddToCart(product)}
                      onSetMode={(isFullUnit) => onSetMode(product._id!, isFullUnit)}
                    />
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-surface-200 dark:divide-slate-700/50">
              {products.map((product) => {
                if (!product._id) return null;
                const isFullUnitMode = productSaleMode[product._id] ?? true;

                return (
                  <POSProductCard
                    key={product._id}
                    product={product}
                    isFullUnitMode={isFullUnitMode}
                    inCart={isInCart(product._id)}
                    onAddToCart={() => onAddToCart(product)}
                    onSetMode={(isFullUnit) => onSetMode(product._id!, isFullUnit)}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto text-surface-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-surface-500 dark:text-slate-400">
                {searchTerm ? "Sin resultados" : "Sin productos"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}