// src/components/labexam/ShareSkinScrapingResultsModal.tsx
import { Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "../Toast";
import ConfirmationModal from "../ConfirmationModal";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import type { LabExam } from "@/types/labExam";

interface ShareSkinScrapingResultsModalProps {
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

export default function ShareSkinScrapingResultsModal({
  isOpen,
  onClose,
  examData,
  patientData,
}: ShareSkinScrapingResultsModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { generatePDF, isReady } = usePDFGenerator();

  const scrapingType = examData.type ?? "superficial";
  const results = examData.results ?? "Sin resultados registrados";

  const handlePrintPDF = () => {
    if (!isReady) {
      toast.error("Error", "Cargando datos necesarios...");
      return;
    }

    setIsGenerating(true);

    try {
      const dateStr = new Date(examData.date).toLocaleDateString("es-ES");
      const ownerName = patientData.owner?.name || "Propietario";
      const fullSpecies = `${patientData.species}${patientData.breed ? ` - ${patientData.breed}` : ""}`;

      generatePDF(
        {
          title: "RASPADO CUTÁNEO",
          primaryColor: { r: 245, g: 158, b: 11 }, // amber-500
          filename: `RaspadoCutaneo_${patientData.name}_${dateStr.replace(/\//g, "-")}.pdf`,
        },
        {
          name: patientData.name,
          ownerName,
          fullSpecies,
        },
        dateStr,
        (doc, y, width, margin, colors) => {
          // ═══ TIPO DE RASPADO ═══
          doc.setFillColor(245, 158, 11); // amber-500
          doc.rect(margin, y, width - margin * 2, 8, "F");
          doc.setFontSize(9);
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.text("TIPO DE RASPADO", margin + 2, y + 5.5);
          y += 8;

          // Contenedor tipo
          const typeBoxHeight = 12;
          doc.setFillColor(250, 245, 235); // amber-50
          doc.rect(margin, y, width - margin * 2, typeBoxHeight, "F");
          doc.setDrawColor(200, 200, 200);
          doc.rect(margin, y, width - margin * 2, typeBoxHeight, "S");

          doc.setFontSize(10);
          doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);
          doc.setFont("helvetica", "bold");
          const typeLabel = scrapingType.charAt(0).toUpperCase() + scrapingType.slice(1);
          doc.text(typeLabel, margin + 2, y + 7.5);

          // Descripción
          doc.setFontSize(7);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);
          const description =
            scrapingType === "superficial"
              ? "Capas externas de la piel"
              : "Capas profundas, hasta sangrado capilar";
          doc.text(description, margin + 50, y + 7.5);

          y += typeBoxHeight + 5;

          // ═══ HALLAZGOS / RESULTADOS ═══
          doc.setFillColor(245, 158, 11); // amber-500
          doc.rect(margin, y, width - margin * 2, 8, "F");
          doc.setFontSize(9);
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.text("HALLAZGOS / RESULTADOS", margin + 2, y + 5.5);
          y += 8;

          // Contenedor resultados
          doc.setFillColor(250, 245, 235); // amber-50
          doc.setDrawColor(200, 200, 200);

          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);

          const lines = doc.splitTextToSize(results, width - margin * 2 - 4);
          const lineHeight = 4.5;
          const textHeight = lines.length * lineHeight;
          const resultsBoxHeight = Math.max(textHeight + 4, 20);

          doc.rect(margin, y, width - margin * 2, resultsBoxHeight, "FD");
          doc.text(lines, margin + 2, y + 4);

          y += resultsBoxHeight + 4;

          // Nota interpretativa
          doc.setFontSize(7);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);
          doc.text(
            "* Examen microscópico directo. Se recomienda correlacionar con el cuadro clínico.",
            width / 2,
            y + 2,
            { align: "center" }
          );
          y += 8;

          return y;
        }
      );

      onClose();
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error("Error", "No se pudo generar el PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handlePrintPDF}
      variant="warning"
      title="¡Raspado Cutáneo Guardado!"
      message={
        <div className="text-center">
          <p className="text-lg font-bold text-slate-200 uppercase tracking-tight">
            {patientData.name} • {patientData.species}
          </p>
          <div className="py-3 border-y border-slate-700/50 my-4">
            <p className="text-amber-400 font-bold mb-2 capitalize">
              Raspado {scrapingType}
            </p>
            <p className="text-sm text-slate-400 line-clamp-3">
              {results}
            </p>
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