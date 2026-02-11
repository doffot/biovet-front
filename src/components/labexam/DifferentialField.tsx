// src/components/labexam/DifferentialField.tsx
import type { DifferentialField, LabExamFormData } from "@/types/labExam";

interface DifferentialFieldProps {
  field: DifferentialField;
  count: number;
  percentage: string;
  absolute: string;
  totalWhiteCells: number;
  species: "canino" | "felino";
  totalCells: number;
  onIncrement: (
    field: keyof LabExamFormData["differentialCount"],
    sound: HTMLAudioElement
  ) => void;
  isOutOfRange: (
    value: number | string | undefined,
    rangeKey: keyof LabExamFormData["differentialCount"]
  ) => boolean;
  isMobile?: boolean;
}

const normalValues = {
  canino: {
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

const cellNames: Record<keyof LabExamFormData["differentialCount"], string> = {
  segmentedNeutrophils: "SEG",
  bandNeutrophils: "BAND",
  lymphocytes: "LYM",
  monocytes: "MONO",
  basophils: "BASO",
  reticulocytes: "RET",
  eosinophils: "EOS",
  nrbc: "NRBC",
};

export function DifferentialFieldComponent({
  field,
  count,
  percentage,
  absolute,
  totalWhiteCells,
  species,
  totalCells,
  onIncrement,
  isOutOfRange,
  isMobile = false,
}: DifferentialFieldProps) {
  
  if (isMobile) {
    return (
      <button
        type="button"
        onClick={() => onIncrement(field.key, field.sound)}
        disabled={totalCells >= 100}
        // Clases para móvil: Botón grande, touch friendly, usando tu paleta
        className="relative w-full h-full min-h-30 bg-surface-50 dark:bg-dark-100 active:scale-95 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group rounded-xl border border-surface-200 dark:border-dark-50 shadow-sm"
      >
        <div className="absolute inset-1 rounded-lg overflow-hidden border-2 border-biovet-400/30 dark:border-biovet-500/30 group-active:border-biovet-500 transition-colors duration-100">
          <img
            src={field.image}
            alt={field.label}
            className="w-full h-full object-cover opacity-90 group-active:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          {/* Gradiente para mejorar lectura de textos sobre la imagen */}
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/70" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-between p-2">
          {/* Nombre Célula (Arriba Izquierda) */}
          <div className="self-start text-[10px] font-bold text-white bg-biovet-600/90 dark:bg-biovet-700/90 rounded-md px-1.5 py-0.5 backdrop-blur-xs shadow-md border border-white/10">
            {cellNames[field.key]}
          </div>

          {/* Contador y Porcentaje (Abajo Derecha) */}
          <div className="self-end flex flex-col items-end">
            <div className="bg-biovet-600 dark:bg-biovet-700 rounded-lg px-2 py-1 text-white shadow-lg border border-white/10 mb-0.5">
              <div className="text-xl font-bold leading-none text-center min-w-5">
                {count}
              </div>
            </div>
             <div className="text-[10px] font-medium text-white/90 bg-black/40 px-1.5 rounded-sm backdrop-blur-xs">
              {percentage}%
            </div>
          </div>
        </div>
      </button>
    );
  }

  // Versión Desktop (Tu código original con nuevos colores)
  return (
    <div className="text-center h-full">
      <label className="block text-slate-700 dark:text-slate-200 text-xs font-medium mb-1 leading-tight truncate">
        {field.label}
      </label>
      <button
        type="button"
        onClick={() => onIncrement(field.key, field.sound)}
        disabled={totalCells >= 100}
        className="relative w-full aspect-square bg-surface-50 dark:bg-dark-100 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group rounded-xl mb-1.5 border border-surface-200 dark:border-dark-50"
      >
        <div className="absolute inset-1 rounded-lg overflow-hidden border-2 border-biovet-400/40 dark:border-biovet-500/40 group-hover:border-biovet-500/70 dark:group-hover:border-biovet-400/70 transition-colors duration-300">
          <img
            src={field.image}
            alt={field.label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/20" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-between p-1">
          <div className="self-start text-[8px] font-bold text-white bg-biovet-600 dark:bg-biovet-700 rounded-md px-1.5 py-0.5 shadow-lg">
            {cellNames[field.key]}
          </div>
          <div className="self-end bg-biovet-600 dark:bg-biovet-700 rounded-md px-1.5 py-0.5 text-white shadow-lg border border-biovet-500/20">
            <div className="text-sm font-bold leading-none">{count}</div>
            <div className="text-[8px] opacity-90 leading-none">
              {percentage}%
            </div>
          </div>
        </div>
      </button>
      <div className="text-xs space-y-0.5">
        <p
          className={`text-[10px] font-medium ${
            isOutOfRange(absolute, field.key)
              ? "text-danger-500 dark:text-danger-400"
              : "text-success-600 dark:text-success-400"
          }`}
        >
          {totalWhiteCells > 0 ? absolute : "0.0"}
          <span className="text-slate-400 dark:text-slate-500"> x10³/μL</span>
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
          Normal: {normalValues[species][field.key][0]} -{" "}
          {normalValues[species][field.key][1]}
        </p>
      </div>
    </div>
  );
}