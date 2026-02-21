// src/views/inventory/hooks/useProductList.ts

import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStockStatus, type CategoryFilter } from "@/utils/productHelpers";
import { deleteProduct, getProductsWithInventory } from "@/api/productAPI";
import { toast } from "@/components/Toast";
import type { ProductWithInventory } from "@/types/inventory";

const ITEMS_PER_PAGE = 10;

export function useProductList() {
  const queryClient = useQueryClient();

  // ==================== STATE ====================
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [stockFilter, setStockFilter] = useState<"all" | "ok" | "low" | "out">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // ==================== QUERY ====================
  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products", "with-inventory"],
    queryFn: getProductsWithInventory,
  });

  // ==================== MUTATION ====================
  const { mutate: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      toast.success("Producto eliminado", "Se eliminó correctamente");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    },
    onError: (err: Error) => {
      toast.error("Error", err.message || "No se pudo eliminar el producto");
    },
  });

  // ==================== FILTRADO ====================
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Búsqueda
      const matchesSearch =
        !searchTerm.trim() ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());

      // Categoría
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      // Stock
      let matchesStock = true;
      if (stockFilter !== "all") {
        const status = getStockStatus(product);
        matchesStock = status === stockFilter;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  // ==================== STATS ====================
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.active !== false).length;
    const lowStock = products.filter((p) => getStockStatus(p) === "low").length;
    const outOfStock = products.filter((p) => getStockStatus(p) === "out").length;
    return { total, active, lowStock, outOfStock };
  }, [products]);

  // ==================== PAGINACIÓN ====================
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (filteredProducts.length === 0) {
      setCurrentPage(1);
    } else if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredProducts.length, currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, stockFilter]);

  // ==================== HANDLERS ====================
  const handleDeleteClick = useCallback(
    (product: ProductWithInventory) => {
      if (product._id) {
        setProductToDelete({ id: product._id, name: product.name });
        setIsDeleteModalOpen(true);
      }
    },
    []
  );

  const handleConfirmDelete = useCallback(() => {
    if (productToDelete) confirmDelete(productToDelete.id);
  }, [productToDelete, confirmDelete]);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStockFilter("all");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = !!(
    searchTerm ||
    categoryFilter !== "all" ||
    stockFilter !== "all"
  );

  return {
    // State
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

    // Data
    products,
    filteredProducts,
    currentProducts,
    stats,
    isLoading,
    isError,
    error,
    isDeleting,
    hasActiveFilters,

    // Pagination
    totalPages,
    startIndex,
    itemsPerPage: ITEMS_PER_PAGE,

    // Handlers
    handleDeleteClick,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleClearFilters,
  };
}