// src/views/sales/hooks/useSalesHistory.ts

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { FilterStatus } from "@/utils/salesHelpers";
import { getInvoiceId, getOwnerName, type GetSalesParams, type Sale } from "@/types/sale";
import { cancelSale, getSales, getTodaySummary } from "@/api/saleAPI";
import { toast } from "@/components/Toast";
import { createPayment } from "@/api/paymentAPI";


const ITEMS_PER_PAGE = 20;

export function useSalesHistory() {
  const queryClient = useQueryClient();

  // ==================== STATE ====================
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedSale, setExpandedSale] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // ==================== QUERY PARAMS ====================
  const queryParams = useMemo((): GetSalesParams => {
    const params: GetSalesParams = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };
    switch (statusFilter) {
      case "completada":
        params.status = "completada";
        params.isPaid = true;
        break;
      case "pendiente":
        params.status = "completada";
        params.isPaid = false;
        break;
      case "con-deuda":
        params.isPaid = false;
        break;
      case "cancelada":
        params.status = "cancelada";
        break;
    }
    if (dateFrom) params.startDate = dateFrom;
    if (dateTo) params.endDate = dateTo;
    return params;
  }, [statusFilter, dateFrom, dateTo, currentPage]);

  // ==================== QUERIES ====================
  const {
    data: salesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["sales", queryParams],
    queryFn: () => getSales(queryParams),
    placeholderData: (prev) => prev,
  });

  const { data: todayData } = useQuery({
    queryKey: ["sales", "today-summary"],
    queryFn: getTodaySummary,
  });

  const sales = salesData?.sales ?? [];
  const pagination = salesData?.pagination;
  const summary = todayData?.summary;

  // ==================== FILTRO LOCAL ====================
  const filteredSales = useMemo(() => {
    if (!searchTerm.trim()) return sales;
    const search = searchTerm.toLowerCase();
    return sales.filter((sale) => {
      const ownerName = getOwnerName(sale).toLowerCase();
      const items = sale.items.map((i) => i.productName).join(" ").toLowerCase();
      return ownerName.includes(search) || items.includes(search);
    });
  }, [sales, searchTerm]);

  // ==================== MUTATIONS ====================
  const { mutate: cancelSaleMutation, isPending: isCancelling } = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelSale(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products", "with-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setShowCancelModal(false);
      setSelectedSale(null);
      setCancelReason("");
      toast.success("Venta cancelada", "La venta fue cancelada y el stock restaurado");
    },
    onError: (error: Error) => {
      toast.error("Error", error.message || "No se pudo cancelar la venta");
    },
  });

  const { mutate: createPaymentMutation } = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      setShowPaymentModal(false);
      setSelectedSale(null);
      toast.success("Pago registrado", "El pago se procesó correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al pagar", error.message);
    },
  });

  // ==================== HANDLERS ====================
  const handleOpenPayment = useCallback((sale: Sale) => {
    setSelectedSale(sale);
    setShowPaymentModal(true);
  }, []);

  const handleOpenCancel = useCallback((sale: Sale) => {
    setSelectedSale(sale);
    setCancelReason("");
    setShowCancelModal(true);
  }, []);

  const handleConfirmCancel = useCallback(() => {
    if (!selectedSale) return;
    cancelSaleMutation({ id: selectedSale._id, reason: cancelReason || undefined });
  }, [selectedSale, cancelReason, cancelSaleMutation]);

  const handlePaymentConfirm = useCallback(
    (paymentData: {
      paymentMethodId?: string;
      reference?: string;
      addAmountPaidUSD: number;
      addAmountPaidBs: number;
      exchangeRate: number;
      isPartial: boolean;
      creditAmountUsed?: number;
    }) => {
      if (!selectedSale) return;
      const invoiceId = getInvoiceId(selectedSale);
      if (!invoiceId) {
        toast.error("Error", "No se encontró la factura asociada");
        return;
      }
      const isPayingBs = paymentData.addAmountPaidBs > 0;
      createPaymentMutation({
        invoiceId,
        amount: isPayingBs ? paymentData.addAmountPaidBs : paymentData.addAmountPaidUSD,
        currency: isPayingBs ? "Bs" : "USD",
        exchangeRate: paymentData.exchangeRate,
        paymentMethod: paymentData.paymentMethodId,
        reference: paymentData.reference,
        creditAmountUsed: paymentData.creditAmountUsed,
      });
    },
    [selectedSale, createPaymentMutation]
  );

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  }, []);

  const handleToggleExpand = useCallback(
    (saleId: string) => {
      setExpandedSale((prev) => (prev === saleId ? null : saleId));
    },
    []
  );

  const handleClosePaymentModal = useCallback(() => {
    setShowPaymentModal(false);
    setSelectedSale(null);
  }, []);

  const handleCloseCancelModal = useCallback(() => {
    setShowCancelModal(false);
    setSelectedSale(null);
    setCancelReason("");
  }, []);

  const hasActiveFilters = !!(searchTerm || statusFilter !== "all" || dateFrom || dateTo);

  // ==================== MODAL DATA ====================
  const modalData = useMemo(() => {
    if (!selectedSale) {
      return {
        pendingAmount: 0,
        services: [] as { description: string; quantity: number; unitPrice: number; total: number }[],
        owner: undefined as { name: string; phone?: string } | undefined,
        creditBalance: 0,
      };
    }
    return {
      pendingAmount: Math.max(0, selectedSale.total - selectedSale.amountPaid),
      services: selectedSale.items.map((item) => ({
        description: item.productName,
        quantity: item.quantity,
        unitPrice: item.isFullUnit ? item.unitPrice : (item.pricePerDose ?? item.unitPrice),
        total: item.total,
      })),
      owner: {
        name: getOwnerName(selectedSale),
        phone:
          selectedSale.ownerPhone ||
          (typeof selectedSale.owner === "object" ? selectedSale.owner?.contact : undefined) ||
          undefined,
      },
      creditBalance:
        typeof selectedSale.owner === "object" && selectedSale.owner?.creditBalance
          ? selectedSale.owner.creditBalance
          : 0,
    };
  }, [selectedSale]);

  return {
    // State
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    currentPage,
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
  };
}