// src/components/labExams/ShareUrinalysisResultsModal.tsx
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

interface ShareUrinalysisResultsModalProps {
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

export default function ShareUrinalysisResultsModal({
  isOpen,
  onClose,
  examData,
  patientData,
}: ShareUrinalysisResultsModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    vetProfile,
    clinic,
    signatureBase64,
    clinicLogoBase64,
    isReady,
  } = usePDFGenerator();

  const handlePrintPDF = () => {
    if (!isReady) {
      toast.error("Error", "Cargando datos necesarios...");
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
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
        12
      );

      // === TÍTULO ===
      y = drawTitle(
        doc,
        "RESULTADOS DE UROANÁLISIS",
        "EXAMEN COMPLETO DE ORINA",
        colors,
        pageWidth,
        y
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
        y
      );

      // === MÉTODO DE RECOLECCIÓN ===
      if (examData.collectionMethod) {
        doc.setFillColor(colors.lightBg.r, colors.lightBg.g, colors.lightBg.b);
        doc.rect(marginLeft, y, contentWidth, 8, "F");
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
        doc.text("Método de Recolección: ", marginLeft + 3, y + 5.5);
        doc.setFont("helvetica", "normal");
        doc.text(examData.collectionMethod, marginLeft + 45, y + 5.5);
        y += 12;
      }

      // === EXAMEN FÍSICO ===
      y = drawSectionHeader(doc, "EXAMEN FÍSICO", y, marginLeft, contentWidth, pageWidth, colors);
      y = drawPhysicalExam(doc, y, marginLeft, contentWidth, colors);

      y += 5;

      // === EXAMEN QUÍMICO ===
      y = drawSectionHeader(doc, "EXAMEN QUÍMICO (TIRA REACTIVA)", y, marginLeft, contentWidth, pageWidth, colors);
      y = drawChemicalExam(doc, y, marginLeft, contentWidth, colors);

      y += 5;

      // === SEDIMENTO ===
      y = drawSectionHeader(doc, "SEDIMENTO URINARIO", y, marginLeft, contentWidth, pageWidth, colors);
      y = drawSedimentExam(doc, y, marginLeft, contentWidth, colors);

      // === OTROS HALLAZGOS ===
      if (examData.otherFindings) {
        y += 5;
        y = drawSectionHeader(doc, "OTROS HALLAZGOS", y, marginLeft, contentWidth, pageWidth, colors);
        doc.setFillColor(colors.labelBg.r, colors.labelBg.g, colors.labelBg.b);
        doc.rect(marginLeft, y, contentWidth, 12, "F");
        doc.setDrawColor(colors.tableBorder.r, colors.tableBorder.g, colors.tableBorder.b);
        doc.rect(marginLeft, y, contentWidth, 12, "S");
        doc.setFontSize(9);
        doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
        doc.setFont("helvetica", "normal");
        doc.text(examData.otherFindings, marginLeft + 3, y + 7);
        y += 12;
      }

      // === FIRMA ===
      y = drawSignatureFooter(doc, vetProfile, signatureBase64, colors, pageWidth, y);

      // === FOOTER ===
      drawSocialFooter(doc, clinic, colors, pageWidth, y);

      // === GUARDAR ===
      const dateStr = new Date(examData.date).toLocaleDateString("es-ES").replace(/\//g, "-");
      doc.save(`Uroanalisis_${patientData.name}_${dateStr}.pdf`);

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
  // HELPERS
  // ═══════════════════════════════════════════════════════════

  function drawSectionHeader(
    doc: jsPDF,
    title: string,
    startY: number,
    marginLeft: number,
    contentWidth: number,
    pageWidth: number,
    colors: typeof LAB_PDF_COLORS
  ): number {
    doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.rect(marginLeft, startY, contentWidth, 7, "F");
    doc.setFontSize(9);
    doc.setTextColor(colors.white.r, colors.white.g, colors.white.b);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, startY + 5, { align: "center" });
    return startY + 7;
  }

  function drawPhysicalExam(
    doc: jsPDF,
    startY: number,
    marginLeft: number,
    contentWidth: number,
    colors: typeof LAB_PDF_COLORS
  ): number {
    const rowH = 8;
    const colWidth = contentWidth / 3;
    let y = startY;

    const data = [
      { label: "Color", value: examData.color || "—" },
      { label: "Aspecto", value: examData.appearance || "—" },
      { label: "Densidad", value: examData.specificGravity?.toString() || "—" },
    ];

    // Fila de datos
    doc.setFillColor(colors.labelBg.r, colors.labelBg.g, colors.labelBg.b);
    doc.rect(marginLeft, y, contentWidth, rowH, "F");
    doc.setDrawColor(colors.tableBorder.r, colors.tableBorder.g, colors.tableBorder.b);
    doc.rect(marginLeft, y, contentWidth, rowH, "S");

    data.forEach((item, index) => {
      const x = marginLeft + index * colWidth;
      doc.line(x, y, x, y + rowH);
      doc.setFontSize(8);
      doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);
      doc.setFont("helvetica", "normal");
      doc.text(item.label, x + 3, y + 3);
      doc.setFontSize(9);
      doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
      doc.setFont("helvetica", "bold");
      doc.text(item.value, x + 3, y + 6.5);
    });

    return y + rowH;
  }

