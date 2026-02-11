import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Save, Loader2, Scissors } from "lucide-react";
import { toast } from "@/components/Toast";
import { updateGroomingService } from "@/api/groomingAPI";
import { getStaffList } from "@/api/staffAPI";
import GroomingServiceForm from "./groomingForm";
import type { GroomingService, GroomingServiceFormData } from "@/types/grooming";

interface EditGroomingServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: GroomingService;
}

export default function EditGroomingServiceModal({
  isOpen,
  onClose,
  service,
}: EditGroomingServiceModalProps) {
  const queryClient = useQueryClient();

  const { data: groomers = [], isLoading: isLoadingGroomers } = useQuery({
    queryKey: ["staff"],
    queryFn: getStaffList,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GroomingServiceFormData>({
    defaultValues: {
      date: service.date
        ? new Date(service.date).toISOString().split("T")[0]
        : "",
      service: service.service as any, // Cast necesario si el enum es estricto
      specifications: service.specifications,
      observations: service.observations || "",
      cost: service.cost,
      // Extraer ID si es objeto, o usar string directo
      groomer:
        typeof service.groomer === "object" && service.groomer !== null
          ? service.groomer._id
          : (service.groomer as string) || "",
    },
  });

  useEffect(() => {
    if (isOpen && service) {
      reset({
        date: service.date
          ? new Date(service.date).toISOString().split("T")[0]
          : "",
        service: service.service as any,
        specifications: service.specifications,
        observations: service.observations || "",
        cost: service.cost,
        groomer:
          typeof service.groomer === "object" && service.groomer !== null
            ? service.groomer._id
            : (service.groomer as string) || "",
      });
    }
  }, [isOpen, service, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Partial<GroomingServiceFormData>) =>
      updateGroomingService({
        formData: data,
        groomingId: service._id!, // Usar el ID del servicio
      }),
    onSuccess: () => {
      toast.success("Servicio actualizado");
      queryClient.invalidateQueries({ queryKey: ["groomingServices"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message || "Error al actualizar"),
  });

  const onSubmit = (data: GroomingServiceFormData) => {
    mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-dark-100 bg-pink-50 dark:bg-dark-300">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Scissors className="text-pink-500" size={20} />
            Editar Servicio
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-50 dark:bg-dark-300 custom-scrollbar">
          {isLoadingGroomers ? (
            <div className="flex justify-center p-10">
              <Loader2 className="animate-spin text-pink-500" />
            </div>
          ) : (
            <form id="edit-grooming-form" onSubmit={handleSubmit(onSubmit)}>
              <GroomingServiceForm
                register={register}
                errors={errors}
                groomers={groomers}
              />
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-200 dark:border-dark-100 bg-white dark:bg-dark-200 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary px-4">
            Cancelar
          </button>
          <button
            form="edit-grooming-form"
            type="submit"
            disabled={isPending}
            className="btn-primary bg-pink-500 hover:bg-pink-600 border-pink-600 px-6 shadow-lg shadow-pink-500/20"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}