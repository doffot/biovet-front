// src/components/labexam/batch/BatchDifferentialTab.tsx
import { useMemo, useState } from "react";
import { Microscope, CheckCircle2 } from "lucide-react";
import { DifferentialTab } from "../DifferentialTab";
import { toast } from "@/components/Toast";
import type { BatchExam } from "@/types/batch";
import type { DifferentialCount, DifferentialField, LabExamFormData } from "@/types/labExam";

// Sonidos
import segmentedSound from "/sounds/segmented.mp3";
import bandSound from "/sounds/band.mp3";
import lymphocytesSound from "/sounds/lymphocytes.mp3";
import monocytesSound from "/sounds/monocytes.mp3";
import basophilsSound from "/sounds/basophils.mp3";
import reticulocytesSound from "/sounds/reticulocytes.mp3";
import eosinophilsSound from "/sounds/eosinophils.mp3";
import nrbcSound from "/sounds/nrbc.mp3";

type DifferentialKey = keyof NonNullable<LabExamFormData["differentialCount"]>;

interface Props {
  exams: BatchExam[];
  activeExamId: string | null;
  onChangeActiveExam: (tempId: string) => void;
  onUpdateDifferential: (
    tempId: string,
    differentialCount: DifferentialCount,
    totalCells: number
  ) => void;
}

const emptyDifferentialCount = (): DifferentialCount => ({
  segmentedNeutrophils: 0,
  bandNeutrophils: 0,
  lymphocytes: 0,
  monocytes: 0,
  basophils: 0,
  reticulocytes: 0,
  eosinophils: 0,
  nrbc: 0,
});

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

