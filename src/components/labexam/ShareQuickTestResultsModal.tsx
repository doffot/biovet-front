// src/components/labexam/ShareQuickTestResultsModal.tsx
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

interface ShareQuickTestResultsModalProps {
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

export default function ShareQuickTestResultsModal({
  isOpen,
  onClose,
  examData,
  patientData,
}: ShareQuickTestResultsModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { vetProfile, clinic, signatureBase64, clinicLogoBase64, isReady } =
    usePDFGenerator();

  // Valores con fallbacks
  const testName = examData.testName ?? "Test no especificado";
  const results = examData.results ?? "Sin resultado";

  // Determinar color según resultado
  const getResultColor = (result: string) => {
    const lower = result.toLowerCase();
    if (lower === "positivo") return { r: 220, g: 38, b: 38 }; // Rojo
    if (lower === "negativo") return { r: 22, g: 163, b: 74 }; // Verde
    return { r: 100, g: 116, b: 139 }; // Gris (indeterminado)
  };

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
        12
      );

      // === TÍTULO ===
      y = drawTitle(
        doc,
        "RESULTADO DE TEST RÁPIDO",
        "DIAGNÓSTICO PRELIMINAR",
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

      // === RESULTADO DEL TEST ===
      y = drawTestResult(doc, y, marginLeft, contentWidth, pageWidth, colors);

      // === FIRMA ===
      y = drawSignatureFooter(
        doc,
        vetProfile,
        signatureBase64,
        colors,
        pageWidth,
        y
      );

      // === FOOTER REDES ===
      drawSocialFooter(doc, clinic, colors, pageWidth, y);

      // === GUARDAR ===
      const dateStr = new Date(examData.date)
        .toLocaleDateString("es-ES")
        .replace(/\//g, "-");
      doc.save(`TestRapido_${patientData.name}_${dateStr}.pdf`);

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
  // RESULTADO DEL TEST
  // ═══════════════════════════════════════════════════════════
  function drawTestResult(
    doc: jsPDF,
    startY: number,
    marginLeft: number,
    contentWidth: number,
    pageWidth: number,
    colors: typeof LAB_PDF_COLORS
  ): number {
    let y = startY;

    // Header
    doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.rect(marginLeft, y, contentWidth, 8, "F");
    doc.setFontSize(10);
    doc.setTextColor(colors.white.r, colors.white.g, colors.white.b);
    doc.setFont("helvetica", "bold");
    doc.text("RESULTADO DEL TEST", pageWidth / 2, y + 5.5, { align: "center" });
    y += 8;

    // Contenedor principal
    const boxHeight = 50;
    doc.setFillColor(colors.labelBg.r, colors.labelBg.g, colors.labelBg.b);
    doc.rect(marginLeft, y, contentWidth, boxHeight, "F");
    doc.setDrawColor(colors.tableBorder.r, colors.tableBorder.g, colors.tableBorder.b);
    doc.rect(marginLeft, y, contentWidth, boxHeight, "S");

    // Nombre del test
    doc.setFontSize(11);
    doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);
    doc.setFont("helvetica", "normal");
    doc.text("Test realizado:", pageWidth / 2, y + 12, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    doc.setFont("helvetica", "bold");
    doc.text(testName.toUpperCase(), pageWidth / 2, y + 22, { align: "center" });

    // Línea divisoria
    doc.setDrawColor(colors.tableBorder.r, colors.tableBorder.g, colors.tableBorder.b);
    doc.line(marginLeft + 20, y + 28, marginLeft + contentWidth - 20, y + 28);

    // Resultado con color
    doc.setFontSize(11);
    doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);
    doc.setFont("helvetica", "normal");
    doc.text("Resultado:", pageWidth / 2, y + 36, { align: "center" });

    const resultColor = getResultColor(results);
    doc.setFontSize(20);
    doc.setTextColor(resultColor.r, resultColor.g, resultColor.b);
    doc.setFont("helvetica", "bold");
    doc.text(results.toUpperCase(), pageWidth / 2, y + 46, { align: "center" });

    y += boxHeight;

    // Nota de interpretación
    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);
    doc.setFont("helvetica", "italic");
    doc.text(
      "* Este resultado es orientativo. Se recomienda confirmar con pruebas de laboratorio complementarias.",
      pageWidth / 2,
      y + 5,
      { align: "center" }
    );
    y += 10;

    return y;
  }

  // Obtener variante visual según resultado
  const getResultVariant = () => {
    const lower = results.toLowerCase();
    if (lower === "positivo") return "danger";
    if (lower === "negativo") return "success";
    return "info";
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handlePrintPDF}
      variant={getResultVariant() as "info" | "danger" | "success"}
      title="¡Test Rápido Guardado!"
      message={
        <div className="text-center">
          <p className="text-lg font-bold text-slate-200 uppercase tracking-tight">
            {patientData.name} • {patientData.species}
          </p>
          <div className="py-3 border-y border-slate-700/50 my-4">
            <p className="text-slate-400 font-medium mb-2">{testName}</p>
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                results.toLowerCase() === "positivo"
                  ? "bg-danger-500/20 text-danger-400"
                  : results.toLowerCase() === "negativo"
                    ? "bg-success-500/20 text-success-400"
                    : "bg-slate-500/20 text-slate-400"
              }`}
            >
              {results.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            {new Date(examData.date).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      }
      confirmText="Descargar PDF"
      confirmIcon={Printer}
      isLoading={isGenerating || !isReady}
    />
  );
}