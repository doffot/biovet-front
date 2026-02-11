import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import {
  ArrowLeft,
  Loader2,
  ClipboardList,
  Stethoscope,
  FileText,
  Check,
  X,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { getPatientById } from "../../api/patientAPI";
import {
  getConsultationById,
  updateConsultation,
} from "../../api/consultationAPI";
import { toast } from "../../components/Toast";
import type { ConsultationFormData } from "../../types/consultation";
import AnamnesisTab from "@/components/consultations/AnamnesisTab";
import PhysicalExamTab from "@/components/consultations/PhysicalExamTab";
import DiagnosisTab from "@/components/consultations/DiagnosisTab";

const TABS = [
  { id: "anamnesis", label: "Anamnesis", icon: ClipboardList },
  { id: "examen", label: "Examen Físico", icon: Stethoscope },
  { id: "diagnostico", label: "Diagnóstico", icon: FileText },
] as const;

type TabId = (typeof TABS)[number]["id"];

const ANAMNESIS_FIELDS = [
  "reasonForVisit", "symptomOnset", "symptomEvolution", "isNeutered",
  "appetite", "breathingDifficulty", "itchingOrExcessiveLicking",
  "feverSigns", "lethargyOrWeakness"
] as const;

const PHYSICAL_EXAM_FIELDS = [
  "temperature", "heartRate", "respiratoryRate", "weight"
] as const;

const DIAGNOSIS_FIELDS = [
  "presumptiveDiagnosis", "definitiveDiagnosis", "treatmentPlan", "cost"
] as const;

export default function EditConsultationView() {
  const { patientId, consultationId } = useParams<{ patientId: string; consultationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabId>("anamnesis");
  const [isClosing, setIsClosing] = useState(false);
  // ✅ FIX 1: Flag para resetear solo UNA VEZ
  const hasLoadedData = useRef(false);

  const methods = useForm<ConsultationFormData>({
    defaultValues: {
      consultationDate: new Date().toISOString().split("T")[0],
      isDraft: false,
      reasonForVisit: "",
      symptomOnset: "",
      symptomEvolution: "",
      isNeutered: undefined,
      appetite: "",
      breathingDifficulty: undefined,
      itchingOrExcessiveLicking: undefined,
      feverSigns: undefined,
      lethargyOrWeakness: undefined,
      cohabitantAnimals: "",
      contactWithStrays: "",
      feeding: "",
      vomiting: "",
      bowelMovementFrequency: "",
      stoolConsistency: "",
      bloodOrParasitesInStool: "",
      normalUrination: "",
      urineFrequencyAndAmount: "",
      urineColor: "",
      painOrDifficultyUrinating: "",
      cough: "",
      sneezing: "",
      hairLossOrSkinLesions: "",
      eyeDischarge: "",
      earIssues: "",
      currentTreatment: "",
      medications: "",
      previousIllnesses: "",
      previousSurgeries: "",
      adverseReactions: "",
      temperature: "",
      heartRate: "",
      respiratoryRate: "",
      weight: "",
      lymphNodes: "",
      capillaryRefillTime: "",
      integumentarySystem: "",
      cardiovascularSystem: "",
      ocularSystem: "",
      respiratorySystem: "",
      nervousSystem: "",
      musculoskeletalSystem: "",
      gastrointestinalSystem: "",
      presumptiveDiagnosis: "",
      definitiveDiagnosis: "",
      requestedTests: "",
      treatmentPlan: "",
      cost: "",
      discount: "",
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = methods;

  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  // ✅ FIX 2: Desactivar refetch automático para evitar sobreescrituras
  const { data: consultation, isLoading: isLoadingConsultation } = useQuery({
    queryKey: ["consultation", consultationId],
    queryFn: () => getConsultationById(consultationId!),
    enabled: !!consultationId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  // ✅ FIX 3: Reset SOLO una vez cuando llegan los datos por primera vez
  useEffect(() => {
    if (!consultation || hasLoadedData.current) return;
    hasLoadedData.current = true;

    reset({
      consultationDate: consultation.consultationDate?.split("T")[0] || new Date().toISOString().split("T")[0],
      isDraft: false,
      reasonForVisit: consultation.reasonForVisit ?? "",
      symptomOnset: consultation.symptomOnset ?? "",
      symptomEvolution: consultation.symptomEvolution ?? "",
      isNeutered: consultation.isNeutered ?? undefined,
      appetite: consultation.appetite ?? "",
      breathingDifficulty: consultation.breathingDifficulty ?? undefined,
      itchingOrExcessiveLicking: consultation.itchingOrExcessiveLicking ?? undefined,
      feverSigns: consultation.feverSigns ?? undefined,
      lethargyOrWeakness: consultation.lethargyOrWeakness ?? undefined,
      cohabitantAnimals: consultation.cohabitantAnimals ?? "",
      contactWithStrays: consultation.contactWithStrays ?? "",
      feeding: consultation.feeding ?? "",
      vomiting: consultation.vomiting ?? "",
      bowelMovementFrequency: consultation.bowelMovementFrequency ?? "",
      stoolConsistency: consultation.stoolConsistency ?? "",
      bloodOrParasitesInStool: consultation.bloodOrParasitesInStool ?? "",
      normalUrination: consultation.normalUrination ?? "",
      urineFrequencyAndAmount: consultation.urineFrequencyAndAmount ?? "",
      urineColor: consultation.urineColor ?? "",
      painOrDifficultyUrinating: consultation.painOrDifficultyUrinating ?? "",
      cough: consultation.cough ?? "",
      sneezing: consultation.sneezing ?? "",
      hairLossOrSkinLesions: consultation.hairLossOrSkinLesions ?? "",
      eyeDischarge: consultation.eyeDischarge ?? "",
      earIssues: consultation.earIssues ?? "",
      currentTreatment: consultation.currentTreatment ?? "",
      medications: consultation.medications ?? "",
      previousIllnesses: consultation.previousIllnesses ?? "",
      previousSurgeries: consultation.previousSurgeries ?? "",
      adverseReactions: consultation.adverseReactions ?? "",
      temperature: consultation.temperature?.toString() ?? "",
      heartRate: consultation.heartRate?.toString() ?? "",
      respiratoryRate: consultation.respiratoryRate?.toString() ?? "",
      weight: consultation.weight?.toString() ?? "",
      lymphNodes: consultation.lymphNodes ?? "",
      capillaryRefillTime: consultation.capillaryRefillTime ?? "",
      integumentarySystem: consultation.integumentarySystem ?? "",
      cardiovascularSystem: consultation.cardiovascularSystem ?? "",
      ocularSystem: consultation.ocularSystem ?? "",
      respiratorySystem: consultation.respiratorySystem ?? "",
      nervousSystem: consultation.nervousSystem ?? "",
      musculoskeletalSystem: consultation.musculoskeletalSystem ?? "",
      gastrointestinalSystem: consultation.gastrointestinalSystem ?? "",
      presumptiveDiagnosis: consultation.presumptiveDiagnosis ?? "",
      definitiveDiagnosis: consultation.definitiveDiagnosis ?? "",
      requestedTests: consultation.requestedTests ?? "",
      treatmentPlan: consultation.treatmentPlan ?? "",
      cost: consultation.cost?.toString() ?? "",
      discount: consultation.discount?.toString() ?? "",
    });
  }, [consultation, reset]);

  // ✅ FIX 4: Mutation con invalidación correcta y navegación segura
  const { mutate: submitUpdate, isPending } = useMutation({
    mutationFn: (data: Partial<ConsultationFormData>) =>
      updateConsultation(consultationId!, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["consultation", consultationId] }),
        queryClient.invalidateQueries({ queryKey: ["consultations", patientId] }),
        queryClient.invalidateQueries({ queryKey: ["consultations"] }),
      ]);
      toast.success("Consulta actualizada exitosamente");
      handleClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const getTabErrors = (tabId: TabId): string[] => {
    const tabErrors: string[] = [];
    const errorKeys = Object.keys(errors);

    if (tabId === "anamnesis") {
      ANAMNESIS_FIELDS.forEach(field => {
        if (errorKeys.includes(field)) tabErrors.push(field);
      });
    } else if (tabId === "examen") {
      PHYSICAL_EXAM_FIELDS.forEach(field => {
        if (errorKeys.includes(field)) tabErrors.push(field);
      });
    } else if (tabId === "diagnostico") {
      DIAGNOSIS_FIELDS.forEach(field => {
        if (errorKeys.includes(field)) tabErrors.push(field);
      });
    }

    return tabErrors;
  };

  const isTabValid = (tabId: TabId): boolean => {
    const values = getValues();

    const isEmpty = (value: unknown): boolean => {
      if (value === null || value === undefined) return true;
      if (typeof value === "string" && value.trim() === "") return true;
      return false;
    };

    if (tabId === "anamnesis") {
      return ANAMNESIS_FIELDS.every(field => !isEmpty(values[field]));
    } else if (tabId === "examen") {
      return PHYSICAL_EXAM_FIELDS.every(field => !isEmpty(values[field]));
    } else if (tabId === "diagnostico") {
      return DIAGNOSIS_FIELDS.every(field => !isEmpty(values[field]));
    }

    return false;
  };

  const handleTabChange = (newTab: TabId) => {
    setActiveTab(newTab);
  };

  // ✅ FIX 5: Navegación directa a la lista de consultas
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => navigate(`/patients/${patientId}/consultations`), 300);
  };

  // ✅ FIX 6: Limpieza de datos mejorada para booleanos
  const onSubmit = (data: ConsultationFormData) => {
    const cleanedData: Record<string, unknown> = {
      ...data,
      isDraft: false,
      temperature: data.temperature ? Number(data.temperature) : undefined,
      heartRate: data.heartRate ? Number(data.heartRate) : undefined,
      respiratoryRate: data.respiratoryRate ? Number(data.respiratoryRate) : undefined,
      weight: data.weight ? Number(data.weight) : undefined,
      cost: data.cost ? Number(data.cost) : undefined,
      discount: data.discount ? Number(data.discount) : 0,
    };

    // Limpiar solo null/undefined, preservar false y ""
    Object.keys(cleanedData).forEach(key => {
      const value = cleanedData[key];
      if (value === null || value === undefined) {
        delete cleanedData[key];
      }
    });

    submitUpdate(cleanedData as Partial<ConsultationFormData>);
  };

  const onError = () => {
    if (getTabErrors("anamnesis").length > 0 || !isTabValid("anamnesis")) {
      setActiveTab("anamnesis");
      toast.error("Complete los campos obligatorios en Anamnesis");
    } else if (getTabErrors("examen").length > 0 || !isTabValid("examen")) {
      setActiveTab("examen");
      toast.error("Complete los campos obligatorios en Examen Físico");
    } else if (getTabErrors("diagnostico").length > 0 || !isTabValid("diagnostico")) {
      setActiveTab("diagnostico");
      toast.error("Complete los campos obligatorios en Diagnóstico");
    }
  };

  if (isLoadingPatient || isLoadingConsultation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-dark-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-biovet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-surface-500 uppercase tracking-widest">
            Cargando consulta...
          </p>
        </div>
      </div>
    );
  }

  if (!consultation || !patient) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-dark-400">
        <div className="text-center space-y-3">
          <p className="text-danger-500 font-bold">Error: Datos no encontrados</p>
          <button onClick={() => navigate(-1)} className="btn-secondary">Volver</button>
        </div>
      </div>
    );
  }

  const isFormValid = isTabValid("anamnesis") && isTabValid("examen") && isTabValid("diagnostico");

  return (
    <FormProvider {...methods}>
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      <div
        className={`fixed inset-0 z-50 bg-white dark:bg-dark-200 flex flex-col transform transition-transform duration-300 ease-out ${
          isClosing ? "translate-x-full" : "translate-x-0"
        }`}
      >
        <header className="shrink-0 bg-linear-to-r from-biovet-600 to-biovet-700 text-white px-4 sm:px-6 py-4 sm:py-5">
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
                    <Pencil className="w-4 h-4 text-biovet-200" />
                    <h1 className="text-lg sm:text-xl font-bold">Editar Consulta</h1>
                  </div>
                  <p className="text-biovet-100 text-xs sm:text-sm mt-0.5">
                    {patient.name} • {patient.species}
                    <span className="hidden sm:inline"> • {patient.breed}</span>
                    <span className="hidden sm:inline text-biovet-200">
                      {" "}• {new Date(consultation.consultationDate).toLocaleDateString('es-ES', { dateStyle: 'medium' })}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <nav className="flex gap-1 mt-4 sm:mt-5 bg-white/10 p-1 rounded-xl">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isCompleted = isTabValid(tab.id);
                const hasErrors = getTabErrors(tab.id).length > 0;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-white text-biovet-600 shadow-lg"
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
                    <span className="hidden xs:inline sm:inline">{tab.label}</span>
                    {hasErrors && !isActive && !isCompleted && (
                      <span className="w-2 h-2 bg-amber-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-surface-50 dark:bg-dark-300">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-32 sm:pb-6">
            <form onSubmit={handleSubmit(onSubmit, onError)}>
              <div className="bg-white dark:bg-dark-200 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-dark-100">
                {activeTab === "anamnesis" && <AnamnesisTab />}
                {activeTab === "examen" && <PhysicalExamTab />}
                {activeTab === "diagnostico" && <DiagnosisTab />}
              </div>
            </form>
          </div>
        </main>

        <footer className="shrink-0 fixed bottom-0 left-0 right-0 sm:relative bg-white dark:bg-dark-200 border-t border-slate-200 dark:border-dark-100 px-4 sm:px-6 py-3 sm:py-4 mb-16 sm:mb-0 z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="hidden md:flex items-center gap-2">
              {TABS.map((tab) => {
                const isCompleted = isTabValid(tab.id);
                const hasErrors = getTabErrors(tab.id).length > 0;

                return (
                  <div
                    key={tab.id}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      activeTab === tab.id
                        ? "bg-biovet-500 scale-125"
                        : isCompleted
                          ? "bg-emerald-500"
                          : hasErrors
                            ? "bg-amber-400"
                            : "bg-slate-200 dark:bg-dark-100"
                    }`}
                  />
                );
              })}
              <span className="text-xs text-slate-400 ml-2">
                Paso {TABS.findIndex((t) => t.id === activeTab) + 1} de {TABS.length}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => {
                  const idx = TABS.findIndex((t) => t.id === activeTab);
                  if (idx > 0) handleTabChange(TABS[idx - 1].id);
                }}
                disabled={activeTab === "anamnesis"}
                className="btn-secondary px-3 sm:px-6 py-2.5 flex-1 md:flex-none disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              <div className="flex md:hidden items-center gap-1.5 px-2">
                {TABS.map((tab) => {
                  const isCompleted = isTabValid(tab.id);
                  const hasErrors = getTabErrors(tab.id).length > 0;

                  return (
                    <div
                      key={tab.id}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        activeTab === tab.id
                          ? "bg-biovet-500 scale-125"
                          : isCompleted
                            ? "bg-emerald-500"
                            : hasErrors
                              ? "bg-amber-400"
                              : "bg-slate-300"
                      }`}
                    />
                  );
                })}
              </div>

              {activeTab === "diagnostico" ? (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit, onError)}
                  disabled={isPending}
                  className={`px-4 sm:px-8 py-2.5 flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 text-sm rounded-lg font-medium transition-all ${
                    isFormValid && !isPending
                      ? "bg-biovet-600 hover:bg-biovet-700 text-white shadow-sm"
                      : "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                  }`}
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  <span>{isPending ? "Guardando..." : "Guardar Cambios"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const idx = TABS.findIndex((t) => t.id === activeTab);
                    if (idx < TABS.length - 1) handleTabChange(TABS[idx + 1].id);
                  }}
                  className="btn-primary px-4 sm:px-8 py-2.5 flex-1 md:flex-none flex items-center justify-center gap-1 sm:gap-2 text-sm"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>
    </FormProvider>
  );
}