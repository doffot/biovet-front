import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importar useNavigate
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  PlusCircle,
  Pencil,
  Trash2,
  Loader2,
  DollarSign,
  Globe,
  CheckCircle2,
  ArrowLeft // Importar ArrowLeft
} from "lucide-react";
import { getPaymentMethods, deletePaymentMethod } from "@/api/paymentAPI";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import EditPaymentMethodModal from "@/components/payment-methods/EditPaymentMethodModal";
import type { PaymentMethod } from "@/types/payment";

export default function PaymentMethodsListView() {
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // Hook de navegación
  const [methodToEdit, setMethodToEdit] = useState<PaymentMethod | null>(null);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);

  const { data: methods = [], isLoading } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: getPaymentMethods,
  });

  const { mutate: removeMethod, isPending: isDeleting } = useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      toast.success("Método Eliminado", "El método de pago ha sido desactivado/eliminado.");
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      setMethodToDelete(null);
    },
    onError: (error: Error) => toast.error("Error", error.message),
  });

  if (isLoading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-biovet-500 w-8 h-8" /></div>;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      
      {/* HEADER CON FLECHA DE REGRESO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white dark:bg-dark-200 border border-surface-200 dark:border-dark-100 text-slate-500 hover:text-biovet-600 hover:border-biovet-200 transition-all shadow-sm"
            title="Volver"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold font-heading text-slate-800 dark:text-white flex items-center gap-2">
              <CreditCard className="text-emerald-500" /> Métodos de Pago
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">Configura las opciones de cobro</p>
          </div>
        </div>

        <Link 
          to="create" 
          className="btn-primary bg-emerald-500 hover:bg-emerald-600 border-emerald-600 shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <PlusCircle size={20} /> Agregar
        </Link>
      </div>

      {/* Grid de Tarjetas */}
      {methods.length === 0 ? (
        <div className="text-center py-20 bg-surface-50 dark:bg-dark-200 rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-100">
          <CreditCard className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">Sin métodos configurados</h3>
          <p className="text-slate-400 dark:text-slate-500 mb-6">Agrega Zelle, Pago Móvil, Efectivo, etc.</p>
          <Link to="create" className="btn-secondary">Comenzar</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((method) => (
            <div key={method._id} className="bg-white dark:bg-dark-200 p-5 rounded-2xl border border-surface-200 dark:border-dark-100 hover:shadow-lg transition-all group relative overflow-hidden">
              
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${
                    method.currency === 'USD' 
                      ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                      : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                  }`}>
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">{method.name}</h3>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-surface-100 dark:bg-dark-100 px-2 py-0.5 rounded mt-1 inline-block">
                      {method.currency}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button onClick={() => setMethodToEdit(method)} className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setMethodToDelete(method)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Globe size={16} className="text-slate-400" />
                  <span>{method.paymentMode}</span>
                </div>
                
                {method.requiresReference && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 size={16} />
                    <span>Requiere Referencia</span>
                  </div>
                )}

                {method.description && (
                  <div className="bg-surface-50 dark:bg-dark-100 p-3 rounded-xl border border-surface-200 dark:border-dark-50 mt-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                      "{method.description}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modales (Sin cambios, Editar conserva la X) */}
      {methodToEdit && <EditPaymentMethodModal isOpen={!!methodToEdit} onClose={() => setMethodToEdit(null)} method={methodToEdit} />}
      <ConfirmationModal isOpen={!!methodToDelete} onClose={() => setMethodToDelete(null)} onConfirm={() => methodToDelete?._id && removeMethod(methodToDelete._id)} variant="danger" title="Eliminar Método" message={<span>¿Eliminar <strong>{methodToDelete?.name}</strong>?</span>} confirmText="Eliminar" isLoading={isDeleting} />
    </div>
  );
}