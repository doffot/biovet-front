import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BriefcaseMedical,
  PlusCircle,
  Calendar,
  Trash2,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { getServicesByPatient, deleteVeterinaryService } from "@/api/veterinaryServiceAPI";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function VeterinaryServiceListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();
  const [serviceToDelete, setServiceToDelete] = useState<{ id: string; name: string } | null>(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services", patientId], // Key usada en el Create para invalidar
    queryFn: () => getServicesByPatient(patientId!),
    enabled: !!patientId,
  });

  const { mutate: removeService, isPending: isDeleting } = useMutation({
    mutationFn: deleteVeterinaryService,
    onSuccess: () => {
      toast.success("Servicio Eliminado", "El registro ha sido removido correctamente.");
      queryClient.invalidateQueries({ queryKey: ["services", patientId] });
      setServiceToDelete(null);
    },
    onError: (error: Error) => toast.error("Error al eliminar", error.message),
  });

 

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));

  const sortedServices = [...services].sort(
    (a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()
  );

  if (isLoading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-biovet-500 w-8 h-8" /></div>;

  return (
    <>
      <div className="flex flex-col bg-surface-50 dark:bg-dark-300 min-h-screen lg:min-h-0 lg:h-[calc(100vh-14rem)] lg:rounded-2xl lg:border lg:border-surface-200 lg:dark:border-dark-100 lg:overflow-hidden">
        
        {/* Header */}
        <div className="sticky top-0 lg:static z-40 bg-indigo-50 dark:bg-dark-200 border-b border-surface-200 dark:border-dark-100 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-heading text-slate-800 dark:text-white">Servicios Clínicos</h1>
              {services.length > 0 && <span className="badge badge-neutral">{services.length}</span>}
            </div>
            <Link to="create" className="btn-primary bg-indigo-500 hover:bg-indigo-600 border-indigo-600 shadow-lg active:scale-95 transition-transform xs:rounded-full w-10 h-10 lg:w-auto lg:h-auto p-0 lg:px-4 lg:py-2.5 flex items-center justify-center gap-2">
              <PlusCircle size={20} />
              <span className="hidden lg:inline font-semibold">Agregar</span>
            </Link>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-4 pb-24">
          <div className="max-w-4xl mx-auto relative pl-4 lg:pl-0">
            {sortedServices.length > 0 && <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-dark-100 z-0" />}

            <div className="space-y-6 relative">
              {sortedServices.length === 0 ? (
                <div className="text-center py-20 ml-10 border-2 border-dashed border-slate-200 dark:border-dark-100 rounded-2xl">
                  <BriefcaseMedical className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3 opacity-50" />
                  <p className="text-slate-400 dark:text-slate-500 font-medium mb-1">Sin servicios registrados</p>
                  <p className="text-xs text-slate-300 dark:text-slate-600">Registra un nuevo procedimiento o servicio</p>
                </div>
              ) : (
                sortedServices.map((service) => {

                  return (
                    <div key={service._id} className="relative flex items-start gap-5 group">
                      <div className="shrink-0 relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-surface-50 dark:border-dark-300 shadow-sm bg-white dark:bg-dark-200 text-indigo-500">
                        <BriefcaseMedical size={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="bg-white dark:bg-dark-200 p-5 rounded-2xl rounded-tl-sm shadow-sm border border-surface-200 dark:border-dark-100 hover:shadow-md transition-all duration-200 relative">
                          
                          <div className="absolute top-4 right-4 flex gap-1.5">
                            

                            <button
                              onClick={() => setServiceToDelete({ id: service._id, name: service.serviceName })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/30 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div className="mb-3 pr-32">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                              <Calendar size={14} />
                              <span className="text-sm font-bold uppercase tracking-wider">{formatDate(service.serviceDate)}</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-white leading-tight">{service.serviceName}</h3>
                            {service.products.length > 0 && (
                              <p className="text-xs text-slate-500 mt-1">
                                {service.products.length} insumos utilizados
                              </p>
                            )}
                          </div>

                          {service.description && (
                            <div className="bg-surface-50 dark:bg-dark-300/50 p-2.5 rounded-xl border border-surface-200 dark:border-dark-100 mb-3">
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{service.description}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-dashed border-surface-100 dark:border-dark-100">
                            <span className="text-sm font-bold text-slate-800 dark:text-white">${service.totalCost.toFixed(2)}</span>
                            <Link to={`${service._id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold text-sm flex items-center gap-1 transition-colors">
                              Ver detalle <ChevronRight size={16} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!serviceToDelete}
        onClose={() => setServiceToDelete(null)}
        onConfirm={() => serviceToDelete?.id && removeService(serviceToDelete.id)}
        variant="danger"
        title="Eliminar Servicio"
        message={
          <span>
            ¿Estás seguro de eliminar el servicio <strong>{serviceToDelete?.name}</strong>? Esta acción no se puede deshacer.
          </span>
        }
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </>
  );
}