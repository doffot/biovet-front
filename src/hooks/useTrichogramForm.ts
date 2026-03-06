// src/hooks/useTrichogramForm.ts
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/Toast";
import { createLabExam } from "@/api/labExamAPI";
import { TRICHOGRAM_TABS, getLocalDateString } from "@/constants/trichogram";
import type { LabExam } from "@/types/labExam";
import type {
  TrichogramFormData,
  TrichogramTabId,
  TrichogramPaymentData,
} from "@/types/labExam/trichogram";

export function useTrichogramForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TrichogramTabId>("patient");
  const [isClosing, setIsClosing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [savedExamData, setSavedExamData] = useState<LabExam | null>(null);
  const [examCostUSD, setExamCostUSD] = useState(0);

  const form = useForm<TrichogramFormData>({
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
      results: "",
    },
  });

  const { watch, setValue, getValues } = form;

  const patientName = watch("patientName");
  const isPatientSelected = Boolean(patientName && patientName.trim() !== "");
  const cost = watch("cost") ?? 0;
  const discount = watch("discount") ?? 0;
  const totalCost = Math.max(0, cost - discount);

  // Mutación
  const { mutate, isPending } = useMutation({
    mutationFn: (data: TrichogramFormData) =>
      createLabExam({
        ...data,
        examType: "trichogram",
      } as any),
    onSuccess: (response) => {
      setSavedExamData(response);
      setShowShareModal(true);
      queryClient.invalidateQueries({ queryKey: ["labExams"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Confirmar pago
  const handlePaymentConfirm = (paymentData: TrichogramPaymentData) => {
    const isPayingInBs = paymentData.addAmountPaidBs > 0;
    const amountPaid = isPayingInBs
      ? paymentData.addAmountPaidBs
      : paymentData.addAmountPaidUSD;
    const currency = isPayingInBs ? "Bs" : "USD";

    const finalData: TrichogramFormData = {
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
  const handleTabChange = (tab: TrichogramTabId) => {
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

  // Cerrar modal share
  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setSavedExamData(null);
    navigate(-1);
  };

  // Submit
  const onSubmit = (data: TrichogramFormData) => {
    if (!isPatientSelected) {
      toast.error("Debes seleccionar un paciente primero");
      setActiveTab("patient");
      return;
    }

    if (!data.results?.trim()) {
      toast.error("Los resultados son obligatorios");
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

  const currentTabIndex = TRICHOGRAM_TABS.findIndex((t) => t.id === activeTab);

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