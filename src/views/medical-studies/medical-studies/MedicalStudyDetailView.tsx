import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  X,  User, FileText, Download, ExternalLink, 
  ArrowLeft, Loader2, ScanLine, StickyNote, AlertCircle, Eye 
} from "lucide-react";
import { getMedicalStudyById } from "@/api/medicalStudyAPI";

export default function MedicalStudyDetailView() {
  const { studyId } = useParams<{ studyId: string }>();
  const navigate = useNavigate();
  
  // Estados de vista
  const [viewMode, setViewMode] = useState<"info" | "pdf">("info");
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  
  // Estado de descarga
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: study, isLoading } = useQuery({
    queryKey: ["medicalStudy", studyId],
    queryFn: () => getMedicalStudyById(studyId!),
    enabled: !!studyId,
  });

  const handleClose = () => navigate(-1);

  // Lógica de Timeout para el visor
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

 
  const getFileName = () => {
    if (!study) return "estudio.pdf";
    const dateStr = new Date(study.date).toISOString().split("T")[0];
    const typeSafe = study.studyType.replace(/\s+/g, "_");
    return `${typeSafe}_${dateStr}.pdf`;
  };

  const handleDownloadPdf = async () => {
    if (!study) return;
    setIsDownloading(true);
    try {
      // Intenta descargar como Blob para renombrar
      const response = await fetch(study.pdfFile);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.warn("Descarga directa falló, abriendo en nueva pestaña...", error);
      // Fallback: abrir directo
      window.open(study.pdfFile, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"><Loader2 className="animate-spin text-white w-10 h-10" /></div>;
  if (!study) return null;

  const handleIframeLoad = () => setPdfLoading(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleClose}>
      <div 
        className={`bg-white dark:bg-dark-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-surface-200 dark:border-dark-100 flex flex-col ${
          viewMode === "pdf" ? "w-full max-w-5xl h-[90vh]" : "w-full max-w-lg"
        }`}
        onClick={e => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className="bg-indigo-50 dark:bg-dark-300 p-4 border-b border-indigo-100 dark:border-dark-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            {viewMode === "pdf" && (
              <button 
                onClick={() => { setViewMode("info"); setPdfError(false); setPdfLoading(true); }}
                className="p-1.5 hover:bg-white/50 rounded-lg transition-colors text-indigo-600 dark:text-indigo-400 mr-1"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 border border-indigo-200 dark:border-indigo-800 shadow-sm">
              <ScanLine size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-slate-800 dark:text-white leading-tight">{study.studyType}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {new Date(study.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {viewMode === "pdf" && (
              <a href={study.pdfFile} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/50 dark:hover:bg-dark-100 rounded-lg transition-colors text-slate-500" title="Abrir externo">
                <ExternalLink size={18} />
              </a>
            )}
            <button onClick={handleClose} className="p-2 hover:bg-white/50 dark:hover:bg-dark-100 rounded-lg transition-colors text-slate-500">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* CONTENT SWITCHER */}
        {viewMode === "info" ? (
          /* VISTA DE INFORMACIÓN */
          <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
            <div className="space-y-4">
              <div className="p-4 bg-surface-50 dark:bg-dark-100 rounded-xl border border-surface-200 dark:border-dark-50 shadow-sm">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center gap-1.5">
                  <User size={12} /> Profesional / Centro
                </p>
                <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{study.professional}</p>
              </div>

              {study.presumptiveDiagnosis && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <FileText size={14} className="text-indigo-500" /> Diagnóstico
                  </h3>
                  <div className="bg-white dark:bg-dark-100 p-3 rounded-lg border border-surface-200 dark:border-dark-50 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {study.presumptiveDiagnosis}
                  </div>
                </div>
              )}

              {study.notes && (
                <div className="flex gap-2 items-start text-sm text-slate-500 italic bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30">
                  <StickyNote size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <p>"{study.notes}"</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* VISTA DE PDF */
          <div className="flex-1 relative bg-slate-100 dark:bg-black w-full h-full min-h-100">
            {pdfLoading && !pdfError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 z-10 backdrop-blur-sm">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Cargando documento...</p>
              </div>
            )}

            {pdfError ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <AlertCircle className="w-12 h-12 text-slate-400 mb-2" />
                <p className="text-sm text-slate-500 mb-4">No se pudo previsualizar el PDF.</p>
                <button
                  onClick={() => window.open(study.pdfFile, "_blank")}
                  className="btn-primary bg-indigo-500 px-6 py-2"
                >
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

        {/* FOOTER */}
        <div className="p-4 bg-surface-50/50 dark:bg-dark-300/50 border-t border-surface-200 dark:border-dark-100">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white dark:bg-dark-100 border border-surface-200 dark:border-dark-50 text-slate-600 dark:text-slate-300 font-bold hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors disabled:opacity-50"
            >
              {isDownloading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
              Descargar
            </button>
            
            {viewMode === "info" ? (
              <button 
                onClick={() => setViewMode("pdf")}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-colors shadow-lg shadow-indigo-500/20"
              >
                <Eye size={16} /> Ver PDF
              </button>
            ) : (
              <button 
                onClick={handleClose} 
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-200 dark:bg-dark-50 text-slate-600 dark:text-slate-300 font-bold hover:bg-surface-300 transition-colors"
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