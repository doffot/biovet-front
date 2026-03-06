// src/components/labExams/ShareCytologyResultsModal.tsx
import { Printer } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import { toast } from "../Toast";
import ConfirmationModal from "../ConfirmationModal";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import {
  LAB_PDF_COLORS,
  drawWatermark,
  drawClinicHeader,
  drawTitle,
  drawPatientInfo,
  drawSignatureFooter,
  drawSocialFooter,
  getVetName,
} from "@/utils/pdfLabExamBuilder";
import type { LabExam } from "@/types/labExam";

// Tipo extendido para métodos no tipados de jsPDF
type ExtendedJsPDF = jsPDF & {
  splitTextToSize: (text: string, maxWidth: number) => string[];
};

interface ShareCytologyResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  examData: LabExam;
  patientData: {
    name: string;
    species: string;
    breed?: string;
    owner: { name?: string; contact?: string };
  };
}

export default function ShareCytologyResultsModal({
  isOpen,
  onClose,
  examData,
  patientData,
}: ShareCytologyResultsModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { vetProfile, clinic, signatureBase64, clinicLogoBase64, isReady } =
    usePDFGenerator();

  // Valores con fallbacks
  const sampleType = examData.sampleType ?? "—";
  const coloration = examData.coloration ?? "—";
  const results = examData.results ?? "Sin resultados registrados";

  const handlePrintPDF = () => {
    if (!isReady) {
      toast.error("Error", "Cargando datos necesarios...");
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginLeft = 15;
      const marginRight = 15;
      const contentWidth = pageWidth - marginLeft - marginRight;
      const colors = LAB_PDF_COLORS;

      // === MARCA DE AGUA ===
      drawWatermark(doc, clinicLogoBase64, pageWidth, pageHeight);

      // === HEADER ===
      let y = drawClinicHeader(
        doc,
        clinic,
        clinicLogoBase64,
        colors,
        pageWidth,
        marginLeft,
        marginRight,
        12,
      );

      // === TÍTULO ===
      y = drawTitle(
        doc,
        "RESULTADOS DE CITOLOGÍA",
        "ANÁLISIS CITOLÓGICO",
        colors,
        pageWidth,
        y,
      );

      // === INFO PACIENTE ===
      y = drawPatientInfo(
        doc,
        patientData,
        examData.date,
        getVetName(vetProfile),
        colors,
        contentWidth,
        marginLeft,
        y,
      );

      // === DATOS DE LA MUESTRA ===
      y = drawSampleInfo(doc, y, marginLeft, contentWidth, pageWidth, colors);

      y += 5;

      // === RESULTADOS ===
      y = drawResultsSection(
        doc,
        y,
        marginLeft,
        contentWidth,
        pageWidth,
        colors,
      );

      // === FIRMA ===
      y = drawSignatureFooter(
        doc,
        vetProfile,
        signatureBase64,
        colors,
        pageWidth,
        y,
      );

      // === FOOTER REDES ===
      drawSocialFooter(doc, clinic, colors, pageWidth, y);

      // === GUARDAR ===
      const dateStr = new Date(examData.date)
        .toLocaleDateString("es-ES")
        .replace(/\//g, "-");
      doc.save(`Citologia_${patientData.name}_${dateStr}.pdf`);

      toast.success("PDF Generado", "Resultados descargados exitosamente.");
      onClose();
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error("Error", "No se pudo generar el PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // DATOS DE LA MUESTRA
  // ═══════════════════════════════════════════════════════════
  function drawSampleInfo(
    doc: jsPDF,
    startY: number,
    marginLeft: number,
    contentWidth: number,
    pageWidth: number,
    colors: typeof LAB_PDF_COLORS,
  ): number {
    let y = startY;

    // Header
    doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.rect(marginLeft, y, contentWidth, 8, "F");
    doc.setFontSize(10);
    doc.setTextColor(colors.white.r, colors.white.g, colors.white.b);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DE LA MUESTRA", pageWidth / 2, y + 5.5, {
      align: "center",
    });
    y += 8;

    // Contenido
    const rowH = 10;
    const halfWidth = contentWidth / 2;

    // Fila: Tipo de Muestra | Coloración
    doc.setFillColor(colors.labelBg.r, colors.labelBg.g, colors.labelBg.b);
    doc.rect(marginLeft, y, contentWidth, rowH, "F");
    doc.setDrawColor(
      colors.tableBorder.r,
      colors.tableBorder.g,
      colors.tableBorder.b,
    );
    doc.rect(marginLeft, y, contentWidth, rowH, "S");
    doc.line(marginLeft + halfWidth, y, marginLeft + halfWidth, y + rowH);

    doc.setFontSize(9);
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);

    // Tipo de Muestra
    doc.setFont("helvetica", "bold");
    doc.text("Tipo de Muestra: ", marginLeft + 3, y + 6.5);
    doc.setFont("helvetica", "normal");
    doc.text(sampleType, marginLeft + 35, y + 6.5);

    // Coloración
    doc.setFont("helvetica", "bold");
    doc.text("Coloración: ", marginLeft + halfWidth + 3, y + 6.5);
    doc.setFont("helvetica", "normal");
    doc.text(coloration, marginLeft + halfWidth + 28, y + 6.5);

    y += rowH;

    return y;
  }

  // ═══════════════════════════════════════════════════════════
  // RESULTADOS
  // ═══════════════════════════════════════════════════════════
  function drawResultsSection(
    doc: jsPDF,
    startY: number,
    marginLeft: number,
    contentWidth: number,
    pageWidth: number,
    colors: typeof LAB_PDF_COLORS,
  ): number {
    let y = startY;

    // Header
    doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.rect(marginLeft, y, contentWidth, 8, "F");
    doc.setFontSize(10);
    doc.setTextColor(colors.white.r, colors.white.g, colors.white.b);
    doc.setFont("helvetica", "bold");
    doc.text("HALLAZGOS CITOLÓGICOS", pageWidth / 2, y + 5.5, {
      align: "center",
    });
    y += 8;

    // Contenido de resultados (texto multilínea)
    doc.setFontSize(10);
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    doc.setFont("helvetica", "normal");

    // Split text para que quepa
    const maxWidth = contentWidth - 6;
    const lines = (doc as ExtendedJsPDF).splitTextToSize(results, maxWidth);
    const lineHeight = 5;
    const textBlockHeight = lines.length * lineHeight + 8;

    // Fondo del bloque
    doc.setFillColor(colors.labelBg.r, colors.labelBg.g, colors.labelBg.b);
    doc.rect(marginLeft, y, contentWidth, textBlockHeight, "F");
    doc.setDrawColor(
      colors.tableBorder.r,
      colors.tableBorder.g,
      colors.tableBorder.b,
    );
    doc.rect(marginLeft, y, contentWidth, textBlockHeight, "S");

    // Texto
    lines.forEach((line, idx) => {
      doc.text(line, marginLeft + 3, y + 6 + idx * lineHeight);
    });

    y += textBlockHeight;

    return y;
  }

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handlePrintPDF}
      variant="info"
      title="¡Citología Guardada!"
      message={
        <div className="text-center">
          <p className="text-lg font-bold text-slate-200 uppercase tracking-tight">
            {patientData.name} • {patientData.species}
          </p>
          <div className="py-3 border-y border-slate-700/50 my-4">
            <p className="text-slate-400 font-medium">
              Resultados listos para descargar
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {new Date(examData.date).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      }
      confirmText="Descargar PDF"
      confirmIcon={Printer}
      isLoading={isGenerating || !isReady}
    />
  );
}
