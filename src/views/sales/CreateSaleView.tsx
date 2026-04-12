// src/views/sales/CreateSaleView.tsx
import { useState } from "react";
import { AlertTriangle, FileText, ShoppingBag, ShoppingCart } from "lucide-react";
import { useSaleForm } from "@/hooks/useSaleForm";
import { POSHeader, POSProductsPanel, POSCart } from "@/components/pos";
import ConfirmationModal from "@/components/ConfirmationModal";
import { PaymentModal } from "@/components/payment/PaymentModal";

export default function CreateSaleView() {
  const {
    searchTerm,
    cart,
    showPaymentModal,
    showCreditConfirmModal,
    selectedOwner,
    ownerError,
    productSaleMode,
    loadingProducts,
    isProcessing,
    filteredProducts,
    cartTotals,
    setSearchTerm,
    setShowPaymentModal,
    setShowCreditConfirmModal,
    setSelectedOwner,
    setProductSaleMode,
    addToCart,
    updateQuantity,
    toggleUnitMode,
    removeFromCart,
    isInCart,
    handleCreditClick,
    handleConfirmCredit,
    handlePaymentConfirm,
    handleCheckout,
    navigate,
  } = useSaleForm();

  const [activeTab, setActiveTab] = useState<"products" | "cart">("products");

  if (loadingProducts) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="relative w-10 h-10 mx-auto mb-2">
            <div className="absolute inset-0 border-2 border-surface-300 dark:border-slate-700 rounded-full" />
            <div className="absolute inset-0 border-2 border-biovet-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-surface-500 dark:text-slate-400 text-sm">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header del POS */}
      <POSHeader
        productCount={filteredProducts.length}
        onBack={() => navigate(-1)}
      />

      {/* ═══ Tabs Mobile ═══ */}
      <div className="lg:hidden flex shrink-0 border-b border-surface-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <button
          onClick={() => setActiveTab("products")}
          className={`
            flex-1 flex items-center justify-center gap-2
            px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
            ${
              activeTab === "products"
                ? "border-biovet-500 text-biovet-600 dark:text-biovet-400 bg-biovet-50/50 dark:bg-biovet-950/20"
                : "border-transparent text-surface-500 dark:text-slate-400"
            }
          `}
        >
          <ShoppingBag className="w-4 h-4" />
          Productos
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-surface-100 dark:bg-slate-700 text-surface-500 dark:text-slate-400">
            {filteredProducts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("cart")}
          className={`
            flex-1 flex items-center justify-center gap-2
            px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
            ${
              activeTab === "cart"
                ? "border-biovet-500 text-biovet-600 dark:text-biovet-400 bg-biovet-50/50 dark:bg-biovet-950/20"
                : "border-transparent text-surface-500 dark:text-slate-400"
            }
          `}
        >
          <ShoppingCart className="w-4 h-4" />
          Carrito
          {cart.length > 0 && (
            <span
              className={`
                inline-flex items-center justify-center min-w-5 h-5 px-1.5
                text-xs font-bold rounded-full
                ${
                  activeTab === "cart"
                    ? "bg-biovet-100 text-biovet-700 dark:bg-biovet-900/50 dark:text-biovet-300"
                    : "bg-red-500 text-white"
                }
              `}
            >
              {cart.length}
            </span>
          )}
          {cartTotals.total > 0 && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ${cartTotals.total.toFixed(2)}
            </span>
          )}
        </button>
      </div>

      {/* ═══ Contenido principal ═══ */}
      <div className="flex-1 min-h-0 p-3 sm:p-4">

        {/* Desktop: grid 3 columnas */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-4 h-full">
          <POSProductsPanel
            products={filteredProducts}
            searchTerm={searchTerm}
            productSaleMode={productSaleMode}
            onSearchChange={setSearchTerm}
            onAddToCart={addToCart}
            onSetMode={(productId, isFullUnit) =>
              setProductSaleMode((prev) => ({
                ...prev,
                [productId]: isFullUnit,
              }))
            }
            isInCart={isInCart}
          />
          <POSCart
            cart={cart}
            cartTotals={cartTotals}
            selectedOwner={selectedOwner}
            ownerError={ownerError}
            isProcessing={isProcessing}
            onSelectOwner={setSelectedOwner}
            onUpdateQuantity={updateQuantity}
            onToggleUnitMode={toggleUnitMode}
            onRemoveFromCart={removeFromCart}
            onCreditClick={handleCreditClick}
            onCheckout={handleCheckout}
          />
        </div>

        {/* Mobile: tab activo — block/hidden para no desmontar */}
        <div className="lg:hidden h-full">
          <div className={`h-full ${activeTab === "products" ? "block" : "hidden"}`}>
            <POSProductsPanel
              products={filteredProducts}
              searchTerm={searchTerm}
              productSaleMode={productSaleMode}
              onSearchChange={setSearchTerm}
              onAddToCart={addToCart}
              onSetMode={(productId, isFullUnit) =>
                setProductSaleMode((prev) => ({
                  ...prev,
                  [productId]: isFullUnit,
                }))
              }
              isInCart={isInCart}
            />
          </div>

          <div className={`h-full ${activeTab === "cart" ? "block" : "hidden"}`}>
            <POSCart
              cart={cart}
              cartTotals={cartTotals}
              selectedOwner={selectedOwner}
              ownerError={ownerError}
              isProcessing={isProcessing}
              onSelectOwner={setSelectedOwner}
              onUpdateQuantity={updateQuantity}
              onToggleUnitMode={toggleUnitMode}
              onRemoveFromCart={removeFromCart}
              onCreditClick={handleCreditClick}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>

      {/* ═══ Modales ═══ */}
      <ConfirmationModal
        isOpen={showCreditConfirmModal}
        onClose={() => setShowCreditConfirmModal(false)}
        onConfirm={handleConfirmCredit}
        title="¿Guardar a crédito?"
        message={
          <div className="space-y-2">
            <p className="text-slate-700 dark:text-slate-200">
              Esta venta quedará como deuda pendiente.
            </p>
            <div className="bg-warning-50 dark:bg-warning-950/30 border border-warning-200 dark:border-warning-800 rounded-lg p-2">
              <p className="text-sm text-warning-700 dark:text-warning-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>{selectedOwner?.name}</strong> deberá{" "}
                  <strong>${cartTotals.total.toFixed(2)}</strong>
                </span>
              </p>
            </div>
          </div>
        }
        confirmText="Guardar"
        cancelText="Cancelar"
        confirmIcon={FileText}
        variant="warning"
        isLoading={isProcessing}
        loadingText="Guardando..."
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        amountUSD={cartTotals.total}
        creditBalance={selectedOwner?.creditBalance || 0}
        services={cart.map((item) => ({
          description: `${item.productName} (${item.quantity} ${
            item.isFullUnit ? item.unit : item.doseUnit
          })`,
          quantity: 1,
          unitPrice: item.total,
          total: item.total,
        }))}
        owner={
          selectedOwner
            ? { name: selectedOwner.name, phone: selectedOwner.phone }
            : undefined
        }
        title="Completar Venta"
        allowPartial={true}
      />
    </div>
  );
}