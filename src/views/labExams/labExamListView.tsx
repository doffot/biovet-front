// src/views/labExams/LabExamListView.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FlaskConical,
  Microscope,
  Droplets,
  Beaker,
  Scissors,
  TestTube,
  AlertCircle,
  Plus,
  RefreshCw,
  Trash2,
  Printer,
  FileSearch,
  Eye,  // ✅ NUEVO
} from "lucide-react";
import Spinner from "../../components/Spinner";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "@/components/Toast";
import type { LabExam } from "@/types/labExam";

import { useLabExamList } from "@/hooks/useLabExamList";

// Modales de PDF
import ShareResultsModal from "@/components/labexam/ShareResultsModal";
import ShareCytologyResultsModal from "@/components/labexam/ShareCytologyResultsModal";
import ShareUrinalysisResultsModal from "@/components/labexam/ShareUrinalysisResultsModal";
import ShareQuickTestResultsModal from "@/components/labexam/ShareQuickTestResultsModal";
import ShareSkinScrapingResultsModal from "@/components/labexam/ShareSkinScrapingResultsModal";
import ShareTrichogramResultsModal from "@/components/labexam/ShareTrichogramResultsModal";

// ✅ NUEVO: Modales de Detalle
import LabExamDetailModal from "@/components/labexam/LabExamDetailModal";
import CytologyDetailModal from "@/components/labexam/modals/CytologyDetailModal";
import UrinalysisDetailModal from "@/components/labexam/modals/UrinalysisDetailModal";
import QuickTestDetailModal from "@/components/labexam/modals/QuickTestDetailModal";
import SkinScrapingDetailModal from "@/components/labexam/modals/SkinScrapingDetailModal";
import TrichogramDetailModal from "@/components/labexam/modals/TrichogramDetailModal";

import { LabExamStats } from "@/components/labexam/LabExamStats";
import { LabExamFilters } from "@/components/labexam/LabExamFilters";
import { LabExamPagination } from "@/components/labexam/LabExamPagination";
import { LabExamListHeader } from "@/components/labexam/LabExamListHeader";

// =============================================
// CONFIGURACIÓN POR TIPO DE EXAMEN
// =============================================
const EXAM_TYPE_CONFIG: Record<
  string,
  {
    name: string;
    icon: typeof FlaskConical;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
  }
