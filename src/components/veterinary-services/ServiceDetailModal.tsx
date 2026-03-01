// src/components/services/ServiceDetailModal.tsx

import { 
  BriefcaseMedical, 
  DollarSign, 
  FileText, 
  Box,
  StickyNote,
} from "lucide-react";
import DetailModal from "@/components/ui/DetailModal";
import type { VeterinaryService } from "@/types/veterinaryService";

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: VeterinaryService | null;
  triggerRect?: DOMRect | null;
}

export default function ServiceDetailModal({
  isOpen,
  onClose,
  service,
  triggerRect,
}: ServiceDetailModalProps) {
  if (!service) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={service.serviceName}
      subtitle={formatDate(service.serviceDate)}
      icon={<BriefcaseMedical size={24} />}
      headerColor="indigo"
      triggerRect={triggerRect}
      footer={
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white dark:bg-dark-100 border border-surface-200 dark:border-dark-50 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors active:scale-[0.98]"
        >
          Cerrar
        </button>
      }
    >
      {/* Descripción */}
      {service.description && (
        <div className="bg-surface-50 dark:bg-dark-100 p-4 rounded-2xl border border-surface-200 dark:border-dark-50">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <FileText size={12} /> Descripción
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {service.description}
          </p>
        </div>
      )}

      {/* Tabla de Insumos */}
      {service.products.length > 0 && (
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Box size={12} /> Insumos / Productos ({service.products.length})
          </h3>
          <div className="border border-surface-200 dark:border-dark-50 rounded-2xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-50 dark:bg-dark-100 text-slate-500 dark:text-slate-400 border-b border-surface-200 dark:border-dark-50">
                <tr>
                  <th className="px-4 py-2.5 font-bold text-[10px] uppercase tracking-wider">Producto</th>
                  <th className="px-4 py-2.5 font-bold text-[10px] uppercase tracking-wider text-center">Cant.</th>
                  <th className="px-4 py-2.5 font-bold text-[10px] uppercase tracking-wider text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-dark-50">
                {service.products.map((prod, idx) => (
                  <tr key={prod._id || idx} className="hover:bg-surface-50/50 dark:hover:bg-dark-100/50">
                    <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200 font-medium">
                      {prod.productName}
                    </td>
                    <td className="px-4 py-2.5 text-center text-slate-500 dark:text-slate-400">
                      {prod.quantity}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-700 dark:text-slate-200">
                      ${prod.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Desglose Financiero */}
      <div className="bg-success-50 dark:bg-success-950/20 p-4 rounded-2xl border border-success-200 dark:border-success-800">
        <h3 className="text-[10px] font-black text-success-600 dark:text-success-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <DollarSign size={12} /> Detalle Financiero
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Insumos</span>
            <span className="font-medium">${service.productsTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Honorarios</span>
            <span className="font-medium">${service.veterinarianFee.toFixed(2)}</span>
          </div>
          {service.discount > 0 && (
            <div className="flex justify-between text-success-600 dark:text-success-400">
              <span>Descuento</span>
              <span className="font-bold">-${service.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-black text-slate-800 dark:text-white pt-3 border-t border-success-200 dark:border-success-700">
            <span>Total</span>
            <span className="font-heading">${service.totalCost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notas */}
      {service.notes && (
        <div className="bg-warning-50 dark:bg-warning-950/20 p-4 rounded-2xl border border-warning-200 dark:border-warning-800 flex gap-3 items-start">
          <StickyNote size={16} className="text-warning-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-black text-warning-600 dark:text-warning-400 uppercase tracking-widest mb-1">
              Notas
            </p>
            <p className="text-sm text-warning-800 dark:text-warning-200 italic leading-relaxed">
              "{service.notes}"
            </p>
          </div>
        </div>
      )}
    </DetailModal>
  );
}