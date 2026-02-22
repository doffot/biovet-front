// src/views/patients/CreateMedicalOrderView.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2, X, ClipboardList } from "lucide-react";
import { createMedicalOrder } from "@/api/medicalOrderAPI";
import type { MedicalOrderFormData } from "@/types/medicalOrder";
import { toast } from "@/components/Toast";
import MedicalOrderForm from "@/components/medical-orders/MedicalOrderForm";

export default function CreateMedicalOrderView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isClosing, setIsClosing] = useState(false);

  const { register, handleSubmit, formState: { errors }, control } = useForm<MedicalOrderFormData>({
    defaultValues: {
      issueDate: new Date().toISOString().split("T")[0],
      studies: [
        {
          type: "ecografia",
          name: "",
          region: "",
          reason: "",
          priority: "normal",
          instructions: "",
        },
      ],
      clinicalHistory: "",
    },
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => navigate(-1), 300);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data: MedicalOrderFormData) => createMedicalOrder(data, patientId!),
    onSuccess: () => {
      toast.success("Orden Creada", "La orden médica se ha registrado correctamente.");
      queryClient.invalidateQueries({ queryKey: ["medicalOrders", patientId] });
      handleClose();
    },
    onError: (e: Error) => toast.error("Error al crear", e.message),
  });

  const onSubmit = (data: MedicalOrderFormData) => mutate(data);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`fixed inset-0 z-50 bg-white dark:bg-dark-200 flex flex-col transform transition-transform duration-300 ease-out ${
          isClosing ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Header */}
        <header className="shrink-0 bg-linear-to-r from-cyan-600 to-cyan-700 text-white px-4 sm:px-6 py-4 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold font-heading flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" /> Nueva Orden Médica
                </h1>
                <p className="text-cyan-100 text-xs font-medium">
                  Solicitud de estudios diagnósticos
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-surface-50 dark:bg-dark-300 p-4 sm:p-6 pb-40 sm:pb-32">
          <div className="max-w-4xl mx-auto">
            <form id="medical-order-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-dark-100">
                <MedicalOrderForm
                  register={register}
                  errors={errors}
                  control={control}
                />
              </div>
            </form>
          </div>
        </main>

        {/* Footer */}
        <footer className="shrink-0 fixed bottom-0 left-0 right-0 sm:relative bg-white dark:bg-dark-200 border-t border-surface-200 dark:border-dark-100 px-6 py-4 z-10 mb-16 sm:mb-0">
          <div className="max-w-4xl mx-auto flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="btn-secondary px-6">
              Cancelar
            </button>
            <button
              form="medical-order-form"
              type="submit"
              disabled={isPending}
              className="btn-primary bg-cyan-600 hover:bg-cyan-700 border-cyan-700 px-8 shadow-lg shadow-cyan-500/20"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar Orden
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}