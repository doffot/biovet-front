import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save, Loader2, Pill } from "lucide-react";
import { toast } from "@/components/Toast";
import { updateTreatment } from "@/api/treatmentAPI";
import TreatmentForm from "./TreatmentForm";
import type { Treatment, TreatmentFormData } from "@/types/treatment";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  treatment: Treatment;
}

export default function EditTreatmentModal({ isOpen, onClose, treatment }: Props) {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<TreatmentFormData>();

  // Cargar datos limpios y formateados al abrir
  useEffect(() => {
    if (isOpen && treatment) {
      setValue("productName", treatment.productName);
      setValue("treatmentType", treatment.treatmentType);
      setValue("treatmentTypeOther", treatment.treatmentTypeOther || "");
      setValue("route", treatment.route);
      setValue("routeOther", treatment.routeOther || "");
      setValue("dose", treatment.dose);
      setValue("frequency", treatment.frequency);
      setValue("duration", treatment.duration);
      setValue("cost", treatment.cost);
      
      // Formato de fecha para input date (YYYY-MM-DD)
      setValue("startDate", treatment.startDate.split("T")[0]);
      setValue("endDate", treatment.endDate ? treatment.endDate.split("T")[0] : "");
      
      setValue("status", treatment.status);
      setValue("observations", treatment.observations || "");
    }
  }, [isOpen, treatment, setValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TreatmentFormData) => updateTreatment(treatment._id, data),
    onSuccess: () => {
      toast.success("Tratamiento actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["treatments", treatment.patientId] });
      onClose();
    },
    onError: (error: Error) => {
      toast.error("Error al actualizar", error.message);
    },
  });

  const onSubmit = (data: TreatmentFormData) => {
    // Limpieza de campos condicionales antes de enviar
    if (data.treatmentType !== "Otro") {
      delete data.treatmentTypeOther;
    }
    if (data.route !== "Otro") {
      delete data.routeOther;
    }
    mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white dark:bg-dark-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-surface-200 dark:border-dark-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-dark-100 bg-cyan-50 dark:bg-dark-300">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Pill className="text-cyan-500" size={20} /> 
            Editar Tratamiento
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
          <form id="edit-treatment-form" onSubmit={handleSubmit(onSubmit)}>
            <TreatmentForm register={register} errors={errors} watch={watch} />
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
            form="edit-treatment-form" 
            type="submit" 
            disabled={isPending} 
            className="btn-primary bg-cyan-500 hover:bg-cyan-600 border-cyan-600 px-6 shadow-lg shadow-cyan-500/20"
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