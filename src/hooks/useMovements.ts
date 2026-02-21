// src/views/inventory/hooks/useMovements.ts

import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMovements } from "@/api/inventoryAPI";
import type { MovementType, MovementReason } from "@/types/inventory";

const ITEMS_PER_PAGE = 15;

export function useMovements() {
  // ==================== STATE ====================
  const [typeFilter, setTypeFilter] = useState<MovementType | "all">("all");
  const [reasonFilter, setReasonFilter] = useState<MovementReason | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ==================== FILTERS PARA API ====================
  const apiFilters = useMemo(() => {
    const filters: Record<string, string | number> = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };

    if (typeFilter !== "all") filters.type = typeFilter;
    if (reasonFilter !== "all") filters.reason = reasonFilter;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    return filters;
  }, [typeFilter, reasonFilter, dateFrom, dateTo, currentPage]);

  // ==================== QUERY ====================
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["movements", apiFilters],
    queryFn: () => getMovements(apiFilters),
  });

  const movements = data?.movements || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.pages || 1;

  // ==================== STATS ====================
  const stats = useMemo(() => {
    return {
      total: pagination?.total || 0,
      showing: movements.length,
    };
  }, [pagination, movements]);

  // ==================== RESET PAGE ON FILTER CHANGE ====================
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, reasonFilter, dateFrom, dateTo]);

  // ==================== HANDLERS ====================
  const handleClearFilters = useCallback(() => {
    setTypeFilter("all");
    setReasonFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = !!(
    typeFilter !== "all" ||
    reasonFilter !== "all" ||
    dateFrom ||
    dateTo
  );

  return {
    // State
    typeFilter,
    setTypeFilter,
    reasonFilter,
    setReasonFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    currentPage,
    setCurrentPage,

    // Data
    movements,
    stats,
    isLoading,
    isError,
    error,
    hasActiveFilters,

    // Pagination
    totalPages,
    startIndex: pagination ? (pagination.page - 1) * pagination.limit : 0,
    itemsPerPage: ITEMS_PER_PAGE,
    totalItems: pagination?.total || 0,

    // Handlers
    handleClearFilters,
  };
}