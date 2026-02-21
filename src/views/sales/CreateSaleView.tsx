// src/views/sales/CreateSaleView.tsx

import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Package,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  User,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { getProductsWithInventory } from "../../api/productAPI";
import { toast } from "../../components/Toast";
import type { ProductWithInventory } from "../../types/inventory";
import type { CartItem, SaleFormData } from "@/types/sale";
import { createSale } from "@/api/saleAPI";
import ConfirmationModal from "@/components/ConfirmationModal";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { OwnerSelector } from "@/components/owners/OwnerSelector";

type SelectedClient = {
  id: string;
  name: string;
  phone?: string;
  creditBalance?: number;
} | null;

export default function CreateSaleView() {
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
        product.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
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
      queryClient.invalidateQueries({
        queryKey: ["products", "with-inventory"],
      });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      if (selectedOwner?.id) {
        queryClient.invalidateQueries({
          queryKey: ["owner", selectedOwner.id],
        });
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
        error.message ||
          "No se pudo completar la operación. Intenta nuevamente"
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

  /* ========================================
     LOADING STATE
     ======================================== */
  if (loadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-dark-300">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 border-3 border-surface-300 dark:border-slate-700 rounded-full" />
            <div className="absolute inset-0 border-3 border-biovet-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-surface-500 dark:text-slate-400 text-sm">
            Cargando productos...
          </p>
        </div>
      </div>
    );
  }

  /* ========================================
     RENDER PRINCIPAL
     ======================================== */
  return (
    <div className="min-h-screen bg-surface-100 dark:bg-dark-300">
      {/* Spacer */}
      <div className="h-4 lg:h-0" />

      {/* ========================================
          HEADER STICKY
          ======================================== */}
      <div className="sticky top-14 lg:top-0 z-30 bg-white/95 dark:bg-dark-100/95 backdrop-blur-lg border-b border-surface-300 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 h-14">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-surface-200 dark:hover:bg-dark-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-linear-to-br from-biovet-500 to-biovet-700 rounded-lg">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Punto de Venta
                </h1>
                <p className="text-xs text-surface-500 dark:text-slate-400">
                  {filteredProducts.length} productos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          CONTENIDO PRINCIPAL
          ======================================== */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* ========================================
              COLUMNA IZQUIERDA: PRODUCTOS
              ======================================== */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 overflow-hidden shadow-sm">
            {/* Búsqueda */}
            <div className="p-4 border-b border-surface-300 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Tabla Desktop / Cards Mobile */}
            <div className="max-h-125 lg:max-h-150] overflow-auto custom-scrollbar">
              {filteredProducts.length > 0 ? (
                <>
                  {/* ===== DESKTOP TABLE ===== */}
                  <table className="hidden md:table w-full text-sm">
                    <thead className="sticky top-0 bg-surface-200 dark:bg-dark-50 border-b border-surface-300 dark:border-slate-700 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase">
                          Producto
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase">
                          Precio
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase">
                          Stock
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase">
                          Modo
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-300 dark:divide-slate-700">
                      {filteredProducts.map((product) => {
                        if (!product._id) return null;

                        const inCart = cart.some(
                          (item) => item.productId === product._id
                        );
                        const inventory = product.inventory;
                        const stockUnits = inventory?.stockUnits || 0;
                        const stockDoses = inventory?.stockDoses || 0;
                        const totalDoses =
                          stockUnits * product.dosesPerUnit + stockDoses;
                        const isFullUnitMode =
                          productSaleMode[product._id] ?? true;

                        return (
                          <tr
                            key={product._id}
                            className="hover:bg-surface-200 dark:hover:bg-dark-50 transition-colors"
                          >
                            {/* Producto */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-surface-100 dark:bg-dark-200 rounded-lg border border-surface-300 dark:border-slate-700">
                                  <Package className="w-4 h-4 text-biovet-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-surface-500 dark:text-slate-400 capitalize">
                                    {product.category}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Precio */}
                            <td className="px-4 py-3">
                              {product.divisible ? (
                                <div>
                                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    $
                                    {isFullUnitMode
                                      ? product.salePrice.toFixed(2)
                                      : (
                                          product.salePricePerDose ??
                                          product.salePrice
                                        ).toFixed(2)}
                                  </p>
                                  <p className="text-xs text-surface-500 dark:text-slate-400">
                                    {isFullUnitMode
                                      ? product.unit
                                      : product.doseUnit}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                  ${product.salePrice.toFixed(2)}
                                </p>
                              )}
                            </td>

                            {/* Stock */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-warning-500" />
                                {product.divisible ? (
                                  <span className="text-sm text-warning-600 dark:text-warning-400">
                                    {totalDoses} {product.doseUnit}
                                  </span>
                                ) : (
                                  <span className="text-sm text-warning-600 dark:text-warning-400">
                                    {stockUnits} {product.unit}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Modo */}
                            <td className="px-4 py-3">
                              {product.divisible ? (
                                <div className="flex gap-1 justify-center">
                                  <button
                                    onClick={() =>
                                      setProductSaleMode((prev) => ({
                                        ...prev,
                                        [product._id!]: true,
                                      }))
                                    }
                                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                                      isFullUnitMode
                                        ? "bg-biovet-500 text-white shadow-sm"
                                        : "bg-surface-100 dark:bg-dark-200 text-surface-500 dark:text-slate-400 hover:bg-surface-200 dark:hover:bg-dark-50 border border-surface-300 dark:border-slate-700"
                                    }`}
                                  >
                                    {product.unit}
                                  </button>
                                  <button
                                    onClick={() =>
                                      setProductSaleMode((prev) => ({
                                        ...prev,
                                        [product._id!]: false,
                                      }))
                                    }
                                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                                      !isFullUnitMode
                                        ? "bg-biovet-500 text-white shadow-sm"
                                        : "bg-surface-100 dark:bg-dark-200 text-surface-500 dark:text-slate-400 hover:bg-surface-200 dark:hover:bg-dark-50 border border-surface-300 dark:border-slate-700"
                                    }`}
                                  >
                                    {product.doseUnit}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-surface-500 dark:text-slate-400 text-center block">
                                  —
                                </span>
                              )}
                            </td>

                            {/* Acción */}
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => addToCart(product)}
                                disabled={inCart}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                  inCart
                                    ? "bg-success-50 dark:bg-success-950 text-success-600 dark:text-success-400 cursor-not-allowed border border-success-200 dark:border-success-800"
                                    : "bg-linear-to-r from-biovet-500 to-biovet-700 hover:shadow-md text-white"
                                }`}
                              >
                                {inCart ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    En carrito
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
                                    Agregar
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* ===== MOBILE CARDS ===== */}
                  <div className="md:hidden divide-y divide-surface-300 dark:divide-slate-700">
                    {filteredProducts.map((product) => {
                      if (!product._id) return null;

                      const inCart = cart.some(
                        (item) => item.productId === product._id
                      );
                      const inventory = product.inventory;
                      const stockUnits = inventory?.stockUnits || 0;
                      const stockDoses = inventory?.stockDoses || 0;
                      const totalDoses =
                        stockUnits * product.dosesPerUnit + stockDoses;
                      const isFullUnitMode =
                        productSaleMode[product._id] ?? true;

                      return (
                        <div key={product._id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="p-2 bg-surface-100 dark:bg-dark-200 rounded-lg border border-surface-300 dark:border-slate-700 shrink-0">
                                <Package className="w-5 h-5 text-biovet-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                                  {product.name}
                                </p>
                                <p className="text-xs text-surface-500 dark:text-slate-400 capitalize">
                                  {product.category}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-warning-500 shrink-0" />
                                  <span className="text-xs text-warning-600 dark:text-warning-400">
                                    {product.divisible
                                      ? `${totalDoses} ${product.doseUnit}`
                                      : `${stockUnits} ${product.unit}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                $
                                {isFullUnitMode
                                  ? product.salePrice.toFixed(2)
                                  : (
                                      product.salePricePerDose ??
                                      product.salePrice
                                    ).toFixed(2)}
                              </p>
                              <p className="text-xs text-surface-500 dark:text-slate-400">
                                {isFullUnitMode
                                  ? product.unit
                                  : product.doseUnit}
                              </p>
                            </div>
                          </div>

                          {/* Toggle divisible mobile */}
                          {product.divisible && (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  setProductSaleMode((prev) => ({
                                    ...prev,
                                    [product._id!]: true,
                                  }))
                                }
                                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                  isFullUnitMode
                                    ? "bg-biovet-500 text-white shadow-sm"
                                    : "bg-surface-100 dark:bg-dark-200 text-surface-500 dark:text-slate-400 border border-surface-300 dark:border-slate-700"
                                }`}
                              >
                                {product.unit}
                              </button>
                              <button
                                onClick={() =>
                                  setProductSaleMode((prev) => ({
                                    ...prev,
                                    [product._id!]: false,
                                  }))
                                }
                                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                  !isFullUnitMode
                                    ? "bg-biovet-500 text-white shadow-sm"
                                    : "bg-surface-100 dark:bg-dark-200 text-surface-500 dark:text-slate-400 border border-surface-300 dark:border-slate-700"
                                }`}
                              >
                                {product.doseUnit}
                              </button>
                            </div>
                          )}

                          {/* Botón agregar mobile */}
                          <button
                            onClick={() => addToCart(product)}
                            disabled={inCart}
                            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                              inCart
                                ? "bg-success-50 dark:bg-success-950 text-success-600 dark:text-success-400 cursor-not-allowed border border-success-200 dark:border-success-800"
                                : "bg-linear-to-r from-biovet-500 to-biovet-700 hover:shadow-lg text-white"
                            }`}
                          >
                            {inCart ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                En carrito
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                Agregar al carrito
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* ===== EMPTY STATE ===== */
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-surface-100 dark:bg-dark-200 rounded-xl flex items-center justify-center border border-surface-300 dark:border-slate-700">
                      <Package className="w-8 h-8 text-surface-500 dark:text-slate-400" />
                    </div>
                    <h3 className="text-base font-medium text-slate-700 dark:text-slate-200 mb-1">
                      {searchTerm
                        ? "Sin resultados"
                        : "Sin productos disponibles"}
                    </h3>
                    <p className="text-sm text-surface-500 dark:text-slate-400">
                      {searchTerm
                        ? "No hay productos con esos criterios"
                        : "Registra productos para venderlos"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================
              COLUMNA DERECHA: CARRITO
              ======================================== */}
          <div className="lg:col-span-1 bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 overflow-hidden shadow-sm lg:sticky lg:top-28 lg:self-start">
            {/* Header del Carrito */}
            <div className="p-4 border-b border-surface-300 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-biovet-500" />
                  Carrito
                </h2>
                <span className="text-xs px-2 py-1 bg-biovet-500/10 text-biovet-500 dark:text-biovet-300 rounded-full font-medium">
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
                  setSelectedOwner(
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

            {/* Items del Carrito */}
            <div className="max-h-75 lg:max-h-100 overflow-auto p-3 custom-scrollbar bg-surface-50/50 dark:bg-dark-200/50">
              {cart.length > 0 ? (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="bg-white dark:bg-dark-100 border border-surface-300 dark:border-slate-700 rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                            {item.productName}
                          </span>

                          {item.isDivisible && (
                            <button
                              onClick={() => toggleUnitMode(item.productId)}
                              className="text-xs px-1.5 py-0.5 rounded bg-surface-100 dark:bg-dark-200 text-biovet-500 dark:text-biovet-300 hover:bg-surface-200 dark:hover:bg-dark-50 shrink-0 border border-surface-300 dark:border-slate-700 transition-colors cursor-pointer"
                              title="Cambiar modo"
                            >
                              {item.isFullUnit ? item.unit : item.doseUnit}
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1 text-danger-500 hover:bg-danger-500/10 rounded transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            className="p-1 rounded border border-surface-300 dark:border-slate-700 hover:bg-surface-200 dark:hover:bg-dark-50 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />
                          </button>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 min-w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            className="p-1 rounded border border-surface-300 dark:border-slate-700 hover:bg-surface-200 dark:hover:bg-dark-50 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />
                          </button>
                        </div>

                        <span className="text-sm font-bold text-success-600 dark:text-success-400">
                          ${item.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <div className="text-center">
                    <ShoppingCart className="w-12 h-12 mx-auto text-surface-500/30 dark:text-slate-400/30 mb-2" />
                    <p className="text-surface-500 dark:text-slate-400 text-sm">
                      Carrito vacío
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ===== FOOTER CON 2 BOTONES ===== */}
            <div className="p-4 border-t border-surface-300 dark:border-slate-700 bg-surface-50/50 dark:bg-dark-200/50 space-y-3">
              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-surface-500 dark:text-slate-400">
                  Total:
                </span>
                <span className="text-3xl font-bold text-success-600 dark:text-success-400">
                  ${cartTotals.total.toFixed(2)}
                </span>
              </div>

              {/* Botón: Guardar a Crédito */}
              <button
                onClick={handleCreditClick}
                disabled={
                  !selectedOwner || cart.length === 0 || isProcessing
                }
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border-2 cursor-pointer ${
                  !selectedOwner || cart.length === 0 || isProcessing
                    ? "bg-surface-200 dark:bg-dark-200 border-surface-300 dark:border-slate-700 text-surface-500 dark:text-slate-500 cursor-not-allowed"
                    : "bg-warning-500/10 border-warning-500/30 text-warning-600 dark:text-warning-400 hover:bg-warning-500/20 hover:border-warning-500/50 hover:shadow-md active:scale-[0.98]"
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-warning-500 border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Guardar a Crédito
                  </>
                )}
              </button>

              {/* Botón: Procesar Pago */}
              <button
                onClick={handleCheckout}
                disabled={
                  !selectedOwner || cart.length === 0 || isProcessing
                }
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  !selectedOwner || cart.length === 0 || isProcessing
                    ? "bg-surface-400 dark:bg-dark-200 cursor-not-allowed"
                    : "bg-linear-to-r from-biovet-500 to-biovet-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Procesar Pago
                  </>
                )}
              </button>

              {/* Mensaje de advertencia */}
              {!selectedOwner && cart.length > 0 && (
                <p className="text-xs text-center text-warning-600 dark:text-warning-400 flex items-center justify-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Selecciona un cliente para continuar
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          MODAL CONFIRMACIÓN CRÉDITO
          ======================================== */}
      <ConfirmationModal
        isOpen={showCreditConfirmModal}
        onClose={() => setShowCreditConfirmModal(false)}
        onConfirm={handleConfirmCredit}
        title="¿Guardar venta a crédito?"
        message={
          <div className="space-y-2">
            <p className="text-slate-700 dark:text-slate-200">
              Esta venta se registrará <strong>sin pago</strong> y quedará como
              deuda pendiente para el cliente.
            </p>
            <div className="bg-warning-500/10 border border-warning-500/20 rounded-lg p-3 mt-3">
              <p className="text-sm text-warning-600 dark:text-warning-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>{selectedOwner?.name}</strong> deberá{" "}
                  <strong>${cartTotals.total.toFixed(2)}</strong>
                </span>
              </p>
            </div>
            <p className="text-xs text-surface-500 dark:text-slate-400 mt-2">
              Podrás registrar el pago más adelante desde el historial de
              facturas del cliente.
            </p>
          </div>
        }
        confirmText="Sí, guardar a crédito"
        cancelText="Cancelar"
        confirmIcon={FileText}
        variant="warning"
        isLoading={isProcessing}
        loadingText="Guardando..."
      />

      {/* ========================================
          MODAL DE PAGO
          ======================================== */}
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