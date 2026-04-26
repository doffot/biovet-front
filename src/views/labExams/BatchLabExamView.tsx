// src/views/labExams/BatchLabExamView.tsx
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, FlaskConical, User, Microscope, FileText } from "lucide-react";
import { toast } from "../../components/Toast";
import { createLabExam } from "../../api/labExamAPI";
import { PaymentModal } from "../../components/payment/PaymentModal";
import { BatchPatientList } from "../../components/labexam/batch/BatchPatientList";
import { BatchGeneralTab } from "../../components/labexam/batch/BatchGeneralTab";
import { BatchDifferentialTab } from "../../components/labexam/batch/BatchDifferentialTab";
import { BatchObservationsTab } from "../../components/labexam/batch/BatchObservationsTab";
import type { BatchExam } from "@/types/batch";
import type { DifferentialCount, LabExamFormData } from "@/types/labExam";

// ── Tabs ──────────────────────────────────────────────────
const TABS = [
  { id: "patients", label: "Pacientes", icon: User },
  { id: "general", label: "Hemograma", icon: FlaskConical },
  { id: "differential", label: "Diferencial", icon: Microscope },
  { id: "observations", label: "Observaciones", icon: FileText },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function BatchLabExamView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabId>("patients");
  const [isClosing, setIsClosing] = useState(false);
  const [exams, setExams] = useState<BatchExam[]>([]);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [savingExamId, setSavingExamId] = useState<string | null>(null);

  // Payment modal
  const [paymentQueue, setPaymentQueue] = useState<BatchExam[]>([]);
  const [currentPaymentExam, setCurrentPaymentExam] =
    useState<BatchExam | null>(null);

  // ── Mutation (reutiliza tu createLabExam existente) ───
  const { isPending, mutateAsync } = useMutation({
    mutationFn: (data: LabExamFormData) => createLabExam(data),
  });

  // ══════════════════════════════════════════════════════
  // HANDLERS DE EXÁMENES
  // ══════════════════════════════════════════════════════

  const handleAddExam = useCallback((exam: BatchExam) => {
    setExams((prev) => {
      if (
        exam.formData.patientId &&
        prev.some((e) => e.formData.patientId === exam.formData.patientId)
      ) {
        toast.error("Este paciente ya está en el lote");
        return prev;
      }
      return [...prev, exam];
    });
    setActiveExamId((prev) => prev || exam.tempId);
  }, []);

  const handleRemoveExam = useCallback((tempId: string) => {
    setExams((prev) => {
      const next = prev.filter((e) => e.tempId !== tempId);
      return next;
    });
    setActiveExamId((prev) => {
      if (prev === tempId) return null;
      return prev;
    });
  }, []);

  const handleUpdateExam = useCallback(
    (tempId: string, updates: Partial<LabExamFormData>) => {
      setExams((prev) =>
        prev.map((exam) =>
          exam.tempId === tempId
            ? {
                ...exam,
                formData: {
                  ...exam.formData,
                  ...updates,
                },
              }
            : exam
        )
      );
    },
    []
  );

  const handleUpdateDifferential = useCallback(
    (tempId: string, differentialCount: DifferentialCount, totalCells: number) => {
      setExams((prev) =>
        prev.map((exam) =>
          exam.tempId === tempId
            ? {
                ...exam,
                differentialCount,
                totalCells,
                formData: {
                  ...exam.formData,
                  differentialCount,
                  totalCells,
                },
              }
            : exam
        )
      );
    },
    []
  );

  const handleChangeActiveExam = useCallback((tempId: string) => {
    setActiveExamId(tempId);
  }, []);

  // ══════════════════════════════════════════════════════
  // NAVEGACIÓN DE TABS
  // ══════════════════════════════════════════════════════

  const handleTabChange = (tab: TabId) => {
    if (tab !== "patients" && exams.length === 0) {
      toast.error("Agrega al menos un paciente primero");
      return;
    }
    setActiveTab(tab);
    if (!activeExamId && exams.length > 0) {
      setActiveExamId(exams[0].tempId);
    }
  };

  // ══════════════════════════════════════════════════════
  // GUARDADO DE UN EXAMEN
  // ══════════════════════════════════════════════════════

  const saveExam = async (exam: BatchExam) => {
    setSavingExamId(exam.tempId);

    setExams((prev) =>
      prev.map((e) =>
        e.tempId === exam.tempId ? { ...e, status: "saving" } : e
      )
    );

    try {
      const finalData: LabExamFormData = {
        ...exam.formData,
        differentialCount: exam.differentialCount,
        totalCells: exam.totalCells,
        hemotropico: exam.formData.hemotropico?.trim() || undefined,
        observacion: exam.formData.observacion?.trim() || undefined,
        ownerName: exam.formData.ownerName?.trim() || undefined,
        ownerPhone: exam.formData.ownerPhone?.trim() || undefined,
        ...(exam.paymentData && {
          paymentMethodId: exam.paymentData.paymentMethodId,
          paymentReference: exam.paymentData.reference,
          exchangeRate: exam.paymentData.exchangeRate,
          paymentAmount:
            exam.paymentData.addAmountPaidBs > 0
              ? exam.paymentData.addAmountPaidBs
              : exam.paymentData.addAmountPaidUSD,
          paymentCurrency:
            exam.paymentData.addAmountPaidBs > 0 ? "Bs" : "USD",
          isPartialPayment: exam.paymentData.isPartial,
          creditAmountUsed: exam.paymentData.creditAmountUsed,
        }),
      };

      await mutateAsync(finalData);

      setExams((prev) =>
        prev.map((e) =>
          e.tempId === exam.tempId ? { ...e, status: "saved" } : e
        )
      );

      toast.success(`${exam.formData.patientName} guardado ✅`);
    } catch (error: any) {
      setExams((prev) =>
        prev.map((e) =>
          e.tempId === exam.tempId
            ? {
                ...e,
                status: "error",
                errorMessage: error.message || "Error al guardar",
              }
            : e
        )
      );
      toast.error(`Error en ${exam.formData.patientName}`);
    } finally {
      setSavingExamId(null);
    }
  };

  // ══════════════════════════════════════════════════════
  // GUARDAR INDIVIDUAL
  // ══════════════════════════════════════════════════════

  const handleSubmitSingle = async (tempId: string) => {
    const exam = exams.find((e) => e.tempId === tempId);
    if (!exam) return;

    if (!exam.formData.cost || exam.formData.cost <= 0) {
      toast.error("El costo del examen debe ser mayor a 0");
      return;
    }

    // Si es externo, abrir payment modal
    if (!exam.formData.patientId) {
      setPaymentQueue([exam]);
      setCurrentPaymentExam(exam);
      return;
    }

    // Si es interno, guardar directo
    await saveExam(exam);
  };

  // ══════════════════════════════════════════════════════
  // GUARDAR TODOS LOS PENDIENTES
  // ══════════════════════════════════════════════════════

  const handleSubmitAll = async () => {
    const pendingExams = exams.filter((e) => e.status === "pending");

    if (pendingExams.length === 0) {
      toast.error("No hay exámenes pendientes por guardar");
      return;
    }

    // Validar que todos tengan costo
    const withoutCost = pendingExams.filter(
      (e) => !e.formData.cost || e.formData.cost <= 0
    );
    if (withoutCost.length > 0) {
      toast.error(
        `Faltan costos en: ${withoutCost.map((e) => e.formData.patientName).join(", ")}`
      );
      return;
    }

    // Separar internos y externos
    const internalExams = pendingExams.filter((e) => e.formData.patientId);
    const externalExams = pendingExams.filter((e) => !e.formData.patientId);

    // Guardar internos directamente
    for (const exam of internalExams) {
      await saveExam(exam);
    }

    // Externos van a la cola de pago
    if (externalExams.length > 0) {
      setPaymentQueue(externalExams);
      setCurrentPaymentExam(externalExams[0]);
    } else if (internalExams.length > 0) {
      handleCheckFinish();
    }
  };

  // ══════════════════════════════════════════════════════
  // CONFIRMACIÓN DE PAGO
  // ══════════════════════════════════════════════════════

  const handlePaymentConfirm = async (paymentData: {
    paymentMethodId?: string;
    reference?: string;
    addAmountPaidUSD: number;
    addAmountPaidBs: number;
    exchangeRate: number;
    isPartial: boolean;
    creditAmountUsed?: number;
  }) => {
    if (!currentPaymentExam) return;

    const examWithPayment: BatchExam = {
      ...currentPaymentExam,
      paymentData,
    };

    await saveExam(examWithPayment);

    const nextQueue = paymentQueue.filter(
      (e) => e.tempId !== currentPaymentExam.tempId
    );
    setPaymentQueue(nextQueue);

    if (nextQueue.length > 0) {
      setCurrentPaymentExam(nextQueue[0]);
    } else {
      setCurrentPaymentExam(null);
      handleCheckFinish();
    }
  };

  // ══════════════════════════════════════════════════════
  // VERIFICAR SI TERMINÓ TODO
  // ══════════════════════════════════════════════════════

  const handleCheckFinish = () => {
    const updatedExams = exams;
    const savedCount = updatedExams.filter((e) => e.status === "saved").length;
    const errorCount = updatedExams.filter((e) => e.status === "error").length;
    const totalCount = updatedExams.length;

    if (savedCount === totalCount) {
      toast.success(`Todos los exámenes guardados (${savedCount}) 🎉`);
      queryClient.invalidateQueries({ queryKey: ["labExams"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setTimeout(() => navigate(-1), 1500);
    } else if (errorCount > 0) {
      toast.error(
        `${savedCount} guardados, ${errorCount} con error. Revisa los pendientes.`
      );
      queryClient.invalidateQueries({ queryKey: ["labExams"] });
    }
  };

  const handleClose = () => {
    const savedCount = exams.filter((e) => e.status === "saved").length;
    if (savedCount > 0) {
      queryClient.invalidateQueries({ queryKey: ["labExams"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    }
    setIsClosing(true);
    setTimeout(() => navigate(-1), 300);
  };

  const currentTabIndex = TABS.findIndex((t) => t.id === activeTab);
  const hasExams = exams.length > 0;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`fixed inset-0 z-50 bg-white dark:bg-dark-200 flex flex-col transform transition-transform duration-300 ease-out ${
          isClosing ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {/* ══ HEADER ══ */}
        <header className="shrink-0 bg-linear-to-r from-biovet-600 to-biovet-700 text-white px-4 sm:px-6 py-4 sm:py-5">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 hidden sm:block" />
                    <h1 className="text-lg sm:text-xl font-bold font-heading">
                      Lote de Hemogramas
                    </h1>
                  </div>
                  <p className="text-biovet-100 text-xs sm:text-sm mt-0.5">
                    {exams.length === 0
                      ? "Agrega pacientes para comenzar"
                      : `${exams.length} paciente${exams.length > 1 ? "s" : ""} • ${exams.filter((e) => e.status === "saved").length} guardados`}
                  </p>
                </div>
              </div>

              {/* Badges */}
              {hasExams && (
                <div className="flex items-center gap-2">
                  {exams.filter((e) => e.status === "saved").length > 0 && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 font-medium">
                      ✅ {exams.filter((e) => e.status === "saved").length} guardados
                    </span>
                  )}
                  {exams.filter((e) => e.status === "error").length > 0 && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-200 font-medium">
                      ❌ {exams.filter((e) => e.status === "error").length} errores
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Tabs */}
            <nav className="flex gap-1 mt-4 sm:mt-5 bg-white/10 p-1 rounded-xl">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isLocked = tab.id !== "patients" && !hasExams;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    disabled={isLocked}
                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-white text-biovet-600 shadow-lg"
                        : isLocked
                          ? "text-white/30 cursor-not-allowed"
                          : "text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline sm:inline">
                      {tab.label}
                    </span>
                    {tab.id === "patients" && exams.length > 0 && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                          isActive
                            ? "bg-biovet-100 text-biovet-600"
                            : "bg-white/20 text-white"
                        }`}
                      >
                        {exams.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        {/* ══ CONTENIDO ══ */}
        <main className="flex-1 overflow-y-auto bg-surface-50 dark:bg-dark-300">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-32 sm:pb-6">
            <div className="bg-white dark:bg-dark-200 rounded-2xl p-4 sm:p-6 shadow-sm border border-surface-200 dark:border-dark-100">
              {activeTab === "patients" && (
                <BatchPatientList
                  exams={exams}
                  onAddExam={handleAddExam}
                  onRemoveExam={handleRemoveExam}
                />
              )}

              {activeTab === "general" && (
                <BatchGeneralTab
                  exams={exams}
                  activeExamId={activeExamId}
                  onChangeActiveExam={handleChangeActiveExam}
                  onUpdateExam={handleUpdateExam}
                />
              )}

              {activeTab === "differential" && (
                <BatchDifferentialTab
                  exams={exams}
                  activeExamId={activeExamId}
                  onChangeActiveExam={handleChangeActiveExam}
                  onUpdateDifferential={handleUpdateDifferential}
                />
              )}

              {activeTab === "observations" && (
                <BatchObservationsTab
                  exams={exams}
                  activeExamId={activeExamId}
                  onChangeActiveExam={handleChangeActiveExam}
                  onUpdateExam={handleUpdateExam}
                  onSubmitAll={handleSubmitAll}
                  onSubmitSingle={handleSubmitSingle}
                  isPending={isPending}
                  savingExamId={savingExamId}
                />
              )}
            </div>
          </div>
        </main>

        {/* ══ FOOTER ══ */}
        <footer className="shrink-0 fixed bottom-0 left-0 right-0 sm:relative bg-white dark:bg-dark-200 border-t border-surface-200 dark:border-dark-100 px-4 sm:px-6 py-3 sm:py-4 mb-16 sm:mb-0 z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Dots progreso desktop */}
            <div className="hidden md:flex items-center gap-2">
              {TABS.map((tab, index) => (
                <div
                  key={tab.id}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    activeTab === tab.id
                      ? "bg-biovet-500 scale-125"
                      : index < currentTabIndex
                        ? "bg-emerald-500"
                        : "bg-slate-200 dark:bg-dark-100"
                  }`}
                />
              ))}
              <span className="text-xs text-slate-400 ml-2">
                Paso {currentTabIndex + 1} de {TABS.length}
              </span>

              {/* Contador de guardados */}
              {exams.filter((e) => e.status === "saved").length > 0 && (
                <span className="ml-3 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {exams.filter((e) => e.status === "saved").length}/
                  {exams.length} guardados
                </span>
              )}
            </div>

            {/* Botones */}
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => {
                  if (currentTabIndex > 0) {
                    handleTabChange(TABS[currentTabIndex - 1].id);
                  }
                }}
                disabled={currentTabIndex === 0}
                className="btn-secondary px-3 sm:px-6 py-2.5 flex-1 md:flex-none disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                ← <span className="hidden sm:inline">Anterior</span>
              </button>

              {/* Dots móvil */}
              <div className="flex md:hidden items-center gap-1.5 px-2">
                {TABS.map((tab, index) => (
                  <div
                    key={tab.id}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      activeTab === tab.id
                        ? "bg-biovet-500 scale-125"
                        : index < currentTabIndex
                          ? "bg-emerald-500"
                          : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                ))}
              </div>

              {activeTab !== "observations" ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "patients" && exams.length === 0) {
                      toast.error("Agrega al menos un paciente primero");
                      return;
                    }
                    if (currentTabIndex < TABS.length - 1) {
                      handleTabChange(TABS[currentTabIndex + 1].id);
                    }
                  }}
                  disabled={activeTab === "patients" && exams.length === 0}
                  className="btn-primary px-4 sm:px-8 py-2.5 flex-1 md:flex-none flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Siguiente</span> →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitAll}
                  disabled={
                    isPending ||
                    exams.length === 0 ||
                    exams.filter((e) => e.status === "pending").length === 0
                  }
                  className="px-4 sm:px-8 py-2.5 flex-1 md:flex-none flex items-center justify-center gap-2 text-sm rounded-lg font-semibold transition-all bg-biovet-600 hover:bg-biovet-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>⏳ Guardando...</>
                  ) : (
                    <>
                      ✅ Guardar pendientes (
                      {exams.filter((e) => e.status === "pending").length})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>

      {/* ══ PAYMENT MODAL ══ */}
      {currentPaymentExam && (
        <PaymentModal
          isOpen={true}
          onClose={() => {
            setCurrentPaymentExam(null);
            setPaymentQueue([]);
          }}
          onConfirm={handlePaymentConfirm}
          amountUSD={Math.max(
            0,
            (currentPaymentExam.formData.cost || 0) -
              (currentPaymentExam.formData.discount || 0)
          )}
          patient={{
            name: currentPaymentExam.formData.patientName,
          }}
        />
      )}
    </>
  );
}