// src/views/recipes/RecipeListView.tsx

import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Trash2,
  Pencil,
  Loader2,
  ChevronRight,
  Pill,
  Download,
} from "lucide-react";
import { getRecipesByPatient, deleteRecipe } from "@/api/recipeAPI";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import RecipeDetailModal from "@/components/recipes/RecipeDetailModal";
import type { Recipe } from "@/types/recipe";
import type { Patient } from "@/types/patient";
import EditRecipeModal from "@/components/recipes/EditRecipeModal";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import TimelineLayout from "@/components/ui/TimelineLayout";

export default function RecipeListView() {
  const contextData = useOutletContext<any>();
  const patient: Patient = contextData.patient || contextData;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Estados
  const [recipeToDelete, setRecipeToDelete] = useState<{ id: string } | null>(null);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  const [recipeToView, setRecipeToView] = useState<Recipe | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

  const { generatePDF, isReady: isPDFReady } = usePDFGenerator();

  // Query
  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ["recipes", patient._id],
    queryFn: () => getRecipesByPatient(patient._id),
    enabled: !!patient._id,
  });

  // Mutation eliminar
  const { mutate: removeRecipe, isPending: isDeleting } = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      toast.success("Receta Eliminada", "El registro ha sido removido correctamente.");
      queryClient.invalidateQueries({ queryKey: ["recipes", patient._id] });
      setRecipeToDelete(null);
    },
    onError: (error: Error) => toast.error("Error al eliminar", error.message),
  });

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));

  const sortedRecipes = [...recipes].sort(
    (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
  );

  // Handler para PDF desde la lista
  const handleDownloadPDF = (recipe: Recipe) => {
    if (!patient || !isPDFReady) {
      toast.error("Error", "No se encontraron los datos necesarios.");
      return;
    }

    setGeneratingPdfId(recipe._id);

    const dateStr = new Date(recipe.issueDate).toLocaleDateString("es-ES");
    const fullSpecies = patient.breed ? `${patient.species} - ${patient.breed}` : patient.species;
    const ownerName = typeof patient.owner === "object" && patient.owner !== null
      ? `${patient.owner.name}`
      : "Propietario";

    generatePDF(
      {
        title: "RECETA MÉDICA VETERINARIA",
        primaryColor: { r: 10, g: 126, b: 164 },
        filename: `Receta_${patient.name}_${dateStr.replace(/\//g, "-")}.pdf`,
      },
      { name: patient.name, ownerName, fullSpecies },
      dateStr,
      (doc, y, width, margin, colors, addPage) => {
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
          const instructions = doc.splitTextToSize(`Indicaciones: ${med.instructions}`, width - margin * 2 - 10);
          doc.text(instructions, margin + 5, y);
          y += instructions.length * 4 + 4;
        });

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

    setGeneratingPdfId(null);
  };

  // Handler para abrir detalle con posición
  const handleOpenDetail = (recipe: Recipe, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTriggerRect(rect);
    setRecipeToView(recipe);
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  return (
    <TimelineLayout
      title="Recetas"
      subtitle={`Historial de ${patient?.name}`}
      headerIcon={Pill}
      count={recipes.length}
      countLabel="recetas"
      onAdd={() => navigate("create")}
      variant="recetas"
    >
      {sortedRecipes.length === 0 ? (
        <div className="ml-8 text-center py-16 border-2 border-dashed border-rose-200 dark:border-rose-900 rounded-2xl">
          <FileText className="w-12 h-12 mx-auto text-rose-300 dark:text-rose-700 mb-3 opacity-50" />
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-1">Sin recetas registradas</p>
          <p className="text-xs text-slate-300 dark:text-slate-600">Crea la primera prescripción médica</p>
        </div>
      ) : (
        sortedRecipes.map((recipe) => (
          <div key={recipe._id} className="relative flex gap-6 md:gap-8 group animate-fade-in">
            {/* Icono Timeline */}
            <div className="relative z-10 shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-lg border flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 text-rose-500 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800">
              <Pill size={14} strokeWidth={2.5} />
            </div>

            {/* Card */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                    Receta Médica
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {formatDate(recipe.issueDate)}
                    </span>
                    <span className="flex items-center gap-1 opacity-70">
                      <Pill size={14} /> {recipe.medications.length} medicamento(s)
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDownloadPDF(recipe)}
                    disabled={generatingPdfId === recipe._id || !isPDFReady}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-50"
                  >
                    {generatingPdfId === recipe._id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Download size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => setRecipeToEdit(recipe)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => setRecipeToDelete({ id: recipe._id })}
                    className="p-2 text-slate-400 hover:text-danger-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Preview Medicamentos */}
              <div className="mt-3 space-y-2">
                {recipe.medications.slice(0, 2).map((med, idx) => (
                  <div
                    key={idx}
                    className="bg-rose-50/50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-100 dark:border-rose-900/50 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[60%]">
                      {med.name}
                    </span>
                    <span className="text-slate-500 truncate">
                      {med.instructions.substring(0, 30)}...
                    </span>
                  </div>
                ))}
                {recipe.medications.length > 2 && (
                  <p className="text-[10px] text-slate-400 text-center italic">
                    ... y {recipe.medications.length - 2} más
                  </p>
                )}
              </div>

              {/* Botón Ver Receta - Captura posición */}
              <div className="mt-3 flex justify-end">
                <button
                  onClick={(e) => handleOpenDetail(recipe, e)}
                  className="text-rose-600 dark:text-rose-400 hover:text-rose-800 font-bold text-sm flex items-center gap-1 transition-colors"
                >
                  Ver Receta <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Modal Ver Detalle */}
      <RecipeDetailModal
        isOpen={!!recipeToView}
        onClose={() => setRecipeToView(null)}
        recipe={recipeToView}
        triggerRect={triggerRect}
      />

      {/* Modal Editar */}
      {recipeToEdit && (
        <EditRecipeModal
          isOpen={true}
          onClose={() => setRecipeToEdit(null)}
          recipe={recipeToEdit}
        />
      )}

      {/* Modal Eliminar */}
      <ConfirmationModal
        isOpen={!!recipeToDelete}
        onClose={() => setRecipeToDelete(null)}
        onConfirm={() => recipeToDelete?.id && removeRecipe(recipeToDelete.id)}
        variant="danger"
        title="Eliminar Receta"
        message="¿Estás seguro de eliminar esta receta?"
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </TimelineLayout>
  );
}