  function drawChemicalExam(
    doc: jsPDF,
    startY: number,
    marginLeft: number,
    contentWidth: number,
    colors: typeof LAB_PDF_COLORS
  ): number {
    const rowH = 7;
    const colWidth = contentWidth / 3;
    let y = startY;

    const data = [
      { label: "pH", value: examData.pH?.toString() || "—" },
      { label: "Proteínas", value: examData.proteins || "—" },
      { label: "Glucosa", value: examData.glucose || "—" },
      { label: "Cetonas", value: examData.ketones || "—" },
      { label: "Bilirrubina", value: examData.bilirubin || "—" },
      { label: "Sangre", value: examData.blood || "—" },
      { label: "Urobilinógeno", value: examData.urobilinogen || "—" },
      { label: "Nitritos", value: examData.nitrites || "—" },
      { label: "Leucocitos", value: examData.leukocytesChemical || "—" },
    ];

    // Dibujar en filas de 3
    for (let i = 0; i < data.length; i += 3) {
      doc.setFillColor(colors.labelBg.r, colors.labelBg.g, colors.labelBg.b);
      doc.rect(marginLeft, y, contentWidth, rowH, "F");
      doc.setDrawColor(colors.tableBorder.r, colors.tableBorder.g, colors.tableBorder.b);
      doc.rect(marginLeft, y, contentWidth, rowH, "S");

      for (let j = 0; j < 3 && i + j < data.length; j++) {
        const item = data[i + j];
        const x = marginLeft + j * colWidth;
        if (j > 0) doc.line(x, y, x, y + rowH);
        doc.setFontSize(7);
        doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);
        doc.setFont("helvetica", "normal");
        doc.text(item.label + ":", x + 2, y + 4.5);
        doc.setFontSize(8);
        doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
        doc.setFont("helvetica", "bold");
        doc.text(item.value, x + colWidth - 3, y + 4.5, { align: "right" });
      }
      y += rowH;
    }

    return y;
  }

  function drawSedimentExam(
    doc: jsPDF,
    startY: number,
    marginLeft: number,
    contentWidth: number,
    colors: typeof LAB_PDF_COLORS
  ): number {
    const rowH = 7;
    const colWidth = contentWidth / 2;
    let y = startY;

    const data = [
      { label: "Células Epiteliales", value: examData.epithelialCells || "—" },
      { label: "Leucocitos", value: examData.sedimentLeukocytes || "—" },
      { label: "Eritrocitos", value: examData.sedimentErythrocytes || "—" },
      { label: "Bacterias", value: examData.bacteria || "—" },
      { label: "Cristales", value: examData.crystals || "—" },
      { label: "Cilindros", value: examData.casts || "—" },
    ];

    // Dibujar en filas de 2
    for (let i = 0; i < data.length; i += 2) {
      doc.setFillColor(colors.labelBg.r, colors.labelBg.g, colors.labelBg.b);
      doc.rect(marginLeft, y, contentWidth, rowH, "F");
      doc.setDrawColor(colors.tableBorder.r, colors.tableBorder.g, colors.tableBorder.b);
      doc.rect(marginLeft, y, contentWidth, rowH, "S");

      for (let j = 0; j < 2 && i + j < data.length; j++) {
        const item = data[i + j];
        const x = marginLeft + j * colWidth;
        if (j > 0) doc.line(x, y, x, y + rowH);
        doc.setFontSize(7);
        doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);
        doc.setFont("helvetica", "normal");
        doc.text(item.label + ":", x + 2, y + 4.5);
        doc.setFontSize(8);
        doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
        doc.setFont("helvetica", "bold");
        doc.text(item.value, x + colWidth - 3, y + 4.5, { align: "right" });
      }
      y += rowH;
    }

    return y;
  }

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handlePrintPDF}
      variant="info"
      title="¡Uroanálisis Guardado!"
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