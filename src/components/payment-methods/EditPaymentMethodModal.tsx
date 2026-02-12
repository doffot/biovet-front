import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save, Loader2, CreditCard } from "lucide-react";
import { toast } from "@/components/Toast";
import { updatePaymentMethod } from "@/api/paymentAPI";
import type { PaymentMethod, PaymentMethodFormData } from "@/types/payment";
import PaymentMethodForm from "../payment/PaymentMethodForm";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  method: PaymentMethod;
}

export default function EditPaymentMethodModal({ isOpen, onClose, method }: Props) {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PaymentMethodFormData>();

  useEffect(() => {
    if (isOpen && method) {
      reset({
        name: method.name,
        currency: method.currency,
        paymentMode: method.paymentMode,
        description: method.description || "",
        requiresReference: method.requiresReference,
      });
    }
  }, [isOpen, method, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Partial<PaymentMethodFormData>) => updatePaymentMethod(method._id, data),
    onSuccess: () => {
      toast.success("Método Actualizado", "Los cambios se guardaron correctamente.");
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      onClose();
    },
    onError: (e: any) => toast.error("Error", e.message),
  });

  const onSubmit = (data: PaymentMethodFormData) => mutate(data);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="bg-white dark:bg-dark-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-surface-200 dark:border-dark-100"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-dark-100 bg-emerald-50 dark:bg-dark-300">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CreditCard className="text-emerald-500" size={20} /> 
            Editar Método
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-50 dark:bg-dark-300 custom-scrollbar">
          <form id="edit-method-form" onSubmit={handleSubmit(onSubmit)}>
            <PaymentMethodForm register={register} errors={errors} />
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-200 dark:border-dark-100 bg-white dark:bg-dark-200 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary px-4">Cancelar</button>
          <button 
            form="edit-method-form" 
            type="submit" 
            disabled={isPending} 
            className="btn-primary bg-emerald-500 hover:bg-emerald-600 border-emerald-600 px-6 shadow-lg shadow-emerald-500/20"
          >
            {isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}