// src/components/owners/EditOwnerModal.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save } from "lucide-react";
import OwnerForm, { type OwnerFormInputs } from "./OwnerForm";
import { updateOwners } from "@/api/OwnerAPI";
import { toast } from "@/components/Toast";
import type { Owner, OwnerFormData } from "@/types/owner";

interface EditOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: Owner;
}

// Función para parsear el contact en countryCode y phone
function parseContact(contact: string): { countryCode: string; phone: string } {
  if (!contact) {
    return { countryCode: "+58", phone: "" };
  }

  // Lista de códigos de país ordenados por longitud (más largos primero)
  const countryCodes = [
    "+593", "+591", "+595", "+598", "+809", "+506", "+507", "+502", "+503", "+504", "+505",
    "+58", "+52", "+34", "+57", "+54", "+56", "+51", "+55",
    "+1"
  ];

  for (const code of countryCodes) {
    if (contact.startsWith(code)) {
      return {
        countryCode: code,
        phone: contact.slice(code.length),
      };
    }
  }

  // Si no encuentra código, asumir Venezuela y el contact es solo el número
  return {
    countryCode: "+58",
    phone: contact.replace(/^\+/, ""),
  };
}

export default function EditOwnerModal({ isOpen, onClose, owner }: EditOwnerModalProps) {
  const queryClient = useQueryClient();
  
  // Parsear el contact existente
  const { countryCode, phone } = parseContact(owner.contact);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<OwnerFormInputs>({
    defaultValues: {
      name: owner.name,
      countryCode,
      phone,
      email: owner.email || "",
      address: owner.address || "",
      nationalId: owner.nationalId || "",
    },
  });

  // Reset form cuando cambia el owner o se abre el modal
 useEffect(() => {
    if (isOpen && owner) {
      const { countryCode, phone } = parseContact(owner.contact);
      reset({
        name: owner.name,
        countryCode,
        phone,
        email: owner.email || "",
        address: owner.address || "",
        nationalId: owner.nationalId || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, owner._id, reset]); 

  const { mutate, isPending } = useMutation({
    mutationFn: updateOwners,
    onSuccess: (data) => {
      toast.success(
        "¡Actualizado!",
        data.msg || "Propietario actualizado correctamente"
      );
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      queryClient.invalidateQueries({ queryKey: ["owner", owner._id] });
      onClose();
    },
    onError: (error: Error) => {
      toast.error("Error", error.message);
    },
  });

  const handleForm = (formData: OwnerFormInputs) => {
    const ownerData: OwnerFormData = {
      name: formData.name,
      contact: `${formData.countryCode}${formData.phone}`,
      email: formData.email || null,
      address: formData.address || null,
      nationalId: formData.nationalId || null,
    };

    mutate({ formData: ownerData, ownerId: owner._id });
  };

  const handleClose = () => {
    if (!isPending) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="
            w-full max-w-lg 
            bg-white dark:bg-dark-100 
            border border-surface-200 dark:border-slate-800
            rounded-xl shadow-2xl
            max-h-[90vh] overflow-hidden
            flex flex-col
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Editar Propietario
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Actualiza la información de {owner.name}
              </p>
            </div>
            
            <button
              onClick={handleClose}
              disabled={isPending}
              className="
                p-2 rounded-lg 
                text-slate-400 hover:text-slate-600 
                hover:bg-slate-100 dark:hover:bg-dark-200
                transition-colors
                disabled:opacity-50 disabled:pointer-events-none
              "
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleForm)} noValidate className="flex flex-col flex-1 overflow-hidden">
            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <OwnerForm register={register} errors={errors} />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="btn-secondary"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isPending || !isDirty}
                className="btn-primary"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}