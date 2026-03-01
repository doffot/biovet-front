// src/components/labexam/LabExamDetailModal.tsx

import {
  FlaskConical,
  Droplets,
  Activity,
  CircleDot,
  TestTube,
  Microscope,
  StickyNote,
  AlertTriangle,
  PawPrint,
  User,
  Scale,
} from "lucide-react";
import DetailModal from "@/components/ui/DetailModal";
import type { LabExam } from "@/types/labExam";

interface LabExamDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: LabExam | null;
  triggerRect?: DOMRect | null;
}

export default function LabExamDetailModal({
  isOpen,
  onClose,
  exam,
  triggerRect,
}: LabExamDetailModalProps) {
  if (!exam) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Campos del conteo diferencial con sus labels
  const differentialFields = [
    { key: "segmentedNeutrophils", label: "Neutrófilos Seg.", abbr: "Seg" },
    { key: "bandNeutrophils", label: "Neutrófilos Banda", abbr: "Banda" },
    { key: "lymphocytes", label: "Linfocitos", abbr: "Linf" },
    { key: "monocytes", label: "Monocitos", abbr: "Mono" },
    { key: "eosinophils", label: "Eosinófilos", abbr: "Eos" },
    { key: "basophils", label: "Basófilos", abbr: "Bas" },
    { key: "reticulocytes", label: "Reticulocitos", abbr: "Ret" },
    { key: "nrbc", label: "NRBC", abbr: "NRBC" },
  ] as const;

  // Filtrar solo los campos con valor
  const activeDifferentials = differentialFields.filter(
    (field) => exam.differentialCount?.[field.key] !== undefined && 
               exam.differentialCount?.[field.key] !== null &&
               exam.differentialCount?.[field.key]! > 0
  );

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="Hemograma"
      subtitle={formatDate(exam.date)}
      icon={<FlaskConical size={24} />}
      headerColor="emerald"
      triggerRect={triggerRect}
      footer={
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-surface-200 dark:bg-dark-50 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-surface-300 dark:hover:bg-dark-100 transition-colors active:scale-[0.98]"
        >
          Cerrar
        </button>
      }
    >
      {/* Info del Paciente (si existe) */}
      {(exam.patientName || exam.species) && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <PawPrint size={24} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                {exam.patientName}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                {exam.species && <span>{exam.species}</span>}
                {exam.breed && <span>• {exam.breed}</span>}
                {exam.sex && <span>• {exam.sex}</span>}
                {exam.age && <span>• {exam.age}</span>}
              </div>
            </div>
            {exam.weight && (
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Scale size={14} />
                  <span className="font-bold">{exam.weight} kg</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Valores Principales */}
      <div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-surface-200 dark:border-dark-50 pb-2">
          <Droplets size={12} className="text-emerald-500" /> Valores Principales
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Hematocrito */}
          <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50">
            <div className="flex items-center gap-2 mb-1">
              <Droplets size={14} className="text-red-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Hematocrito
              </span>
            </div>
            <p className="text-lg font-black text-slate-800 dark:text-white">
              {exam.hematocrit}<span className="text-sm font-medium text-slate-400 ml-1">%</span>
            </p>
          </div>

          {/* Glóbulos Blancos */}
          <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50">
            <div className="flex items-center gap-2 mb-1">
              <CircleDot size={14} className="text-blue-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Glóbulos Blancos
              </span>
            </div>
            <p className="text-lg font-black text-slate-800 dark:text-white">
              {exam.whiteBloodCells.toLocaleString()}
            </p>
          </div>

          {/* Proteína Total */}
          <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50">
            <div className="flex items-center gap-2 mb-1">
              <TestTube size={14} className="text-amber-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Proteína Total
              </span>
            </div>
            <p className="text-lg font-black text-slate-800 dark:text-white">
              {exam.totalProtein}<span className="text-sm font-medium text-slate-400 ml-1">g/dL</span>
            </p>
          </div>

          {/* Plaquetas */}
          <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} className="text-purple-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Plaquetas
              </span>
            </div>
            <p className="text-lg font-black text-slate-800 dark:text-white">
              {exam.platelets.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Conteo Diferencial */}
      {activeDifferentials.length > 0 && (
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-surface-200 dark:border-dark-50 pb-2">
            <Microscope size={12} className="text-emerald-500" /> Conteo Diferencial
            {exam.totalCells > 0 && (
              <span className="ml-auto text-emerald-600 dark:text-emerald-400 font-bold">
                Total: {exam.totalCells}%
              </span>
            )}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {activeDifferentials.map((field) => (
              <div
                key={field.key}
                className="bg-surface-50 dark:bg-dark-100 p-3 rounded-xl border border-surface-200 dark:border-dark-50 text-center"
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  {field.abbr}
                </p>
                <p className="text-sm font-black text-slate-800 dark:text-white">
                  {exam.differentialCount?.[field.key]}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hemotrópico */}
      {exam.hemotropico && (
        <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-200 dark:border-purple-800 flex gap-3 items-start">
          <AlertTriangle size={18} className="text-purple-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">
              Hemotrópico
            </p>
            <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">
              {exam.hemotropico}
            </p>
          </div>
        </div>
      )}

      {/* Observaciones */}
      {exam.observacion && (
        <div className="bg-warning-50 dark:bg-warning-950/20 p-4 rounded-2xl border border-warning-200 dark:border-warning-800 flex gap-3 items-start">
          <StickyNote size={18} className="text-warning-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-black text-warning-600 dark:text-warning-400 uppercase tracking-widest mb-1">
              Observaciones
            </p>
            <p className="text-sm text-warning-800 dark:text-warning-200 italic leading-relaxed">
              "{exam.observacion}"
            </p>
          </div>
        </div>
      )}

      {/* Info Adicional */}
      {(exam.treatingVet || exam.ownerName) && (
        <div className="grid grid-cols-2 gap-3">
          {exam.treatingVet && (
            <div className="bg-surface-50 dark:bg-dark-100 p-3 rounded-xl border border-surface-200 dark:border-dark-50">
              <div className="flex items-center gap-2 mb-1">
                <User size={12} className="text-biovet-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  Veterinario
                </span>
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                {exam.treatingVet}
              </p>
            </div>
          )}
          {exam.ownerName && (
            <div className="bg-surface-50 dark:bg-dark-100 p-3 rounded-xl border border-surface-200 dark:border-dark-50">
              <div className="flex items-center gap-2 mb-1">
                <User size={12} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  Propietario
                </span>
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                {exam.ownerName}
              </p>
            </div>
          )}
        </div>
      )}
    </DetailModal>
  );
}