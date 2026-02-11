// src/views/labexam/PatientLabExamListView.tsx

import { useState } from "react";
import { Link, useParams} from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLabExamsByPatient, deleteLabExam } from "../../api/labExamAPI";
import { getPatientById } from "../../api/patientAPI";
import {
  FlaskConical,
  PlusCircleIcon,
  Calendar,
  Eye,
  Trash2,
  Printer,
  Loader2,
  FileSearch,
  ChevronRight,
} from "lucide-react";
import { toast } from "../../components/Toast";
import LabExamModal from "../../components/labexam/LabExamModal";
import ShareResultsModal from "@/components/labexam/ShareResultsModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import type { LabExam } from "../../types/labExam";

export default function PatientLabExamListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();
  // const navigate = useNavigate();

  const [selectedExam, setSelectedExam] = useState<LabExam | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<LabExam | null>(null);

  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ["labExams", "patient", patientId],
    queryFn: () => getLabExamsByPatient(patientId!),
    enabled: !!patientId,
  });

  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const { mutate: removeExam, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteLabExam(id),
    onSuccess: () => {
      toast.success("Eliminado", "El hemograma ha sido removido del historial.");
      queryClient.invalidateQueries({ queryKey: ["labExams", "patient", patientId] });
      setIsDeleteModalOpen(false);
      setExamToDelete(null);
    },
    onError: (error: Error) => toast.error("Error", error.message),
  });

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));

  const sortedExams = [...exams].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (examsLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-biovet-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col bg-surface-50 dark:bg-dark-300 min-h-screen lg:min-h-0 lg:h-[calc(100vh-14rem)] lg:rounded-2xl lg:border lg:border-surface-200 lg:dark:border-dark-100 lg:overflow-hidden">

        {/* ═══ HEADER ═══ */}
        <div className="sticky top-0 lg:static z-40 bg-success-50 dark:bg-dark-200 border-b border-surface-200 dark:border-dark-100 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-heading text-slate-800 dark:text-white">
                Laboratorio
              </h1>
              {exams.length > 0 && (
                <span className="badge badge-neutral">{exams.length}</span>
              )}
            </div>

            <Link
              to="create"
              className="btn-primary bg-success-500 border-success-600 hover:bg-success-600 shadow-lg active:scale-95 transition-transform xs:rounded-full w-10 h-10 lg:w-auto lg:h-auto p-0 lg:px-4 lg:py-2.5 flex items-center justify-center gap-2"
            >
              <PlusCircleIcon size={20} />
              <span className="hidden lg:inline font-semibold">Agregar</span>
            </Link>
          </div>
        </div>

        {/* ═══ CONTENIDO ═══ */}
        <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-4 pb-24">
          <div className="max-w-4xl mx-auto relative pl-4 lg:pl-0">

            {/* Línea vertical timeline */}
            {sortedExams.length > 0 && (
              <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-dark-100 z-0" />
            )}

            <div className="space-y-6 relative">
              {sortedExams.length === 0 ? (
                <div className="text-center py-20 ml-10 border-2 border-dashed border-slate-200 dark:border-dark-100 rounded-2xl">
                  <FileSearch className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3 opacity-50" />
                  <p className="text-slate-400 dark:text-slate-500 font-medium mb-1">
                    Sin historial de laboratorio
                  </p>
                  <p className="text-xs text-slate-300 dark:text-slate-600">
                    Registra el primer hemograma para este paciente
                  </p>
                </div>
              ) : (
                sortedExams.map((exam) => (
                  <div
                    key={exam._id}
                    className="relative flex items-start gap-5 group"
                  >
                    {/* Dot timeline */}
                    <div className="shrink-0 relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-surface-50 dark:border-dark-300 shadow-sm bg-white dark:bg-dark-200 text-amber-500">
                      <FlaskConical size={18} />
                    </div>

                    {/* Card */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-white dark:bg-dark-200 p-5 rounded-2xl rounded-tl-sm shadow-sm border border-surface-200 dark:border-dark-100 hover:shadow-md transition-all duration-200 relative">

                        {/* Acciones */}
                        <div className="absolute top-4 right-4 flex gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedExam(exam);
                              setShowShareModal(true);
                            }}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-surface-50 dark:hover:bg-dark-300 transition-colors"
                            title="Generar PDF"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedExam(exam);
                              setShowViewModal(true);
                            }}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-950/30 transition-colors"
                            title="Ver Detalle"
                          >
                            <Eye size={15} />
                          </button>
                          
                          <button
                            onClick={() => {
                              setExamToDelete(exam);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/30 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* Fecha y título */}
                        <div className="mb-3 pr-28">
                          <div className="flex items-center gap-2 text-biovet-600 dark:text-biovet-400 mb-1">
                            <Calendar size={14} />
                            <span className="text-sm font-bold uppercase tracking-wider">
                              {formatDate(exam.date)}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-700 dark:text-white leading-tight">
                            Hemograma Automatizado
                          </h3>
                        </div>

                        {/* Info rápida */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <div className="flex items-center gap-1.5 text-xs bg-surface-50 dark:bg-dark-300 px-2.5 py-1 rounded-lg border border-surface-200 dark:border-dark-100">
                            <span className="text-surface-500 dark:text-slate-400">Hto:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{exam.hematocrit}%</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs bg-surface-50 dark:bg-dark-300 px-2.5 py-1 rounded-lg border border-surface-200 dark:border-dark-100">
                            <span className="text-surface-500 dark:text-slate-400">GB:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{exam.whiteBloodCells}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs bg-surface-50 dark:bg-dark-300 px-2.5 py-1 rounded-lg border border-surface-200 dark:border-dark-100">
                            <span className="text-surface-500 dark:text-slate-400">PT:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{exam.totalProtein}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs bg-surface-50 dark:bg-dark-300 px-2.5 py-1 rounded-lg border border-surface-200 dark:border-dark-100">
                            <span className="text-surface-500 dark:text-slate-400">Plaq:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{exam.platelets}</span>
                          </div>
                        </div>

                        {/* Observación preview */}
                        {exam.observacion && (
                          <div className="bg-warning-50 dark:bg-warning-950/20 p-2.5 rounded-xl border border-warning-100 dark:border-warning-900/30 mb-3">
                            <p className="text-xs text-warning-700 dark:text-warning-400 line-clamp-1 italic">
                              📝 {exam.observacion}
                            </p>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-dashed border-surface-100 dark:border-dark-100">
                          <span className="text-[11px] text-surface-400 dark:text-slate-500 font-medium">
                            ID: {exam._id?.slice(-6).toUpperCase()}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedExam(exam);
                              setShowViewModal(true);
                            }}
                            className="text-biovet-600 dark:text-biovet-400 hover:text-biovet-800 dark:hover:text-biovet-300 font-bold text-sm flex items-center gap-1 transition-colors"
                          >
                            Ver más
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MODALES ═══ */}

      
      {selectedExam && (
        <LabExamModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedExam(null);
          }}
          exam={selectedExam}
        />
      )}

     {/* ═══ MODAL DE PDF ═══ */}


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

      {/* Eliminar */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setExamToDelete(null);
        }}
        onConfirm={() => examToDelete?._id && removeExam(examToDelete._id)}
        variant="danger"
        title="Eliminar Hemograma"
        message={`¿Estás seguro de eliminar el hemograma del ${examToDelete ? formatDate(examToDelete.date) : ""}? Esta acción es permanente.`}
        confirmText="Eliminar"
        confirmIcon={Trash2}
        isLoading={isDeleting}
        loadingText="Eliminando..."
      />
    </>
  );
}