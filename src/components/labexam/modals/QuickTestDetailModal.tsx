import { Beaker, Printer } from "lucide-react";
import type { LabExam } from "@/types/labExam";

interface QuickTestDetailModalProps {
  exam: LabExam;
  onClose: () => void;
  onPrint: (exam: LabExam) => void;
}

export default function QuickTestDetailModal({
  exam,
  onClose,
  onPrint,
}: QuickTestDetailModalProps) {
  const isPositive = exam.results?.toLowerCase() === "positivo";
  const isNegative = exam.results?.toLowerCase() === "negativo";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Beaker className="w-5 h-5 text-cyan-500" />
            Test Rápido
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-dark-100 rounded-lg transition-colors text-slate-500"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Fecha</span>
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                {new Date(exam.date).toLocaleDateString()}
              </p>
            </div>
            {exam.treatingVet && (
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Veterinario</span>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{exam.treatingVet}</p>
              </div>
            )}
          </div>

          <div className="text-center py-4 bg-cyan-50 dark:bg-cyan-950/20 rounded-xl border border-cyan-100 dark:border-cyan-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Test Realizado</p>
            <p className="font-bold text-lg text-slate-800 dark:text-white mb-3">{exam.testName}</p>

            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Resultado</p>
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                isPositive
                  ? "bg-danger-100 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400"
                  : isNegative
                    ? "bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {exam.results?.toUpperCase()}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { onPrint(exam); onClose(); }} className="btn-secondary flex items-center gap-2">
              <Printer size={16} /> Imprimir
            </button>
            <button onClick={onClose} className="btn-primary">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}