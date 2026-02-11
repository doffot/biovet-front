import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2, X, Scissors } from "lucide-react";

import { createGroomingService } from "../../api/groomingAPI";
import { getStaffList } from "../../api/staffAPI";

import type { GroomingServiceFormData } from "../../types/grooming";
import { toast } from "../../components/Toast";
import GroomingServiceForm from "@/components/grooming/groomingForm";

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CreateGroomingServiceView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isClosing, setIsClosing] = useState(false);

  const { data: groomers = [], isLoading: isLoadingGroomers } = useQuery({
    queryKey: ["staff"],
    queryFn: getStaffList,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GroomingServiceFormData>({
    defaultValues: {
      date: getLocalDateString(), 
      service: undefined,
      specifications: "",
      observations: "",
      cost: undefined,
      groomer: undefined,
    },
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => navigate(-1), 300);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: GroomingServiceFormData) => {
      if (!patientId) {
        throw new Error("ID del paciente no encontrado");
      }
      if (!data.groomer) {
        throw new Error("Debes seleccionar un peluquero");
      }
      return await createGroomingService(data, patientId);
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al registrar el servicio");
    },
    onSuccess: () => {
      toast.success("Servicio registrado con éxito");
      queryClient.invalidateQueries({ queryKey: ["groomingServices", patientId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["activeAppointments"] });
      handleClose();
    },
  });

  const onSubmit = (data: GroomingServiceFormData) => {
    mutate(data);
  };

  if (isLoadingGroomers) {
    return (
      <div className="flex items-center justify-center h-screen bg-black/40">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* 1. OVERLAY OSCURO */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* 2. PANEL PRINCIPAL (Slide-in) */}
     <div
  className={`fixed inset-0 z-100 bg-white dark:bg-dark-200 flex flex-col transform transition-transform duration-300 ease-out ${
    isClosing ? "translate-x-full" : "translate-x-0"
  }`}
>
        {/* ═══ HEADER FIJO ═══ */}
        {/* Usamos gradiente rosado para distinguir Estética */}
        <header className="shrink-0 bg-linear-to-r from-pink-500 to-pink-600 text-white px-4 sm:px-6 py-4 shadow-md">
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
                  <Scissors className="w-5 h-5" />
                  Nuevo Servicio
                </h1>
                <p className="text-pink-100 text-xs font-medium">Registrar peluquería o baño</p>
              </div>
            </div>
          </div>
        </header>

        {/* ═══ CONTENIDO SCROLLABLE ═══ */}
       <main className="flex-1 overflow-y-auto bg-surface-50 dark:bg-dark-300 p-4 sm:p-6 pb-40 md:pb-32">
          <div className="max-w-4xl mx-auto">
            <form id="grooming-form" onSubmit={handleSubmit(onSubmit)}>
              
              <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-dark-100 space-y-6">
                <GroomingServiceForm 
                  register={register} 
                  errors={errors} 
                  groomers={groomers} 
                />
              </div>

            </form>
          </div>
        </main>

        {/* ═══ FOOTER FIJO ═══ */}
        <footer className="shrink-0 bg-white dark:bg-dark-200 border-t border-surface-200 dark:border-dark-100 px-6 py-4 z-10">
          <div className="max-w-4xl mx-auto flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary px-6"
            >
              Cancelar
            </button>
            <button
              form="grooming-form"
              type="submit"
              disabled={isPending}
              className="btn-primary bg-pink-500 hover:bg-pink-600 border-pink-600 px-8 shadow-lg shadow-pink-500/20"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar 
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}