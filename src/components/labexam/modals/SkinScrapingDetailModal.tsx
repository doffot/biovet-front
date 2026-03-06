import { Scissors, Printer } from "lucide-react";
import type { LabExam } from "@/types/labExam";

interface SkinScrapingDetailModalProps {
  exam: LabExam;
  onClose: () => void;
  onPrint: (exam: LabExam) => void;
}

export default function SkinScrapingDetailModal({
  exam,
  onClose,
  onPrint,
}: SkinScrapingDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Scissors className="w-5 h-5 text-amber-500" />
            Raspado Cutáneo
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

          {exam.type && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-800">
              <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">
                Tipo de Raspado
              </span>
              <p className="font-bold text-amber-700 dark:text-amber-400 capitalize">{exam.type}</p>
            </div>
          )}

          {exam.results && (
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Hallazgos</span>
              <p className="mt-1 text-slate-700 dark:text-slate-200 whitespace-pre-wrap bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800">
                {exam.results}
              </p>
            </div>
          )}

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