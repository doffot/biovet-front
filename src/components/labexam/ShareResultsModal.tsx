import { Printer } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import { getProfile } from "@/api/AuthAPI";
import { toast } from "../Toast";
import ConfirmationModal from "../ConfirmationModal";
import type { LabExam } from "@/types/labExam";

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

export default function ShareResultsModal({
  isOpen,
  onClose,
  examData,
  patientData,
}: ShareResultsModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState<string>("");

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  useEffect(() => {
    const loadSignature = async () => {
      if (!profile?.signature) return;
      try {
        const response = await fetch(profile.signature);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => setSignatureBase64(reader.result as string);
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error cargando firma:", error);
      }
    };
    if (isOpen && profile?.signature) {
      loadSignature();
    }
  }, [isOpen, profile?.signature]);

  const cells = examData.differentialCount;

  const calculatePercentage = (count: number) =>
    examData.totalCells > 0
      ? ((count / examData.totalCells) * 100).toFixed(1)
      : "0.0";

  const calculateAbsolute = (percentage: string) =>
    ((parseFloat(percentage) / 100) * examData.whiteBloodCells).toFixed(0);

  const formatNumber = (num: number) => num.toLocaleString("es-ES");

  const handlePrintPDF = () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginLeft = 15;
      const marginRight = 15;
      const contentWidth = pageWidth - marginLeft - marginRight;
      let y = 15;

      // === COLORES ===
      const primary = { r: 10, g: 126, b: 164 }; // #0A7EA4
      const dark = { r: 30, g: 41, b: 59 }; // #1e293b
      const gray = { r: 100, g: 116, b: 139 }; // #64748b
      const lightBg = { r: 224, g: 244, b: 248 }; // #E0F4F8
      const white = { r: 255, g: 255, b: 255 };
      const tableBorder = { r: 226, g: 232, b: 240 }; // #E2E8F0
      const labelBg = { r: 248, g: 250, b: 252 }; // #f8fafc

      // === TÍTULO ===
      doc.setFontSize(20);
      doc.setTextColor(primary.r, primary.g, primary.b);
      doc.setFont("helvetica", "bold");
      doc.text("RESULTADOS DE HEMATOLOGÍA", pageWidth / 2, y, { align: "center" });
      y += 7;

      doc.setFontSize(10);
      doc.setTextColor(gray.r, gray.g, gray.b);
      doc.setFont("helvetica", "normal");
      doc.text("ANÁLISIS HEMATOLÓGICO COMPLETO", pageWidth / 2, y, { align: "center" });
      y += 10;

      // === INFO PACIENTE ===
      const infoHeight = 22;
      doc.setFillColor(lightBg.r, lightBg.g, lightBg.b);
      doc.rect(marginLeft, y, contentWidth, infoHeight, "F");

      doc.setFontSize(9);
      doc.setTextColor(dark.r, dark.g, dark.b);

      const col1 = marginLeft + 5;
      const col2 = marginLeft + contentWidth / 3 + 5;
      const col3 = marginLeft + (contentWidth / 3) * 2 + 5;
      const row1 = y + 7;
      const row2 = y + 15;

      // Fila 1
      doc.setFont("helvetica", "bold");
      doc.text("Fecha: ", col1, row1);
      doc.setFont("helvetica", "normal");
      doc.text(new Date(examData.date).toLocaleDateString("es-ES"), col1 + 14, row1);

      doc.setFont("helvetica", "bold");
      doc.text("Paciente: ", col2, row1);
      doc.setFont("helvetica", "normal");
      doc.text(patientData.name, col2 + 20, row1);

      doc.setFont("helvetica", "bold");
      doc.text("Especie: ", col3, row1);
      doc.setFont("helvetica", "normal");
      doc.text(patientData.species, col3 + 18, row1);

      // Fila 2
      doc.setFont("helvetica", "bold");
      doc.text("Raza: ", col1, row2);
      doc.setFont("helvetica", "normal");
      doc.text(patientData.breed || "—", col1 + 13, row2);

      doc.setFont("helvetica", "bold");
      doc.text("Propietario: ", col2, row2);
      doc.setFont("helvetica", "normal");
      doc.text(patientData.owner.name || "—", col2 + 25, row2);

      doc.setFont("helvetica", "bold");
      doc.text("Médico: ", col3, row2);
      doc.setFont("helvetica", "normal");
      doc.text(patientData.mainVet || "—", col3 + 16, row2);

      y += infoHeight + 10;

      // === FUNCIÓN PARA DIBUJAR TABLAS ===
      const drawTableHeader = (title: string, startY: number): number => {
        doc.setFillColor(primary.r, primary.g, primary.b);
        doc.rect(marginLeft, startY, contentWidth, 8, "F");
        doc.setFontSize(10);
        doc.setTextColor(white.r, white.g, white.b);
        doc.setFont("helvetica", "bold");
        doc.text(title, pageWidth / 2, startY + 5.5, { align: "center" });
        return startY + 8;
      };

      const drawRow = (
        cols: { text: string; x: number; width: number; align?: "left" | "center" | "right"; bold?: boolean }[],
        rowY: number,
        rowHeight: number,
        isHeader: boolean,
        isLabel?: boolean
      ) => {
        if (isHeader) {
          doc.setFillColor(primary.r, primary.g, primary.b);
        } else if (isLabel) {
          doc.setFillColor(labelBg.r, labelBg.g, labelBg.b);
        } else {
          doc.setFillColor(white.r, white.g, white.b);
        }

        // Dibujar celdas
        let xPos = marginLeft;
        cols.forEach((col) => {
          doc.rect(xPos, rowY, col.width, rowHeight, "FD");
          xPos += col.width;
        });

        // Bordes
        doc.setDrawColor(tableBorder.r, tableBorder.g, tableBorder.b);
        xPos = marginLeft;
        cols.forEach((col) => {
          doc.rect(xPos, rowY, col.width, rowHeight, "S");
          xPos += col.width;
        });

        // Texto
        doc.setFontSize(isHeader ? 8 : 9);
        if (isHeader) {
          doc.setTextColor(white.r, white.g, white.b);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(dark.r, dark.g, dark.b);
        }

        cols.forEach((col) => {
          if (!isHeader) {
            doc.setFont("helvetica", col.bold ? "bold" : "normal");
          }
          const textX =
            col.align === "center"
              ? col.x + col.width / 2
              : col.align === "right"
              ? col.x + col.width - 3
              : col.x + 3;
          doc.text(col.text, textX, rowY + rowHeight / 2 + 1, {
            align: col.align || "left",
          });
        });
      };

      // === TABLA HEMOGRAMA ===
      y = drawTableHeader("VALORES DEL HEMOGRAMA", y);

      const colWidths1 = [
        contentWidth * 0.28,
        contentWidth * 0.18,
        contentWidth * 0.18,
        contentWidth * 0.18,
        contentWidth * 0.18,
      ];
      const rowH = 8;

      // Header
      const headerCols1 = [
        { text: "PARÁMETRO", x: marginLeft, width: colWidths1[0], align: "center" as const },
        { text: "RESULTADO", x: marginLeft + colWidths1[0], width: colWidths1[1], align: "center" as const },
        { text: "UNIDAD", x: marginLeft + colWidths1[0] + colWidths1[1], width: colWidths1[2], align: "center" as const },
        { text: "REF. CANINO", x: marginLeft + colWidths1[0] + colWidths1[1] + colWidths1[2], width: colWidths1[3], align: "center" as const },
        { text: "REF. FELINO", x: marginLeft + colWidths1[0] + colWidths1[1] + colWidths1[2] + colWidths1[3], width: colWidths1[4], align: "center" as const },
      ];
      drawRow(headerCols1, y, rowH, true);
      y += rowH;

      // Filas hemograma
      const hemogramaRows = [
        { param: "Hematocrito", value: String(examData.hematocrit), unit: "%", refC: "37 - 55", refF: "30 - 45" },
        { param: "Glóbulos Blancos", value: formatNumber(examData.whiteBloodCells), unit: "células/µL", refC: "6.000 - 17.000", refF: "5.000 - 19.500" },
        { param: "Plaquetas", value: formatNumber(examData.platelets), unit: "células/µL", refC: "200.000 - 500.000", refF: "300.000 - 800.000" },
        { param: "Proteínas Totales", value: String(examData.totalProtein), unit: "g/dL", refC: "5.4 - 7.8", refF: "5.7 - 8.9" },
      ];

      hemogramaRows.forEach((row) => {
        let xPos = marginLeft;
        const cols = [
          { text: row.param, x: xPos, width: colWidths1[0], align: "left" as const, bold: true },
          { text: row.value, x: (xPos += colWidths1[0]), width: colWidths1[1], align: "center" as const, bold: true },
          { text: row.unit, x: (xPos += colWidths1[1]), width: colWidths1[2], align: "center" as const },
          { text: row.refC, x: (xPos += colWidths1[2]), width: colWidths1[3], align: "center" as const },
          { text: row.refF, x: (xPos += colWidths1[3]), width: colWidths1[4], align: "center" as const },
        ];
        drawRow(cols, y, rowH, false, true);
        y += rowH;
      });

      y += 10;

      // === TABLA FÓRMULA LEUCOCITARIA ===
      y = drawTableHeader("FÓRMULA LEUCOCITARIA", y);

      const headerCols2 = [
        { text: "TIPO CELULAR", x: marginLeft, width: colWidths1[0], align: "center" as const },
        { text: "%", x: marginLeft + colWidths1[0], width: colWidths1[1], align: "center" as const },
        { text: "ABSOLUTO (CÉL/ML)", x: marginLeft + colWidths1[0] + colWidths1[1], width: colWidths1[2], align: "center" as const },
        { text: "REF. CANINO (%)", x: marginLeft + colWidths1[0] + colWidths1[1] + colWidths1[2], width: colWidths1[3], align: "center" as const },
        { text: "REF. FELINO (%)", x: marginLeft + colWidths1[0] + colWidths1[1] + colWidths1[2] + colWidths1[3], width: colWidths1[4], align: "center" as const },
      ];
      drawRow(headerCols2, y, rowH, true);
      y += rowH;

      const leucoRows = [
        { label: "Neutrófilos Segmentados", val: cells.segmentedNeutrophils, refC: "60 - 77", refF: "35 - 75" },
        { label: "Neutrófilos en Banda", val: cells.bandNeutrophils, refC: "0 - 3", refF: "0 - 3" },
        { label: "Linfocitos", val: cells.lymphocytes, refC: "12 - 30", refF: "20 - 55" },
        { label: "Monocitos", val: cells.monocytes, refC: "3 - 10", refF: "1 - 4" },
        { label: "Eosinófilos", val: cells.eosinophils, refC: "2 - 10", refF: "2 - 12" },
        { label: "Basófilos", val: cells.basophils, refC: "Raros", refF: "Raros" },
      ];

      leucoRows.forEach((row) => {
        const per = calculatePercentage(row.val || 0);
        const abs = calculateAbsolute(per);
        let xPos = marginLeft;
        const cols = [
          { text: row.label, x: xPos, width: colWidths1[0], align: "left" as const, bold: true },
          { text: `${per}%`, x: (xPos += colWidths1[0]), width: colWidths1[1], align: "center" as const, bold: true },
          { text: abs, x: (xPos += colWidths1[1]), width: colWidths1[2], align: "center" as const },
          { text: row.refC, x: (xPos += colWidths1[2]), width: colWidths1[3], align: "center" as const },
          { text: row.refF, x: (xPos += colWidths1[3]), width: colWidths1[4], align: "center" as const },
        ];
        drawRow(cols, y, rowH, false, true);
        y += rowH;
      });

      // === PIE DE PÁGINA ===
      y += 20;

      // Firma
      if (signatureBase64) {
        try {
          doc.addImage(signatureBase64, "PNG", pageWidth / 2 - 25, y, 50, 20);
          y += 22;
        } catch (e) {
          console.warn("No se pudo agregar firma:", e);
          y += 5;
        }
      }

      // Línea separadora
      doc.setDrawColor(tableBorder.r, tableBorder.g, tableBorder.b);
      doc.line(pageWidth / 2 - 40, y, pageWidth / 2 + 40, y);
      y += 6;

      // Nombre del doctor
      doc.setFontSize(12);
      doc.setTextColor(primary.r, primary.g, primary.b);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Dr(a). ${profile?.name || ""} ${profile?.lastName || ""}`,
        pageWidth / 2,
        y,
        { align: "center" }
      );
      y += 6;

      // CI
      doc.setFontSize(9);
      doc.setTextColor(gray.r, gray.g, gray.b);
      doc.setFont("helvetica", "normal");
      doc.text(`C.I: ${profile?.ci || "—"}`, pageWidth / 2, y, { align: "center" });
      y += 6;

      // Credenciales
      doc.setFontSize(8);
      doc.text(
        `COLVET-${profile?.estado || "—"}: ${profile?.cmv || "—"} | INSAI: ${profile?.runsai || "—"} | MSDS: ${profile?.msds || "—"}`,
        pageWidth / 2,
        y,
        { align: "center" }
      );
      y += 5;

      // Estado
      doc.text(`${profile?.estado || "—"}, Venezuela`, pageWidth / 2, y, {
        align: "center",
      });

      // === GUARDAR ===
      doc.save(`Hematologia_${patientData.name}.pdf`);

      toast.success("PDF Generado correctamente");
      onClose();
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error("Error al generar PDF");
    } finally {
      setIsGenerating(false);
    }
  };

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
      isLoading={isGenerating}
    />
  );
}