> = {
  hematology: {
    name: "Hemograma",
    icon: FlaskConical,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  cytology: {
    name: "Citología",
    icon: Microscope,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    textColor: "text-purple-600 dark:text-purple-400",
  },
  urinalysis: {
    name: "Uroanálisis",
    icon: Droplets,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  test: {
    name: "Test Rápido",
    icon: Beaker,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    textColor: "text-cyan-600 dark:text-cyan-400",
  },
  skin_scraping: {
    name: "Raspado Cutáneo",
    icon: Scissors,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  trichogram: {
    name: "Tricograma",
    icon: TestTube,
    color: "text-teal-500",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    borderColor: "border-teal-200 dark:border-teal-800",
    textColor: "text-teal-600 dark:text-teal-400",
  },
};

const DEFAULT_CONFIG = {
  name: "Examen",
  icon: FlaskConical,
  color: "text-slate-500",
  bgColor: "bg-slate-50 dark:bg-slate-950/30",
  borderColor: "border-slate-200 dark:border-slate-800",
  textColor: "text-slate-600 dark:text-slate-400",
};

const getExamConfig = (examType?: string) => {
  return EXAM_TYPE_CONFIG[examType || "hematology"] || DEFAULT_CONFIG;
};

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function LabExamListView() {
  const navigate = useNavigate();

  // ✅ Estado para modal de detalle
  const [examToView, setExamToView] = useState<LabExam | null>(null);

  // Estados para modales de PDF
  const [selectedExam, setSelectedExam] = useState<LabExam | null>(null);
  const [showHematologyModal, setShowHematologyModal] = useState(false);
  const [showCytologyModal, setShowCytologyModal] = useState(false);
  const [showUrinalysisModal, setShowUrinalysisModal] = useState(false);
  const [showQuickTestModal, setShowQuickTestModal] = useState(false);
  const [showSkinScrapingModal, setShowSkinScrapingModal] = useState(false);
  const [showTrichogramModal, setShowTrichogramModal] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    speciesFilter,
    setSpeciesFilter,
    examTypeFilter,
    setExamTypeFilter,
    currentPage,
    setCurrentPage,
    isDeleteModalOpen,
    examToDelete,

    currentExams,
    filteredExams,
    stats,
    isLoading,
    isError,
    error,
    isDeleting,
    hasActiveFilters,

    totalPages,
    startIndex,
    itemsPerPage,

    handleDeleteClick,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleClearFilters,
  } = useLabExamList();

  // ══════════════════════════════════════════
  // VER DETALLE
  // ══════════════════════════════════════════
  const handleViewExam = (exam: LabExam) => {
    setExamToView(exam);
  };

  const handleCloseDetail = () => {
    setExamToView(null);
  };

  // ══════════════════════════════════════════
  // ABRIR MODAL DE PDF SEGÚN TIPO
  // ══════════════════════════════════════════
  const handlePrintExam = (exam: LabExam) => {
    setSelectedExam(exam);
    const examType = exam.examType || "hematology";

    switch (examType) {
      case "hematology":
        setShowHematologyModal(true);
        break;
      case "cytology":
        setShowCytologyModal(true);
        break;
      case "urinalysis":
        setShowUrinalysisModal(true);
        break;
      case "test":
        setShowQuickTestModal(true);
        break;
      case "skin_scraping":
        setShowSkinScrapingModal(true);
        break;
      case "trichogram":
        setShowTrichogramModal(true);
        break;
      default:
        toast.error("Error", "Tipo de examen no soportado");
    }
  };

  // ══════════════════════════════════════════
  // DATOS PARA PDF (pacientes externos)
  // ══════════════════════════════════════════
  const getPatientData = (exam: LabExam) => ({
    name: exam.patientName || "",
    species: exam.species || "",
    breed: exam.breed || "",
    owner: {
      name: exam.ownerName || "Particular",
      contact: exam.ownerPhone || "",
    },
    mainVet: exam.treatingVet || "Veterinario",
  });

  // Loading
  if (isLoading) return <Spinner fullScreen size="xl" />;

  // Error
  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-100 dark:bg-dark-300">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 bg-danger-50 dark:bg-danger-950 rounded-full flex items-center justify-center border border-danger-200 dark:border-danger-800">
            <AlertCircle className="w-7 h-7 text-danger-500" />
          </div>
          <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
            Error al cargar exámenes
          </p>
          <p className="text-surface-500 dark:text-slate-400 text-xs mb-3">
            {error?.message || "No se pudieron cargar los exámenes"}
          </p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const totalCountText = `${stats.total} examen${stats.total !== 1 ? "es" : ""} registrado${stats.total !== 1 ? "s" : ""}`;
  const examType = examToView?.examType || "hematology";

  return (
    <div className="flex flex-col h-full bg-surface-100 dark:bg-dark-300">
      {/* ========================================
          HEADER FIJO
          ======================================== */}
      <div className="shrink-0 px-4 sm:px-8 pt-4 sm:pt-6 pb-0 space-y-4 sm:space-y-5">
        <LabExamListHeader
          totalCount={totalCountText}
          onBack={() => navigate(-1)}
        />

        <LabExamStats stats={stats} />

        <LabExamFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          speciesFilter={speciesFilter}
          onSpeciesChange={setSpeciesFilter}
          examTypeFilter={examTypeFilter}
          onExamTypeChange={setExamTypeFilter}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* ========================================
          CONTENIDO SCROLLEABLE
          ======================================== */}
      <div className="flex-1 overflow-hidden px-4 sm:px-8 pb-4 sm:pb-8 pt-2">
        <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm h-full flex flex-col overflow-hidden">
          {currentExams.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-surface-100 dark:bg-dark-200 rounded-full flex items-center justify-center border border-surface-300 dark:border-slate-700">
                  <FileSearch className="w-7 h-7 text-surface-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
                  {hasActiveFilters ? "Sin resultados" : "No hay exámenes registrados"}
                </p>
                <p className="text-surface-500 dark:text-slate-400 text-xs mb-3">
                  {hasActiveFilters
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Comienza registrando el primer examen"}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-950 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Limpiar filtros
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/lab/create")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-biovet-500 text-white text-sm font-semibold rounded-lg hover:bg-biovet-600 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Primer Examen
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* ══════════════════════════════════════════
                  TABLA DESKTOP
                  ══════════════════════════════════════════ */}
              <div className="hidden lg:block flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                        Propietario
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-center text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200 dark:divide-slate-700/50">
                    {currentExams.map((exam) => {
                      const config = getExamConfig(exam.examType);
                      const Icon = config.icon;

                      return (
                        <tr
                          key={exam._id}
                          className="hover:bg-surface-50 dark:hover:bg-dark-200/50 transition-colors"
                        >
                          {/* Tipo */}
                          <td className="px-4 py-3">
                            <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
                              <Icon className={`w-4 h-4 ${config.color}`} />
                              <span className={`text-xs font-semibold ${config.textColor}`}>
                                {config.name}
                              </span>
                            </div>
                          </td>

                          {/* Paciente */}
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-white">
                                {exam.patientName || "—"}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {exam.species} {exam.breed && `• ${exam.breed}`}
                              </p>
                            </div>
                          </td>

                          {/* Propietario */}
                          <td className="px-4 py-3 hidden md:table-cell">
                            <p className="text-slate-600 dark:text-slate-300">
                              {exam.ownerName || "Particular"}
                            </p>
                            {exam.ownerPhone && (
                              <p className="text-xs text-slate-400">{exam.ownerPhone}</p>
                            )}
                          </td>

                          {/* Fecha */}
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="text-slate-600 dark:text-slate-300">
                              {new Date(exam.date).toLocaleDateString("es-ES")}
                            </span>
                          </td>

                          {/* Acciones */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              {/* ✅ NUEVO: Botón Ver Detalle */}
                              <button
                                onClick={() => handleViewExam(exam)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="Ver detalle"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handlePrintExam(exam)}
                                className="p-2 text-slate-400 hover:text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-950/30 rounded-lg transition-colors"
                                title="Generar PDF"
                              >
                                <Printer size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  if (exam._id) {
                                    handleDeleteClick({ _id: exam._id, patientName: exam.patientName });
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/30 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ══════════════════════════════════════════
                  CARDS MOBILE
                  ══════════════════════════════════════════ */}
              <div className="lg:hidden flex-1 overflow-auto custom-scrollbar divide-y divide-surface-200 dark:divide-slate-700/50">
                {currentExams.map((exam) => {
                  const config = getExamConfig(exam.examType);
                  const Icon = config.icon;

                  return (
                    <div key={exam._id} className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 dark:text-white">
                              {exam.patientName || "Sin nombre"}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {config.name} • {exam.species || "—"}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${config.bgColor} ${config.textColor}`}>
                          {new Date(exam.date).toLocaleDateString("es-ES")}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Propietario</span>
                          <p className="text-slate-700 dark:text-slate-200 truncate">
                            {exam.ownerName || "Particular"}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Veterinario</span>
                          <p className="text-slate-700 dark:text-slate-200 truncate">
                            {exam.treatingVet || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-200 dark:border-slate-700/50">
                        {/* ✅ NUEVO: Botón Ver */}
                        <button
                          onClick={() => handleViewExam(exam)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver
                        </button>
                        <button
                          onClick={() => handlePrintExam(exam)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-biovet-600 dark:text-biovet-400 hover:bg-biovet-50 dark:hover:bg-biovet-950/30 rounded-lg transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          PDF
                        </button>
                        <button
                          onClick={() => {
                            if (exam._id) {
                              handleDeleteClick({ _id: exam._id, patientName: exam.patientName });
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          <LabExamPagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsPerPage={itemsPerPage}
            totalItems={filteredExams.length}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* ========================================
          MODALES DE DETALLE POR TIPO
          ======================================== */}

      {/* Hematología */}
      {examToView && examType === "hematology" && (
        <LabExamDetailModal
          isOpen={!!examToView}
          onClose={handleCloseDetail}
          exam={examToView}
          triggerRect={null}
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

      {/* ========================================
          MODALES DE PDF POR TIPO
          ======================================== */}

      {showHematologyModal && selectedExam && (
        <ShareResultsModal
          isOpen={showHematologyModal}
          onClose={() => {
            setShowHematologyModal(false);
            setSelectedExam(null);
          }}
          examData={selectedExam}
          patientData={getPatientData(selectedExam)}
        />
      )}

      {showCytologyModal && selectedExam && (
        <ShareCytologyResultsModal
          isOpen={showCytologyModal}
          onClose={() => {
            setShowCytologyModal(false);
            setSelectedExam(null);
          }}
          examData={selectedExam}
          patientData={getPatientData(selectedExam)}
        />
      )}

      {showUrinalysisModal && selectedExam && (
        <ShareUrinalysisResultsModal
          isOpen={showUrinalysisModal}
          onClose={() => {
            setShowUrinalysisModal(false);
            setSelectedExam(null);
          }}
          examData={selectedExam}
          patientData={getPatientData(selectedExam)}
        />
      )}

      {showQuickTestModal && selectedExam && (
        <ShareQuickTestResultsModal
          isOpen={showQuickTestModal}
          onClose={() => {
            setShowQuickTestModal(false);
            setSelectedExam(null);
          }}
          examData={selectedExam}
          patientData={getPatientData(selectedExam)}
        />
      )}

      {showSkinScrapingModal && selectedExam && (
        <ShareSkinScrapingResultsModal
          isOpen={showSkinScrapingModal}
          onClose={() => {
            setShowSkinScrapingModal(false);
            setSelectedExam(null);
          }}
          examData={selectedExam}
          patientData={getPatientData(selectedExam)}
        />
      )}

      {showTrichogramModal && selectedExam && (
        <ShareTrichogramResultsModal
          isOpen={showTrichogramModal}
          onClose={() => {
            setShowTrichogramModal(false);
            setSelectedExam(null);
          }}
          examData={selectedExam}
          patientData={getPatientData(selectedExam)}
        />
      )}

      {/* ========================================
          DELETE MODAL
          ======================================== */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Examen"
        message={
          <p className="text-slate-700 dark:text-slate-200">
            ¿Estás seguro de que deseas eliminar el examen de{" "}
            <span className="font-bold text-danger-500">{examToDelete?.name}</span>?
            Esta acción no se puede deshacer.
          </p>
        }
        variant="danger"
        confirmText="Eliminar Examen"
        confirmIcon={Trash2}
        isLoading={isDeleting}
        loadingText="Eliminando..."
      />
    </div>
  );
}