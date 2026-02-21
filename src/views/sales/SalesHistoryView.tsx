// src/views/sales/SalesHistoryView.tsx

import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  AlertCircle,
  Plus,
  RefreshCw,
  Ban,
} from "lucide-react";
import Spinner from "../../components/Spinner";
import ConfirmationModal from "../../components/ConfirmationModal";
import { PaymentModal } from "../../components/payment/PaymentModal";
import { useSalesHistory } from "@/hooks/useSalesHistory";
import { getOwnerName } from "../../types/sale";
import { SalesHeader } from "@/components/sales/SalesHeader";
import { SalesStats } from "@/components/sales/SalesStats";
import { SalesFilters } from "@/components/sales/SalesFilters";
import { SalesTable } from "@/components/sales/SalesTable";
import { SalesMobileList } from "@/components/sales/SalesMobileList";
import { SalesPagination } from "@/components/sales/SalesPagination";
import { formatDate } from "@/utils/ownerHelpers";



export default function SalesHistoryView() {
  const navigate = useNavigate();
  const {
    // State
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    // currentPage,
    setCurrentPage,
    expandedSale,
    showPaymentModal,
    selectedSale,
    showCancelModal,
    cancelReason,
    setCancelReason,

    // Data
    filteredSales,
    pagination,
    summary,
    salesData,
    isLoading,
    isError,
    isCancelling,
    hasActiveFilters,
    modalData,

    // Handlers
    handleOpenPayment,
    handleOpenCancel,
    handleConfirmCancel,
    handlePaymentConfirm,
    handleClearFilters,
    handleToggleExpand,
    handleClosePaymentModal,
    handleCloseCancelModal,
  } = useSalesHistory();

  // Loading inicial
  if (isLoading && !salesData) return <Spinner fullScreen size="xl" />;

  // Texto del contador
  const totalCountText = pagination
    ? `${pagination.total} venta${pagination.total !== 1 ? "s" : ""}`
    : `${filteredSales.length} resultados`;

  return (
    <div className="flex flex-col h-full bg-surface-100 dark:bg-dark-300">
      {/* ========================================
          HEADER FIJO
          ======================================== */}
      <div className="shrink-0 px-4 sm:px-8 pt-4 sm:pt-6 pb-0 space-y-4 sm:space-y-5">
        <SalesHeader
          totalCount={totalCountText}
          onBack={() => navigate(-1)}
          onNewSale={() => navigate("/sales/new")}
        />

        {summary && <SalesStats summary={summary} />}

        <SalesFilters
          searchTerm={searchTerm}
          onSearchChange={(v) => {
            setSearchTerm(v);
            setCurrentPage(1);
          }}
          statusFilter={statusFilter}
          onStatusChange={(v) => {
            setStatusFilter(v);
            setCurrentPage(1);
          }}
          dateFrom={dateFrom}
          onDateFromChange={(v) => {
            setDateFrom(v);
            setCurrentPage(1);
          }}
          dateTo={dateTo}
          onDateToChange={(v) => {
            setDateTo(v);
            setCurrentPage(1);
          }}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* ========================================
          CONTENIDO (SCROLLEABLE)
          ======================================== */}
      <div className="flex-1 overflow-hidden px-4 sm:px-8 pb-4 sm:pb-8">
        <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm h-full flex flex-col overflow-hidden relative">
          {/* Loading overlay */}
          {isLoading && salesData && (
            <div className="absolute inset-0 bg-white/50 dark:bg-dark-100/50 z-20 flex items-center justify-center rounded-xl">
              <div className="w-6 h-6 border-2 border-biovet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {isError ? (
            /* Error State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-danger-50 dark:bg-danger-950 rounded-full flex items-center justify-center border border-danger-200 dark:border-danger-800">
                  <AlertCircle className="w-7 h-7 text-danger-500" />
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
                  Error al cargar ventas
                </p>
                <p className="text-surface-500 dark:text-slate-400 text-xs">
                  Intenta recargar la página
                </p>
              </div>
            </div>
          ) : filteredSales.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-surface-100 dark:bg-dark-200 rounded-full flex items-center justify-center border border-surface-300 dark:border-slate-700">
                  <ShoppingCart className="w-7 h-7 text-surface-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
                  {hasActiveFilters ? "Sin resultados" : "No hay ventas"}
                </p>
                <p className="text-surface-500 dark:text-slate-400 text-xs mb-3">
                  {hasActiveFilters
                    ? "Prueba con otros filtros"
                    : "Las ventas aparecerán aquí"}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-950 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Limpiar filtros
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/sales/new")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-biovet-500 text-white text-sm font-semibold rounded-lg hover:bg-biovet-600 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Primera venta
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <SalesTable
                sales={filteredSales}
                expandedSale={expandedSale}
                onToggleExpand={handleToggleExpand}
                onCancel={handleOpenCancel}
              />

              {/* Mobile */}
              <SalesMobileList
                sales={filteredSales}
                expandedSale={expandedSale}
                onToggleExpand={handleToggleExpand}
                onPay={handleOpenPayment}
                onCancel={handleOpenCancel}
              />
            </>
          )}

          {/* Pagination */}
          {pagination && (
            <SalesPagination
              page={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {/* ========================================
          MODALS
          ======================================== */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        title="¿Cancelar esta venta?"
        message={
          <div className="space-y-3">
            <p className="text-slate-700 dark:text-slate-200">
              Esta acción <strong>cancelará la venta</strong> y restaurará el stock.
            </p>
            {selectedSale && (
              <div className="bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-800 rounded-lg p-3">
                <p className="text-sm text-danger-600 dark:text-danger-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Venta de <strong>${selectedSale.total.toFixed(2)}</strong> a{" "}
                    <strong>{getOwnerName(selectedSale)}</strong>
                  </span>
                </p>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                Motivo (opcional)
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ej: Error en la venta, devolución..."
                className="input"
              />
            </div>
          </div>
        }
        confirmText="Sí, cancelar venta"
        cancelText="No, mantener"
        confirmIcon={Ban}
        variant="danger"
        isLoading={isCancelling}
        loadingText="Cancelando..."
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClosePaymentModal}
        onConfirm={handlePaymentConfirm}
        amountUSD={modalData.pendingAmount}
        creditBalance={modalData.creditBalance}
        services={modalData.services}
        owner={modalData.owner}
        title="Pagar Venta Pendiente"
        subtitle={
          selectedSale
            ? `${selectedSale.items.length} producto${selectedSale.items.length !== 1 ? "s" : ""} · ${formatDate(selectedSale.createdAt)}`
            : undefined
        }
        allowPartial={true}
      />
    </div>
  );
}