// src/components/labexam/DifferentialTab.tsx
import { DifferentialFieldComponent } from "./DifferentialField";
import { DifferentialControls } from "./DifferentialControls";
import type { DifferentialField, LabExamFormData } from "@/types/labExam";

interface DifferentialTabProps {
  differentialCount: LabExamFormData["differentialCount"];
  totalCells: number;
  totalWhiteCells: number;
  species: "canino" | "felino";
  lastAction: { field: keyof LabExamFormData["differentialCount"] } | null;
  calculatedValues: Record<
    keyof LabExamFormData["differentialCount"],
    { percentage: string; absolute: string }
  >;
  differentialFields: DifferentialField[];
  onIncrement: (
    field: keyof LabExamFormData["differentialCount"],
    sound: HTMLAudioElement
  ) => void;
  onUndo: () => void;
  onReset: () => void;
  isOutOfRange: (
    value: number | string | undefined,
    rangeKey: keyof LabExamFormData["differentialCount"]
  ) => boolean;
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
                count={differentialCount[field.key] || 0}
                percentage={calculatedValues[field.key].percentage}
                absolute={calculatedValues[field.key].absolute}
                totalWhiteCells={totalWhiteCells}
                species={species}
                totalCells={totalCells}
                onIncrement={onIncrement}
                isOutOfRange={isOutOfRange}
                isMobile={true} // <--- Activa modo touch
              />
            </div>
            {/* Renderizado para DESKTOP (hidden md:block) */}
            <div className="hidden md:block w-full h-full">
              <DifferentialFieldComponent
                field={field}
                count={differentialCount[field.key] || 0}
                percentage={calculatedValues[field.key].percentage}
                absolute={calculatedValues[field.key].absolute}
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