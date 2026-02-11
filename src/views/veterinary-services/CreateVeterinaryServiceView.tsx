import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2, X, BriefcaseMedical } from "lucide-react";
import { createVeterinaryService } from "@/api/veterinaryServiceAPI";
import type { VeterinaryServiceFormData } from "@/types/veterinaryService";
import { toast } from "@/components/Toast";
import VeterinaryServiceForm from "@/components/veterinary-services/VeterinaryServiceForm";

export default function CreateVeterinaryServiceView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isClosing, setIsClosing] = useState(false);

  const { register, handleSubmit, formState: { errors }, control, watch } = useForm<VeterinaryServiceFormData>({
    defaultValues: {
      serviceDate: new Date().toISOString().split('T')[0],
      veterinarianFee: 0,
      discount: 0,
      products: [],
    }
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => navigate(-1), 300);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VeterinaryServiceFormData) => createVeterinaryService(patientId!, data),
    onSuccess: () => {
      // ✅ TOAST PROFESIONAL
      toast.success(
        "Servicio Registrado",
        "El servicio veterinario ha sido creado y agregado al historial del paciente."
      );
      
      queryClient.invalidateQueries({ queryKey: ["services", patientId] }); // Asumiendo que esta es la key del listview
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      
      handleClose();
    },
    onError: (e: any) => {
      toast.error(
        "Error al Registrar",
        e.message || "No se pudo completar el registro del servicio."
      );
    },
  });

  const onSubmit = (data: VeterinaryServiceFormData) => {
    mutate(data);
  };

  return (
    <>
      <div 
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`} 
        onClick={handleClose} 
      />

      <div 
        className={`fixed inset-0 z-50 bg-white dark:bg-dark-200 flex flex-col transform transition-transform duration-300 ease-out ${isClosing ? "translate-x-full" : "translate-x-0"}`}
      >
        {/* HEADER */}
        <header className="shrink-0 bg-linear-to-r from-biovet-500 to-biovet-600 text-white px-4 sm:px-6 py-4 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handleClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold font-heading flex items-center gap-2">
                  <BriefcaseMedical className="w-5 h-5" /> Nuevo Servicio
                </h1>
                <p className="text-biovet-100 text-xs font-medium">Registrar procedimiento clínico</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto bg-surface-50 dark:bg-dark-300 p-4 sm:p-6 pb-40 sm:pb-32">
          <div className="max-w-4xl mx-auto">
            <form id="service-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-dark-100">
                <VeterinaryServiceForm 
                  register={register} 
                  errors={errors} 
                  control={control} 
                  watch={watch} 
                />
              </div>
            </form>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="shrink-0 fixed bottom-0 left-0 right-0 sm:relative bg-white dark:bg-dark-200 border-t border-surface-200 dark:border-dark-100 px-6 py-4 z-10 mb-16 sm:mb-0">
          <div className="max-w-4xl mx-auto flex justify-end gap-3">
            <button 
              type="button" 
              onClick={handleClose} 
              className="btn-secondary px-6"
            >
              Cancelar
            </button>
            <button 
              form="service-form" 
              type="submit" 
              disabled={isPending} 
              className="btn-primary bg-biovet-500 hover:bg-biovet-600 border-biovet-600 px-8 shadow-lg shadow-biovet-500/20"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar Servicio
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}