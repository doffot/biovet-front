import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save, Loader2, FileText } from "lucide-react";
import { toast } from "@/components/Toast";
import { updateRecipe } from "@/api/recipeAPI";
import RecipeForm from "./RecipeForm";
import type { Recipe, RecipeFormData } from "@/types/recipe";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
}

export default function EditRecipeModal({ isOpen, onClose, recipe }: Props) {
  const queryClient = useQueryClient();
  console.log('modal editar');
  // 1. Inicializar formulario con valores por defecto seguros
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    control, 
    reset 
  } = useForm<RecipeFormData>({
    defaultValues: {
      issueDate: new Date().toISOString().split('T')[0],
      medications: [],
      notes: ""
    }
  });

  // 2. Cargar datos de forma SEGURA
  useEffect(() => {
    if (isOpen && recipe) {
      try {
        // Preparamos los datos con validaciones para que no explote
        const safeDate = recipe.issueDate 
          ? new Date(recipe.issueDate).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0];

        // Mapeamos manualmente para asegurar que medications sea un array válido
        const safeMedications = Array.isArray(recipe.medications) 
          ? recipe.medications.map(m => ({
              name: m.name || "",
              presentation: m.presentation || "",
              source: (m.source === "veterinario" || m.source === "farmacia") ? m.source : "farmacia",
              instructions: m.instructions || "",
              quantity: m.quantity || ""
            }))
          : [];

        reset({
          issueDate: safeDate,
          medications: safeMedications,
          notes: recipe.notes || "",
        });
      } catch (error) {
        console.error("Error cargando datos en el modal:", error);
        toast.error("Error", "No se pudieron cargar los datos para editar.");
      }
    }
  }, [isOpen, recipe, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Partial<RecipeFormData>) => updateRecipe(recipe._id, data),
    onSuccess: () => {
      toast.success("Receta Actualizada", "Los cambios se guardaron correctamente.");
      
      // Invalidar queries de forma inteligente (chequeando si patientId es objeto o string)
      const patientId = typeof recipe.patientId === 'object' && recipe.patientId !== null 
        ? recipe.patientId._id 
        : (recipe.patientId as string);

      if (patientId) {
        queryClient.invalidateQueries({ queryKey: ["recipes", patientId] });
      }
      queryClient.invalidateQueries({ queryKey: ["recipe", recipe._id] });
      
      onClose();
    },
    onError: (e: any) => {
      toast.error("Error al actualizar", e.message);
    },
  });

  const onSubmit = (data: RecipeFormData) => {
    mutate(data);
  };

  // Renderizado de seguridad
  if (!isOpen) return null;
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white dark:bg-dark-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-surface-200 dark:border-dark-100"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-dark-100 bg-rose-50 dark:bg-dark-300">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="text-rose-500" size={20} /> 
            Editar Receta
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500 dark:text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-50 dark:bg-dark-300 custom-scrollbar">
          <form id="edit-recipe-form" onSubmit={handleSubmit(onSubmit)}>
            <RecipeForm register={register} errors={errors} control={control} />
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-200 dark:border-dark-100 bg-white dark:bg-dark-200 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose} 
            className="btn-secondary px-4"
          >
            Cancelar
          </button>
          <button 
            form="edit-recipe-form" 
            type="submit" 
            disabled={isPending} 
            className="btn-primary bg-rose-500 hover:bg-rose-600 border-rose-600 px-6 shadow-lg shadow-rose-500/20"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}