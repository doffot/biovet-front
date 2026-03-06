import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLabExamsByPatient, deleteLabExam } from "../../api/labExamAPI";
import { FlaskConical, Loader2, FileSearch } from "lucide-react";
import { toast } from "../../components/Toast";

// Componentes propios
import ExamTimelineItem from "@/components/labexam/ExamTimelineItem";
import LabExamDetailModal from "@/components/labexam/LabExamDetailModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import TimelineLayout from "@/components/ui/TimeLineLayout";
import { getExamConfig } from "@/components/labexam/config/examConfig";

// Modales de detalle
import CytologyDetailModal from "@/components/labexam/modals/CytologyDetailModal";
import UrinalysisDetailModal from "@/components/labexam/modals/UrinalysisDetailModal";
import QuickTestDetailModal from "@/components/labexam/modals/QuickTestDetailModal";
import SkinScrapingDetailModal from "@/components/labexam/modals/SkinScrapingDetailModal";
import TrichogramDetailModal from "@/components/labexam/modals/TrichogramDetailModal";

// Modales de PDF/Share
import ShareResultsModal from "@/components/labexam/ShareResultsModal";
import ShareCytologyResultsModal from "@/components/labexam/ShareCytologyResultsModal";
import ShareUrinalysisResultsModal from "@/components/labexam/ShareUrinalysisResultsModal";
import ShareQuickTestResultsModal from "@/components/labexam/ShareQuickTestResultsModal";
import ShareSkinScrapingResultsModal from "@/components/labexam/ShareSkinScrapingResultsModal";
import ShareTrichogramResultsModal from "@/components/labexam/ShareTrichogramResultsModal";

// Hook personalizado
import { useLabExamModals } from "@/hooks/useLabExamModals";

// Types
import type { LabExam } from "../../types/labExam";
import type { Patient } from "../../types/patient";