export const BatchDifferentialTab = ({
  exams,
  activeExamId,
  onChangeActiveExam,
  onUpdateDifferential,
}: Props) => {
  const selectedExam =
    exams.find((exam) => exam.tempId === activeExamId) || exams[0] || null;

  const [lastActions, setLastActions] = useState<
    Record<string, { field: DifferentialKey } | null>
  >({});

  const differentialFields: DifferentialField[] = useMemo(
    () => [
      {
        key: "segmentedNeutrophils",
        sound: new Audio(segmentedSound),
        label: "Neutrófilos Segmentados",
        image: "/img/segmentedNeutrophils.png",
      },
      {
        key: "bandNeutrophils",
        sound: new Audio(bandSound),
        label: "Neutrófilos en Banda",
        image: "/img/band.png",
      },
      {
        key: "lymphocytes",
        sound: new Audio(lymphocytesSound),
        label: "Linfocitos",
        image: "/img/lymphocytes.png",
      },
      {
        key: "monocytes",
        sound: new Audio(monocytesSound),
        label: "Monocitos",
        image: "/img/monocytes.png",
      },
      {
        key: "basophils",
        sound: new Audio(basophilsSound),
        label: "Basófilos",
        image: "/img/basophils.png",
      },
      {
        key: "reticulocytes",
        sound: new Audio(reticulocytesSound),
        label: "Reticulocitos",
        image: "/img/reticulocytes.png",
      },
      {
        key: "eosinophils",
        sound: new Audio(eosinophilsSound),
        label: "Eosinófilos",
        image: "/img/eosinophils.png",
      },
      {
        key: "nrbc",
        sound: new Audio(nrbcSound),
        label: "NRBC",
        image: "/img/nrbc.png",
      },
    ],
    []
  );

  const selectedCount = selectedExam?.differentialCount || emptyDifferentialCount();

  const totalWhiteCells = selectedExam?.formData.whiteBloodCells || 0;

  const species =
    selectedExam?.formData.species === "felino" ? "felino" : "canino";

  const calculatedValues = useMemo(() => {
    const calculated = {} as Record<
      DifferentialKey,
      { percentage: string; absolute: string }
    >;

    if (!selectedExam) return calculated;

    Object.keys(selectedCount).forEach((key) => {
      const cellKey = key as DifferentialKey;

      const countValue = selectedCount[cellKey] ?? 0;
      const percentage =
        selectedExam.totalCells > 0 ? countValue / selectedExam.totalCells : 0;

      const absolute = percentage * Number(totalWhiteCells || 0);

      calculated[cellKey] = {
        percentage: (percentage * 100).toFixed(1),
        absolute: absolute.toFixed(1),
      };
    });

    return calculated;
  }, [selectedCount, selectedExam?.totalCells, totalWhiteCells]);

  const handleIncrement = (field: DifferentialKey, sound: HTMLAudioElement) => {
    if (!selectedExam) return;

    if (selectedExam.totalCells >= 100) {
      toast.error("El conteo total no puede superar 100");
      return;
    }

    const nextCount: DifferentialCount = {
      ...emptyDifferentialCount(),
      ...selectedCount,
      [field]: (selectedCount[field] || 0) + 1,
    };

    onUpdateDifferential(
      selectedExam.tempId,
      nextCount,
      selectedExam.totalCells + 1
    );

    setLastActions((prev) => ({
      ...prev,
      [selectedExam.tempId]: { field },
    }));

    sound.currentTime = 0;
    sound.play().catch(() => {});
  };

  const handleUndo = () => {
    if (!selectedExam) return;

    const lastAction = lastActions[selectedExam.tempId];

    if (!lastAction || selectedExam.totalCells === 0) {
      toast.error("No hay acciones para deshacer");
      return;
    }

    const field = lastAction.field;
    const currentValue = selectedCount[field] || 0;

    if (currentValue <= 0) return;

    const nextCount: DifferentialCount = {
      ...emptyDifferentialCount(),
      ...selectedCount,
      [field]: currentValue - 1,
    };

    onUpdateDifferential(
      selectedExam.tempId,
      nextCount,
      Math.max(0, selectedExam.totalCells - 1)
    );

    setLastActions((prev) => ({
      ...prev,
      [selectedExam.tempId]: null,
    }));

    toast.success("Último conteo deshecho");
  };

  const handleReset = () => {
    if (!selectedExam) return;

    onUpdateDifferential(selectedExam.tempId, emptyDifferentialCount(), 0);

    setLastActions((prev) => ({
      ...prev,
      [selectedExam.tempId]: null,
    }));

    toast.success("Conteo diferencial reiniciado");
  };

  const isOutOfRange = (
    value: number | string | undefined,
    rangeKey: keyof typeof normalValues.canino
  ) => {
    if (value === undefined || value === null || value === "") return false;

    const numValue = Number(value);
    const range = normalValues[species][rangeKey];

    return numValue < range[0] || numValue > range[1];
  };

  if (!selectedExam) {
    return (
      <div className="py-10 text-center text-sm text-slate-400">
        Agrega pacientes primero para continuar al diferencial.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">
          Diferencial por paciente
        </h2>
        <p className="text-sm text-slate-400">
          Realiza el conteo diferencial de cada muestra.
        </p>
      </div>

      {/* Tabs de pacientes */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {exams.map((exam, index) => {
          const isActive = exam.tempId === selectedExam.tempId;
          const isCompleted = exam.totalCells === 100;

          return (
            <button
              key={exam.tempId}
              type="button"
              onClick={() => onChangeActiveExam(exam.tempId)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                isActive
                  ? "bg-biovet-600 text-white border-biovet-600 shadow-sm"
                  : "bg-white dark:bg-dark-300 text-slate-700 dark:text-slate-200 border-surface-200 dark:border-dark-100 hover:border-biovet-300"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-biovet-100 dark:bg-biovet-900/30 text-biovet-600 dark:text-biovet-400"
                }`}
              >
                {index + 1}
              </span>

              <div className="text-left">
                <p className="text-sm font-semibold whitespace-nowrap">
                  {exam.formData.patientName}
                </p>
                <p
                  className={`text-xs ${
                    isActive ? "text-white/80" : "text-slate-400"
                  }`}
                >
                  {exam.totalCells}/100 células
                </p>
              </div>

              {isCompleted && (
                <CheckCircle2
                  className={`w-4 h-4 ${
                    isActive ? "text-emerald-200" : "text-emerald-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Resumen del paciente activo */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-50 dark:bg-dark-300 border border-surface-200 dark:border-dark-100">
        <div className="w-10 h-10 rounded-xl bg-biovet-100 dark:bg-biovet-900/30 flex items-center justify-center">
          <Microscope className="w-5 h-5 text-biovet-600 dark:text-biovet-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
            {selectedExam.formData.patientName}
          </p>
          <p className="text-xs text-slate-400">
            Leucocitos: {selectedExam.formData.whiteBloodCells || 0} •{" "}
            Conteo: {selectedExam.totalCells}/100
          </p>
        </div>

        {selectedExam.totalCells === 100 && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            Completo
          </span>
        )}
      </div>

      {/* Tu componente actual reutilizado */}
      <DifferentialTab
        differentialCount={selectedCount}
        totalCells={selectedExam.totalCells}
        totalWhiteCells={totalWhiteCells}
        species={species}
        lastAction={lastActions[selectedExam.tempId] || null}
        calculatedValues={calculatedValues}
        differentialFields={differentialFields}
        onIncrement={handleIncrement}
        onUndo={handleUndo}
        onReset={handleReset}
        isOutOfRange={isOutOfRange}
      />
    </div>
  );
};