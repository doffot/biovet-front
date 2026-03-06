import { useState } from "react";
import type { LabExam } from "@/types/labExam";

export function useLabExamModals() {
  const [selectedExam, setSelectedExam] = useState<LabExam | null>(null);
  const [examToView, setExamToView] = useState<LabExam | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  // Estados para modales de PDF
  const [showHematologyModal, setShowHematologyModal] = useState(false);
  const [showCytologyModal, setShowCytologyModal] = useState(false);
  const [showUrinalysisModal, setShowUrinalysisModal] = useState(false);
  const [showQuickTestModal, setShowQuickTestModal] = useState(false);
  const [showSkinScrapingModal, setShowSkinScrapingModal] = useState(false);
  const [showTrichogramModal, setShowTrichogramModal] = useState(false);

  const handleOpenDetail = (exam: LabExam, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTriggerRect(rect);
    setExamToView(exam);
  };

  const handleCloseDetail = () => {
    setExamToView(null);
  };

  const handlePrintExam = (exam: LabExam) => {
    setSelectedExam(exam);
    const examType = exam.examType || "hematology";

    const modalMap: Record<string, () => void> = {
      hematology: () => setShowHematologyModal(true),
      cytology: () => setShowCytologyModal(true),
      urinalysis: () => setShowUrinalysisModal(true),
      test: () => setShowQuickTestModal(true),
      skin_scraping: () => setShowSkinScrapingModal(true),
      trichogram: () => setShowTrichogramModal(true),
    };

    modalMap[examType]?.();
  };

  const closeAllPrintModals = () => {
    setShowHematologyModal(false);
    setShowCytologyModal(false);
    setShowUrinalysisModal(false);
    setShowQuickTestModal(false);
    setShowSkinScrapingModal(false);
    setShowTrichogramModal(false);
    setSelectedExam(null);
  };

  return {
    // Estado de examen seleccionado para PDF
    selectedExam,
    
    // Estado del modal de detalle
    examToView,
    triggerRect,
    handleOpenDetail,
    handleCloseDetail,
    
    // Control de modales de PDF
    handlePrintExam,
    closeAllPrintModals,
    
    // Estados individuales de modales PDF
    pdfModals: {
      hematology: {
        isOpen: showHematologyModal,
        close: () => { setShowHematologyModal(false); setSelectedExam(null); },
      },
      cytology: {
        isOpen: showCytologyModal,
        close: () => { setShowCytologyModal(false); setSelectedExam(null); },
      },
      urinalysis: {
        isOpen: showUrinalysisModal,
        close: () => { setShowUrinalysisModal(false); setSelectedExam(null); },
      },
      test: {
        isOpen: showQuickTestModal,
        close: () => { setShowQuickTestModal(false); setSelectedExam(null); },
      },
      skin_scraping: {
        isOpen: showSkinScrapingModal,
        close: () => { setShowSkinScrapingModal(false); setSelectedExam(null); },
      },
      trichogram: {
        isOpen: showTrichogramModal,
        close: () => { setShowTrichogramModal(false); setSelectedExam(null); },
      },
    },
  };
}