export default function PatientLabExamListView() {
  const contextData = useOutletContext<Patient>();
  const patient: Patient = contextData;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Estado para eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<LabExam | null>(null);

  // Hook para manejar modales
  const {
    selectedExam,
    examToView,
    triggerRect,
    handleOpenDetail,
    handleCloseDetail,
    handlePrintExam,
    pdfModals,
  } = useLabExamModals();

  // Query para obtener exámenes
  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ["labExams", "patient", patient._id],
    queryFn: () => getLabExamsByPatient(patient._id),
    enabled: !!patient._id,
  });

  // Mutación para eliminar
  const { mutate: removeExam, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteLabExam(id),
    onSuccess: () => {
      toast.success("Eliminado", "Examen removido del historial");
      queryClient.invalidateQueries({
        queryKey: ["labExams", "patient", patient._id],
      });
      setIsDeleteModalOpen(false);
      setExamToDelete(null);
    },
    onError: (error: Error) => toast.error("Error", error.message),
  });

  // Ordenar exámenes por fecha
  const sortedExams = [...exams].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Obtener datos del paciente para PDFs
  const getPatientData = (exam: LabExam) => ({
    name: String(patient?.name || ""),
    species: String(patient?.species || ""),
    breed: String(patient?.breed || ""),
    owner: {
      name: String(
        exam?.ownerName ||
          (typeof patient?.owner === "object"
            ? (patient?.owner as { name?: string })?.name
            : "") ||
          "Particular"
      ),
      contact: String(exam?.ownerPhone || ""),
    },
    mainVet: String(
      exam?.treatingVet ||
        (typeof patient?.mainVet === "object"
          ? (patient?.mainVet as { name?: string })?.name
          : "") ||
        "Veterinario"
    ),
  });

  const handleDeleteClick = (exam: LabExam) => {
    setExamToDelete(exam);
    setIsDeleteModalOpen(true);
  };

  if (examsLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
      </div>
    );
  }

  const examType = examToView?.examType || "hematology";

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
      {/* Lista vacía */}
      {sortedExams.length === 0 ? (
        <div className="ml-8 text-center py-16 border-2 border-dashed border-emerald-200 dark:border-emerald-900 rounded-2xl">
          <FileSearch className="w-12 h-12 mx-auto text-emerald-300 dark:text-emerald-700 mb-3 opacity-50" />
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-1">
            Sin historial de laboratorio
          </p>
          <p className="text-xs text-slate-300 dark:text-slate-600">
            Registra el primer examen
          </p>
        </div>
      ) : (
        /* Lista de exámenes */
        sortedExams.map((exam) => (
          <ExamTimelineItem
            key={exam._id}
            exam={exam}
            onView={handleOpenDetail}
            onPrint={handlePrintExam}
            onDelete={handleDeleteClick}
          />
        ))
      )}

      {/* ==================== MODALES DE DETALLE ==================== */}
      
      {/* Hematología */}
      {examToView && examType === "hematology" && (
        <LabExamDetailModal
          isOpen={!!examToView}
          onClose={handleCloseDetail}
          exam={examToView}
          triggerRect={triggerRect}
        />
      )}

      {/* Citología */}
      {examToView && examType === "cytology" && (
        <CytologyDetailModal
          exam={examToView}
          onClose={handleCloseDetail}
          onPrint={handlePrintExam}
        />
      )}

      {/* Uroanálisis */}
      {examToView && examType === "urinalysis" && (
        <UrinalysisDetailModal
          exam={examToView}
          onClose={handleCloseDetail}
          onPrint={handlePrintExam}
        />
      )}

      {/* Test Rápido */}
      {examToView && examType === "test" && (
        <QuickTestDetailModal
          exam={examToView}
          onClose={handleCloseDetail}
          onPrint={handlePrintExam}
        />
      )}

      {/* Raspado Cutáneo */}
      {examToView && examType === "skin_scraping" && (
        <SkinScrapingDetailModal
          exam={examToView}
          onClose={handleCloseDetail}
          onPrint={handlePrintExam}
        />
      )}

      {/* Tricograma */}
      {examToView && examType === "trichogram" && (
        <TrichogramDetailModal
          exam={examToView}
          onClose={handleCloseDetail}
          onPrint={handlePrintExam}
        />
      )}

      {/* ==================== MODALES PDF ==================== */}
      
      {pdfModals.hematology.isOpen && selectedExam && (
        <ShareResultsModal
          isOpen={pdfModals.hematology.isOpen}
          onClose={pdfModals.hematology.close}
          examData={selectedExam}
          patientData={getPatientData(selectedExam)}
        />
      )}

      {pdfModals.cytology.isOpen && selectedExam && (
        <ShareCytologyResultsModal
          isOpen={pdfModals.cytology.isOpen}
          onClose={pdfModals.cytology.close}
          examData={selectedExam}
          patientData={getPatientData(selectedExam)}
        />
      )}

      {pdfModals.urinalysis.isOpen && selectedExam && (
        <ShareUrinalysisResultsModal
          isOpen={pdfModals.urinalysis.isOpen}
          onClose={pdfModals.urinalysis.close}
          examData={selectedExam}
          patientData={getPatientData(selectedExam)}
        />
      )}

      {pdfModals.test.isOpen && selectedExam && (
        <ShareQuickTestResultsModal
          isOpen={pdfModals.test.isOpen}
          onClose={pdfModals.test.close}
          examData={selectedExam}
          patientData={getPatientData(selectedExam)}
        />
      )}

      {pdfModals.skin_scraping.isOpen && selectedExam && (
        <ShareSkinScrapingResultsModal
          isOpen={pdfModals.skin_scraping.isOpen}
          onClose={pdfModals.skin_scraping.close}
          examData={selectedExam}
          patientData={getPatientData(selectedExam)}
        />
      )}

      {pdfModals.trichogram.isOpen && selectedExam && (
        <ShareTrichogramResultsModal
          isOpen={pdfModals.trichogram.isOpen}
          onClose={pdfModals.trichogram.close}
          examData={selectedExam}
          patientData={getPatientData(selectedExam)}
        />
      )}

      {/* ==================== MODAL ELIMINAR ==================== */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setExamToDelete(null);
        }}
        onConfirm={() => examToDelete?._id && removeExam(examToDelete._id)}
        variant="danger"
        title={`Eliminar ${examToDelete ? getExamConfig(examToDelete.examType).name : "Examen"}`}
        message={`¿Eliminar ${examToDelete ? getExamConfig(examToDelete.examType).name.toLowerCase() : "examen"} del ${examToDelete ? new Date(examToDelete.date).toLocaleDateString() : ""}?`}
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </TimelineLayout>
  );
}