import { Droplets, Printer } from "lucide-react";
import type { LabExam } from "@/types/labExam";

interface UrinalysisDetailModalProps {
  exam: LabExam;
  onClose: () => void;
  onPrint: (exam: LabExam) => void;
}

export default function UrinalysisDetailModal({
  exam,
  onClose,
  onPrint,
}: UrinalysisDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            Uroanálisis
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-dark-100 rounded-lg transition-colors text-slate-500"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Info básica */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
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
            {exam.collectionMethod && (
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Método</span>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{exam.collectionMethod}</p>
              </div>
            )}
          </div>

          {/* Examen Físico */}
          <div className="bg-sky-50 dark:bg-sky-950/20 p-3 rounded-lg border border-sky-100 dark:border-sky-800">
            <h4 className="text-sm font-bold text-sky-700 dark:text-sky-400 mb-2">Examen Físico</h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {exam.color && <InfoField label="Color" value={exam.color} />}
              {exam.appearance && <InfoField label="Aspecto" value={exam.appearance} />}
              {exam.specificGravity && <InfoField label="Densidad" value={exam.specificGravity} />}
            </div>
          </div>

          {/* Examen Químico */}
          <div className="bg-indigo-50 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
            <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 mb-2">Examen Químico</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 text-sm">
              {exam.pH !== undefined && <InfoField label="pH" value={exam.pH} />}
              {exam.proteins && <InfoField label="Proteínas" value={exam.proteins} />}
              {exam.glucose && <InfoField label="Glucosa" value={exam.glucose} />}
              {exam.ketones && <InfoField label="Cetonas" value={exam.ketones} />}
              {exam.bilirubin && <InfoField label="Bilirrubina" value={exam.bilirubin} />}
              {exam.blood && <InfoField label="Sangre" value={exam.blood} />}
            </div>
          </div>

          {/* Sedimento */}
          <div className="bg-violet-50 dark:bg-violet-950/20 p-3 rounded-lg border border-violet-100 dark:border-violet-800">
            <h4 className="text-sm font-bold text-violet-700 dark:text-violet-400 mb-2">Sedimento</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {exam.epithelialCells && <InfoField label="Cél. Epiteliales" value={exam.epithelialCells} />}
              {exam.sedimentLeukocytes && <InfoField label="Leucocitos" value={exam.sedimentLeukocytes} />}
              {exam.sedimentErythrocytes && <InfoField label="Eritrocitos" value={exam.sedimentErythrocytes} />}
              {exam.bacteria && <InfoField label="Bacterias" value={exam.bacteria} />}
              {exam.crystals && <InfoField label="Cristales" value={exam.crystals} />}
              {exam.casts && <InfoField label="Cilindros" value={exam.casts} />}
            </div>
          </div>

          {exam.otherFindings && (
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Otros Hallazgos</span>
              <p className="mt-1 text-slate-700 dark:text-slate-200 whitespace-pre-wrap bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                {exam.otherFindings}
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

function InfoField({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span className="text-xs text-slate-500">{label}</span>
      <p className="font-semibold text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  );
}