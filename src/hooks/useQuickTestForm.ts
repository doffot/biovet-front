// src/hooks/useQuickTestForm.ts
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/Toast";
import { createLabExam } from "@/api/labExamAPI";
import { getActiveProducts } from "@/api/productAPI";
import { QUICK_TEST_TABS, getLocalDateString } from "@/constants/quickTest";
import type { Product } from "@/types/product";
import type { LabExam } from "@/types/labExam";
import type { QuickTestFormData, TabId, PaymentConfirmData } from "@/types/labExam/quickTest";

export function useQuickTestForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabId>("patient");
  const [isClosing, setIsClosing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [savedExamData, setSavedExamData] = useState<LabExam | null>(null);
  const [examCostUSD, setExamCostUSD] = useState(0);

  const form = useForm<QuickTestFormData>({
    defaultValues: {
      patientName: "",
      species: "canino",
      breed: "",
      sex: "",
      age: "",
      weight: undefined,
      cost: 0,
      discount: 0,
      date: getLocalDateString(),
      treatingVet: "",
      ownerName: "",
      ownerPhone: "",
      testName: "",
      results: "",
      productId: "",
      quantity: 1,
      patientId: undefined,
    },
  });

  const { watch, setValue, getValues } = form;

  const patientName = watch("patientName");
  const isPatientSelected = Boolean(patientName && patientName.trim() !== "");
  const cost = watch("cost") ?? 0;
  const discount = watch("discount") ?? 0;
  const totalCost = Math.max(0, cost - discount);

  const watchedProductId = watch("productId");
  const watchedQuantity = watch("quantity") || 1;

  // Query productos
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products", "active"],
    queryFn: getActiveProducts,
  });

  const testProducts = products.filter(
    (p) => p.category === "test" || p.name.toLowerCase().includes("test")
  );

  // Autocompletar precio y nombre cuando selecciona producto
  useEffect(() => {
    if (watchedProductId) {
      const prod = testProducts.find((p) => p._id === watchedProductId);
      if (prod) {
        setValue("testName", prod.name);
        const basePrice = prod.salePrice || 0;
        setValue("cost", basePrice * watchedQuantity);
      }
    } else {
      setValue("testName", "");
      setValue("cost", 0);
    }
  }, [watchedProductId, watchedQuantity, testProducts, setValue]);

  // Mutación
  const { mutate, isPending } = useMutation({
    mutationFn: (data: QuickTestFormData) =>
      createLabExam({
        ...data,
        examType: "test",
        productId: data.productId,
        quantity: data.quantity,
      } as any),
    onSuccess: (response) => {
      setSavedExamData(response);
      setShowShareModal(true);
      queryClient.invalidateQueries({ queryKey: ["labExams"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Confirmar pago
  const handlePaymentConfirm = (paymentData: PaymentConfirmData) => {
    const isPayingInBs = paymentData.addAmountPaidBs > 0;
    const amountPaid = isPayingInBs
      ? paymentData.addAmountPaidBs
      : paymentData.addAmountPaidUSD;
    const currency = isPayingInBs ? "Bs" : "USD";

    const finalData: QuickTestFormData = {
      ...getValues(),
      paymentMethodId: paymentData.paymentMethodId,
      paymentReference: paymentData.reference,
      exchangeRate: paymentData.exchangeRate,
      paymentAmount: amountPaid,
      paymentCurrency: currency,
      isPartialPayment: paymentData.isPartial,
      creditAmountUsed: paymentData.creditAmountUsed,
    };

    mutate(finalData);
    setShowPaymentModal(false);
  };

  // Cambiar tab
  const handleTabChange = (tab: TabId) => {
    if (tab !== "patient" && !isPatientSelected) {
      toast.error("Primero selecciona un paciente");
      return;
    }
    setActiveTab(tab);
  };

  // Cerrar
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => navigate(-1), 300);
  };

  // Limpiar paciente
  const handleClearPatient = () => {
    setValue("patientId", undefined);
    setValue("patientName", "");
    setValue("species", "canino");
    setValue("breed", "");
    setValue("sex", "");
    setValue("age", "");
    setValue("weight", undefined);
    setValue("ownerName", "");
    setValue("treatingVet", "");
    setActiveTab("patient");
  };

  // Submit
  const onSubmit = (data: QuickTestFormData) => {
    if (!isPatientSelected) {
      toast.error("Debes seleccionar un paciente primero");
      setActiveTab("patient");
      return;
    }

    if (!data.productId) {
      toast.error("Selecciona un test del inventario");
      setActiveTab("exam");
      return;
    }

    if (!data.testName?.trim()) {
      toast.error("El nombre del test es obligatorio");
      setActiveTab("results");
      return;
    }

    if (!data.results?.trim()) {
      toast.error("El resultado es obligatorio");
      setActiveTab("results");
      return;
    }

    if ((data.cost ?? 0) <= 0) {
      toast.error("El costo del examen debe ser mayor a 0");
      setActiveTab("exam");
      return;
    }

    setExamCostUSD(totalCost);

    if (data.patientId) {
      mutate(data);
    } else if (data.ownerName) {
      setShowPaymentModal(true);
    } else {
      toast.error("Debe ingresar los datos del dueño para pacientes externos");
      setActiveTab("patient");
    }
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setSavedExamData(null);
    navigate(-1);
  };

  const currentTabIndex = QUICK_TEST_TABS.findIndex((t) => t.id === activeTab);

  return {
    form,
    activeTab,
    isClosing,
    showPaymentModal,
    showShareModal,
    savedExamData,
    examCostUSD,
    isPending,
    isPatientSelected,
    patientName,
    cost,
    discount,
    totalCost,
    testProducts,
    currentTabIndex,
    handleTabChange,
    handleClose,
    handleClearPatient,
    handlePaymentConfirm,
    handleCloseShareModal,
    onSubmit,
    setShowPaymentModal,
    setActiveTab,
  };
}