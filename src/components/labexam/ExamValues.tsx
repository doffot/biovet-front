import type { LabExam } from "@/types/labExam";
import type { ExamConfig } from "./config/examConfig";

interface ExamValuesProps {
  exam: LabExam;
  config: ExamConfig;
}

export default function ExamValues({ exam, config }: ExamValuesProps) {
  const examType = exam.examType || "hematology";

  // Hematología
  if (examType === "hematology") {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {exam.hematocrit !== undefined && (
          <ValueBadge label="Hto" value={`${exam.hematocrit}%`} config={config} />
        )}
        {exam.whiteBloodCells !== undefined && (
          <ValueBadge label="GB" value={exam.whiteBloodCells} config={config} />
        )}
        {exam.totalProtein !== undefined && (
          <ValueBadge label="PT" value={exam.totalProtein} config={config} />
        )}
        {exam.platelets !== undefined && (
          <ValueBadge label="Plaq" value={exam.platelets} config={config} />
        )}
      </div>
    );
  }

  // Citología
  if (examType === "cytology") {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {exam.sampleType && (
          <ValueBadge label="Muestra" value={exam.sampleType} config={config} />
        )}
        {exam.coloration && (
          <ValueBadge label="Coloración" value={exam.coloration} config={config} />
        )}
      </div>
    );
  }

  // Uroanálisis
  if (examType === "urinalysis") {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {exam.color && <ValueBadge label="Color" value={exam.color} config={config} />}
        {exam.specificGravity !== undefined && (
          <ValueBadge label="Densidad" value={exam.specificGravity} config={config} />
        )}
        {exam.pH !== undefined && (
          <ValueBadge label="pH" value={exam.pH} config={config} />
        )}
        {exam.collectionMethod && (
          <ValueBadge label="Método" value={exam.collectionMethod} config={config} />
        )}
      </div>
    );
  }

  // Test Rápido
  if (examType === "test") {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {exam.testName && (
          <ValueBadge label="Test" value={exam.testName} config={config} />
        )}
        {exam.results && <ResultBadge result={exam.results} config={config} />}
      </div>
    );
  }

  // Raspado Cutáneo
  if (examType === "skin_scraping") {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {exam.type && (
          <div
            className={`flex items-center gap-1.5 text-xs ${config.bgColor} px-2.5 py-1 rounded-lg border ${config.borderColor}`}
          >
            <span className={config.textColor}>Tipo:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200 capitalize">
              {exam.type}
            </span>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// Componente auxiliar para badges de valores
function ValueBadge({
  label,
  value,
  config,
}: {
  label: string;
  value: string | number;
  config: ExamConfig;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 text-xs ${config.bgColor} px-2.5 py-1 rounded-lg border ${config.borderColor}`}
    >
      <span className={config.textColor}>{label}:</span>
      <span className="font-bold text-slate-700 dark:text-slate-200">{value}</span>
    </div>
  );
}

// Componente auxiliar para resultados (positivo/negativo)
function ResultBadge({ result, config }: { result: string; config: ExamConfig }) {
  const isPositive = result.toLowerCase() === "positivo";
  const isNegative = result.toLowerCase() === "negativo";

  const bgClass = isPositive
    ? "bg-danger-50 dark:bg-danger-950/30 border-danger-200 dark:border-danger-800"
    : isNegative
      ? "bg-success-50 dark:bg-success-950/30 border-success-200 dark:border-success-800"
      : `${config.bgColor} ${config.borderColor}`;

  const textClass = isPositive
    ? "text-danger-600 dark:text-danger-400"
    : isNegative
      ? "text-success-600 dark:text-success-400"
      : "text-slate-700 dark:text-slate-200";

  return (
    <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ${bgClass}`}>
      <span className={`font-bold ${textClass}`}>{result}</span>
    </div>
  );
}