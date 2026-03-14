import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2, X, FileText} from "lucide-react";
import { createRecipe } from "@/api/recipeAPI";
import type { RecipeFormData } from "@/types/recipe";
import { toast } from "@/components/Toast";
import RecipeForm from "@/components/recipes/RecipeForm";

export default function CreateRecipeView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isClosing, setIsClosing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const { register, handleSubmit, formState: { errors }, control } = useForm<RecipeFormData>({
    defaultValues: {
      issueDate: new Date().toISOString().split('T')[0],
      medications: [{ name: "", presentation: "", source: "farmacia", instructions: "", quantity: "" }],
    }
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => navigate(-1), 300);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data: RecipeFormData) => createRecipe(patientId!, data),
    onSuccess: () => {
      toast.success("Receta Creada", "La receta médica se ha registrado correctamente.");
      queryClient.invalidateQueries({ queryKey: ["recipes", patientId] });
      handleClose();
    },
    onError: (e: any) => toast.error("Error al crear", e.message),
  });

  const onSubmit = (data: RecipeFormData) => mutate(data);

  // Función para disparar el submit manualmente
  const triggerSubmit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <div className={`fixed inset-0 z-100 flex flex-col transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Container */}
      <div className={`relative z-10 flex flex-col h-full bg-white dark:bg-dark-200 transform transition-transform duration-300 ease-out ${isClosing ? "translate-x-full" : "translate-x-0"}`}>
        
        {/* Header */}
        <header className="shrink-0 bg-linear-to-r from-rose-500 to-rose-600 text-white px-4 sm:px-6 py-4 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button type="button" onClick={handleClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold font-heading flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Nueva Receta
                </h1>
                <p className="text-rose-100 text-xs font-medium">Prescripción de medicamentos</p>
              </div>
            </div>

            {/* Botón Guardar en Header - Solo Mobile */}
            <button
              type="button"
              onClick={triggerSubmit}
              disabled={isPending}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Guardar</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-surface-50 dark:bg-dark-300 p-4 sm:p-6">
          <div className="max-w-4xl mx-auto pb-6">
            <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-dark-100">
                <RecipeForm register={register} errors={errors} control={control} />
              </div>
            </form>
          </div>
        </main>

        {/* Footer - Solo Desktop */}
        <footer className="shrink-0 hidden lg:block bg-white dark:bg-dark-200 border-t border-surface-200 dark:border-dark-100 px-6 py-4">
          <div className="max-w-4xl mx-auto flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="btn-secondary px-6">
              Cancelar
            </button>
            <button 
              type="button"
              onClick={triggerSubmit}
              disabled={isPending} 
              className="btn-primary bg-rose-500 hover:bg-rose-600 border-rose-600 px-8 shadow-lg shadow-rose-500/20"
            >
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar Receta
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}