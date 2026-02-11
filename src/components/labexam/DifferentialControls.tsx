// src/components/labexam/DifferentialControls.tsx
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type { LabExamFormData } from "@/types/labExam";
import ConfirmationModal from "../ConfirmationModal";

interface DifferentialControlsProps {
  totalCells: number;
  lastAction: { field: keyof LabExamFormData["differentialCount"] } | null;
  onUndo: () => void;
  onReset: () => void;
}

export function DifferentialControls({
  totalCells,
  lastAction,
  onUndo,
  onReset,
}: DifferentialControlsProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetConfirm = () => {
    onReset();
    setShowResetConfirm(false);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div
          className={`text-base font-bold px-3 py-1.5 rounded-lg border transition-colors ${
            totalCells === 100
              ? "text-success-600 dark:text-success-400 border-success-300 dark:border-success-700 bg-success-50 dark:bg-success-950"
              : "text-biovet-600 dark:text-biovet-400 border-biovet-200 dark:border-biovet-700 bg-biovet-50 dark:bg-biovet-950"
          }`}
        >
          {totalCells}/100
        </div>

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!lastAction || totalCells === 0}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-warning-300 dark:border-warning-700 bg-warning-50 dark:bg-warning-950 text-warning-600 dark:text-warning-400 hover:bg-warning-100 dark:hover:bg-warning-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Deshacer último conteo"
          >
            <span className="text-sm font-bold">↶</span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            disabled={totalCells === 0}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-surface-300 dark:border-slate-700 bg-surface-50 dark:bg-dark-100 text-slate-500 dark:text-slate-400 hover:bg-surface-100 dark:hover:bg-dark-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Reiniciar conteo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetConfirm}
        title="¿Reiniciar conteo?"
        message={
          <>
            <p className="text-slate-700 dark:text-slate-200 mb-2">
              Se eliminarán{" "}
              <span className="font-bold text-biovet-600 dark:text-biovet-400">
                {totalCells} células
              </span>{" "}
              contadas.
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Esta acción no se puede deshacer.
            </p>
          </>
        }
        confirmText="Reiniciar"
        confirmIcon={RotateCcw}
        variant="warning"
      />
    </>
  );
}