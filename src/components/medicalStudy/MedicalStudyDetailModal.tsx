// src/components/medicalStudy/MedicalStudyDetailModal.tsx

import { useState, useEffect } from "react";
import {
  ScanLine,
  Calendar,
  User,
  FileText,
  Download,
  Loader2,
  Stethoscope,
  StickyNote,
  ExternalLink,
  Eye,
  ArrowLeft,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "@/components/Toast";
import type { MedicalStudy } from "@/types/medicalStudy";

interface MedicalStudyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: MedicalStudy | null;
  triggerRect?: DOMRect | null;
}

export default function MedicalStudyDetailModal({
  isOpen,
  onClose,
  study,
  triggerRect,
}: MedicalStudyDetailModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Estados del visor PDF
  const [viewMode, setViewMode] = useState<"info" | "pdf">("info");
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);

  // Animación de entrada/salida
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setViewMode("info"); // Reset al abrir
      setPdfLoading(true);
      setPdfError(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Timeout para el visor PDF
  useEffect(() => {
    if (viewMode === "pdf") {
      const timeout = setTimeout(() => {
        if (pdfLoading) {
          setPdfError(true);
          setPdfLoading(false);
        }
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [viewMode, pdfLoading]);

  if (!isVisible || !study) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getFileName = () => {
    const dateStr = new Date(study.date).toISOString().split("T")[0];
    const typeSafe = study.studyType.replace(/\s+/g, "_");
    return `${typeSafe}_${dateStr}.pdf`;
  };

  // Descargar PDF
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(study.pdfFile);
      if (!response.ok) throw new Error("Error de red");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getFileName();

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Descarga iniciada", "Archivo guardado correctamente");
    } catch (error) {
      console.warn("Descarga fallida, abriendo pestaña...", error);
      window.open(study.pdfFile, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDownloading) {
      onClose();
    }
  };

  const handleIframeLoad = () => setPdfLoading(false);

  // Estilos del modal según animación
  const getModalStyles = (): React.CSSProperties => {
    if (!isAnimating && triggerRect) {
      const centerX = triggerRect.left + triggerRect.width / 2;
      const centerY = triggerRect.top + triggerRect.height / 2;
      return {
        position: "fixed",
        top: centerY,
        left: centerX,
        transform: "translate(-50%, -50%) scale(0.15)",
        opacity: 0,
      };
    }
    return {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%) scale(1)",
      opacity: 1,
    };
  };

  return (
    <div
      className={`
        fixed inset-0 z-50
        transition-all duration-400 ease-out
        ${isAnimating ? "bg-black/70 backdrop-blur-sm" : "bg-transparent"}
      `}
      onClick={handleBackdropClick}
    >
      {/* Modal */}
      <div
        className={`
          bg-white dark:bg-dark-200 
          rounded-2xl shadow-2xl overflow-hidden
          border border-surface-200 dark:border-dark-100
          flex flex-col
          ${isDownloading ? "pointer-events-none opacity-50" : ""}
          ${viewMode === "pdf" ? "w-full max-w-5xl h-[90vh]" : "w-full max-w-lg max-h-[85vh]"}
        `}
        style={{
          ...getModalStyles(),
          transition: "all 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-cyan-50 dark:bg-cyan-950/20 px-5 py-4 border-b border-cyan-200 dark:border-cyan-800 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {viewMode === "pdf" && (
                <button
                  onClick={() => {
                    setViewMode("info");
                    setPdfError(false);
                    setPdfLoading(true);
                  }}
                  className="p-1.5 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 rounded-lg transition-colors text-cyan-600 dark:text-cyan-400"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div className="w-11 h-11 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 shadow-sm">
                <ScanLine size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black font-heading text-slate-800 dark:text-white leading-tight">
                  {study.studyType}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {formatDate(study.date)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {viewMode === "pdf" && (
                <a
                  href={study.pdfFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 rounded-lg transition-colors text-slate-400 hover:text-cyan-600"
                  title="Abrir en nueva pestaña"
                >
                  <ExternalLink size={18} />
                </a>
              )}
              <button
                onClick={onClose}
                disabled={isDownloading}
                className="p-2 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === "info" ? (
          /* ══════════════════════════════════════════
             VISTA DE INFORMACIÓN
             ══════════════════════════════════════════ */
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
            {/* Profesional */}
            <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50">
              <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-biovet-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Profesional / Centro
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {study.professional}
              </p>
            </div>

            {/* Fecha */}
            <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-cyan-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Fecha del Estudio
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {formatDate(study.date)}
              </p>
            </div>

            {/* Archivo PDF */}
            <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-500">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    Archivo PDF
                  </p>
                  <p className="text-xs text-slate-400 truncate">{getFileName()}</p>
                </div>
              </div>
            </div>

            {/* Diagnóstico Presuntivo */}
            {study.presumptiveDiagnosis && (
              <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-200 dark:border-purple-800 flex gap-3 items-start">
                <Stethoscope size={18} className="text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">
                    Diagnóstico Presuntivo
                  </p>
                  <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
                    {study.presumptiveDiagnosis}
                  </p>
                </div>
              </div>
            )}

            {/* Notas */}
            {study.notes && (
              <div className="bg-warning-50 dark:bg-warning-950/20 p-4 rounded-2xl border border-warning-200 dark:border-warning-800 flex gap-3 items-start">
                <StickyNote size={18} className="text-warning-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-warning-600 dark:text-warning-400 uppercase tracking-widest mb-1">
                    Notas
                  </p>
                  <p className="text-sm text-warning-800 dark:text-warning-200 italic leading-relaxed">
                    "{study.notes}"
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ══════════════════════════════════════════
             VISTA DE PDF
             ══════════════════════════════════════════ */
          <div className="flex-1 relative bg-slate-100 dark:bg-black min-h-100">
            {pdfLoading && !pdfError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 z-10 backdrop-blur-sm">
                <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-3" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Cargando documento...
                </p>
              </div>
            )}

            {pdfError ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  No se pudo previsualizar el PDF.
                </p>
                <button
                  onClick={() => window.open(study.pdfFile, "_blank")}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 text-white font-bold text-sm hover:bg-cyan-600 transition-colors flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  Abrir Externamente
                </button>
              </div>
            ) : (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(study.pdfFile)}&embedded=true`}
                className="w-full h-full border-none"
                onLoad={handleIframeLoad}
                title="Visor PDF"
              />
            )}
          </div>
        )}

        {/* Footer */}
        <div className="shrink-0 p-4 bg-surface-50 dark:bg-dark-300 border-t border-surface-200 dark:border-dark-100">
          <div className="grid grid-cols-2 gap-3">
            {/* Botón Descargar */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white dark:bg-dark-100 border border-surface-200 dark:border-dark-50 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-surface-100 dark:hover:bg-dark-50 transition-colors disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Download size={18} />
              )}
              Descargar
            </button>

            {/* Botón Ver PDF / Cerrar */}
            {viewMode === "info" ? (
              <button
                onClick={() => setViewMode("pdf")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm transition-colors shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
              >
                <Eye size={18} />
                Ver PDF
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-200 dark:bg-dark-50 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-surface-300 dark:hover:bg-dark-100 transition-colors active:scale-[0.98]"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}