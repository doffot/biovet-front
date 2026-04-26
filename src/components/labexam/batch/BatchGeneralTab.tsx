// src/components/labexam/batch/BatchGeneralTab.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FlaskConical, CheckCircle2 } from "lucide-react";
import { GeneralTab } from "../GeneralTab";
import type { BatchExam } from "@/types/batch";
import type { LabExamFormData } from "@/types/labExam";

interface Props {
  exams: BatchExam[];
  activeExamId: string | null;
  onChangeActiveExam: (tempId: string) => void;
  onUpdateExam: (tempId: string, updates: Partial<LabExamFormData>) => void;
}

const GeneralForm = ({
  exam,
  onUpdateExam,
}: {
  exam: BatchExam;
  onUpdateExam: (tempId: string, updates: Partial<LabExamFormData>) => void;
}) => {
  const species = exam.formData.species === "felino" ? "felino" : "canino";

  const {
    register,
    watch,
    formState: { errors },
  } = useForm<LabExamFormData>({
    defaultValues: {
      ...exam.formData,
      hematocrit: exam.formData.hematocrit ?? 0,
      whiteBloodCells: exam.formData.whiteBloodCells ?? 0,
      totalProtein: exam.formData.totalProtein ?? 0,
      platelets: exam.formData.platelets ?? 0,
      cost: exam.formData.cost ?? 0,
      discount: exam.formData.discount ?? 0,
      date: exam.formData.date ?? new Date().toISOString().split("T")[0],
      treatingVet: exam.formData.treatingVet ?? "",
    },
  });

  useEffect(() => {
    const subscription = watch((value) => {
      onUpdateExam(exam.tempId, value as Partial<LabExamFormData>);
    });
    return () => subscription.unsubscribe();
  }, [watch, onUpdateExam, exam.tempId]);

  return (
    <GeneralTab
      species={species}
      register={register}
      errors={errors}
      watch={watch}
    />
  );
};

// ── Componente principal ───────────────────────────────────
export const BatchGeneralTab = ({
  exams,
  activeExamId,
  onChangeActiveExam,
  onUpdateExam,
}: Props) => {
  const selectedExam =
    exams.find((exam) => exam.tempId === activeExamId) || exams[0] || null;

  if (!selectedExam) {
    return (
      <div className="py-10 text-center text-sm text-slate-400">
        Agrega pacientes primero para continuar al hemograma.
      </div>
    );
  }

  const isCompleted =
    Number(selectedExam.formData.hematocrit || 0) > 0 &&
    Number(selectedExam.formData.whiteBloodCells || 0) > 0 &&
    Number(selectedExam.formData.totalProtein || 0) > 0 &&
    Number(selectedExam.formData.platelets || 0) > 0 &&
    Number(selectedExam.formData.cost || 0) > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">
          Hemograma por paciente
        </h2>
        <p className="text-sm text-slate-400">
          Completa los valores generales de cada muestra
        </p>
      </div>

      {/* Tabs de pacientes */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {exams.map((exam, index) => {
          const currentCompleted =
            Number(exam.formData.hematocrit || 0) > 0 &&
            Number(exam.formData.whiteBloodCells || 0) > 0 &&
            Number(exam.formData.totalProtein || 0) > 0 &&
            Number(exam.formData.platelets || 0) > 0 &&
            Number(exam.formData.cost || 0) > 0;

          const isActive = exam.tempId === selectedExam.tempId;

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
                  {exam.formData.species}
                </p>
              </div>

              {currentCompleted && (
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
          <FlaskConical className="w-5 h-5 text-biovet-600 dark:text-biovet-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
            {selectedExam.formData.patientName}
          </p>
          <p className="text-xs text-slate-400">
            {selectedExam.formData.species}
            {selectedExam.formData.breed
              ? ` • ${selectedExam.formData.breed}`
              : ""}
            {selectedExam.formData.patientId
              ? " • Paciente interno"
              : " • Paciente externo"}
          </p>
        </div>

        {isCompleted && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            Completo
          </span>
        )}
      </div>

      <div className="bg-white dark:bg-dark-200 rounded-2xl">
        <GeneralForm
          key={selectedExam.tempId}
          exam={selectedExam}
          onUpdateExam={onUpdateExam}
        />
      </div>
    </div>
  );
};