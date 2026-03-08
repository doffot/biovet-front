// src/views/sales/CreateSaleView.tsx
import { AlertTriangle, FileText } from "lucide-react";
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
      {/* Header fijo */}
      <POSHeader
        productCount={filteredProducts.length}
        onBack={() => navigate(-1)}
      />

      {/* Contenido - ocupa el resto */}
      <div className="flex-1 min-h-0 p-3 sm:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 h-full">
          <POSProductsPanel
            products={filteredProducts}
            searchTerm={searchTerm}
            productSaleMode={productSaleMode}
            onSearchChange={setSearchTerm}
            onAddToCart={addToCart}
            onSetMode={(productId, isFullUnit) =>
              setProductSaleMode((prev) => ({ ...prev, [productId]: isFullUnit }))
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
      </div>

      {/* Modales */}
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
          description: `${item.productName} (${item.quantity} ${item.isFullUnit ? item.unit : item.doseUnit})`,
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