// src/components/medicalOrders/EditMedicalOrderModal.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save, Loader2, ClipboardList } from "lucide-react";
import { toast } from "@/components/Toast";
import { updateMedicalOrder } from "@/api/medicalOrderAPI";
import MedicalOrderForm from "./MedicalOrderForm";
import type { MedicalOrder, MedicalOrderFormData, StudyType, StudyPriority } from "@/types/medicalOrder";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  medicalOrder: MedicalOrder;
}

export default function EditMedicalOrderModal({ isOpen, onClose, medicalOrder }: Props) {
  const queryClient = useQueryClient();

  // 1. Inicializar formulario con valores por defecto seguros
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<MedicalOrderFormData>({
    defaultValues: {
      issueDate: new Date().toISOString().split("T")[0],
      studies: [],
      clinicalHistory: "",
    },
  });

  // 2. Cargar datos de forma SEGURA
  useEffect(() => {
    if (isOpen && medicalOrder) {
      try {
        // Preparamos los datos con validaciones para que no explote
        const safeDate = medicalOrder.issueDate
          ? new Date(medicalOrder.issueDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

        // Validar tipos de estudio
        const validStudyTypes: StudyType[] = [
          "ecografia",
          "radiografia",
          "laboratorio",
          "tomografia",
          "electrocardiograma",
          "endoscopia",
          "citologia",
          "biopsia",
          "otro",
        ];

        const validPriorities: StudyPriority[] = ["normal", "urgente"];

        // Mapeamos manualmente para asegurar que studies sea un array válido
        const safeStudies = Array.isArray(medicalOrder.studies)
          ? medicalOrder.studies.map((s) => ({
              type: validStudyTypes.includes(s.type as StudyType)
                ? (s.type as StudyType)
                : "otro",
              name: s.name || "",
              region: s.region || "",
              reason: s.reason || "",
              priority: validPriorities.includes(s.priority as StudyPriority)
                ? (s.priority as StudyPriority)
                : "normal",
              instructions: s.instructions || "",
            }))
          : [];

        reset({
          issueDate: safeDate,
          studies: safeStudies,
          clinicalHistory: medicalOrder.clinicalHistory || "",
        });
      } catch (error) {
        console.error("Error cargando datos en el modal:", error);
        toast.error("Error", "No se pudieron cargar los datos para editar.");
      }
    }
  }, [isOpen, medicalOrder, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Partial<MedicalOrderFormData>) =>
      updateMedicalOrder({ formData: data, orderId: medicalOrder._id! }),
    onSuccess: () => {
      toast.success("Orden Actualizada", "Los cambios se guardaron correctamente.");

      // Invalidar queries de forma inteligente (chequeando si patientId es objeto o string)
      const patientId =
        typeof medicalOrder.patientId === "object" && medicalOrder.patientId !== null
          ? medicalOrder.patientId._id
          : (medicalOrder.patientId as string);

      if (patientId) {
        queryClient.invalidateQueries({ queryKey: ["medicalOrders", patientId] });
      }
      queryClient.invalidateQueries({ queryKey: ["medicalOrder", medicalOrder._id] });

      onClose();
    },
    onError: (e: Error) => {
      toast.error("Error al actualizar", e.message);
    },
  });

  const onSubmit = (data: MedicalOrderFormData) => {
    mutate(data);
  };

  // Renderizado de seguridad
  if (!isOpen) return null;
  if (!medicalOrder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="bg-white dark:bg-dark-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-surface-200 dark:border-dark-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-dark-100 bg-cyan-50 dark:bg-dark-300">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ClipboardList className="text-cyan-600" size={20} />
            Editar Orden Médica
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
          <form id="edit-medical-order-form" onSubmit={handleSubmit(onSubmit)}>
            <MedicalOrderForm register={register} errors={errors} control={control} />
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-200 dark:border-dark-100 bg-white dark:bg-dark-200 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary px-4">
            Cancelar
          </button>
          <button
            form="edit-medical-order-form"
            type="submit"
            disabled={isPending}
            className="btn-primary bg-cyan-600 hover:bg-cyan-700 border-cyan-700 px-6 shadow-lg shadow-cyan-500/20"
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