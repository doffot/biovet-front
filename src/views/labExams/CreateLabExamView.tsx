// src/views/labExams/CreateLabExamView.tsx
import { useForm } from "react-hook-form";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FlaskConical,
  User,
  Microscope,
  FileText,
  X,
  Check,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Undo2,
  RotateCcw,
} from "lucide-react";
import { toast } from "../../components/Toast";
import { createLabExam } from "../../api/labExamAPI";
import { PatientSelectionTab } from "../../components/labexam/PatientSelectionTab";
import { GeneralTab } from "../../components/labexam/GeneralTab";
import { DifferentialTab } from "../../components/labexam/DifferentialTab";
import { ObservationsTab } from "../../components/labexam/ObservationsTab";
import ShareResultsModal from "@/components/labexam/ShareResultsModal";
import type { DifferentialField, LabExam, LabExamFormData } from "@/types/labExam";

// Sonidos
import segmentedSound from "/sounds/segmented.mp3";
import bandSound from "/sounds/band.mp3";
import lymphocytesSound from "/sounds/lymphocytes.mp3";
import monocytesSound from "/sounds/monocytes.mp3";
import basophilsSound from "/sounds/basophils.mp3";
import reticulocytesSound from "/sounds/reticulocytes.mp3";
import eosinophilsSound from "/sounds/eosinophils.mp3";
import nrbcSound from "/sounds/nrbc.mp3";
import errorSound from "/sounds/error.mp3";

const TABS = [
  { id: "patient", label: "Paciente", icon: User },
  { id: "general", label: "Hemograma", icon: FlaskConical },
  { id: "differential", label: "Diferencial", icon: Microscope },
  { id: "observations", label: "Observaciones", icon: FileText },
] as const;

type TabId = (typeof TABS)[number]["id"];

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalValues = {
  canino: {
    hematocrit: [37, 55],
    whiteBloodCells: [6, 17],
    totalProtein: [5.4, 7.8],
    platelets: [175, 500],
    segmentedNeutrophils: [3.3, 11.4],
    bandNeutrophils: [0, 0.3],
    lymphocytes: [1.0, 4.8],
    monocytes: [0.1, 1.4],
    eosinophils: [0.1, 1.3],
    basophils: [0, 0.2],
    nrbc: [0, 0.2],
    reticulocytes: [0, 1.5],
  },
  felino: {
    hematocrit: [30, 45],
    whiteBloodCells: [5.5, 19.5],
    totalProtein: [5.7, 8.9],
    platelets: [180, 500],
    segmentedNeutrophils: [2.5, 12.5],
    bandNeutrophils: [0, 0.3],
    lymphocytes: [1.5, 7.0],
    monocytes: [0.1, 1.4],
    eosinophils: [0.1, 1.5],
    basophils: [0, 0.2],
    nrbc: [0, 0.2],
    reticulocytes: [0, 1.5],
  },
};

