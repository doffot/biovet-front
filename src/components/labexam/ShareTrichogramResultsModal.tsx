// src/components/labexam/ShareTrichogramResultsModal.tsx
import { Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "../Toast";
import ConfirmationModal from "../ConfirmationModal";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import type { LabExam } from "@/types/labExam";

interface ShareTrichogramResultsModalProps {
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

export default function ShareTrichogramResultsModal({
  isOpen,
  onClose,
  examData,
  patientData,
}: ShareTrichogramResultsModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { generatePDF, isReady } = usePDFGenerator();

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
          title: "TRICOGRAMA",
          primaryColor: { r: 20, g: 184, b: 166 }, // teal-500
          filename: `Tricograma_${patientData.name}_${dateStr.replace(/\//g, "-")}.pdf`,
        },
        {
          name: patientData.name,
          ownerName,
          fullSpecies,
        },
        dateStr,
        (doc, y, width, margin, colors) => {
          // ═══ DESCRIPCIÓN DEL EXAMEN ═══
          doc.setFillColor(20, 184, 166); // teal-500
          doc.rect(margin, y, width - margin * 2, 8, "F");
          doc.setFontSize(9);
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.text("TRICOGRAMA - ANÁLISIS DE PELO", margin + 2, y + 5.5);
          y += 8;

          // Info box
          const infoBoxHeight = 14;
          doc.setFillColor(240, 253, 250); // teal-50
          doc.rect(margin, y, width - margin * 2, infoBoxHeight, "F");
          doc.setDrawColor(200, 200, 200);
          doc.rect(margin, y, width - margin * 2, infoBoxHeight, "S");

          doc.setFontSize(8);
          doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);
          doc.setFont("helvetica", "italic");
          doc.text(
            "Análisis microscópico del pelo para evaluar el ciclo piloso y alteraciones estructurales.",
            margin + 2,
            y + 5
          );
          doc.text(
            "Útil para diagnóstico diferencial de alopecias endocrinas y otras causas de pérdida de pelo.",
            margin + 2,
            y + 10
          );

          y += infoBoxHeight + 5;

          // ═══ HALLAZGOS / RESULTADOS ═══
          doc.setFillColor(20, 184, 166); // teal-500
          doc.rect(margin, y, width - margin * 2, 8, "F");
          doc.setFontSize(9);
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.text("HALLAZGOS / RESULTADOS", margin + 2, y + 5.5);
          y += 8;

          // Contenedor resultados
          doc.setFillColor(240, 253, 250); // teal-50
          doc.setDrawColor(200, 200, 200);

          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);

          const lines = doc.splitTextToSize(results, width - margin * 2 - 4);
          const lineHeight = 4.5;
          const textHeight = lines.length * lineHeight;
          const resultsBoxHeight = Math.max(textHeight + 4, 25);

          doc.rect(margin, y, width - margin * 2, resultsBoxHeight, "FD");
          doc.text(lines, margin + 2, y + 4);

          y += resultsBoxHeight + 4;

          // Nota interpretativa
          doc.setFontSize(7);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);
          doc.text(
            "* El ratio anágeno:telógeno normal es aproximadamente 9:1. Se recomienda correlacionar con el cuadro clínico.",
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
      variant="info"
      title="¡Tricograma Guardado!"
      message={
        <div className="text-center">
          <p className="text-lg font-bold text-slate-200 uppercase tracking-tight">
            {patientData.name} • {patientData.species}
          </p>
          <div className="py-3 border-y border-slate-700/50 my-4">
            <p className="text-teal-400 font-bold mb-2">
              Análisis de Pelo
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