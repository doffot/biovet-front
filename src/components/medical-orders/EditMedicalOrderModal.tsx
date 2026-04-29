// src/components/medical-orders/EditMedicalOrderModal.tsx

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save, Loader2, ClipboardList } from "lucide-react";
import { toast } from "@/components/Toast";
import { updateMedicalOrder } from "@/api/medicalOrderAPI";
import MedicalOrderForm from "./MedicalOrderForm";
import type { MedicalOrder, MedicalOrderFormData } from "@/types/medicalOrder";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  medicalOrder: MedicalOrder;
}

export default function EditMedicalOrderModal({ isOpen, onClose, medicalOrder }: Props) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
    reset,
  } = useForm<MedicalOrderFormData>({
    defaultValues: {
      issueDate: new Date().toISOString().split("T")[0],
      hematology: [],
      coprology: [],
      urinalysis: [],
      cytology: [],
      hormonal: [],
      skin: [],
      chemistry: [],
      cultures: [],
      antigenicTests: [],
      specialExams: "",
      observations: "",
    },
  });

  useEffect(() => {
    if (isOpen && medicalOrder) {
      try {
        const safeDate = medicalOrder.issueDate
          ? new Date(medicalOrder.issueDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

        const safeArray = (val: unknown): string[] =>
          Array.isArray(val) ? val.filter((item) => typeof item === "string") : [];

        reset({
          issueDate: safeDate,
          hematology: safeArray(medicalOrder.hematology),
          coprology: safeArray(medicalOrder.coprology),
          urinalysis: safeArray(medicalOrder.urinalysis),
          cytology: safeArray(medicalOrder.cytology),
          hormonal: safeArray(medicalOrder.hormonal),
          skin: safeArray(medicalOrder.skin),
          chemistry: safeArray(medicalOrder.chemistry),
          cultures: safeArray(medicalOrder.cultures),
          antigenicTests: safeArray(medicalOrder.antigenicTests),
          specialExams: medicalOrder.specialExams || "",
          observations: medicalOrder.observations || "",
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
    const hasSelections = [
      data.hematology,
      data.coprology,
      data.urinalysis,
      data.cytology,
      data.hormonal,
      data.skin,
      data.chemistry,
      data.cultures,
      data.antigenicTests,
    ].some((arr) => Array.isArray(arr) && arr.length > 0);

    if (!hasSelections && !data.specialExams?.trim()) {
      toast.error(
        "Formulario incompleto",
        "Debe seleccionar al menos un examen o escribir uno especial."
      );
      return;
    }

    mutate(data);
  };

  if (!isOpen || !medicalOrder) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dark-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-surface-200 dark:border-dark-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-dark-100 bg-cyan-50 dark:bg-dark-300 shrink-0">
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
        <div className="flex-1 overflow-y-auto p-6 bg-surface-50 dark:bg-dark-300">
          <form id="edit-medical-order-form" onSubmit={handleSubmit(onSubmit)}>
            <MedicalOrderForm
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              control={control}
            />
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-200 dark:border-dark-100 bg-white dark:bg-dark-200 flex justify-end gap-3 shrink-0">
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