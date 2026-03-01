// src/views/services/VeterinaryServiceListView.tsx

import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BriefcaseMedical,
  Trash2,
  Loader2,
  ChevronRight,
  Package,
} from "lucide-react";
import {
  getServicesByPatient,
  deleteVeterinaryService,
} from "@/api/veterinaryServiceAPI";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import TimelineLayout from "@/components/ui/TimeLineLayout";
import type { Patient } from "@/types/patient";
import type { VeterinaryService } from "@/types/veterinaryService";
import ServiceDetailModal from "@/components/veterinary-services/ServiceDetailModal";

export default function VeterinaryServiceListView() {
  const contextData = useOutletContext<any>();
  const patient: Patient = contextData.patient || contextData;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Estados para modales
  const [serviceToDelete, setServiceToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [serviceToView, setServiceToView] = useState<VeterinaryService | null>(
    null,
  );
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  // Query
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services", patient._id],
    queryFn: () => getServicesByPatient(patient._id),
    enabled: !!patient._id,
  });

  // Mutation eliminar
  const { mutate: removeService, isPending: isDeleting } = useMutation({
    mutationFn: deleteVeterinaryService,
    onSuccess: () => {
      toast.success("Eliminado", "Servicio removido correctamente");
      queryClient.invalidateQueries({ queryKey: ["services", patient._id] });
      setServiceToDelete(null);
    },
    onError: (error: Error) => toast.error("Error al eliminar", error.message),
  });

  // Handler para abrir detalle con posición
  const handleOpenDetail = (
    service: VeterinaryService,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTriggerRect(rect);
    setServiceToView(service);
  };

  // Ordenar por fecha
  const sortedServices = [...services].sort(
    (a, b) =>
      new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime(),
  );

  // Loading
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <TimelineLayout
      title="Servicios"
      subtitle={`Historial de ${patient?.name}`}
      headerIcon={BriefcaseMedical}
      count={services.length}
      countLabel="servicios"
      onAdd={() => navigate("create")}
      variant="servicios"
    >
      {sortedServices.length === 0 ? (
        <div className="ml-8 text-center py-16 border-2 border-dashed border-indigo-200 dark:border-indigo-900 rounded-2xl">
          <BriefcaseMedical className="w-12 h-12 mx-auto text-indigo-300 dark:text-indigo-700 mb-3 opacity-50" />
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-1">
            Sin servicios registrados
          </p>
          <p className="text-xs text-slate-300 dark:text-slate-600">
            Registra un nuevo procedimiento
          </p>
        </div>
      ) : (
        sortedServices.map((service) => (
          <div
            key={service._id}
            className="relative flex gap-6 md:gap-8 group animate-fade-in"
          >
            {/* Icono Timeline */}
            <div className="relative z-10 shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-500 shadow-sm transition-transform group-hover:scale-110">
              <BriefcaseMedical size={14} strokeWidth={2.5} />
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                    {service.serviceName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {new Date(service.serviceDate).toLocaleDateString()}
                    </span>
                    {service.products.length > 0 && (
                      <span className="flex items-center gap-1 opacity-70">
                        <Package size={12} /> {service.products.length} insumos
                      </span>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setServiceToDelete({
                        id: service._id,
                        name: service.serviceName,
                      })
                    }
                    className="p-2 text-slate-400 hover:text-danger-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Descripción */}
              {service.description && (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 italic line-clamp-2">
                  "{service.description}"
                </p>
              )}

              {/* Precio + Link */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  ${service.totalCost.toFixed(2)}
                </span>
                <button
                  onClick={(e) => handleOpenDetail(service, e)}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-bold text-sm flex items-center gap-1 transition-colors"
                >
                  Ver detalle <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Modal Ver Detalle */}
      <ServiceDetailModal
        isOpen={!!serviceToView}
        onClose={() => setServiceToView(null)}
        service={serviceToView}
        triggerRect={triggerRect}
      />

      {/* Modal Eliminar */}
      <ConfirmationModal
        isOpen={!!serviceToDelete}
        onClose={() => setServiceToDelete(null)}
        onConfirm={() =>
          serviceToDelete?.id && removeService(serviceToDelete.id)
        }
        variant="danger"
        title="Eliminar Servicio"
        message={`¿Eliminar "${serviceToDelete?.name}"?`}
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </TimelineLayout>
  );
}
