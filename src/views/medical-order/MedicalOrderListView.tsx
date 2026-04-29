// src/views/medical-order/MedicalOrderListView.tsx
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  PlusCircle,
  Calendar,
  Trash2,
  Pencil,
  Loader2,
  ChevronRight,
  ClipboardList,
  Download,
} from "lucide-react";
import { getMedicalOrdersByPatient, deleteMedicalOrder } from "@/api/medicalOrderAPI";
import { getPatientById } from "@/api/patientAPI";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import type { MedicalOrder } from "@/types/medicalOrder";
import { ORDER_CATEGORY_LABELS, MEDICAL_ORDER_OPTIONS } from "@/types/medicalOrder";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import EditMedicalOrderModal from "@/components/medical-orders/EditMedicalOrderModal";

export default function MedicalOrderListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();

  const [orderToDelete, setOrderToDelete] = useState<{ id: string } | null>(null);
  const [orderToEdit, setOrderToEdit] = useState<MedicalOrder | null>(null);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

  const { generatePDF, isReady: isPDFReady } = usePDFGenerator();

  const { data: medicalOrders = [], isLoading } = useQuery({
    queryKey: ["medicalOrders", patientId],
    queryFn: () => getMedicalOrdersByPatient(patientId!),
    enabled: !!patientId,
  });

  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const { mutate: removeOrder, isPending: isDeleting } = useMutation({
    mutationFn: deleteMedicalOrder,
    onSuccess: () => {
      toast.success("Orden Eliminada", "El registro ha sido removido correctamente.");
      queryClient.invalidateQueries({ queryKey: ["medicalOrders", patientId] });
      setOrderToDelete(null);
    },
    onError: (error: Error) => toast.error("Error al eliminar", error.message),
  });

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));

  const sortedOrders = [...medicalOrders].sort(
    (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
  );

  // HELPER: Extrae todos los exámenes seleccionados para la vista previa
  const getAllSelectedExams = (order: MedicalOrder) => {
    const categories = Object.keys(MEDICAL_ORDER_OPTIONS) as (keyof typeof MEDICAL_ORDER_OPTIONS)[];
    const allExams: { category: string; name: string }[] = [];

    categories.forEach(cat => {
      if (Array.isArray(order[cat])) {
        (order[cat] as string[]).forEach(exam => {
          allExams.push({ category: ORDER_CATEGORY_LABELS[cat], name: exam });
        });
      }
    });
    return allExams;
  };

  // ══════════════════════════════════════════
  // GENERAR PDF (Actualizado para categorías)
  // ══════════════════════════════════════════
  const handleDownloadPDF = (order: MedicalOrder) => {
    if (!patient || !isPDFReady) {
      toast.error("Error", "No se encontraron los datos necesarios.");
      return;
    }

    setGeneratingPdfId(order._id!);
    const dateStr = new Date(order.issueDate).toLocaleDateString("es-ES");
    const ownerName = typeof patient.owner === "object" ? patient.owner?.name : "Propietario";

    generatePDF(
      {
        title: "ORDEN DE ESTUDIOS MÉDICOS",
        primaryColor: { r: 8, g: 145, b: 178 },
        filename: `Orden_${patient.name}_${dateStr.replace(/\//g, "-")}.pdf`,
      },
      { name: patient.name, ownerName, fullSpecies: `${patient.species} - ${patient.breed || ''}` },
      dateStr,
      (doc, y, width, margin, colors, addPage) => {
        
        doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
        doc.text("EXÁMENES SOLICITADOS", margin, y);
        y += 8;

        const categories = Object.keys(MEDICAL_ORDER_OPTIONS) as (keyof typeof MEDICAL_ORDER_OPTIONS)[];
        
        categories.forEach(cat => {
          const exams = order[cat] as string[];
          if (exams && exams.length > 0) {
            if (y > 250) y = addPage();
            
            doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(colors.black.r, colors.black.g, colors.black.b);
            doc.text(ORDER_CATEGORY_LABELS[cat], margin, y);
            y += 4;
            
            doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(80, 80, 80);
            exams.forEach(exam => {
               doc.text(`• ${exam}`, margin + 5, y);
               y += 4;
            });
            y += 2;
          }
        });

        if (order.specialExams) {
            if (y > 250) y = addPage();
            doc.setFont("helvetica", "bold").text("OTROS / ESPECIALES:", margin, y);
            y += 4;
            doc.setFont("helvetica", "normal").text(doc.splitTextToSize(order.specialExams, width - margin * 2), margin + 5, y);
            y += 10;
        }

        return y;
      }
    );
    setGeneratingPdfId(null);
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500 w-8 h-8" /></div>;

  return (
    <>
      <div className="flex flex-col bg-surface-50 dark:bg-dark-300 min-h-screen lg:min-h-0 lg:h-[calc(100vh-14rem)] lg:rounded-2xl lg:border lg:border-surface-200 lg:dark:border-dark-100 lg:overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 lg:static z-40 bg-cyan-50 dark:bg-dark-200 border-b border-surface-200 dark:border-dark-100 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-heading text-slate-800 dark:text-white">Órdenes Médicas</h1>
              {medicalOrders.length > 0 && <span className="badge badge-neutral">{medicalOrders.length}</span>}
            </div>
            <Link to="create" className="btn-primary bg-cyan-600 hover:bg-cyan-700 border-cyan-700 shadow-lg px-4 py-2.5 flex items-center gap-2">
              <PlusCircle size={20} />
              <span className="hidden lg:inline font-semibold">Nueva Orden</span>
            </Link>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-4 pb-24">
          <div className="max-w-4xl mx-auto relative pl-4 lg:pl-0">
            {sortedOrders.length > 0 && <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-dark-100 z-0" />}

            <div className="space-y-6 relative">
              {sortedOrders.length === 0 ? (
                <div className="text-center py-20 ml-10 border-2 border-dashed border-slate-200 dark:border-dark-100 rounded-2xl">
                  <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3 opacity-50" />
                  <p className="text-slate-400 font-medium">Sin órdenes registradas</p>
                </div>
              ) : (
                sortedOrders.map((order) => {
                  const selectedExams = getAllSelectedExams(order);
                  return (
                    <div key={order._id} className="relative flex items-start gap-5 group">
                      <div className="shrink-0 relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-surface-50 dark:border-dark-300 shadow-sm bg-white dark:bg-dark-200 text-cyan-600">
                        <ClipboardList size={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="bg-white dark:bg-dark-200 p-5 rounded-2xl rounded-tl-sm shadow-sm border border-surface-200 dark:border-dark-100 hover:shadow-md transition-all">
                          {/* Acciones */}
                          <div className="absolute top-4 right-4 flex gap-1.5">
                            <button onClick={() => handleDownloadPDF(order)} disabled={generatingPdfId === order._id || !isPDFReady} className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600">
                              {generatingPdfId === order._id ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                            </button>
                            <button onClick={() => setOrderToEdit(order)} className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => setOrderToDelete({ id: order._id! })} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500">
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div className="mb-3 pr-24">
                            <div className="flex items-center gap-2 text-cyan-600 mb-1">
                              <Calendar size={14} />
                              <span className="text-sm font-bold uppercase">{formatDate(order.issueDate)}</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-white">Orden Médica</h3>
                          </div>

                          {/* Preview de Exámenes Seleccionados */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {selectedExams.slice(0, 4).map((exam, idx) => (
                              <span key={idx} className="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 text-[10px] px-2 py-1 rounded-md border border-cyan-100 dark:border-cyan-800 font-medium">
                                {exam.name}
                              </span>
                            ))}
                            {selectedExams.length > 4 && (
                              <span className="text-[10px] text-slate-400 self-center">+{selectedExams.length - 4} más</span>
                            )}
                            {selectedExams.length === 0 && order.specialExams && (
                              <span className="text-xs italic text-slate-500">Exámenes especiales solicitados</span>
                            )}
                          </div>

                          <div className="flex items-center justify-end pt-3 border-t border-dashed border-surface-100 dark:border-dark-100">
                            <Link to={`${order._id}`} className="text-cyan-600 font-bold text-sm flex items-center gap-1">
                              Ver Detalle <ChevronRight size={16} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={() => orderToDelete?.id && removeOrder(orderToDelete.id)}
        variant="danger"
        title="Eliminar Orden"
        message="¿Estás seguro de eliminar esta orden médica?"
        isLoading={isDeleting}
      />

      {orderToEdit && (
        <EditMedicalOrderModal
          isOpen={true}
          onClose={() => setOrderToEdit(null)}
          medicalOrder={orderToEdit}
        />
      )}
    </>
  );
}