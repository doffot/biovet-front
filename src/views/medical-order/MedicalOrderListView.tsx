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
  AlertTriangle,
  Download,
} from "lucide-react";
import { getMedicalOrdersByPatient, deleteMedicalOrder } from "@/api/medicalOrderAPI";
import { getPatientById } from "@/api/patientAPI";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import type { MedicalOrder } from "@/types/medicalOrder";
import { STUDY_TYPE_LABELS } from "@/types/medicalOrder";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import EditMedicalOrderModal from "@/components/medical-orders/EditMedicalOrderModal";

export default function MedicalOrderListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();

  const [orderToDelete, setOrderToDelete] = useState<{ id: string } | null>(null);
  const [orderToEdit, setOrderToEdit] = useState<MedicalOrder | null>(null);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

  // Hook de PDF
  const { generatePDF, isReady: isPDFReady } = usePDFGenerator();

  // Query: Órdenes médicas
  const { data: medicalOrders = [], isLoading } = useQuery({
    queryKey: ["medicalOrders", patientId],
    queryFn: () => getMedicalOrdersByPatient(patientId!),
    enabled: !!patientId,
  });

  // Query: Paciente
  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  // Mutation: Eliminar
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

  const hasUrgentStudy = (order: MedicalOrder) =>
    order.studies.some((study) => study.priority === "urgente");

  // ══════════════════════════════════════════
  // GENERAR PDF
  // ══════════════════════════════════════════
  const handleDownloadPDF = (order: MedicalOrder) => {
    if (!patient || !isPDFReady) {
      toast.error("Error", "No se encontraron los datos necesarios.");
      return;
    }

    setGeneratingPdfId(order._id!);

    const dateStr = new Date(order.issueDate).toLocaleDateString("es-ES");
    const fullSpecies = patient.breed
      ? `${patient.species} - ${patient.breed}`
      : patient.species;
    const ownerName =
      typeof patient.owner === "object" && patient.owner !== null
        ? `${patient.owner.name}  ""}`
        : "Propietario";

    generatePDF(
      {
        title: "ORDEN DE ESTUDIOS MÉDICOS",
        primaryColor: { r: 8, g: 145, b: 178 },
        filename: `Orden_${patient.name}_${dateStr.replace(/\//g, "-")}.pdf`,
      },
      {
        name: patient.name,
        ownerName,
        fullSpecies,
      },
      dateStr,
      (doc, y, width, margin, colors, addPage) => {
        const urgentColor = { r: 220, g: 38, b: 38 };

        // --- HISTORIA CLÍNICA (si existe) ---
        if (order.clinicalHistory) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);
          doc.text("Historia Clínica:", margin, y);
          y += 4;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);
          const history = doc.splitTextToSize(
            order.clinicalHistory,
            width - margin * 2
          );
          doc.text(history, margin, y);
          y += history.length * 3.5 + 5;
        }

        // Línea separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, width - margin, y);
        y += 6;

        // --- ESTUDIOS SOLICITADOS ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
        doc.text("ESTUDIOS SOLICITADOS", margin, y);
        y += 8;

        doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);

        order.studies.forEach((study, index) => {
          if (y > 170) {
            y = addPage();
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);

          const typeLabel = STUDY_TYPE_LABELS[study.type] || study.type;

          if (study.priority === "urgente") {
            doc.setTextColor(urgentColor.r, urgentColor.g, urgentColor.b);
            doc.text(`${index + 1}. [URGENTE] ${typeLabel}`, margin, y);
          } else {
            doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);
            doc.text(`${index + 1}. ${typeLabel}`, margin, y);
          }
          y += 5;

          doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(`Estudio: ${study.name}`, margin + 5, y);
          y += 4;

          if (study.region) {
            doc.text(`Región: ${study.region}`, margin + 5, y);
            y += 4;
          }

          doc.setFont("helvetica", "italic");
          const reason = doc.splitTextToSize(
            `Motivo: ${study.reason}`,
            width - margin * 2 - 10
          );
          doc.text(reason, margin + 5, y);
          y += reason.length * 3.5;

          if (study.instructions) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);
            const instructions = doc.splitTextToSize(
              `Instrucciones: ${study.instructions}`,
              width - margin * 2 - 10
            );
            doc.text(instructions, margin + 5, y);
            y += instructions.length * 3 + 2;
            doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);
          }

          y += 5;
        });

        return y;
      }
    );

    setGeneratingPdfId(null);
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-biovet-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col bg-surface-50 dark:bg-dark-300 min-h-screen lg:min-h-0 lg:h-[calc(100vh-14rem)] lg:rounded-2xl lg:border lg:border-surface-200 lg:dark:border-dark-100 lg:overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 lg:static z-40 bg-cyan-50 dark:bg-dark-200 border-b border-surface-200 dark:border-dark-100 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-heading text-slate-800 dark:text-white">
                Órdenes Médicas
              </h1>
              {medicalOrders.length > 0 && (
                <span className="badge badge-neutral">{medicalOrders.length}</span>
              )}
            </div>
            <Link
              to="create"
              className="btn-primary bg-cyan-600 hover:bg-cyan-700 border-cyan-700 shadow-lg active:scale-95 transition-transform xs:rounded-full w-10 h-10 lg:w-auto lg:h-auto p-0 lg:px-4 lg:py-2.5 flex items-center justify-center gap-2"
            >
              <PlusCircle size={20} />
              <span className="hidden lg:inline font-semibold">Nueva Orden</span>
            </Link>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-4 pb-24">
          <div className="max-w-4xl mx-auto relative pl-4 lg:pl-0">
            {sortedOrders.length > 0 && (
              <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-dark-100 z-0" />
            )}

            <div className="space-y-6 relative">
              {sortedOrders.length === 0 ? (
                <div className="text-center py-20 ml-10 border-2 border-dashed border-slate-200 dark:border-dark-100 rounded-2xl">
                  <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3 opacity-50" />
                  <p className="text-slate-400 dark:text-slate-500 font-medium mb-1">
                    Sin órdenes médicas registradas
                  </p>
                  <p className="text-xs text-slate-300 dark:text-slate-600">
                    Crea la primera orden de estudios
                  </p>
                </div>
              ) : (
                sortedOrders.map((order) => (
                  <div key={order._id} className="relative flex items-start gap-5 group">
                    {/* Nodo timeline */}
                    <div
                      className={`shrink-0 relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-surface-50 dark:border-dark-300 shadow-sm bg-white dark:bg-dark-200 ${
                        hasUrgentStudy(order) ? "text-danger-500" : "text-cyan-600"
                      }`}
                    >
                      <ClipboardList size={18} />
                    </div>

                    {/* Card */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-white dark:bg-dark-200 p-5 rounded-2xl rounded-tl-sm shadow-sm border border-surface-200 dark:border-dark-100 hover:shadow-md transition-all duration-200 relative">
                        {/* Acciones */}
                        <div className="absolute top-4 right-4 flex gap-1.5">
                          {/* Descargar PDF */}
                          <button
                            onClick={() => handleDownloadPDF(order)}
                            disabled={generatingPdfId === order._id || !isPDFReady}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors disabled:opacity-50"
                            title="Descargar PDF"
                          >
                            {generatingPdfId === order._id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Download size={15} />
                            )}
                          </button>
                          {/* Editar */}
                          <button
                            onClick={() => setOrderToEdit(order)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-900/30 transition-colors"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                          {/* Eliminar */}
                          <button
                            onClick={() => setOrderToDelete({ id: order._id! })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/30 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* Header del card */}
                        <div className="mb-3 pr-24">
                          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-1">
                            <Calendar size={14} />
                            <span className="text-sm font-bold uppercase tracking-wider">
                              {formatDate(order.issueDate)}
                            </span>
                            {hasUrgentStudy(order) && (
                              <span className="badge badge-danger ml-2 text-[10px] py-0.5">
                                <AlertTriangle size={10} />
                                Urgente
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-slate-700 dark:text-white leading-tight">
                            Orden de Estudios
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {order.studies.length} estudio(s) solicitado(s)
                          </p>
                        </div>

                        {/* Preview Estudios (Max 2) */}
                        <div className="space-y-2 mb-3">
                          {order.studies.slice(0, 2).map((study, idx) => (
                            <div
                              key={idx}
                              className="bg-surface-50 dark:bg-dark-300/50 p-2 rounded-lg border border-surface-200 dark:border-dark-100 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    study.priority === "urgente"
                                      ? "bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-400"
                                      : "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-400"
                                  }`}
                                >
                                  {STUDY_TYPE_LABELS[study.type]}
                                </span>
                                <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                                  {study.name}
                                </span>
                              </div>
                              {study.region && (
                                <span className="text-slate-500 truncate ml-2">
                                  {study.region}
                                </span>
                              )}
                            </div>
                          ))}
                          {order.studies.length > 2 && (
                            <p className="text-[10px] text-slate-400 text-center italic">
                              ... y {order.studies.length - 2} estudio(s) más
                            </p>
                          )}
                        </div>

                        {/* Historia clínica resumida */}
                        {order.clinicalHistory && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 italic">
                            "{order.clinicalHistory.substring(0, 100)}
                            {order.clinicalHistory.length > 100 ? "..." : ""}"
                          </p>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-end pt-3 border-t border-dashed border-surface-100 dark:border-dark-100">
                          <Link
                            to={`${order._id}`}
                            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-bold text-sm flex items-center gap-1 transition-colors"
                          >
                            Ver Orden <ChevronRight size={16} />
                          </Link>
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

      {/* Modal Editar */}
      {orderToEdit && (
        <EditMedicalOrderModal
          isOpen={true}
          onClose={() => setOrderToEdit(null)}
          medicalOrder={orderToEdit}
        />
      )}

      {/* Modal Confirmar Eliminación */}
      <ConfirmationModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={() => orderToDelete?.id && removeOrder(orderToDelete.id)}
        variant="danger"
        title="Eliminar Orden Médica"
        message="¿Estás seguro de eliminar esta orden médica? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </>
  );
}