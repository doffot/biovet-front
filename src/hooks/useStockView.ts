// src/views/inventory/hooks/useStockView.ts

import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductsWithInventory } from "@/api/productAPI";
import { getStockStatus } from "@/utils/productHelpers";


const ITEMS_PER_PAGE = 15;

export function useStockView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "ok" | "low" | "out">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products", "with-inventory"],
    queryFn: getProductsWithInventory,
  });

  // ==================== FILTRADO ====================
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStock = true;
      if (stockFilter !== "all") {
        matchesStock = getStockStatus(p) === stockFilter;
      }

      return matchesSearch && matchesStock;
    });
  }, [products, searchTerm, stockFilter]);

  // ==================== STATS ====================
  const stats = useMemo(() => {
    const totalUnits = products.reduce(
      (sum, p) => sum + (p.inventory?.stockUnits ?? 0),
      0
    );
    const totalValue = products.reduce((sum, p) => {
      const units = p.inventory?.stockUnits ?? 0;
      return sum + units * p.salePrice;
    }, 0);
    const lowStock = products.filter((p) => getStockStatus(p) === "low").length;
    const outOfStock = products.filter((p) => getStockStatus(p) === "out").length;
    return { totalUnits, totalValue, lowStock, outOfStock };
  }, [products]);

  // ==================== PAGINACIÓN ====================
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (filteredProducts.length === 0) setCurrentPage(1);
    else if (currentPage > totalPages && totalPages > 0)
      setCurrentPage(totalPages);
  }, [filteredProducts.length, currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stockFilter]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setStockFilter("all");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = !!(searchTerm || stockFilter !== "all");

  return {
    searchTerm,
    setSearchTerm,
    stockFilter,
    setStockFilter,
    currentPage,
    setCurrentPage,
    products,
    filteredProducts,
    currentProducts,
    stats,
    isLoading,
    isError,
    error,
    hasActiveFilters,
    totalPages,
    startIndex,
    itemsPerPage: ITEMS_PER_PAGE,
    handleClearFilters,
  };
}