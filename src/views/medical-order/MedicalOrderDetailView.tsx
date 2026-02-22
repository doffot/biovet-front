// src/views/patients/MedicalOrderDetailView.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  ClipboardList,
  FileText,
  Loader2,
  StickyNote,
  Download,
  AlertCircle,
  AlertTriangle,
  Stethoscope,
} from "lucide-react";
import { getMedicalOrderById } from "@/api/medicalOrderAPI";
import { getProfile } from "@/api/AuthAPI";
import { usePatientData } from "@/hooks/usePatientData";
import { toast } from "@/components/Toast";
import { STUDY_TYPE_LABELS } from "@/types/medicalOrder";
import jsPDF from "jspdf";

export default function MedicalOrderDetailView() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState<string>("");

  // 1. Obtener Orden Médica
  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["medicalOrder", orderId],
    queryFn: () => getMedicalOrderById(orderId!),
    enabled: !!orderId,
  });

  // 2. Extraer ID seguro y usar Hook de Paciente
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

  // 3. Obtener Perfil Veterinario
  const { data: vetProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  // 4. Cargar firma
  useEffect(() => {
    const loadSignature = async () => {
      if (!vetProfile?.signature) return;
      try {
        const response = await fetch(vetProfile.signature);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => setSignatureBase64(reader.result as string);
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error firma:", error);
      }
    };
    if (vetProfile?.signature) loadSignature();
  }, [vetProfile?.signature]);

  const handleClose = () => navigate(-1);

  // ==========================================
  // GENERAR PDF - ORDEN MÉDICA
  // ==========================================
  const handlePrintPDF = () => {
    if (!order || !patient) return;
    setIsGenerating(true);

    try {
      const doc: any = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
      });

      const width = doc.internal.pageSize.getWidth();
      const margin = 10;
      let y = 15;

      // Colores
      const primaryColor = { r: 8, g: 145, b: 178 }; // Cyan
      const black = { r: 0, g: 0, b: 0 };
      const gray = { r: 100, g: 100, b: 100 };
      const urgentColor = { r: 220, g: 38, b: 38 }; // Rojo

      // --- HEADER ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text("ORDEN DE ESTUDIOS MÉDICOS", width / 2, y, { align: "center" });
      y += 6;

      doc.setFontSize(10);
      doc.setTextColor(black.r, black.g, black.b);
      const vetName = vetProfile
        ? `Dr(a). ${vetProfile.name} ${vetProfile.lastName}`
        : "Médico Veterinario";
      doc.text(vetName, width / 2, y, { align: "center" });
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(gray.r, gray.g, gray.b);
      const vetInfo = `COLVET: ${vetProfile?.cmv || "N/A"} | MSDS: ${vetProfile?.msds || "N/A"}`;
      doc.text(vetInfo, width / 2, y, { align: "center" });
      y += 8;

      // Línea separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, width - margin, y);
      y += 5;

      // --- INFO PACIENTE ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(black.r, black.g, black.b);

      const dateStr = new Date(order.issueDate).toLocaleDateString("es-ES");

      doc.text(`Paciente: ${patient.name}`, margin, y);
      doc.text(`Fecha: ${dateStr}`, width - margin, y, { align: "right" });
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.text(`Especie: ${fullSpecies}`, margin, y);
      y += 5;
      doc.text(`Propietario: ${ownerName}`, margin, y);
      y += 8;

      // --- HISTORIA CLÍNICA (si existe) ---
      if (order.clinicalHistory) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Historia Clínica:", margin, y);
        y += 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
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
      doc.setFontSize(11);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text("ESTUDIOS SOLICITADOS", margin, y);
      y += 8;

      doc.setTextColor(black.r, black.g, black.b);

      order.studies.forEach((study, index) => {
        // Verificar salto de página
        if (y > 180) {
          doc.addPage();
          y = 20;
        }

        // Número y tipo
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);

        const typeLabel = STUDY_TYPE_LABELS[study.type] || study.type;
        
        // Badge de prioridad
        if (study.priority === "urgente") {
          doc.setTextColor(urgentColor.r, urgentColor.g, urgentColor.b);
          doc.text(`${index + 1}. [URGENTE] ${typeLabel}`, margin, y);
        } else {
          doc.setTextColor(black.r, black.g, black.b);
          doc.text(`${index + 1}. ${typeLabel}`, margin, y);
        }
        y += 5;

        doc.setTextColor(black.r, black.g, black.b);

        // Nombre del estudio
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Estudio: ${study.name}`, margin + 5, y);
        y += 4;

        // Región (si existe)
        if (study.region) {
          doc.text(`Región: ${study.region}`, margin + 5, y);
          y += 4;
        }

        // Motivo
        doc.setFont("helvetica", "italic");
        const reason = doc.splitTextToSize(
          `Motivo: ${study.reason}`,
          width - margin * 2 - 10
        );
        doc.text(reason, margin + 5, y);
        y += reason.length * 3.5;

        // Instrucciones (si existen)
        if (study.instructions) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(gray.r, gray.g, gray.b);
          const instructions = doc.splitTextToSize(
            `Instrucciones: ${study.instructions}`,
            width - margin * 2 - 10
          );
          doc.text(instructions, margin + 5, y);
          y += instructions.length * 3 + 2;
          doc.setTextColor(black.r, black.g, black.b);
        }

        y += 5; // Espacio entre estudios
      });

      // --- FIRMA (Footer) ---
      if (y > 170) {
        doc.addPage();
        y = 40;
      } else {
        y = Math.max(y, 160);
      }

      // Firma digital
      if (signatureBase64 && signatureBase64.startsWith("data:image")) {
        try {
          doc.addImage(signatureBase64, "PNG", width / 2 - 20, y, 40, 15);
          y += 15;
        } catch (e) {
          console.warn("No se pudo agregar la firma al PDF", e);
        }
      } else {
        y += 10;
      }

      doc.line(width / 2 - 30, y, width / 2 + 30, y);
      y += 5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(vetName, width / 2, y, { align: "center" });
      y += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(gray.r, gray.g, gray.b);
      doc.text("Médico Veterinario", width / 2, y, { align: "center" });

      // Guardar
      const filename = `Orden_Medica_${patient.name}.pdf`;
      doc.save(filename);
      toast.success("PDF Generado", "Orden médica descargada exitosamente.");
    } catch (error) {
      console.error("Error JS-PDF:", error);
      toast.error("Error", "No se pudo generar el PDF. Revisa la consola.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isLoading = isLoadingOrder || isLoadingPatient;

  // Verificar si hay estudios urgentes
  const hasUrgentStudy = order?.studies.some(
    (study) => study.priority === "urgente"
  );

  if (isLoading) {
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
          <button onClick={handleClose} className="mt-4 btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-dark-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-surface-200 dark:border-dark-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-cyan-50 dark:bg-dark-300 p-6 border-b border-cyan-100 dark:border-dark-100 flex justify-between items-start">
          <div className="flex gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${
                hasUrgentStudy
                  ? "bg-danger-100 dark:bg-danger-900/30 text-danger-500 border-danger-200 dark:border-danger-800"
                  : "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 border-cyan-200 dark:border-cyan-800"
              }`}
            >
              <ClipboardList size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-white leading-tight">
                  Orden Médica
                </h2>
                {hasUrgentStudy && (
                  <span className="badge badge-danger text-[10px] py-0.5">
                    <AlertTriangle size={10} />
                    Urgente
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                <Calendar size={14} />
                <span>
                  {new Date(order.issueDate).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT VISTA */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* Estudios */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2 border-b border-surface-200 dark:border-dark-50 pb-2">
              <Stethoscope size={14} className="text-cyan-600" /> Estudios
              Solicitados ({order.studies.length})
            </h3>
            <div className="space-y-3">
              {order.studies.map((study, idx) => (
                <div
                  key={idx}
                  className={`bg-surface-50 dark:bg-dark-100 p-4 rounded-xl border relative group transition-colors ${
                    study.priority === "urgente"
                      ? "border-danger-200 dark:border-danger-800 hover:border-danger-300 dark:hover:border-danger-700"
                      : "border-surface-200 dark:border-dark-50 hover:border-cyan-200 dark:hover:border-cyan-900/50"
                  }`}
                >
                  {/* Badge prioridad y tipo */}
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {study.priority === "urgente" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase bg-danger-50 text-danger-600 border-danger-200 dark:bg-danger-900/20 dark:text-danger-400 dark:border-danger-800 flex items-center gap-1">
                        <AlertTriangle size={10} />
                        Urgente
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800">
                      {STUDY_TYPE_LABELS[study.type]}
                    </span>
                  </div>

                  <div className="pr-28">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-0.5">
                      {study.name}
                    </h4>
                    {study.region && (
                      <p className="text-xs text-slate-500 font-medium mb-2">
                        Región: {study.region}
                      </p>
                    )}
                  </div>

                  {/* Motivo */}
                  <div className="bg-white dark:bg-dark-200 p-3 rounded-lg border border-surface-200 dark:border-dark-50 text-sm text-slate-700 dark:text-slate-300 mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Motivo / Indicación
                    </p>
                    <p className="italic">"{study.reason}"</p>
                  </div>

                  {/* Instrucciones */}
                  {study.instructions && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2 mt-2">
                      <FileText size={12} className="mt-0.5 shrink-0" />
                      <span>{study.instructions}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Historia Clínica */}
          {order.clinicalHistory && (
            <div className="flex gap-3 items-start text-sm text-slate-600 dark:text-slate-300 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
              <StickyNote
                size={18}
                className="text-amber-500 mt-0.5 shrink-0"
              />
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase mb-1">
                  Historia Clínica Relevante
                </p>
                <p className="italic">"{order.clinicalHistory}"</p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-surface-50/50 dark:bg-dark-300/50 border-t border-surface-200 dark:border-dark-100 flex gap-3">
          <button
            onClick={handlePrintPDF}
            disabled={isGenerating}
            className="flex-1 py-2.5 rounded-xl bg-white dark:bg-dark-100 border border-surface-200 dark:border-dark-50 text-slate-600 dark:text-slate-300 font-bold hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Download size={16} />
            )}
            Descargar PDF
          </button>
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl bg-surface-200 dark:bg-dark-50 text-slate-600 dark:text-slate-300 font-bold hover:bg-surface-300 dark:hover:bg-dark-100 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}