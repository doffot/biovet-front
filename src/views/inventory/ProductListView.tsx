// src/views/inventory/ProductListView.tsx

import { useNavigate } from "react-router-dom";
import { Package, AlertCircle, Plus, RefreshCw, Trash2 } from "lucide-react";
import Spinner from "../../components/Spinner";
import ConfirmationModal from "../../components/ConfirmationModal";

import { useProductList } from "@/hooks/useProductList";
import { ProductListHeader } from "@/components/inventory/ProductListHeader";
import { ProductStats } from "@/components/inventory/ProductStats";
import { ProductFilters } from "@/components/inventory/ProductFilters";
import { ProductTable } from "@/components/inventory/ProductTable";
import { ProductMobileCard } from "@/components/inventory/ProductMobileCard";
import { ProductPagination } from "@/components/inventory/ProductPagination";




export default function ProductListView() {
  const navigate = useNavigate();
  const {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    stockFilter,
    setStockFilter,
    currentPage,
    setCurrentPage,
    isDeleteModalOpen,
    productToDelete,

    filteredProducts,
    currentProducts,
    stats,
    isLoading,
    isError,
    error,
    isDeleting,
    hasActiveFilters,

    totalPages,
    startIndex,
    itemsPerPage,

    handleDeleteClick,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleClearFilters,
  } = useProductList();

  if (isLoading) return <Spinner fullScreen size="xl" />;

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-100 dark:bg-dark-300">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 bg-danger-50 dark:bg-danger-950 rounded-full flex items-center justify-center border border-danger-200 dark:border-danger-800">
            <AlertCircle className="w-7 h-7 text-danger-500" />
          </div>
          <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
            Error al cargar productos
          </p>
          <p className="text-surface-500 dark:text-slate-400 text-xs mb-3">
            {error?.message || "No se pudieron cargar los productos"}
          </p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const totalCountText = `${stats.total} producto${stats.total !== 1 ? "s" : ""} registrado${stats.total !== 1 ? "s" : ""}`;

  return (
    <div className="flex flex-col h-full bg-surface-100 dark:bg-dark-300">
      {/* HEADER FIJO */}
      <div className="shrink-0 px-4 sm:px-8 pt-4 sm:pt-6 pb-0 space-y-4 sm:space-y-5">
        <ProductListHeader
          totalCount={totalCountText}
          onBack={() => navigate(-1)}
          onNew={() => navigate("/inventory/products/create")}
        />

        <ProductStats stats={stats} />

        <ProductFilters
          searchTerm={searchTerm}
          onSearchChange={(v) => setSearchTerm(v)}
          categoryFilter={categoryFilter}
          onCategoryChange={(v) => setCategoryFilter(v)}
          stockFilter={stockFilter}
          onStockFilterChange={(v) => setStockFilter(v)}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* CONTENIDO SCROLLEABLE */}
      <div className="flex-1 overflow-hidden px-4 sm:px-8 pb-4 sm:pb-8">
        <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm h-full flex flex-col overflow-hidden">
          {currentProducts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-surface-100 dark:bg-dark-200 rounded-full flex items-center justify-center border border-surface-300 dark:border-slate-700">
                  <Package className="w-7 h-7 text-surface-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
                  {hasActiveFilters
                    ? "Sin resultados"
                    : "No hay productos registrados"}
                </p>
                <p className="text-surface-500 dark:text-slate-400 text-xs mb-3">
                  {hasActiveFilters
                    ? "Prueba con otros filtros"
                    : "Comienza registrando tu primer producto"}
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
                    onClick={() => navigate("/inventory/products/create")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-biovet-500 text-white text-sm font-semibold rounded-lg hover:bg-biovet-600 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Producto
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <ProductTable
                products={currentProducts}
                onEdit={(p) => navigate(`/inventory/products/edit/${p._id}`)}
                onDelete={handleDeleteClick}
              />

              {/* Mobile */}
              <div className="lg:hidden flex-1 overflow-auto custom-scrollbar divide-y divide-surface-200 dark:divide-slate-700/50">
                {currentProducts.map((product) => (
                  <ProductMobileCard
                    key={product._id}
                    product={product}
                    onEdit={() => navigate(`/inventory/products/${product._id}`)}
                    onDelete={() => handleDeleteClick(product)}
                  />
                ))}
              </div>
            </>
          )}

          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsPerPage={itemsPerPage}
            totalItems={filteredProducts.length}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* DELETE MODAL */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Producto"
        message={
          <p className="text-slate-700 dark:text-slate-200">
            ¿Eliminar{" "}
            <span className="font-bold text-danger-500">
              {productToDelete?.name}
            </span>
            ? Esta acción no se puede deshacer.
          </p>
        }
        variant="danger"
        confirmText="Eliminar"
        confirmIcon={Trash2}
        isLoading={isDeleting}
        loadingText="Eliminando..."
      />
    </div>
  );
}