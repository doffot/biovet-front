import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2, ArrowLeft, CreditCard } from "lucide-react"; // Importar ArrowLeft
import { createPaymentMethod } from "@/api/paymentAPI";
import type { PaymentMethodFormData } from "@/types/payment";
import { toast } from "@/components/Toast";
import PaymentMethodForm from "@/components/payment/PaymentMethodForm";

export default function CreatePaymentMethodView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isClosing, setIsClosing] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<PaymentMethodFormData>({
    defaultValues: {
      currency: "USD",
      paymentMode: "Transferencia",
      requiresReference: true,
    }
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => navigate(-1), 300);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: createPaymentMethod,
    onSuccess: () => {
      toast.success("Método Creado", "El nuevo método de pago está listo para usarse.");
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      handleClose();
    },
    onError: (e: any) => toast.error("Error", e.message || "Error al crear"),
  });

  const onSubmit = (data: PaymentMethodFormData) => mutate(data);

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`} onClick={handleClose} />

      <div className={`fixed inset-0 z-50 bg-white dark:bg-dark-200 flex flex-col transform transition-transform duration-300 ease-out ${isClosing ? "translate-x-full" : "translate-x-0"}`}>
        
        {/* Header con FLECHA */}
        <header className="shrink-0 bg-linear-to-r from-emerald-500 to-emerald-600 text-white px-4 sm:px-6 py-4 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* ✅ CAMBIO: X por ArrowLeft */}
              <button onClick={handleClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold font-heading flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Nuevo Método de Pago
                </h1>
                <p className="text-emerald-100 text-xs font-medium">Configuración financiera</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-surface-50 dark:bg-dark-300 p-4 sm:p-6 pb-40 sm:pb-32">
          <div className="max-w-4xl mx-auto">
            <form id="payment-method-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-dark-100">
                <PaymentMethodForm register={register} errors={errors} />
              </div>
            </form>
          </div>
        </main>

        {/* Footer */}
        <footer className="shrink-0 fixed bottom-0 left-0 right-0 sm:relative bg-white dark:bg-dark-200 border-t border-surface-200 dark:border-dark-100 px-6 py-4 z-10 mb-16 sm:mb-0">
          <div className="max-w-4xl mx-auto flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="btn-secondary px-6">Cancelar</button>
            <button 
              form="payment-method-form" 
              type="submit" 
              disabled={isPending} 
              className="btn-primary bg-emerald-500 hover:bg-emerald-600 border-emerald-600 px-8 shadow-lg shadow-emerald-500/20"
            >
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar Método
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}