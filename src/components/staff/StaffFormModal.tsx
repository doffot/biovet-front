// src/views/staff/StaffFormModal.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, User, Phone, Briefcase, Loader2 } from "lucide-react";
import { createStaff, updateStaff } from "@/api/staffAPI";
import type { Staff, StaffFormData, StaffRole } from "@/types/staff";
import { toast } from "../Toast";

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
}

interface FormValues {
  name: string;
  lastName: string;
  role: StaffRole;
  phone: string;
  active: boolean;
}

export function StaffFormModal({ isOpen, onClose, staff }: StaffFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!staff;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      lastName: "",
      role: "asistente",
      phone: "",
      active: true,
    },
  });

  // Cargar datos al editar
  useEffect(() => {
    if (staff) {
      reset({
        name: staff.name,
        lastName: staff.lastName,
        role: staff.role,
        phone: staff.phone || "",
        active: staff.active,
      });
    } else {
      reset({
        name: "",
        lastName: "",
        role: "asistente",
        phone: "",
        active: true,
      });
    }
  }, [staff, reset]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Personal agregado", "El miembro ha sido registrado correctamente");
      onClose();
    },
    onError: (error: Error) => {
      toast.error("Error al crear", error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ formData, staffId }: { formData: Partial<StaffFormData>; staffId: string }) =>
      updateStaff({ formData, staffId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Personal actualizado", "Los datos han sido guardados correctamente");
      onClose();
    },
    onError: (error: Error) => {
      toast.error("Error al actualizar", error.message);
    },
  });

  const onSubmit = (data: FormValues) => {
    const formData: StaffFormData = {
      name: data.name.trim(),
      lastName: data.lastName.trim(),
      role: data.role,
      phone: data.phone?.trim() || undefined,
      active: data.active,
    };

    if (isEditing && staff?._id) {
      updateMutation.mutate({ formData, staffId: staff._id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-dark-100 rounded-2xl shadow-2xl border border-surface-300 dark:border-slate-700 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-biovet-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-slate-800 dark:text-slate-100">
                {isEditing ? "Editar Personal" : "Agregar Personal"}
              </h2>
              <p className="text-xs text-surface-500 dark:text-slate-400">
                {isEditing ? "Modifica los datos del miembro" : "Completa la información"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-surface-400 hover:text-slate-600 hover:bg-surface-100 dark:hover:bg-dark-50 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre</label>
              <input
                type="text"
                {...register("name", {
                  required: "El nombre es obligatorio",
                  minLength: { value: 2, message: "Mínimo 2 caracteres" },
                  maxLength: { value: 50, message: "Máximo 50 caracteres" },
                })}
                className={`input ${errors.name ? "input-error" : ""}`}
                placeholder="Nombre"
              />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Apellido</label>
              <input
                type="text"
                {...register("lastName", {
                  required: "El apellido es obligatorio",
                  minLength: { value: 2, message: "Mínimo 2 caracteres" },
                  maxLength: { value: 50, message: "Máximo 50 caracteres" },
                })}
                className={`input ${errors.lastName ? "input-error" : ""}`}
                placeholder="Apellido"
              />
              {errors.lastName && <p className="error-text">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Rol */}
          <div>
            <label className="label">
              <Briefcase className="w-4 h-4 inline mr-1.5" />
              Rol
            </label>
            <select
              {...register("role", { required: "El rol es obligatorio" })}
              className={`input ${errors.role ? "input-error" : ""}`}
            >
              <option value="veterinario">Veterinario</option>
              <option value="groomer">Peluquero</option>
              <option value="asistente">Asistente</option>
              <option value="recepcionista">Recepcionista</option>
            </select>
            {errors.role && <p className="error-text">{errors.role.message}</p>}
          </div>

          {/* Teléfono */}
          <div>
            <label className="label">
              <Phone className="w-4 h-4 inline mr-1.5" />
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              {...register("phone")}
              className="input"
              placeholder="+58 412 123 4567"
            />
          </div>

          {/* Estado */}
          <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-slate-700">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Estado activo
              </p>
              <p className="text-xs text-surface-500 dark:text-slate-400">
                El personal activo puede ser asignado a servicios
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register("active")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-biovet-400 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-biovet-500" />
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditing ? "Guardando..." : "Agregando..."}
                </>
              ) : isEditing ? (
                "Guardar Cambios"
              ) : (
                "Agregar Personal"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}