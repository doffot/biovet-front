// src/views/medicalStudy/MedicalStudyListView.tsx

import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ScanLine,
  Trash2,
  Loader2,
  Download,
  FileSearch,
  ChevronRight,
} from "lucide-react";
import {
  getMedicalStudiesByPatient,
  deleteMedicalStudy,
} from "@/api/medicalStudyAPI";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import MedicalStudyDetailModal from "@/components/medicalStudy/MedicalStudyDetailModal";
import TimelineLayout from "@/components/ui/TimeLineLayout";
import type { MedicalStudy } from "@/types/medicalStudy";
import type { Patient } from "@/types/patient";

export default function MedicalStudyListView() {
  const contextData = useOutletContext<any>();
  const patient: Patient = contextData.patient || contextData;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [studyToDelete, setStudyToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // ══════════════════════════════════════════
  // Estados para el modal de detalle
  // ══════════════════════════════════════════
  const [studyToView, setStudyToView] = useState<MedicalStudy | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const { data: studies = [], isLoading } = useQuery({
    queryKey: ["medicalStudies", patient._id],
    queryFn: () => getMedicalStudiesByPatient(patient._id),
    enabled: !!patient._id,
  });

  const { mutate: removeStudy, isPending: isDeleting } = useMutation({
    mutationFn: deleteMedicalStudy,
    onSuccess: () => {
      toast.success("Eliminado", "Estudio removido correctamente");
      queryClient.invalidateQueries({
        queryKey: ["medicalStudies", patient._id],
      });
      setStudyToDelete(null);
    },
    onError: (error: Error) => toast.error("Error al eliminar", error.message),
  });

  const handleDownload = async (study: MedicalStudy) => {
    setDownloadingId(study._id!);
    try {
      const response = await fetch(study.pdfFile);
      if (!response.ok) throw new Error("Error de red");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const dateStr = new Date(study.date).toISOString().split("T")[0];
      const typeSafe = study.studyType.replace(/\s+/g, "_");
      link.download = `${typeSafe}_${dateStr}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Descarga iniciada", "Archivo guardado correctamente");
    } catch (error) {
      console.warn("Descarga fallida, abriendo pestaña...", error);
      window.open(study.pdfFile, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  // ══════════════════════════════════════════
  // Handler para abrir detalle con posición
  // ══════════════════════════════════════════
  const handleOpenDetail = (
    study: MedicalStudy,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTriggerRect(rect);
    setStudyToView(study);
  };

  const sortedStudies = [...studies].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <TimelineLayout
      title="Estudios"
      subtitle={`Historial de ${patient?.name}`}
      headerIcon={ScanLine}
      count={studies.length}
      countLabel="estudios"
      onAdd={() => navigate("create")}
      variant="estudios"
    >
      {sortedStudies.length === 0 ? (
        <div className="ml-8 text-center py-16 border-2 border-dashed border-cyan-200 dark:border-cyan-900 rounded-2xl">
          <FileSearch className="w-12 h-12 mx-auto text-cyan-300 dark:text-cyan-700 mb-3 opacity-50" />
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-1">
            Sin estudios médicos registrados
          </p>
          <p className="text-xs text-slate-300 dark:text-slate-600">
            Sube el primer archivo de imagen
          </p>
        </div>
      ) : (
        sortedStudies.map((study) => (
          <div
            key={study._id}
            className="relative flex gap-6 md:gap-8 group animate-fade-in"
          >
            {/* Icono Timeline */}
            <div className="relative z-10 shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-lg border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/30 flex items-center justify-center text-cyan-500 shadow-sm transition-transform group-hover:scale-110">
              <ScanLine size={14} strokeWidth={2.5} />
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                    {study.studyType}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {new Date(study.date).toLocaleDateString()}
                    </span>
                    <span className="opacity-70">{study.professional}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDownload(study)}
                    disabled={downloadingId === study._id}
                    className="p-2 text-slate-400 hover:text-cyan-500 transition-colors disabled:opacity-50"
                    title="Descargar PDF"
                  >
                    {downloadingId === study._id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Download size={18} />
                    )}
                  </button>

                  <button
                    onClick={() =>
                      setStudyToDelete({
                        id: study._id!,
                        name: study.studyType,
                      })
                    }
                    className="p-2 text-slate-400 hover:text-danger-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Diagnóstico presuntivo */}
              {study.presumptiveDiagnosis && (
                <div className="mt-3 bg-purple-50/50 dark:bg-purple-950/20 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/30">
                  <p className="text-xs text-purple-700 dark:text-purple-400 line-clamp-1 italic">
                    {study.presumptiveDiagnosis}
                  </p>
                </div>
              )}

              {/* Notas (si no hay diagnóstico) */}
              {!study.presumptiveDiagnosis && study.notes && (
                <div className="mt-3 bg-warning-50/50 dark:bg-warning-950/20 p-2.5 rounded-xl border border-warning-100 dark:border-warning-900/30">
                  <p className="text-xs text-warning-700 dark:text-warning-400 line-clamp-1 italic">
                    {study.notes}
                  </p>
                </div>
              )}

              {/* Botón Ver Detalle */}
              <div className="mt-3 flex justify-end">
                <button
                  onClick={(e) => handleOpenDetail(study, e)}
                  className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-bold text-sm flex items-center gap-1 transition-colors"
                >
                  Ver Detalle <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Modal Ver Detalle */}
      <MedicalStudyDetailModal
        isOpen={!!studyToView}
        onClose={() => setStudyToView(null)}
        study={studyToView}
        triggerRect={triggerRect}
      />

      {/* Modal Eliminar */}
      <ConfirmationModal
        isOpen={!!studyToDelete}
        onClose={() => setStudyToDelete(null)}
        onConfirm={() => studyToDelete?.id && removeStudy(studyToDelete.id)}
        variant="danger"
        title="Eliminar Estudio"
        message={`¿Eliminar "${studyToDelete?.name}"?`}
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </TimelineLayout>
  );
}
