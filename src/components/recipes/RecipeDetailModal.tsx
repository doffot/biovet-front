// src/components/recipes/RecipeDetailModal.tsx

import { useState } from "react";
import { 
  FileText, 
  Pill, 
  StickyNote, 
  Download, 
  Loader2,
  Building2,
  Home
} from "lucide-react";
import DetailModal from "@/components/ui/DetailModal";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import { usePatientData } from "@/hooks/usePatientData";
import { toast } from "@/components/Toast";
import type { Recipe } from "@/types/recipe";

interface RecipeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  triggerRect?: DOMRect | null;
}

export default function RecipeDetailModal({
  isOpen,
  onClose,
  recipe,
  triggerRect,
}: RecipeDetailModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { generatePDF, isReady: isPDFReady } = usePDFGenerator();

  // Extraer ID del paciente
  const patientIdString = recipe?.patientId
    ? typeof recipe.patientId === "object"
      ? recipe.patientId._id
      : recipe.patientId
    : undefined;

  // Obtener datos del paciente
  const { patient, ownerName, fullSpecies } = usePatientData(patientIdString);

  if (!recipe) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ══════════════════════════════════════════
  // GENERAR PDF
  // ══════════════════════════════════════════
  const handlePrintPDF = () => {
    if (!recipe || !patient || !isPDFReady) {
      toast.error("Error", "No se encontraron los datos necesarios");
      return;
    }
    
    setIsGenerating(true);

    const dateStr = new Date(recipe.issueDate).toLocaleDateString("es-ES");

    generatePDF(
      {
        title: "RECETA MÉDICA VETERINARIA",
        primaryColor: { r: 10, g: 126, b: 164 },
        filename: `Receta_${patient.name}_${dateStr.replace(/\//g, "-")}.pdf`,
      },
      {
        name: patient.name,
        ownerName,
        fullSpecies,
      },
      dateStr,
      (doc, y, width, margin, colors, addPage) => {
        // Rx.
        doc.setFont("times", "bold");
        doc.setFontSize(16);
        doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);
        doc.text("Rx.", margin, y);
        y += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        recipe.medications.forEach((med, index) => {
          if (y > 175) y = addPage();

          doc.setFont("helvetica", "bold");
          doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);
          doc.text(`${index + 1}. ${med.name} (${med.presentation})`, margin + 5, y);
          y += 5;

          if (med.quantity) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.text(`Cantidad: ${med.quantity}`, margin + 5, y);
            y += 5;
          }

          doc.setFont("helvetica", "italic");
          doc.setFontSize(10);
          const instructions = doc.splitTextToSize(
            `Indicaciones: ${med.instructions}`,
            width - margin * 2 - 10
          );
          doc.text(instructions, margin + 5, y);
          y += instructions.length * 4 + 4;
        });

        // Notas
        if (recipe.notes) {
          if (y > 170) y = addPage();
          y += 5;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text("Observaciones:", margin, y);
          y += 4;
          doc.setFont("helvetica", "normal");
          const notes = doc.splitTextToSize(recipe.notes, width - margin * 2);
          doc.text(notes, margin, y);
        }

        return y;
      }
    );

    setIsGenerating(false);
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="Receta Médica"
      subtitle={formatDate(recipe.issueDate)}
      icon={<FileText size={24} />}
      headerColor="rose"
      triggerRect={triggerRect}
      isLoading={isGenerating}
      footer={
        <div className="flex gap-3">
          <button
            onClick={handlePrintPDF}
            disabled={isGenerating || !isPDFReady}
            className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Download size={18} />
            )}
            Descargar PDF
          </button>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="flex-1 py-3 rounded-xl bg-surface-200 dark:bg-dark-50 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-surface-300 dark:hover:bg-dark-100 transition-colors disabled:opacity-50 active:scale-[0.98]"
          >
            Cerrar
          </button>
        </div>
      }
    >
      {/* Medicamentos */}
      <div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-surface-200 dark:border-dark-50 pb-2">
          <Pill size={12} className="text-rose-500" /> Medicamentos Prescritos ({recipe.medications.length})
        </h3>
        <div className="space-y-3">
          {recipe.medications.map((med, idx) => (
            <div
              key={idx}
              className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50 hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors"
            >
              {/* Header con badge */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-0.5">
                    {med.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {med.presentation}
                    {med.quantity && (
                      <span className="text-slate-400"> • Cantidad: {med.quantity}</span>
                    )}
                  </p>
                </div>
                
                {/* Badge Fuente */}
                <span
                  className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg border uppercase flex items-center gap-1 ${
                    med.source === "veterinario"
                      ? "bg-biovet-50 text-biovet-600 border-biovet-200 dark:bg-biovet-900/20 dark:border-biovet-800"
                      : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-dark-200 dark:border-dark-50"
                  }`}
                >
                  {med.source === "veterinario" ? <Building2 size={10} /> : <Home size={10} />}
                  {med.source}
                </span>
              </div>

              {/* Indicaciones */}
              <div className="bg-white dark:bg-dark-200 p-3 rounded-xl border border-surface-200 dark:border-dark-50 text-sm text-slate-700 dark:text-slate-300 italic">
                "{med.instructions}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notas adicionales */}
      {recipe.notes && (
        <div className="bg-warning-50 dark:bg-warning-950/20 p-4 rounded-2xl border border-warning-200 dark:border-warning-800 flex gap-3 items-start">
          <StickyNote size={18} className="text-warning-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-black text-warning-600 dark:text-warning-400 uppercase tracking-widest mb-1">
              Indicaciones Adicionales
            </p>
            <p className="text-sm text-warning-800 dark:text-warning-200 italic leading-relaxed">
              "{recipe.notes}"
            </p>
          </div>
        </div>
      )}
    </DetailModal>
  );
}