export default function CreateLabExamView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [species] = useState<"canino" | "felino">("canino");
  const [activeTab, setActiveTab] = useState<TabId>("patient");
  const [isClosing, setIsClosing] = useState(false);

  const [differentialCount, setDifferentialCount] = useState<
    LabExamFormData["differentialCount"]
  >({
    segmentedNeutrophils: 0,
    bandNeutrophils: 0,
    lymphocytes: 0,
    monocytes: 0,
    basophils: 0,
    reticulocytes: 0,
    eosinophils: 0,
    nrbc: 0,
  });

  const [totalCells, setTotalCells] = useState(0);
  const [lastAction, setLastAction] = useState<{
    field: keyof LabExamFormData["differentialCount"];
  } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [savedExamData, setSavedExamData] = useState<LabExam | null>(null);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LabExamFormData>({
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
      hematocrit: 0,
      whiteBloodCells: 0,
      totalProtein: 0,
      platelets: 0,
      hemotropico: "",
      observacion: "",
      treatingVet: "",
      ownerName: "",
      ownerPhone: "",
      patientId: undefined,
    },
  });

  useEffect(() => {
    setValue("species", species);
  }, [species, setValue]);

  const totalWhiteCells = watch("whiteBloodCells") || 0;
  const patientName = watch("patientName");
  const isPatientSelected = Boolean(patientName && patientName.trim() !== "");

  const calculatedValues = useMemo(() => {
    const calculated = {} as Record<
      keyof LabExamFormData["differentialCount"],
      { percentage: string; absolute: string }
    >;

    Object.keys(differentialCount).forEach((key) => {
      const cellKey = key as keyof LabExamFormData["differentialCount"];
      const percentage =
        totalCells > 0 ? (differentialCount[cellKey] ?? 0) / totalCells : 0;
      const absolute = percentage * totalWhiteCells || 0;

      calculated[cellKey] = {
        percentage: (percentage * 100).toFixed(1),
        absolute: absolute.toFixed(1),
      };
    });

    return calculated;
  }, [differentialCount, totalCells, totalWhiteCells]);

  const differentialFields: DifferentialField[] = useMemo(
    () => [
      { key: "segmentedNeutrophils" as const, sound: new Audio(segmentedSound), label: "Neutrófilos Segmentados", image: "/img/segmentedNeutrophils.png" },
      { key: "bandNeutrophils" as const, sound: new Audio(bandSound), label: "Neutrófilos en Banda", image: "/img/band.png" },
      { key: "lymphocytes" as const, sound: new Audio(lymphocytesSound), label: "Linfocitos", image: "/img/lymphocytes.png" },
      { key: "monocytes" as const, sound: new Audio(monocytesSound), label: "Monocitos", image: "/img/monocytes.png" },
      { key: "basophils" as const, sound: new Audio(basophilsSound), label: "Basófilos", image: "/img/basophils.png" },
      { key: "reticulocytes" as const, sound: new Audio(reticulocytesSound), label: "Reticulocitos", image: "/img/reticulocytes.png" },
      { key: "eosinophils" as const, sound: new Audio(eosinophilsSound), label: "Eosinófilos", image: "/img/eosinophils.png" },
      { key: "nrbc" as const, sound: new Audio(nrbcSound), label: "NRBC", image: "/img/nrbc.png" },
    ],
    []
  );

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LabExamFormData) => createLabExam(data),
    onSuccess: (data) => {
      toast.success("Hemograma registrado exitosamente");
      setSavedExamData(data);
      setShowShareModal(true);
      queryClient.invalidateQueries({ queryKey: ["labExams"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleIncrement = (
    field: keyof LabExamFormData["differentialCount"],
    sound: HTMLAudioElement
  ) => {
    if (totalCells >= 100) {
      toast.error("El conteo total no puede superar 100");
      return;
    }
    setDifferentialCount((prev) => ({
      ...prev,
      [field]: (prev[field] || 0) + 1,
    }));
    setTotalCells((prev) => prev + 1);
    setLastAction({ field });
    sound.currentTime = 0;
    sound.play().catch(() => {});
  };

  const handleUndo = () => {
    if (!lastAction || totalCells === 0) {
      toast.error("No hay acciones para deshacer");
      return;
    }
    const { field } = lastAction;
    if (differentialCount[field] && differentialCount[field]! > 0) {
      setDifferentialCount((prev) => ({
        ...prev,
        [field]: (prev[field] || 0) - 1,
      }));
      setTotalCells((prev) => prev - 1);
      setLastAction(null);
      toast.success("Último conteo deshecho");
    }
  };

  const handleReset = () => {
    setDifferentialCount({
      segmentedNeutrophils: 0,
      bandNeutrophils: 0,
      lymphocytes: 0,
      monocytes: 0,
      basophils: 0,
      reticulocytes: 0,
      eosinophils: 0,
      nrbc: 0,
    });
    setTotalCells(0);
    setLastAction(null);
    toast.success("Conteo diferencial reiniciado");
  };

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

  const handleTabChange = (tab: TabId) => {
    if (tab !== "patient" && !isPatientSelected) {
      toast.error("Primero selecciona un paciente");
      return;
    }
    setActiveTab(tab);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => navigate(-1), 300);
  };

  const isOutOfRange = (
    value: number | string | undefined,
    rangeKey: keyof typeof normalValues.canino
  ) => {
    if (value === undefined || value === null) return false;
    const numValue = Number(value);
    const range = normalValues[species][rangeKey];
    return numValue < range[0] || numValue > range[1];
  };

  const onSubmit = (data: LabExamFormData) => {
    if (!isPatientSelected) {
      toast.error("Debes seleccionar un paciente primero");
      setActiveTab("patient");
      return;
    }

    const finalData: LabExamFormData = {
      ...data,
      differentialCount,
      totalCells,
      ownerName: data.ownerName?.trim() || undefined,
      ownerPhone: data.ownerPhone?.trim() || undefined,
    };

    const cost = finalData.cost ?? 0;
    if (cost <= 0) {
      toast.error("El costo del examen debe ser mayor a 0");
      setActiveTab("general");
      return;
    }

    mutate(finalData);
  };

  useEffect(() => {
    if (totalCells === 100) {
      if (!errorAudioRef.current) {
        errorAudioRef.current = new Audio(errorSound);
      }
      errorAudioRef.current.currentTime = 0;
      errorAudioRef.current.play().catch(() => {});
    }
  }, [totalCells]);

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
                    <FlaskConical className="w-5 h-5 hidden sm:block" />
                    <h1 className="text-lg sm:text-xl font-bold font-heading">
                      Nuevo Hemograma
                    </h1>
                  </div>
                  {isPatientSelected && (
                    <p className="text-biovet-100 text-xs sm:text-sm mt-0.5">
                      {patientName} • {watch("species")}
                      <span className="hidden sm:inline"> • {watch("breed")}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Acciones rápidas header */}
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

                {activeTab === "differential" && totalCells > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                      title="Deshacer último"
                    >
                      <Undo2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                      title="Reiniciar conteo"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Tabs */}
            <nav className="flex gap-1 mt-4 sm:mt-5 bg-white/10 p-1 rounded-xl">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const tabIndex = TABS.findIndex((t) => t.id === tab.id);
                const isCompleted = tabIndex < currentTabIndex && isPatientSelected;
                const isLocked = tab.id !== "patient" && !isPatientSelected;

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
                {activeTab === "patient" && (
                  <PatientSelectionTab
                    onPatientSelected={() => setActiveTab("general")}
                    setValues={setValue}
                    currentPatientName={watch("patientName")}
                  />
                )}
                {activeTab === "general" && (
                  <GeneralTab
                    species={species}
                    register={register}
                    errors={errors}
                    watch={watch}
                  />
                )}
                {activeTab === "differential" && (
                  <DifferentialTab
                    differentialCount={differentialCount}
                    totalCells={totalCells}
                    totalWhiteCells={totalWhiteCells}
                    species={species}
                    lastAction={lastAction}
                    calculatedValues={calculatedValues}
                    differentialFields={differentialFields}
                    onIncrement={handleIncrement}
                    onUndo={handleUndo}
                    onReset={handleReset}
                    isOutOfRange={isOutOfRange}
                  />
                )}
                {activeTab === "observations" && (
                  <ObservationsTab
                    register={register}
                    errors={errors}
                    isPending={isPending}
                    onSubmit={handleSubmit(onSubmit)}
                  />
                )}
              </div>
            </form>
          </div>
        </main>

        {/* ═══ FOOTER ═══ */}
        <footer className="shrink-0 fixed bottom-0 left-0 right-0 sm:relative bg-white dark:bg-dark-200 border-t border-surface-200 dark:border-dark-100 px-4 sm:px-6 py-3 sm:py-4 mb-16 sm:mb-0 z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Indicadores de progreso - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {TABS.map((tab, index) => {
                const isLocked = tab.id !== "patient" && !isPatientSelected;

                return (
                  <div
                    key={tab.id}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      activeTab === tab.id
                        ? "bg-biovet-500 scale-125"
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

              {/* Contador de células en footer */}
              {totalCells > 0 && (
                <div className="ml-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-50 dark:bg-dark-300 border border-surface-200 dark:border-dark-100">
                  <Microscope className="w-3.5 h-3.5 text-biovet-500" />
                  <span className={`text-sm font-bold ${
                    totalCells === 100 ? "text-emerald-500" : "text-biovet-600 dark:text-biovet-400"
                  }`}>
                    {totalCells}/100
                  </span>
                  {totalCells === 100 && (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
              )}
            </div>

            {/* Botones de navegación */}
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => {
                  if (currentTabIndex > 0) handleTabChange(TABS[currentTabIndex - 1].id);
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
                          ? "bg-biovet-500 scale-125"
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

              {activeTab === "observations" ? (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isPending || !isPatientSelected}
                  className="px-4 sm:px-8 py-2.5 flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 text-sm rounded-lg font-semibold transition-all bg-biovet-600 hover:bg-biovet-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="btn-primary px-4 sm:px-8 py-2.5 flex-1 md:flex-none flex items-center justify-center gap-1 sm:gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>

      {/* ═══ MODAL PDF ═══ */}
      {showShareModal && savedExamData && (
        <ShareResultsModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            navigate(-1);
          }}
          examData={savedExamData}
          patientData={{
            name: savedExamData.patientName || "Paciente",
            species: savedExamData.species as "canino" | "felino",
            owner: {
              name: savedExamData.ownerName || "—",
              contact: savedExamData.ownerPhone || "—",
            },
            mainVet: savedExamData.treatingVet || "—",
            refVet: "—",
          }}
        />
      )}
    </>
  );
}