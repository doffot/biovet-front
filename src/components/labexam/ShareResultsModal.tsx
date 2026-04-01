// src/components/labExams/ShareResultsModal.tsx
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
import type { LabExam, DifferentialCount } from "@/types/labExam";

interface ShareResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  examData: LabExam;
  patientData: {
    name: string;
    species: string;
    breed?: string;
    owner: { name?: string; contact?: string };
    mainVet?: string;
    refVet?: string;
  };
}

const DEFAULT_DIFFERENTIAL: DifferentialCount = {
  segmentedNeutrophils: 0,
  bandNeutrophils: 0,
  lymphocytes: 0,
  monocytes: 0,
  eosinophils: 0,
  basophils: 0,
  reticulocytes: 0,
  nrbc: 0,
};

export default function ShareResultsModal({
  isOpen,
  onClose,
  examData,
  patientData,
}: ShareResultsModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    vetProfile,
    clinic,
    signatureBase64,
    clinicLogoBase64,
    isReady,
  } = usePDFGenerator();

  // Valores con fallbacks seguros
  const totalCells = examData.totalCells ?? 0;
  const whiteBloodCells = examData.whiteBloodCells ?? 0;
  const hematocrit = examData.hematocrit ?? 0;
  const platelets = examData.platelets ?? 0;
  const totalProtein = examData.totalProtein ?? 0;
  const cells = examData.differentialCount ?? DEFAULT_DIFFERENTIAL;
  const hemotropico = examData.hemotropico ?? "";
  const observacion = examData.observacion ?? "";

  const calculatePercentage = (count: number) =>
    totalCells > 0 ? ((count / totalCells) * 100).toFixed(1) : "0.0";

  const calculateAbsolute = (percentage: string) =>
    ((parseFloat(percentage) / 100) * whiteBloodCells).toFixed(0);

  const formatNumber = (num: number) => num.toLocaleString("es-ES");

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
        "RESULTADOS DE HEMATOLOGÍA",
        "ANÁLISIS HEMATOLÓGICO COMPLETO",
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

      // === TABLA HEMOGRAMA ===
      y = drawHemogramaTable(doc, y, marginLeft, contentWidth, pageWidth, colors);

      y += 10;

      // === TABLA FÓRMULA LEUCOCITARIA ===
      y = drawLeucocitariaTable(doc, y, marginLeft, contentWidth, pageWidth, colors);

      y += 8;

      // === HEMOTROPICOS Y OBSERVACIONES ===
      y = drawHemotropicosAndObservaciones(doc, y, marginLeft, contentWidth, pageWidth, colors);

      // === FIRMA ===
      y = drawSignatureFooter(doc, vetProfile, signatureBase64, colors, pageWidth, y);

      // === FOOTER REDES ===
      drawSocialFooter(doc, clinic, colors, pageWidth, y);

      // === GUARDAR ===
      const dateStr = new Date(examData.date).toLocaleDateString("es-ES").replace(/\//g, "-");
      doc.save(`Hematologia_${patientData.name}_${dateStr}.pdf`);

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
  // TABLA HEMOGRAMA
  // ═══════════════════════════════════════════════════════════
  function drawHemogramaTable(
    doc: jsPDF,
    startY: number,
    marginLeft: number,
    contentWidth: number,
    pageWidth: number,
    colors: typeof LAB_PDF_COLORS
  ): number {
    let y = startY;

    // Header de tabla
    doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.rect(marginLeft, y, contentWidth, 8, "F");
    doc.setFontSize(10);
    doc.setTextColor(colors.white.r, colors.white.g, colors.white.b);
    doc.setFont("helvetica", "bold");
    doc.text("VALORES DEL HEMOGRAMA", pageWidth / 2, y + 5.5, { align: "center" });
    y += 8;

    const colWidths = [
      contentWidth * 0.28,
      contentWidth * 0.18,
      contentWidth * 0.18,
      contentWidth * 0.18,
      contentWidth * 0.18,
    ];
    const rowH = 8;

    // Header de columnas
    const headers = ["PARÁMETRO", "RESULTADO", "UNIDAD", "REF. CANINO", "REF. FELINO"];
    drawTableRow(doc, headers, y, rowH, marginLeft, colWidths, colors, true);
    y += rowH;

    // Filas de datos
    const rows = [
      ["Hematocrito", String(hematocrit), "%", "37 - 55", "30 - 45"],
      ["Glóbulos Blancos", formatNumber(whiteBloodCells), "células/µL", "6.000 - 17.000", "5.000 - 19.500"],
      ["Plaquetas", formatNumber(platelets), "células/µL", "200.000 - 500.000", "300.000 - 800.000"],
      ["Proteínas Totales", String(totalProtein), "g/dL", "5.4 - 7.8", "5.7 - 8.9"],
    ];

    rows.forEach((row) => {
      drawTableRow(doc, row, y, rowH, marginLeft, colWidths, colors, false);
      y += rowH;
    });

    return y;
  }

  // ═══════════════════════════════════════════════════════════
  // TABLA FÓRMULA LEUCOCITARIA
  // ═══════════════════════════════════════════════════════════
  function drawLeucocitariaTable(
    doc: jsPDF,
    startY: number,
    marginLeft: number,
    contentWidth: number,
    pageWidth: number,
    colors: typeof LAB_PDF_COLORS
  ): number {
    let y = startY;

    // Header de tabla
    doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.rect(marginLeft, y, contentWidth, 8, "F");
    doc.setFontSize(10);
    doc.setTextColor(colors.white.r, colors.white.g, colors.white.b);
    doc.setFont("helvetica", "bold");
    doc.text("FÓRMULA LEUCOCITARIA", pageWidth / 2, y + 5.5, { align: "center" });
    y += 8;

    const colWidths = [
      contentWidth * 0.28,
      contentWidth * 0.18,
      contentWidth * 0.18,
      contentWidth * 0.18,
      contentWidth * 0.18,
    ];
    const rowH = 8;

    // Header de columnas
    const headers = ["TIPO CELULAR", "%", "ABSOLUTO (CÉL/ML)", "REF. CANINO (%)", "REF. FELINO (%)"];
    drawTableRow(doc, headers, y, rowH, marginLeft, colWidths, colors, true);
    y += rowH;

    // Filas de datos
    const leucoData = [
      { label: "Neutrófilos Segmentados", val: cells.segmentedNeutrophils ?? 0, refC: "60 - 77", refF: "35 - 75" },
      { label: "Neutrófilos en Banda", val: cells.bandNeutrophils ?? 0, refC: "0 - 3", refF: "0 - 3" },
      { label: "Linfocitos", val: cells.lymphocytes ?? 0, refC: "12 - 30", refF: "20 - 55" },
      { label: "Monocitos", val: cells.monocytes ?? 0, refC: "3 - 10", refF: "1 - 4" },
      { label: "Eosinófilos", val: cells.eosinophils ?? 0, refC: "2 - 10", refF: "2 - 12" },
      { label: "Basófilos", val: cells.basophils ?? 0, refC: "Raros", refF: "Raros" },
    ];

    leucoData.forEach((row) => {
      const per = calculatePercentage(row.val);
      const abs = calculateAbsolute(per);
      const rowData = [row.label, `${per}%`, abs, row.refC, row.refF];
      drawTableRow(doc, rowData, y, rowH, marginLeft, colWidths, colors, false);
      y += rowH;
    });

    return y;
  }

  // ═══════════════════════════════════════════════════════════
  // HEMOTROPICOS Y OBSERVACIONES
  // ═══════════════════════════════════════════════════════════
  function drawHemotropicosAndObservaciones(
    doc: jsPDF,
    startY: number,
    marginLeft: number,
    contentWidth: number,
    pageWidth: number,
    colors: typeof LAB_PDF_COLORS
  ): number {
    let y = startY;

    // Solo dibujar si hay datos
    if (!hemotropico && !observacion) {
      return y;
    }

    // Header de sección
    doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.rect(marginLeft, y, contentWidth, 8, "F");
    doc.setFontSize(10);
    doc.setTextColor(colors.white.r, colors.white.g, colors.white.b);
    doc.setFont("helvetica", "bold");
    doc.text("HALLAZGOS ADICIONALES", pageWidth / 2, y + 5.5, { align: "center" });
    y += 8;

    // === HEMOTROPICOS ===
    if (hemotropico) {
      // Etiqueta
      doc.setFillColor(colors.labelBg.r, colors.labelBg.g, colors.labelBg.b);
      doc.rect(marginLeft, y, contentWidth, 8, "F");
      doc.setDrawColor(colors.tableBorder.r, colors.tableBorder.g, colors.tableBorder.b);
      doc.rect(marginLeft, y, contentWidth, 8, "S");

      doc.setFontSize(9);
      doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
      doc.setFont("helvetica", "bold");
      doc.text("HEMOTROPICOS:", marginLeft + 3, y + 5.5);

      // Valor - determinar color según resultado
      const hemotropicoUpper = hemotropico.toUpperCase();
      if (hemotropicoUpper === "POSITIVO" || hemotropicoUpper.includes("POSITIVO")) {
        doc.setTextColor(220, 38, 38); // Rojo para positivo
      } else if (hemotropicoUpper === "NEGATIVO" || hemotropicoUpper.includes("NEGATIVO")) {
        doc.setTextColor(22, 163, 74); // Verde para negativo
      } else {
        doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
      }
      doc.setFont("helvetica", "bold");
      doc.text(hemotropico, marginLeft + 45, y + 5.5);
      y += 8;
    }

    // === OBSERVACIONES ===
    if (observacion) {
      // Etiqueta
      doc.setFillColor(colors.labelBg.r, colors.labelBg.g, colors.labelBg.b);
      doc.setDrawColor(colors.tableBorder.r, colors.tableBorder.g, colors.tableBorder.b);

      doc.setFontSize(9);
      doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
      doc.setFont("helvetica", "bold");

      // Calcular altura necesaria para el texto
      const maxWidth = contentWidth - 6;
      const splitText = (doc as any).splitTextToSize(observacion, maxWidth);
      const textHeight = splitText.length * 5;
      const boxHeight = Math.max(12, textHeight + 8);

      doc.rect(marginLeft, y, contentWidth, boxHeight, "F");
      doc.rect(marginLeft, y, contentWidth, boxHeight, "S");

      doc.text("OBSERVACIONES:", marginLeft + 3, y + 5);

      // Texto de observación
      doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
      doc.setFont("helvetica", "normal");
      doc.text(splitText, marginLeft + 3, y + 10);

      y += boxHeight;
    }

    return y + 5;
  }

  // ═══════════════════════════════════════════════════════════
  // HELPER: DIBUJAR FILA DE TABLA
  // ═══════════════════════════════════════════════════════════
  function drawTableRow(
    doc: jsPDF,
    data: string[],
    rowY: number,
    rowHeight: number,
    marginLeft: number,
    colWidths: number[],
    colors: typeof LAB_PDF_COLORS,
    isHeader: boolean
  ): void {
    if (isHeader) {
      doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
    } else {
      doc.setFillColor(colors.labelBg.r, colors.labelBg.g, colors.labelBg.b);
    }

    let xPos = marginLeft;
    colWidths.forEach((width) => {
      doc.rect(xPos, rowY, width, rowHeight, "FD");
      xPos += width;
    });

    doc.setDrawColor(colors.tableBorder.r, colors.tableBorder.g, colors.tableBorder.b);
    xPos = marginLeft;
    colWidths.forEach((width) => {
      doc.rect(xPos, rowY, width, rowHeight, "S");
      xPos += width;
    });

    doc.setFontSize(isHeader ? 8 : 9);
    if (isHeader) {
      doc.setTextColor(colors.white.r, colors.white.g, colors.white.b);
      doc.setFont("helvetica", "bold");
    } else {
      doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    }

    xPos = marginLeft;
    data.forEach((text, index) => {
      if (!isHeader) {
        doc.setFont("helvetica", index <= 1 ? "bold" : "normal");
      }
      const align = index === 0 ? "left" : "center";
      const textX = index === 0 ? xPos + 3 : xPos + colWidths[index] / 2;
      doc.text(text, textX, rowY + rowHeight / 2 + 1, { align });
      xPos += colWidths[index];
    });
  }

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handlePrintPDF}
      variant="info"
      title="¡Examen Guardado!"
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