// src/views/recipes/RecipeDetailView.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  X,
  Calendar,
  Pill,
  FileText,
  Loader2,
  StickyNote,
  Download,
  AlertCircle,
} from "lucide-react";
import { getRecipeById } from "@/api/recipeAPI";
import { usePatientData } from "@/hooks/usePatientData";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";

export default function RecipeDetailView() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  // Hook de PDF
  const { generatePDF, isReady: isPDFReady } = usePDFGenerator();

  // Obtener Receta
  const { data: recipe, isLoading: isLoadingRecipe } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => getRecipeById(recipeId!),
    enabled: !!recipeId,
  });

  // Extraer ID seguro y usar Hook de Paciente
  const patientIdString = recipe?.patientId
    ? typeof recipe.patientId === "object"
      ? recipe.patientId._id
      : recipe.patientId
    : undefined;

  const {
    patient,
    ownerName,
    fullSpecies,
    isLoading: isLoadingPatient,
  } = usePatientData(patientIdString);

  const handleClose = () => navigate(-1);

  // ══════════════════════════════════════════
  // GENERAR PDF DE RECETA
  // ══════════════════════════════════════════
  const handlePrintPDF = () => {
    if (!recipe || !patient || !isPDFReady) return;
    setIsGenerating(true);

    const dateStr = new Date(recipe.issueDate).toLocaleDateString("es-ES");

    generatePDF(
      {
        title: "RECETA MÉDICA VETERINARIA",
        primaryColor: { r: 10, g: 126, b: 164 }, // Azul biovet
        filename: `Receta_${patient.name}_${dateStr.replace(/\//g, "-")}.pdf`,
      },
      {
        name: patient.name,
        ownerName,
        fullSpecies,
      },
      dateStr,
      (doc, y, width, margin, colors, addPage) => {
        // --- CUERPO (Rx) ---
        doc.setFont("times", "bold");
        doc.setFontSize(16);
        doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);
        doc.text("Rx.", margin, y);
        y += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        recipe.medications.forEach((med, index) => {
          if (y > 175) {
            y = addPage();
          }

          doc.setFont("helvetica", "bold");
          doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);
          const title = `${index + 1}. ${med.name} (${med.presentation})`;
          doc.text(title, margin + 5, y);
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

        // --- NOTAS ---
        if (recipe.notes) {
          if (y > 170) {
            y = addPage();
          }

          y += 5;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);
          doc.text("Observaciones:", margin, y);
          y += 4;
          doc.setFont("helvetica", "normal");
          const notes = doc.splitTextToSize(recipe.notes, width - margin * 2);
          doc.text(notes, margin, y);
          y += notes.length * 4 + 10;
        }

        return y;
      }
    );

    setIsGenerating(false);
  };

  const isLoading = isLoadingRecipe || isLoadingPatient;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <Loader2 className="animate-spin text-white w-10 h-10" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-xl text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <p>No se encontró la receta</p>
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
        <div className="bg-rose-50 dark:bg-dark-300 p-6 border-b border-rose-100 dark:border-dark-100 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 border border-rose-200 dark:border-rose-800 shadow-sm">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-white leading-tight">
                Receta Médica
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                <Calendar size={14} />
                <span>
                  {new Date(recipe.issueDate).toLocaleDateString("es-ES", {
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
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2 border-b border-surface-200 dark:border-dark-50 pb-2">
              <Pill size={14} className="text-rose-500" /> Medicamentos
              Prescritos ({recipe.medications.length})
            </h3>
            <div className="space-y-3">
              {recipe.medications.map((med, idx) => (
                <div
                  key={idx}
                  className="bg-surface-50 dark:bg-dark-100 p-4 rounded-xl border border-surface-200 dark:border-dark-50 relative group hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors"
                >
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        med.source === "veterinario"
                          ? "bg-biovet-50 text-biovet-600 border-biovet-200 dark:bg-biovet-900/20 dark:border-biovet-800"
                          : "bg-white text-slate-500 border-slate-200 dark:bg-dark-200 dark:border-dark-50"
                      }`}
                    >
                      {med.source}
                    </span>
                  </div>
                  <div className="pr-16">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-0.5">
                      {med.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mb-3">
                      {med.presentation}{" "}
                      {med.quantity && (
                        <span className="text-slate-400 font-normal">
                          • Cantidad: {med.quantity}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-dark-200 p-3 rounded-lg border border-surface-200 dark:border-dark-50 text-sm text-slate-700 dark:text-slate-300 italic">
                    "{med.instructions}"
                  </div>
                </div>
              ))}
            </div>
          </div>
          {recipe.notes && (
            <div className="flex gap-3 items-start text-sm text-slate-600 dark:text-slate-300 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
              <StickyNote size={18} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase mb-1">
                  Indicaciones Adicionales
                </p>
                <p className="italic">"{recipe.notes}"</p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-surface-50/50 dark:bg-dark-300/50 border-t border-surface-200 dark:border-dark-100 flex gap-3">
          <button
            onClick={handlePrintPDF}
            disabled={isGenerating || !isPDFReady}
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