import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  X, 
  Calendar, 
  DollarSign, 
  BriefcaseMedical, 
  FileText, 
  Loader2, 
  Box,
  StickyNote
} from "lucide-react";
import { getServiceById } from "@/api/veterinaryServiceAPI";

export default function VeterinaryServiceDetailView() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: () => getServiceById(serviceId!),
    enabled: !!serviceId,
  });

  const handleClose = () => navigate(-1);

  if (isLoading) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"><Loader2 className="animate-spin text-white w-10 h-10" /></div>;
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleClose}>
      <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-surface-200 dark:border-dark-100" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="bg-indigo-50 dark:bg-dark-300 p-6 border-b border-indigo-100 dark:border-dark-100 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-sm">
              <BriefcaseMedical size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-white leading-tight">{service.serviceName}</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                <Calendar size={14} />
                <span>{new Date(service.serviceDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          
          {/* Descripción */}
          {service.description && (
            <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-xl border border-surface-200 dark:border-dark-50">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                <FileText size={14} /> Descripción
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{service.description}</p>
            </div>
          )}

          {/* Tabla de Insumos */}
          {service.products.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Box size={14} /> Insumos / Productos
              </h3>
              <div className="border border-surface-200 dark:border-dark-50 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-surface-50 dark:bg-dark-100 text-slate-500 dark:text-slate-400 border-b border-surface-200 dark:border-dark-50">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Producto</th>
                      <th className="px-4 py-2 font-semibold text-center">Cant.</th>
                      <th className="px-4 py-2 font-semibold text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-dark-50">
                    {service.products.map((prod) => (
                      <tr key={prod._id} className="hover:bg-surface-50/50 dark:hover:bg-dark-100/50">
                        <td className="px-4 py-2 text-slate-700 dark:text-slate-200">{prod.productName}</td>
                        <td className="px-4 py-2 text-center text-slate-600 dark:text-slate-400">{prod.quantity}</td>
                        <td className="px-4 py-2 text-right font-medium text-slate-700 dark:text-slate-200">${prod.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Desglose Financiero */}
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
            <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <DollarSign size={14} /> Detalle Financiero
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Insumos</span>
                <span>${service.productsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Honorarios</span>
                <span>${service.veterinarianFee.toFixed(2)}</span>
              </div>
              {service.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Descuento</span>
                  <span>-${service.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-slate-800 dark:text-white pt-2 border-t border-emerald-200 dark:border-emerald-800">
                <span>Total</span>
                <span>${service.totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {service.notes && (
            <div className="flex gap-2 items-start text-sm text-slate-500 italic bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30">
              <StickyNote size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <p>"{service.notes}"</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-surface-50/50 dark:bg-dark-300/50 border-t border-surface-200 dark:border-dark-100">
          <button onClick={handleClose} className="w-full py-2.5 rounded-xl bg-white dark:bg-dark-100 border border-surface-200 dark:border-dark-50 text-slate-600 dark:text-slate-300 font-bold hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors">Cerrar Detalle</button>
        </div>
      </div>
    </div>
  );
}