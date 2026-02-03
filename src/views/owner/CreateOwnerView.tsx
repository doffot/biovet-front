import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import OwnerForm, { type OwnerFormInputs } from "@/components/owners/OwnerForm";
import { createOwner } from "@/api/OwnerAPI";
import { toast } from "@/components/Toast";
import type { OwnerFormData } from "@/types/owner";

export default function CreateOwnerView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const initialValues: OwnerFormInputs = {
    name: "",
    countryCode: "+58",
    phone: "",
    email: "",
    address: "",
    nationalId: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OwnerFormInputs>({
    defaultValues: initialValues,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createOwner,
    onSuccess: (data) => {
      toast.success(
        "¡Creado!",
        data.msg || "Propietario registrado correctamente",
      );
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      navigate("/owners");
    },
    onError: (error: Error) => {
      toast.error("Error", error.message);
    },
  });

  const handleForm = (formData: OwnerFormInputs) => {
    // Transformar datos del formulario al formato de la API
    const ownerData: OwnerFormData = {
      name: formData.name,
      contact: `${formData.countryCode}${formData.phone}`,
      email: formData.email || null,
      address: formData.address || null,
      nationalId: formData.nationalId || null,
    };

    mutate(ownerData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-icon-neutral">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Nuevo Propietario
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Registra un nuevo cliente en el sistema
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white dark:bg-dark-100 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Información del Propietario
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Los campos marcados con <span className="text-danger-500">*</span>{" "}
            son obligatorios
          </p>
        </div>

        <form onSubmit={handleSubmit(handleForm)} noValidate>
          <div className="p-6">
            <OwnerForm register={register} errors={errors} />
          </div>

          <div className="px-6 py-4 bg-slate-50 dark:bg-dark-200 border-t border-slate-200 dark:border-slate-800 rounded-b-xl flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar Propietario
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
