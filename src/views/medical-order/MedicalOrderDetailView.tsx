// src/views/medical-order/MedicalOrderDetailView.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  X,
  Calendar,
  ClipboardList,
  Loader2,
  Download,
  AlertCircle,
  Stethoscope,
  Info,
} from "lucide-react";
import { getMedicalOrderById } from "@/api/medicalOrderAPI";
import { usePatientData } from "@/hooks/usePatientData";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import { ORDER_CATEGORY_LABELS, MEDICAL_ORDER_OPTIONS } from "@/types/medicalOrder";

export default function MedicalOrderDetailView() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const { generatePDF, isReady: isPDFReady } = usePDFGenerator();

  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["medicalOrder", orderId],
    queryFn: () => getMedicalOrderById(orderId!),
    enabled: !!orderId,
  });

  const patientIdString = order?.patientId
    ? typeof order.patientId === "object"
      ? order.patientId._id
      : order.patientId
    : undefined;

  const {
    patient,
    ownerName,
    fullSpecies,
    isLoading: isLoadingPatient,
  } = usePatientData(patientIdString);

  const handleClose = () => navigate(-1);

  // ══════════════════════════════════════════
  // GENERAR PDF (Actualizado para categorías)
  // ══════════════════════════════════════════
  const handlePrintPDF = () => {
    if (!order || !patient || !isPDFReady) return;
    setIsGenerating(true);

    const dateStr = new Date(order.issueDate).toLocaleDateString("es-ES");

    generatePDF(
      {
        title: "ORDEN DE ESTUDIOS MÉDICOS",
        primaryColor: { r: 8, g: 145, b: 178 },
        filename: `Orden_Medica_${patient.name}_${dateStr.replace(/\//g, "-")}.pdf`,
      },
      { name: patient.name, ownerName, fullSpecies },
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
            doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(colors.black.r, colors.black.g, colors.black.b);
            doc.text("OTROS / ESPECIALES:", margin, y);
            y += 4;
            doc.setFont("helvetica", "normal").text(doc.splitTextToSize(order.specialExams, width - margin * 2), margin + 5, y);
            y += 8;
        }

        if (order.observations) {
            if (y > 250) y = addPage();
            doc.setFont("helvetica", "italic").setFontSize(8).setTextColor(100, 100, 100);
            doc.text("Observaciones:", margin, y);
            y += 4;
            doc.text(doc.splitTextToSize(order.observations, width - margin * 2), margin, y);
        }

        return y;
      }
    );

    setIsGenerating(false);
  };

  if (isLoadingOrder || isLoadingPatient) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <Loader2 className="animate-spin text-white w-10 h-10" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-xl text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <p>No se encontró la orden médica</p>
          <button onClick={handleClose} className="mt-4 btn-secondary">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleClose}>
      <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-surface-200 dark:border-dark-100" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="bg-cyan-50 dark:bg-dark-300 p-6 border-b border-cyan-100 dark:border-dark-100 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 border-cyan-200 dark:border-cyan-800">
              <ClipboardList size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-white leading-tight">Orden Médica</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                <Calendar size={14} />
                <span>{new Date(order.issueDate).toLocaleDateString("es-ES", { dateStyle: 'full' })}</span>
              </div>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          
          {/* Exámenes por Categorías */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2 border-b border-surface-200 dark:border-dark-50 pb-2">
              <Stethoscope size={14} className="text-cyan-600" /> Estudios Solicitados
            </h3>
            
            <div className="space-y-3">
              {(Object.keys(MEDICAL_ORDER_OPTIONS) as (keyof typeof MEDICAL_ORDER_OPTIONS)[]).map((cat) => {
                const exams = order[cat] as string[];
                if (!exams || exams.length === 0) return null;

                return (
                  <div key={cat} className="bg-surface-50 dark:bg-dark-100 p-4 rounded-xl border border-surface-200 dark:border-dark-50">
                    <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase mb-2">{ORDER_CATEGORY_LABELS[cat]}</p>
                    <div className="flex flex-wrap gap-2">
                      {exams.map((exam, idx) => (
                        <span key={idx} className="bg-white dark:bg-dark-200 px-2 py-1 rounded-md text-xs border border-surface-200 dark:border-dark-50 text-slate-700 dark:text-slate-300">
                          {exam}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {order.specialExams && (
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                  <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Exámenes Especiales / Otros</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 italic">{order.specialExams}</p>
                </div>
              )}
            </div>
          </div>

          {/* Observaciones / Historia */}
          {order.observations && (
            <div className="flex gap-3 items-start text-sm text-slate-600 dark:text-slate-300 bg-surface-50 dark:bg-dark-100 p-4 rounded-xl border border-surface-200 dark:border-dark-50">
              <Info size={18} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Observaciones adicionales</p>
                <p>{order.observations}</p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-surface-50/50 dark:bg-dark-300/50 border-t border-surface-200 dark:border-dark-100 flex gap-3">
          <button
            onClick={handlePrintPDF}
            disabled={isGenerating || !isPDFReady}
            className="flex-1 py-2.5 rounded-xl bg-white dark:bg-dark-100 border border-surface-200 dark:border-dark-50 text-slate-600 dark:text-slate-300 font-bold hover:bg-surface-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            Descargar PDF
          </button>
          <button onClick={handleClose} className="flex-1 py-2.5 rounded-xl bg-surface-200 dark:bg-dark-50 text-slate-600 dark:text-slate-300 font-bold hover:bg-surface-300 transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}