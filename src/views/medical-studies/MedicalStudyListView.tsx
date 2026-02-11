import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ScanLine,
  PlusCircle,
  Trash2,
  Loader2,
  Download,
  Eye
} from "lucide-react";
import { getMedicalStudiesByPatient, deleteMedicalStudy } from "@/api/medicalStudyAPI";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import type { MedicalStudy } from "@/types/medicalStudy";

export default function MedicalStudyListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();
  const [studyToDelete, setStudyToDelete] = useState<{ id: string; name: string } | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: studies = [], isLoading } = useQuery({
    queryKey: ["medicalStudies", patientId],
    queryFn: () => getMedicalStudiesByPatient(patientId!),
    enabled: !!patientId,
  });

  const { mutate: removeStudy, isPending: isDeleting } = useMutation({
    mutationFn: deleteMedicalStudy,
    onSuccess: () => {
      toast.success("Estudio Eliminado", "El registro ha sido removido correctamente.");
      queryClient.invalidateQueries({ queryKey: ["medicalStudies", patientId] });
      setStudyToDelete(null);
    },
    onError: (error: Error) => toast.error("Error al eliminar", error.message),
  });

  // Lógica de descarga inteligente (reutilizada)
  const handleDownload = async (study: MedicalStudy) => {
    setDownloadingId(study._id!);
    try {
      const response = await fetch(study.pdfFile);
      if (!response.ok) throw new Error("Error de red");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Nombre amigable: Tipo_Fecha.pdf
      const dateStr = new Date(study.date).toISOString().split("T")[0];
      const typeSafe = study.studyType.replace(/\s+/g, "_");
      link.download = `${typeSafe}_${dateStr}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Descarga iniciada", "El archivo se ha guardado correctamente.");
    } catch (error) {
      console.warn("Descarga fallida, abriendo pestaña...", error);
      window.open(study.pdfFile, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));

  const sortedStudies = [...studies].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (isLoading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-biovet-500 w-8 h-8" /></div>;

  return (
    <>
      <div className="flex flex-col bg-surface-50 dark:bg-dark-300 min-h-screen lg:min-h-0 lg:h-[calc(100vh-14rem)] lg:rounded-2xl lg:border lg:border-surface-200 lg:dark:border-dark-100 lg:overflow-hidden">
        
        {/* Header Compacto */}
        <div className="sticky top-0 lg:static z-40 bg-indigo-50 dark:bg-dark-200 border-b border-surface-200 dark:border-dark-100 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold font-heading text-slate-800 dark:text-white">Estudios Médicos</h1>
              {studies.length > 0 && <span className="badge badge-neutral text-xs">{studies.length}</span>}
            </div>
            <Link to="create" className="btn-primary bg-indigo-500 hover:bg-indigo-600 border-indigo-600 shadow-sm active:scale-95 transition-transform xs:rounded-full w-9 h-9 lg:w-auto lg:h-auto p-0 lg:px-3 lg:py-2 flex items-center justify-center gap-2">
              <PlusCircle size={18} />
              <span className="hidden lg:inline font-semibold text-xs">Subir</span>
            </Link>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-3 pb-24">
          <div className="max-w-4xl mx-auto relative pl-3 lg:pl-0">
            {sortedStudies.length > 0 && <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-dark-100 z-0" />}

            <div className="space-y-3 relative">
              {sortedStudies.length === 0 ? (
                <div className="text-center py-16 ml-8 border-2 border-dashed border-slate-200 dark:border-dark-100 rounded-xl">
                  <ScanLine className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2 opacity-50" />
                  <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">Sin estudios registrados</p>
                </div>
              ) : (
                sortedStudies.map((study) => (
                  <div key={study._id} className="relative flex items-center gap-4 group">
                    {/* Dot Timeline */}
                    <div className="shrink-0 relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 border-surface-50 dark:border-dark-300 shadow-sm bg-white dark:bg-dark-200 text-indigo-500">
                      <ScanLine size={14} />
                    </div>

                    {/* Card Compacta */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-white dark:bg-dark-200 p-3 rounded-xl border border-surface-200 dark:border-dark-100 hover:shadow-sm transition-all duration-200 relative flex items-center justify-between gap-3">
                        
                        {/* Info Izquierda */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-white truncate">{study.studyType}</h3>
                            <span className="text-[10px] bg-slate-100 dark:bg-dark-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-dark-50 whitespace-nowrap">
                              {formatDate(study.date)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{study.professional}</p>
                        </div>

                        {/* Acciones Derecha */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            onClick={() => handleDownload(study)}
                            disabled={downloadingId === study._id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors disabled:opacity-50"
                            title="Descargar PDF"
                          >
                            {downloadingId === study._id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                          </button>
                          
                          <Link 
                            to={`${study._id}`} 
                            className="p-1.5 rounded-lg text-slate-400 hover:text-biovet-600 hover:bg-biovet-50 dark:hover:bg-biovet-900/30 transition-colors"
                            title="Ver Detalle"
                          >
                            <Eye size={16} />
                          </Link>

                          <button 
                            onClick={() => setStudyToDelete({ id: study._id!, name: study.studyType })} 
                            className="p-1.5 rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/30 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
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

      <ConfirmationModal
        isOpen={!!studyToDelete}
        onClose={() => setStudyToDelete(null)}
        onConfirm={() => studyToDelete?.id && removeStudy(studyToDelete.id)}
        variant="danger"
        title="Eliminar Estudio"
        message={
          <span>
            ¿Eliminar <strong>{studyToDelete?.name}</strong>? Esta acción es irreversible.
          </span>
        }
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </>
  );
}