// src/components/labexam/DifferentialTab.tsx
import { DifferentialFieldComponent } from "./DifferentialField";
import { DifferentialControls } from "./DifferentialControls";
import type { DifferentialCount, DifferentialField } from "@/types/labExam";

// Tipo para el conteo diferencial (siempre definido)
type DifferentialCountState = NonNullable<DifferentialCount>;
type DifferentialKey = keyof DifferentialCountState;

interface DifferentialTabProps {
  differentialCount: DifferentialCountState | undefined;
  totalCells: number;
  totalWhiteCells: number;
  species: "canino" | "felino";
  lastAction: { field: DifferentialKey } | null;
  calculatedValues: Record<DifferentialKey, { percentage: string; absolute: string }>;
  differentialFields: DifferentialField[];
  onIncrement: (field: DifferentialKey, sound: HTMLAudioElement) => void;
  onUndo: () => void;
  onReset: () => void;
  isOutOfRange: (value: number | string | undefined, rangeKey: DifferentialKey) => boolean;
}

export function DifferentialTab({
  differentialCount,
  totalCells,
  totalWhiteCells,
  species,
  lastAction,
  calculatedValues,
  differentialFields,
  onIncrement,
  onUndo,
  onReset,
  isOutOfRange,
}: DifferentialTabProps) {
  // Valor por defecto si differentialCount es undefined
  const safeCount = differentialCount ?? {
    segmentedNeutrophils: 0,
    bandNeutrophils: 0,
    lymphocytes: 0,
    monocytes: 0,
    basophils: 0,
    reticulocytes: 0,
    eosinophils: 0,
    nrbc: 0,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controles Superiores */}
      <div className="shrink-0 mb-2">
        <DifferentialControls
          totalCells={totalCells}
          lastAction={lastAction}
          onUndo={onUndo}
          onReset={onReset}
        />
      </div>

      {/* GRID RESPONSIVO */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4 h-full md:h-auto overflow-y-auto pb-20 md:pb-0 content-start">
        {differentialFields.map((field) => (
          <div key={field.key} className="contents">
            {/* Renderizado para MÓVIL (block md:hidden) */}
            <div className="block md:hidden w-full h-full">
              <DifferentialFieldComponent
                field={field}
                count={safeCount[field.key] ?? 0}
                percentage={calculatedValues[field.key]?.percentage ?? "0.0"}
                absolute={calculatedValues[field.key]?.absolute ?? "0.0"}
                totalWhiteCells={totalWhiteCells}
                species={species}
                totalCells={totalCells}
                onIncrement={onIncrement}
                isOutOfRange={isOutOfRange}
                isMobile={true}
              />
            </div>
            {/* Renderizado para DESKTOP (hidden md:block) */}
            <div className="hidden md:block w-full h-full">
              <DifferentialFieldComponent
                field={field}
                count={safeCount[field.key] ?? 0}
                percentage={calculatedValues[field.key]?.percentage ?? "0.0"}
                absolute={calculatedValues[field.key]?.absolute ?? "0.0"}
                totalWhiteCells={totalWhiteCells}
                species={species}
                totalCells={totalCells}
                onIncrement={onIncrement}
                isOutOfRange={isOutOfRange}
                isMobile={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}