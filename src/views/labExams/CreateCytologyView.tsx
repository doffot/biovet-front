// src/views/labExams/CreateCytologyView.tsx
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Microscope,
  User,
  FileText,
  X,
  Check,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Calendar,
  DollarSign,
  Percent,
  Stethoscope,
  Palette,
  FlaskConical,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { toast } from "../../components/Toast";
import { createLabExam } from "../../api/labExamAPI";
import { PatientSelectionTab } from "../../components/labexam/PatientSelectionTab";
import { PaymentModal } from "../../components/payment/PaymentModal";

// =============================================
// TIPOS
// =============================================
interface CytologyFormData {
  patientId?: string;
  patientName: string;
  species: string;
  breed?: string;
  sex?: string;
  age?: string;
  weight?: number;
  cost: number;
  discount?: number;
  date: string;
  treatingVet?: string;
  ownerName?: string;
  ownerPhone?: string;
  sampleType: string;
  coloration: string;
  results: string;
  paymentMethodId?: string;
  paymentReference?: string;
  exchangeRate?: number;
  paymentAmount?: number;
  paymentCurrency?: string;
  isPartialPayment?: boolean;
  creditAmountUsed?: number;
}

// =============================================
// CONSTANTES
// =============================================
const TABS = [
  { id: "patient", label: "Paciente", icon: User },
  { id: "exam", label: "Examen", icon: FlaskConical },
  { id: "results", label: "Resultados", icon: FileText },
] as const;

type TabId = (typeof TABS)[number]["id"];

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const COLORATION_OPTIONS = [
  "Diff-Quick",
  "Giemsa",
  "Wright",
  "Papanicolaou",
  "Gram",
  "Ziehl-Neelsen",
  "Azul de metileno",
  "Otro",
];

const SAMPLE_TYPE_OPTIONS = [
  "Aspirado con aguja fina (PAAF)",
  "Impronta",
  "Raspado",
  "Hisopado",
  "Líquido cefalorraquídeo",
  "Líquido sinovial",
  "Líquido pleural",
  "Líquido abdominal",
  "Orina (sedimento)",
  "Otro",
];

