// src/views/labexam/PatientLabExamListView.tsx

import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLabExamsByPatient, deleteLabExam } from "../../api/labExamAPI";
import {
  FlaskConical,
  Trash2,
  Printer,
  Loader2,
  FileSearch,
  ChevronRight,
} from "lucide-react";
import { toast } from "../../components/Toast";
import LabExamDetailModal from "@/components/labexam/LabExamDetailModal";
import ShareResultsModal from "@/components/labexam/ShareResultsModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import TimelineLayout from "@/components/ui/TimelineLayout";
import type { LabExam } from "../../types/labExam";
import type { Patient } from "../../types/patient";

export default function PatientLabExamListView() {
  const contextData = useOutletContext<any>();
  const patient: Patient = contextData.patient || contextData;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [selectedExam, setSelectedExam] = useState<LabExam | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<LabExam | null>(null);

  // ══════════════════════════════════════════
  // Estados para el modal de detalle
  // ══════════════════════════════════════════
  const [examToView, setExamToView] = useState<LabExam | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ["labExams", "patient", patient._id],
    queryFn: () => getLabExamsByPatient(patient._id),
    enabled: !!patient._id,
  });

  const { mutate: removeExam, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteLabExam(id),
    onSuccess: () => {
      toast.success("Eliminado", "Hemograma removido del historial");
      queryClient.invalidateQueries({ queryKey: ["labExams", "patient", patient._id] });
      setIsDeleteModalOpen(false);
      setExamToDelete(null);
    },
    onError: (error: Error) => toast.error("Error", error.message),
  });

  const sortedExams = [...exams].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // ══════════════════════════════════════════
  // Handler para abrir detalle con posición
  // ══════════════════════════════════════════
  const handleOpenDetail = (exam: LabExam, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTriggerRect(rect);
    setExamToView(exam);
  };

  if (examsLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <TimelineLayout
      title="Exámenes"
      subtitle={`Historial de ${patient?.name}`}
      headerIcon={FlaskConical}
      count={exams.length}
      countLabel="estudios"
      onAdd={() => navigate("create")}
      variant="examenes"
    >
      {sortedExams.length === 0 ? (
        <div className="ml-8 text-center py-16 border-2 border-dashed border-emerald-200 dark:border-emerald-900 rounded-2xl">
          <FileSearch className="w-12 h-12 mx-auto text-emerald-300 dark:text-emerald-700 mb-3 opacity-50" />
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-1">Sin historial de laboratorio</p>
          <p className="text-xs text-slate-300 dark:text-slate-600">Registra el primer hemograma</p>
        </div>
      ) : (
        sortedExams.map((exam) => (
          <div key={exam._id} className="relative flex gap-6 md:gap-8 group animate-fade-in">
            {/* Icono Timeline */}
            <div className="relative z-10 shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 shadow-sm transition-transform group-hover:scale-110">
              <FlaskConical size={14} strokeWidth={2.5} />
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                    Hemograma Automatizado
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {new Date(exam.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedExam(exam);
                      setShowShareModal(true);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Generar PDF"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setExamToDelete(exam);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-danger-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Valores principales */}
              <div className="mt-3 flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs bg-emerald-50/50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-emerald-600 dark:text-emerald-400">Hto:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{exam.hematocrit}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs bg-emerald-50/50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-emerald-600 dark:text-emerald-400">GB:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{exam.whiteBloodCells}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs bg-emerald-50/50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-emerald-600 dark:text-emerald-400">PT:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{exam.totalProtein}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs bg-emerald-50/50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-emerald-600 dark:text-emerald-400">Plaq:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{exam.platelets}</span>
                </div>
              </div>

              {/* Observación */}
              {exam.observacion && (
                <div className="mt-3 bg-warning-50/50 dark:bg-warning-950/20 p-2.5 rounded-xl border border-warning-100 dark:border-warning-900/30">
                  <p className="text-xs text-warning-700 dark:text-warning-400 line-clamp-1 italic">
                    {exam.observacion}
                  </p>
                </div>
              )}

              {/* Botón Ver Detalle */}
              <div className="mt-3 flex justify-end">
                <button
                  onClick={(e) => handleOpenDetail(exam, e)}
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold text-sm flex items-center gap-1 transition-colors"
                >
                  Ver Detalle <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Modal Ver Detalle */}
      <LabExamDetailModal
        isOpen={!!examToView}
        onClose={() => setExamToView(null)}
        exam={examToView}
        triggerRect={triggerRect}
      />

      {/* Modal Compartir/PDF */}
      {showShareModal && selectedExam && patient && (
        <ShareResultsModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedExam(null);
          }}
          examData={selectedExam}
          patientData={{
            name: String(patient?.name || ""),
            species: String(patient?.species || ""),
            breed: String(patient?.breed || ""),
            owner: {
              name: String(selectedExam?.ownerName || (typeof patient?.owner === 'object' ? (patient?.owner as any)?.name : '') || "Particular"),
              contact: String(selectedExam?.ownerPhone || "")
            },
            mainVet: String(selectedExam?.treatingVet || (typeof patient?.mainVet === 'object' ? (patient?.mainVet as any)?.name : '') || "Veterinario")
          }}
        />
      )}

      {/* Modal Eliminar */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setExamToDelete(null);
        }}
        onConfirm={() => examToDelete?._id && removeExam(examToDelete._id)}
        variant="danger"
        title="Eliminar Hemograma"
        message={`¿Eliminar hemograma del ${examToDelete ? new Date(examToDelete.date).toLocaleDateString() : ""}?`}
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </TimelineLayout>
  );
}