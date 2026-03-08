// src/hooks/useSaleForm.ts
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getProductsWithInventory } from "@/api/productAPI";
import { createSale } from "@/api/saleAPI";
import { toast } from "@/components/Toast";
import type { ProductWithInventory } from "@/types/inventory";
import type { CartItem, SaleFormData } from "@/types/sale";

export type SelectedClient = {
  id: string;
  name: string;
  phone?: string;
  creditBalance?: number;
} | null;

export function useSaleForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreditConfirmModal, setShowCreditConfirmModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<SelectedClient>(null);
  const [ownerError, setOwnerError] = useState("");
  const [discountTotal, setDiscountTotal] = useState(0);
  const [productSaleMode, setProductSaleMode] = useState<{
    [key: string]: boolean;
  }>({});

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "with-inventory"],
    queryFn: getProductsWithInventory,
  });

  const productsWithStock = useMemo(() => {
    return products.filter((product) => {
      if (!product.divisible) {
        return (
          product.inventory?.stockUnits && product.inventory.stockUnits > 0
        );
      }
      const totalDoses =
        (product.inventory?.stockUnits || 0) * product.dosesPerUnit +
        (product.inventory?.stockDoses || 0);
      return totalDoses > 0;
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    return productsWithStock.filter((product) => {
      return (
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [productsWithStock, searchTerm]);

  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const itemDiscounts = cart.reduce((sum, item) => sum + item.discount, 0);
    const total = Math.max(0, subtotal - itemDiscounts - discountTotal);
    return { subtotal, itemDiscounts, total };
  }, [cart, discountTotal]);

  const getAvailableStock = useCallback(
    (product: ProductWithInventory, isFullUnit: boolean): number => {
      if (!product.inventory) return 0;
      if (isFullUnit) return product.inventory.stockUnits;
      return (
        product.inventory.stockUnits * product.dosesPerUnit +
        product.inventory.stockDoses
      );
    },
    []
  );

  const addToCart = useCallback(
    (product: ProductWithInventory) => {
      if (!product._id) return;

      const productId = product._id;
      const isFullUnit = product.divisible
        ? (productSaleMode[productId] ?? true)
        : true;
      const availableStock = getAvailableStock(product, isFullUnit);

      if (availableStock <= 0) {
        toast.error(
          "Sin stock disponible",
          `No hay unidades de "${product.name}" disponibles`
        );
        return;
      }

      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.productId === productId && item.isFullUnit === isFullUnit
        );

        if (existingIndex >= 0) {
          const existing = prev[existingIndex];
          if (existing.quantity >= availableStock) {
            toast.error(
              "Stock máximo alcanzado",
              `Solo hay ${availableStock} unidades disponibles`
            );
            return prev;
          }

          const updated = [...prev];
          const item = updated[existingIndex];
          const price = isFullUnit
            ? item.unitPrice
            : item.pricePerDose || item.unitPrice;
          item.quantity += 1;
          item.subtotal = price * item.quantity;
          item.total = item.subtotal - item.discount;
          return updated;
        }

        const unitPrice = product.salePrice;
        const pricePerDose = product.salePricePerDose || product.salePrice;
        const price = isFullUnit ? unitPrice : pricePerDose;

        return [
          ...prev,
          {
            productId,
            productName: product.name,
            quantity: 1,
            isFullUnit,
            unitPrice,
            pricePerDose,
            subtotal: price,
            discount: 0,
            total: price,
            unit: product.unit,
            doseUnit: product.doseUnit,
            availableStock,
            isDivisible: product.divisible || false,
          },
        ];
      });
    },
    [productSaleMode, getAvailableStock]
  );

  const updateQuantity = useCallback(
    (productId: string, newQuantity: number) => {
      setCart((prev) => {
        const index = prev.findIndex((item) => item.productId === productId);
        if (index < 0) return prev;

        const updated = [...prev];
        const item = updated[index];

        if (newQuantity <= 0) {
          updated.splice(index, 1);
          return updated;
        }

        if (newQuantity > item.availableStock) {
          toast.error(
            "Stock insuficiente",
            `Solo hay ${item.availableStock} unidades disponibles`
          );
          return prev;
        }

        const price = item.isFullUnit
          ? item.unitPrice
          : item.pricePerDose || item.unitPrice;
        item.quantity = newQuantity;
        item.subtotal = price * newQuantity;
        item.total = item.subtotal - item.discount;
        return updated;
      });
    },
    []
  );

  const toggleUnitMode = useCallback((productId: string) => {
    setCart((prev) => {
      const index = prev.findIndex((item) => item.productId === productId);
      if (index < 0) return prev;

      const updated = [...prev];
      const item = updated[index];

      if (!item.isDivisible) return prev;

      const newIsFullUnit = !item.isFullUnit;
      const newPrice = newIsFullUnit
        ? item.unitPrice
        : item.pricePerDose || item.unitPrice;

      item.isFullUnit = newIsFullUnit;
      item.subtotal = newPrice * item.quantity;
      item.total = item.subtotal - item.discount;
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const isInCart = useCallback(
    (productId: string) => cart.some((item) => item.productId === productId),
    [cart]
  );

  const validateSale = (): boolean => {
    if (!selectedOwner) {
      setOwnerError("Debes seleccionar un cliente para procesar la venta");
      toast.error("Cliente requerido", "Selecciona un cliente para continuar");
      return false;
    }

    if (cart.length === 0) {
      toast.error(
        "Carrito vacío",
        "Agrega productos al carrito antes de continuar"
      );
      return false;
    }

    setOwnerError("");
    return true;
  };

  const { mutate: createSaleMutation, isPending: isProcessing } = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products", "with-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      if (selectedOwner?.id) {
        queryClient.invalidateQueries({ queryKey: ["owner", selectedOwner.id] });
        queryClient.invalidateQueries({ queryKey: ["owners"] });
      }

      setCart([]);
      setSelectedOwner(null);
      setDiscountTotal(0);
      setSearchTerm("");
      setShowPaymentModal(false);
      setShowCreditConfirmModal(false);

      toast.success("Venta procesada", "La venta se registró correctamente");
      navigate("/");
    },
    onError: (error: Error) => {
      toast.error(
        "Error al procesar la venta",
        error.message || "No se pudo completar la operación. Intenta nuevamente"
      );
    },
  });

  const handleCreditClick = () => {
    if (!validateSale()) return;
    setShowCreditConfirmModal(true);
  };

  const handleConfirmCredit = useCallback(() => {
    const formData: SaleFormData = {
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        isFullUnit: item.isFullUnit,
        discount: item.discount,
      })),
      discountTotal,
      amountPaidUSD: 0,
      amountPaidBs: 0,
      creditUsed: 0,
      exchangeRate: 1,
      ownerId: selectedOwner!.id,
    };

    toast.info(
      "Guardando venta a crédito",
      "La factura quedará pendiente de pago para el cliente"
    );

    createSaleMutation(formData);
  }, [cart, discountTotal, selectedOwner, createSaleMutation]);

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
      const formData: SaleFormData = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          isFullUnit: item.isFullUnit,
          discount: item.discount,
        })),
        discountTotal,
        amountPaidUSD: paymentData.addAmountPaidUSD,
        amountPaidBs: paymentData.addAmountPaidBs,
        creditUsed: paymentData.creditAmountUsed || 0,
        exchangeRate: paymentData.exchangeRate,
        paymentMethodId: paymentData.paymentMethodId,
        paymentReference: paymentData.reference,
        ...(selectedOwner && { ownerId: selectedOwner.id }),
      };

      const isPayingInBs = paymentData.addAmountPaidBs > 0;
      const amount = isPayingInBs
        ? paymentData.addAmountPaidBs
        : paymentData.addAmountPaidUSD;
      const currency: "USD" | "Bs" = isPayingInBs ? "Bs" : "USD";

      toast.success(
        "Pago procesado",
        `Se registró el pago de ${currency} ${amount.toFixed(2)}`
      );

      createSaleMutation(formData);
    },
    [cart, discountTotal, selectedOwner, createSaleMutation]
  );

  const handleCheckout = () => {
    if (!validateSale()) return;
    setShowPaymentModal(true);
  };

  return {
    // State
    searchTerm,
    cart,
    showPaymentModal,
    showCreditConfirmModal,
    selectedOwner,
    ownerError,
    discountTotal,
    productSaleMode,
    loadingProducts,
    isProcessing,
    
    // Computed
    filteredProducts,
    cartTotals,
    
    // Setters
    setSearchTerm,
    setShowPaymentModal,
    setShowCreditConfirmModal,
    setSelectedOwner,
    setProductSaleMode,
    
    // Actions
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
  };
}