// =============================================
// COMPONENTE
// =============================================
export default function CreateCytologyView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabId>("patient");
  const [isClosing, setIsClosing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [examCostUSD, setExamCostUSD] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<CytologyFormData>({
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
      sampleType: "",
      coloration: "",
      results: "",
      patientId: undefined,
    },
  });

  const patientName = watch("patientName");
  const isPatientSelected = Boolean(patientName && patientName.trim() !== "");
  const cost = watch("cost") ?? 0;
  const discount = watch("discount") ?? 0;
  const totalCost = Math.max(0, cost - discount);

  // Mutación
  const { mutate, isPending } = useMutation({
    mutationFn: (data: CytologyFormData) =>
      createLabExam({
        ...data,
        examType: "cytology",
      } as any),
    onSuccess: () => {
      toast.success("Citología registrada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["labExams"] });
      setTimeout(() => navigate(-1), 1500);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Confirmar pago
  const handlePaymentConfirm = (paymentData: {
    paymentMethodId?: string;
    reference?: string;
    addAmountPaidUSD: number;
    addAmountPaidBs: number;
    exchangeRate: number;
    isPartial: boolean;
    creditAmountUsed?: number;
  }) => {
    const isPayingInBs = paymentData.addAmountPaidBs > 0;
    const amountPaid = isPayingInBs
      ? paymentData.addAmountPaidBs
      : paymentData.addAmountPaidUSD;
    const currency = isPayingInBs ? "Bs" : "USD";

    const finalData: CytologyFormData = {
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
  const onSubmit = (data: CytologyFormData) => {
    if (!isPatientSelected) {
      toast.error("Debes seleccionar un paciente primero");
      setActiveTab("patient");
      return;
    }

    if (!data.sampleType?.trim()) {
      toast.error("El tipo de muestra es obligatorio");
      setActiveTab("results");
      return;
    }

    if (!data.coloration?.trim()) {
      toast.error("La coloración es obligatoria");
      setActiveTab("results");
      return;
    }

    if (!data.results?.trim()) {
      toast.error("Los resultados son obligatorios");
      setActiveTab("results");
      return;
    }

    const finalCost = data.cost ?? 0;
    if (finalCost <= 0) {
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

  const currentTabIndex = TABS.findIndex((t) => t.id === activeTab);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Panel Fullscreen */}
      <div
        className={`fixed inset-0 z-50 bg-white dark:bg-dark-200 flex flex-col transform transition-transform duration-300 ease-out ${
          isClosing ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {/* ═══ HEADER ═══ */}
        <header className="shrink-0 bg-linear-to-r from-purple-600 to-purple-700 text-white px-4 sm:px-6 py-4 sm:py-5">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Microscope className="w-5 h-5 hidden sm:block" />
                    <h1 className="text-lg sm:text-xl font-bold font-heading">
                      Nueva Citología
                    </h1>
                  </div>
                  {isPatientSelected && (
                    <p className="text-purple-100 text-xs sm:text-sm mt-0.5">
                      {patientName} • {watch("species")}
                      <span className="hidden sm:inline">
                        {" "}
                        • {watch("breed")}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Acciones header */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {isPatientSelected && (
                  <button
                    type="button"
                    onClick={handleClearPatient}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cambiar paciente</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <nav className="flex gap-1 mt-4 sm:mt-5 bg-white/10 p-1 rounded-xl">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const tabIndex = TABS.findIndex((t) => t.id === tab.id);
                const isCompleted =
                  tabIndex < currentTabIndex && isPatientSelected;
                const isLocked = tab.id !== "patient" && !isPatientSelected;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    disabled={isLocked}
                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-white text-purple-600 shadow-lg"
                        : isLocked
                          ? "text-white/30 cursor-not-allowed"
                          : isCompleted
                            ? "text-white/90 hover:bg-white/10"
                            : "text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {isCompleted && !isActive ? (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
                    ) : (
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                    <span className="hidden xs:inline sm:inline">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        {/* ═══ CONTENIDO ═══ */}
        <main className="flex-1 overflow-y-auto bg-surface-50 dark:bg-dark-300">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-32 sm:pb-6">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="bg-white dark:bg-dark-200 rounded-2xl p-4 sm:p-6 shadow-sm border border-surface-200 dark:border-dark-100">
                {/* Tab Paciente */}
                {activeTab === "patient" && (
                  <PatientSelectionTab
                    onPatientSelected={() => setActiveTab("exam")}
                    setValues={setValue as any}
                    currentPatientName={watch("patientName")}
                  />
                )}

                {/* Tab Examen */}
                {activeTab === "exam" && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-surface-200 dark:border-dark-100">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <FlaskConical className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                          Datos del Examen
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Información general de la citología
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Fecha */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-500" />
                          Fecha
                          <span className="text-danger-500">*</span>
                        </label>
                        <input
                          type="date"
                          {...register("date", { required: "Requerido" })}
                          className={`input ${errors.date ? "input-error" : ""}`}
                        />
                        {errors.date && (
                          <p className="error-text flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.date.message}
                          </p>
                        )}
                      </div>

                      {/* Costo */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-success-500" />
                          Costo
                          <span className="text-danger-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register("cost", {
                              required: "Requerido",
                              min: { value: 0.01, message: "Mayor a 0" },
                              valueAsNumber: true,
                            })}
                            className={`input pl-7 ${errors.cost ? "input-error" : ""}`}
                            placeholder="0.00"
                          />
                        </div>
                        {errors.cost && (
                          <p className="error-text flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.cost.message}
                          </p>
                        )}
                      </div>

                      {/* Descuento */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                          <Percent className="w-3.5 h-3.5 text-warning-500" />
                          Descuento
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register("discount", {
                              valueAsNumber: true,
                              min: { value: 0, message: "No negativo" },
                            })}
                            className="input pl-7"
                            placeholder="0.00"
                          />
                        </div>
                        {discount > 0 && (
                          <p className="mt-1 text-[10px] text-success-600 dark:text-success-400 font-medium">
                            Total: ${totalCost.toFixed(2)}
                          </p>
                        )}
                      </div>

                      {/* Veterinario */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-purple-400" />
                          Veterinario
                        </label>
                        <input
                          type="text"
                          {...register("treatingVet")}
                          className="input"
                          placeholder="Dr. Nombre"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Resultados */}
                {activeTab === "results" && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-surface-200 dark:border-dark-100">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <Microscope className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                          Resultados de Citología
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Datos del análisis citológico
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tipo de Muestra */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                          <FlaskConical className="w-3.5 h-3.5 text-purple-500" />
                          Tipo de Muestra
                          <span className="text-danger-500">*</span>
                        </label>
                        <select
                          {...register("sampleType", {
                            required: "Requerido",
                          })}
                          className={`input ${errors.sampleType ? "input-error" : ""}`}
                        >
                          <option value="">Seleccionar...</option>
                          {SAMPLE_TYPE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {errors.sampleType && (
                          <p className="error-text flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.sampleType.message}
                          </p>
                        )}
                      </div>

                      {/* Coloración */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                          <Palette className="w-3.5 h-3.5 text-pink-500" />
                          Coloración
                          <span className="text-danger-500">*</span>
                        </label>
                        <select
                          {...register("coloration", { required: "Requerido" })}
                          className={`input ${errors.coloration ? "input-error" : ""}`}
                        >
                          <option value="">Seleccionar...</option>
                          {COLORATION_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {errors.coloration && (
                          <p className="error-text flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.coloration.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Resultados */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                        <FileText className="w-3.5 h-3.5 text-purple-500" />
                        Resultados
                        <span className="text-danger-500">*</span>
                      </label>
                      <textarea
                        {...register("results", {
                          required: "Los resultados son obligatorios",
                        })}
                        placeholder="Descripción detallada de los hallazgos citológicos..."
                        className={`w-full bg-surface-50 dark:bg-dark-100 border rounded-lg px-3 py-2 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 resize-none transition-all text-slate-700 dark:text-slate-200 ${
                          errors.results
                            ? "border-danger-500 focus:border-danger-600 focus:ring-danger-500/20"
                            : "border-surface-200 dark:border-slate-700 hover:border-purple-500/50 focus:border-purple-500 focus:ring-purple-500/20"
                        }`}
                        rows={6}
                      />
                      {errors.results && (
                        <p className="error-text flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.results.message}
                        </p>
                      )}
                    </div>

                    {/* Tip */}
                    <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-800 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400 shrink-0" />
                      <p className="text-[11px] text-purple-700 dark:text-purple-300">
                        Incluye descripción celular, hallazgos relevantes y
                        diagnóstico morfológico.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </main>

        {/* ═══ FOOTER ═══ */}
        <footer className="shrink-0 fixed bottom-0 left-0 right-0 sm:relative bg-white dark:bg-dark-200 border-t border-surface-200 dark:border-dark-100 px-4 sm:px-6 py-3 sm:py-4 mb-16 sm:mb-0 z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Indicadores - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {TABS.map((tab, index) => {
                const isLocked = tab.id !== "patient" && !isPatientSelected;
                return (
                  <div
                    key={tab.id}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      activeTab === tab.id
                        ? "bg-purple-500 scale-125"
                        : isLocked
                          ? "bg-slate-200 dark:bg-dark-100"
                          : index < currentTabIndex
                            ? "bg-emerald-500"
                            : "bg-slate-200 dark:bg-dark-100"
                    }`}
                  />
                );
              })}
              <span className="text-xs text-slate-400 ml-2">
                Paso {currentTabIndex + 1} de {TABS.length}
              </span>
            </div>

            {/* Botones */}
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => {
                  if (currentTabIndex > 0)
                    handleTabChange(TABS[currentTabIndex - 1].id);
                }}
                disabled={currentTabIndex === 0}
                className="btn-secondary px-3 sm:px-6 py-2.5 flex-1 md:flex-none disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              {/* Dots móvil */}
              <div className="flex md:hidden items-center gap-1.5 px-2">
                {TABS.map((tab, index) => {
                  const isLocked = tab.id !== "patient" && !isPatientSelected;
                  return (
                    <div
                      key={tab.id}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        activeTab === tab.id
                          ? "bg-purple-500 scale-125"
                          : isLocked
                            ? "bg-slate-300 dark:bg-slate-600"
                            : index < currentTabIndex
                              ? "bg-emerald-500"
                              : "bg-slate-300 dark:bg-slate-600"
                      }`}
                    />
                  );
                })}
              </div>

              {activeTab === "results" ? (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isPending || !isPatientSelected}
                  className="px-4 sm:px-8 py-2.5 flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 text-sm rounded-lg font-semibold transition-all bg-purple-600 hover:bg-purple-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  <span>{isPending ? "Guardando..." : "Guardar"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "patient" && !isPatientSelected) {
                      toast.error("Selecciona un paciente primero");
                      return;
                    }
                    if (currentTabIndex < TABS.length - 1) {
                      handleTabChange(TABS[currentTabIndex + 1].id);
                    }
                  }}
                  disabled={activeTab === "patient" && !isPatientSelected}
                  className="px-4 sm:px-8 py-2.5 flex-1 md:flex-none flex items-center justify-center gap-1 sm:gap-2 text-sm rounded-lg font-semibold transition-all bg-purple-600 hover:bg-purple-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>

      {/* Modal de Pago */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handlePaymentConfirm}
          amountUSD={examCostUSD}
          patient={{
            name: watch("patientName"),
          }}
        />
      )}
    </>
  );
}