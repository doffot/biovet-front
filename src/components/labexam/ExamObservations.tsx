import type { LabExam } from "@/types/labExam";

interface ExamObservationsProps {
  exam: LabExam;
}

export default function ExamObservations({ exam }: ExamObservationsProps) {
  const examType = exam.examType || "hematology";

  const observationConfig: Record<string, {
    field: keyof LabExam;
    label?: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
  }> = {
    hematology: {
      field: "observacion",
      bgColor: "bg-warning-50/50 dark:bg-warning-950/20",
      borderColor: "border-warning-100 dark:border-warning-900/30",
      textColor: "text-warning-700 dark:text-warning-400",
    },
    cytology: {
      field: "results",
      label: "Resultados",
      bgColor: "bg-purple-50/50 dark:bg-purple-950/20",
      borderColor: "border-purple-100 dark:border-purple-900/30",
      textColor: "text-purple-700 dark:text-purple-400",
    },
    urinalysis: {
      field: "otherFindings",
      label: "Observaciones",
      bgColor: "bg-blue-50/50 dark:bg-blue-950/20",
      borderColor: "border-blue-100 dark:border-blue-900/30",
      textColor: "text-blue-700 dark:text-blue-400",
    },
    skin_scraping: {
      field: "results",
      label: "Hallazgos",
      bgColor: "bg-amber-50/50 dark:bg-amber-950/20",
      borderColor: "border-amber-100 dark:border-amber-900/30",
      textColor: "text-amber-700 dark:text-amber-400",
    },
    trichogram: {
      field: "results",
      label: "Hallazgos",
      bgColor: "bg-teal-50/50 dark:bg-teal-950/20",
      borderColor: "border-teal-100 dark:border-teal-900/30",
      textColor: "text-teal-700 dark:text-teal-400",
    },
  };

  const config = observationConfig[examType];
  if (!config) return null;

  const value = exam[config.field];
  if (!value) return null;

  return (
    <div className={`mt-3 ${config.bgColor} p-2.5 rounded-xl border ${config.borderColor}`}>
      <p className={`text-xs ${config.textColor} line-clamp-2 ${examType === "hematology" ? "italic" : ""}`}>
        {config.label && <span className="font-semibold">{config.label}: </span>}
        {String(value)}
      </p>
    </div>
  );
}