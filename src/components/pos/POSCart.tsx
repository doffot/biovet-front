// src/components/pos/POSCart.tsx
import {
  ShoppingCart,
  CreditCard,
  FileText,
  User,
} from "lucide-react";
import { OwnerSelector } from "@/components/owners/OwnerSelector";
import { POSCartItem } from "./POSCartItem";
import type { CartItem } from "@/types/sale";
import type { SelectedClient } from "@/hooks/useSaleForm";

interface POSCartProps {
  cart: CartItem[];
  cartTotals: { subtotal: number; itemDiscounts: number; total: number };
  selectedOwner: SelectedClient;
  ownerError: string;
  isProcessing: boolean;
  onSelectOwner: (owner: SelectedClient) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onToggleUnitMode: (productId: string) => void;
  onRemoveFromCart: (productId: string) => void;
  onCreditClick: () => void;
  onCheckout: () => void;
}

export function POSCart({
  cart,
  cartTotals,
  selectedOwner,
  ownerError,
  isProcessing,
  onSelectOwner,
  onUpdateQuantity,
  onToggleUnitMode,
  onRemoveFromCart,
  onCreditClick,
  onCheckout,
}: POSCartProps) {
  return (
    <div className="lg:col-span-1 bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col h-[calc(100vh-180px)] lg:h-[calc(100vh-140px)]">
      {/* Header - Fixed */}
      <div className="p-3 border-b border-surface-300 dark:border-slate-700 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-biovet-500" />
            Carrito
          </h2>
          <span className="text-xs px-2 py-0.5 bg-biovet-500/10 text-biovet-600 dark:text-biovet-400 rounded-full font-medium">
            {cart.length}
          </span>
        </div>

        <OwnerSelector
          selectedOwner={
            selectedOwner
              ? {
                  id: selectedOwner.id,
                  name: selectedOwner.name,
                  phone: selectedOwner.phone,
                }
              : null
          }
          onSelectOwner={(owner) =>
            onSelectOwner(
              owner
                ? {
                    id: owner.id,
                    name: owner.name,
                    phone: owner.phone,
                    creditBalance: 0,
                  }
                : null
            )
          }
          required
          error={ownerError}
        />
      </div>

      {/* Items - Scrollable */}
      <div className="flex-1 overflow-auto p-2 space-y-1.5 custom-scrollbar">
        {cart.length > 0 ? (
          cart.map((item) => (
            <POSCartItem
              key={item.productId}
              item={item}
              onUpdateQuantity={(qty) => onUpdateQuantity(item.productId, qty)}
              onToggleUnitMode={() => onToggleUnitMode(item.productId)}
              onRemove={() => onRemoveFromCart(item.productId)}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center py-8">
              <ShoppingCart className="w-10 h-10 mx-auto text-surface-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-surface-500 dark:text-slate-400">
                Carrito vacío
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Fixed */}
      <div className="p-3 border-t border-surface-300 dark:border-slate-700 bg-surface-50 dark:bg-dark-200 shrink-0 space-y-2">
        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-surface-500 dark:text-slate-400">
            Total:
          </span>
          <span className="text-2xl font-bold text-success-600 dark:text-success-400">
            ${cartTotals.total.toFixed(2)}
          </span>
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-2">
          {/* Crédito */}
          <button
            onClick={onCreditClick}
            disabled={!selectedOwner || cart.length === 0 || isProcessing}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
              !selectedOwner || cart.length === 0 || isProcessing
                ? "bg-surface-100 dark:bg-dark-100 border-surface-300 dark:border-slate-700 text-surface-400 cursor-not-allowed"
                : "bg-warning-50 dark:bg-warning-950/30 border-warning-300 dark:border-warning-800 text-warning-700 dark:text-warning-400 hover:bg-warning-100 dark:hover:bg-warning-950/50"
            }`}
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-warning-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Crédito
              </>
            )}
          </button>

          {/* Pagar */}
          <button
            onClick={onCheckout}
            disabled={!selectedOwner || cart.length === 0 || isProcessing}
            className={`py-2 px-3 rounded-lg text-sm font-medium text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              !selectedOwner || cart.length === 0 || isProcessing
                ? "bg-surface-300 dark:bg-dark-100 cursor-not-allowed"
                : "bg-biovet-500 hover:bg-biovet-600"
            }`}
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Pagar
              </>
            )}
          </button>
        </div>

        {/* Warning */}
        {!selectedOwner && cart.length > 0 && (
          <p className="text-xs text-center text-warning-600 dark:text-warning-400 flex items-center justify-center gap-1">
            <User className="w-3 h-3" />
            Selecciona cliente
          </p>
        )}
      </div>
    </div>
  );
}