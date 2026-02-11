import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  PlusCircle,
  Calendar,
  Trash2,
  Pencil,
  Loader2,
  ChevronRight,
  Pill,
} from "lucide-react";
import { getRecipesByPatient, deleteRecipe } from "@/api/recipeAPI";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import type { Recipe } from "@/types/recipe";
import EditRecipeModal from "@/components/recipes/EditRecipeModal";

export default function RecipeListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();

  const [recipeToDelete, setRecipeToDelete] = useState<{ id: string } | null>(null);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ["recipes", patientId],
    queryFn: () => getRecipesByPatient(patientId!),
    enabled: !!patientId,
  });

  const { mutate: removeRecipe, isPending: isDeleting } = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      toast.success("Receta Eliminada", "El registro ha sido removido correctamente.");
      queryClient.invalidateQueries({ queryKey: ["recipes", patientId] });
      setRecipeToDelete(null);
    },
    onError: (error: Error) => toast.error("Error al eliminar", error.message),
  });

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));

  const sortedRecipes = [...recipes].sort(
    (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
  );

  if (isLoading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-biovet-500 w-8 h-8" /></div>;

  return (
    <>
      <div className="flex flex-col bg-surface-50 dark:bg-dark-300 min-h-screen lg:min-h-0 lg:h-[calc(100vh-14rem)] lg:rounded-2xl lg:border lg:border-surface-200 lg:dark:border-dark-100 lg:overflow-hidden">
        
        {/* Header */}
        <div className="sticky top-0 lg:static z-40 bg-rose-50 dark:bg-dark-200 border-b border-surface-200 dark:border-dark-100 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-heading text-slate-800 dark:text-white">Recetas Médicas</h1>
              {recipes.length > 0 && <span className="badge badge-neutral">{recipes.length}</span>}
            </div>
            <Link to="create" className="btn-primary bg-rose-500 hover:bg-rose-600 border-rose-600 shadow-lg active:scale-95 transition-transform xs:rounded-full w-10 h-10 lg:w-auto lg:h-auto p-0 lg:px-4 lg:py-2.5 flex items-center justify-center gap-2">
              <PlusCircle size={20} />
              <span className="hidden lg:inline font-semibold">Nueva Receta</span>
            </Link>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-4 pb-24">
          <div className="max-w-4xl mx-auto relative pl-4 lg:pl-0">
            {sortedRecipes.length > 0 && <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-dark-100 z-0" />}

            <div className="space-y-6 relative">
              {sortedRecipes.length === 0 ? (
                <div className="text-center py-20 ml-10 border-2 border-dashed border-slate-200 dark:border-dark-100 rounded-2xl">
                  <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3 opacity-50" />
                  <p className="text-slate-400 dark:text-slate-500 font-medium mb-1">Sin recetas registradas</p>
                  <p className="text-xs text-slate-300 dark:text-slate-600">Crea la primera prescripción médica</p>
                </div>
              ) : (
                sortedRecipes.map((recipe) => (
                  <div key={recipe._id} className="relative flex items-start gap-5 group">
                    <div className="shrink-0 relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-surface-50 dark:border-dark-300 shadow-sm bg-white dark:bg-dark-200 text-rose-500">
                      <Pill size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="bg-white dark:bg-dark-200 p-5 rounded-2xl rounded-tl-sm shadow-sm border border-surface-200 dark:border-dark-100 hover:shadow-md transition-all duration-200 relative">
                        
                        <div className="absolute top-4 right-4 flex gap-1.5">
                          <button onClick={() => setRecipeToEdit(recipe)} className="p-1.5 rounded-lg text-slate-400 hover:text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-900/30 transition-colors" title="Editar">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setRecipeToDelete({ id: recipe._id })} className="p-1.5 rounded-lg text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/30 transition-colors" title="Eliminar">
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="mb-3 pr-20">
                          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
                            <Calendar size={14} />
                            <span className="text-sm font-bold uppercase tracking-wider">{formatDate(recipe.issueDate)}</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-700 dark:text-white leading-tight">Receta Médica</h3>
                          <p className="text-xs text-slate-500 mt-1">{recipe.medications.length} medicamento(s)</p>
                        </div>

                        {/* Preview Medicamentos (Max 2) */}
                        <div className="space-y-2 mb-3">
                          {recipe.medications.slice(0, 2).map((med, idx) => (
                            <div key={idx} className="bg-surface-50 dark:bg-dark-300/50 p-2 rounded-lg border border-surface-200 dark:border-dark-100 flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[60%]">{med.name}</span>
                              <span className="text-slate-500 truncate">{med.instructions.substring(0, 30)}...</span>
                            </div>
                          ))}
                          {recipe.medications.length > 2 && (
                            <p className="text-[10px] text-slate-400 text-center italic">... y {recipe.medications.length - 2} más</p>
                          )}
                        </div>

                        <div className="flex items-center justify-end pt-3 border-t border-dashed border-surface-100 dark:border-dark-100">
                          <Link to={`${recipe._id}`} className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-bold text-sm flex items-center gap-1 transition-colors">
                            Ver Receta <ChevronRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

     {/* Modal Editar */}
{recipeToEdit && (
  <EditRecipeModal
    isOpen={true} // Simplificado
    onClose={() => setRecipeToEdit(null)}
    recipe={recipeToEdit}
  />
)}

      <ConfirmationModal
        isOpen={!!recipeToDelete}
        onClose={() => setRecipeToDelete(null)}
        onConfirm={() => recipeToDelete?.id && removeRecipe(recipeToDelete.id)}
        variant="danger"
        title="Eliminar Receta"
        message="¿Estás seguro de eliminar esta receta? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </>
  );
}