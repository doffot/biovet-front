// src/components/labexam/batch/BatchObservationsTab.tsx
import { useEffect} from "react";
import { useForm } from "react-hook-form";
import { FileText, CheckCircle2, Save, Loader2 } from "lucide-react";
import { ObservationsTab } from "../ObservationsTab";
import type { BatchExam } from "@/types/batch";
import type { LabExamFormData } from "@/types/labExam";

interface Props {
  exams: BatchExam[];
  activeExamId: string | null;
  onChangeActiveExam: (tempId: string) => void;
  onUpdateExam: (tempId: string, updates: Partial<LabExamFormData>) => void;
  onSubmitAll: () => void;
  onSubmitSingle: (tempId: string) => void;
  isPending: boolean;
  savingExamId: string | null;
}

const ObservationsForm = ({
  exam,
  onUpdateExam,
  onSubmitSingle,
  isPending,
  savingExamId,
  
}: {
  exam: BatchExam;
  onUpdateExam: (tempId: string, updates: Partial<LabExamFormData>) => void;
  onSubmitSingle: (tempId: string) => void;
  isPending: boolean;
  savingExamId: string | null;
  onSubmit: () => void;
}) => {
  const {
    register,
    watch,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<LabExamFormData>({
    defaultValues: {
      ...exam.formData,
      hemotropico: exam.formData.hemotropico ?? "",
      observacion: exam.formData.observacion ?? "",
    },
  });

  useEffect(() => {
    const subscription = watch((value) => {
      onUpdateExam(exam.tempId, {
        hemotropico: value.hemotropico ?? "",
        observacion: value.observacion ?? "",
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, onUpdateExam, exam.tempId]);

  return (
    <>
      <ObservationsTab
        register={register}
        errors={errors}
        isPending={isPending && savingExamId === exam.tempId}
        onSubmit={handleSubmit(() => {})}
      />

      <button
        type="button"
        onClick={() => {
          const currentValues = getValues();
          onUpdateExam(exam.tempId, {
            hemotropico: currentValues.hemotropico ?? "",
            observacion: currentValues.observacion ?? "",
          });
          onSubmitSingle(exam.tempId);
        }}
        disabled={isPending || savingExamId === exam.tempId}
        className="w-full py-3 bg-biovet-600 hover:bg-biovet-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {savingExamId === exam.tempId ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Guardando {exam.formData.patientName}...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Guardar examen de {exam.formData.patientName}
          </>
        )}
      </button>
    </>
  );
};

// ── Componente principal ───────────────────────────────────
export const BatchObservationsTab = ({
  exams,
  activeExamId,
  onChangeActiveExam,
  onUpdateExam,
  onSubmitAll,
  onSubmitSingle,
  isPending,
  savingExamId,
}: Props) => {
  const selectedExam =
    exams.find((exam) => exam.tempId === activeExamId) || exams[0] || null;

  const handlePatientChange = (tempId: string) => {
    onChangeActiveExam(tempId);
  };

  if (!selectedExam) {
    return (
      <div className="py-10 text-center text-sm text-slate-400">
        Agrega pacientes primero para continuar.
      </div>
    );
  }

  const pendingExams = exams.filter((e) => e.status === "pending");
  const savedExams = exams.filter((e) => e.status === "saved");
  const errorExams = exams.filter((e) => e.status === "error");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">
          Observaciones por paciente
        </h2>
        <p className="text-sm text-slate-400">
          Agrega observaciones y guarda individualmente o todos a la vez
        </p>
      </div>

      {/* Tabs de pacientes */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {exams.map((exam, index) => {
          const isActive = exam.tempId === selectedExam.tempId;

          return (
            <button
              key={exam.tempId}
              type="button"
              onClick={() => handlePatientChange(exam.tempId)}
              disabled={savingExamId === exam.tempId}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                exam.status === "saved"
                  ? isActive
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                  : exam.status === "error"
                    ? isActive
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800"
                    : isActive
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
                  {exam.status === "saved"
                    ? "✅ Guardado"
                    : exam.status === "error"
                      ? "❌ Error"
                      : exam.status === "saving"
                        ? "⏳ Guardando..."
                        : "Pendiente"}
                </p>
              </div>

              {exam.status === "saved" && (
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

      {/* Info del paciente activo */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-50 dark:bg-dark-300 border border-surface-200 dark:border-dark-100">
        <div className="w-10 h-10 rounded-xl bg-biovet-100 dark:bg-biovet-900/30 flex items-center justify-center">
          <FileText className="w-5 h-5 text-biovet-600 dark:text-biovet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
            {selectedExam.formData.patientName}
          </p>
          <p className="text-xs text-slate-400">
            {selectedExam.formData.species}
            {selectedExam.formData.patientId ? " • Interno" : " • Externo"}
          </p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-biovet-100 text-biovet-700 dark:bg-biovet-900/30 dark:text-biovet-400">
          {savedExams.length}/{exams.length} guardados
        </span>
      </div>

      {/*  key={selectedExam.tempId} fuerza remontaje completo */}
      {selectedExam.status === "saved" ? (
        <div className="py-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Este examen ya fue guardado
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Selecciona otro paciente pendiente
          </p>
        </div>
      ) : (
        <ObservationsForm
          key={selectedExam.tempId}
          exam={selectedExam}
          onUpdateExam={onUpdateExam}
          onSubmitSingle={onSubmitSingle}
          isPending={isPending}
          savingExamId={savingExamId}
          onSubmit={onSubmitAll}
        />
      )}

      {/* Guardar todos pendientes */}
      {pendingExams.length > 1 && (
        <button
          type="button"
          onClick={onSubmitAll}
          disabled={isPending}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando exámenes...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Guardar todos los pendientes ({pendingExams.length})
            </>
          )}
        </button>
      )}

      {/* Resumen de estados */}
      {(savedExams.length > 0 || errorExams.length > 0) && (
        <div className="space-y-1.5 pt-2">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Progreso del lote
          </p>
          {exams.map((exam) => (
            <div
              key={exam.tempId}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-50 dark:bg-dark-300 text-xs"
            >
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {exam.formData.patientName}
              </span>
              <span
                className={`font-semibold ${
                  exam.status === "saved"
                    ? "text-emerald-500"
                    : exam.status === "error"
                      ? "text-red-500"
                      : exam.status === "saving"
                        ? "text-amber-500"
                        : "text-slate-400"
                }`}
              >
                {exam.status === "saved"
                  ? "✅ Guardado"
                  : exam.status === "error"
                    ? `❌ ${exam.errorMessage || "Error"}`
                    : exam.status === "saving"
                      ? "⏳ Guardando..."
                      : "⏸ Pendiente"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};