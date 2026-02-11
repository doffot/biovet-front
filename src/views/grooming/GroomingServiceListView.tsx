import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Scissors,
  PlusCircle,
  Calendar,
  Eye,
  Trash2,
  Pencil,
  Loader2,
  FileSearch,
  ChevronRight,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  getGroomingServicesByPatient,
  deleteGroomingService,
} from "@/api/groomingAPI";
import { getInvoices } from "@/api/invoiceAPI";
import type { GroomingService } from "@/types/grooming";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import EditGroomingServiceModal from "@/components/grooming/EditGroomingServiceModal";

export default function GroomingServiceListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();
  // const [mounted, setMounted] = useState(false);

  // Estados para modales
  const [serviceToEdit, setServiceToEdit] = useState<GroomingService | null>(
    null
  );
  const [serviceToDelete, setServiceToDelete] =
    useState<GroomingService | null>(null);

  // Queries
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ["groomingServices", patientId],
    queryFn: () => getGroomingServicesByPatient(patientId!),
    enabled: !!patientId,
  });

  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["invoices", { patientId }],
    queryFn: () => getInvoices({ patientId }),
    enabled: !!patientId,
  });

  // Mutación para eliminar
  const { mutate: removeService, isPending: isDeleting } = useMutation({
    mutationFn: deleteGroomingService,
    onSuccess: () => {
      toast.success("Servicio eliminado correctamente");
      queryClient.invalidateQueries({
        queryKey: ["groomingServices", patientId],
      });
      setServiceToDelete(null);
    },
    onError: (error: Error) => toast.error("Error al eliminar", error.message),
  });

  const invoices = invoicesData?.invoices || [];
  const isLoading = isLoadingServices || isLoadingInvoices;

  const getPaymentInfo = (service: GroomingService) => {
    const invoice = invoices.find((inv) =>
      inv.items.some(
        (item) => item.type === "grooming" && item.resourceId === service._id
      )
    );

    if (!invoice)
      return {
        status: "Sin facturar",
        color: "text-slate-400 bg-slate-100 dark:bg-slate-800",
        icon: AlertCircle,
      };

    if (invoice.paymentStatus === "Pagado")
      return {
        status: "Pagado",
        color:
          "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
        icon: CheckCircle2,
      };
    if (invoice.paymentStatus === "Pendiente")
      return {
        status: "Pendiente",
        color:
          "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
        icon: CreditCard,
      };

    return {
      status: "Parcial",
      color:
        "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
      icon: Clock,
    };
  };

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));

  const sortedServices = [...services].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (isLoading)
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-biovet-500 w-8 h-8" />
      </div>
    );

  return (
    <>
      <div className="flex flex-col bg-surface-50 dark:bg-dark-300 min-h-screen lg:min-h-0 lg:h-[calc(100vh-14rem)] lg:rounded-2xl lg:border lg:border-surface-200 lg:dark:border-dark-100 lg:overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 lg:static z-40 bg-pink-50 dark:bg-dark-200 border-b border-surface-200 dark:border-dark-100 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-heading text-slate-800 dark:text-white">
                Estética y Baño
              </h1>
              {services.length > 0 && (
                <span className="badge badge-neutral">{services.length}</span>
              )}
            </div>
            <Link
              to="create"
              className="btn-primary bg-pink-500 hover:bg-pink-600 border-pink-600 shadow-lg active:scale-95 transition-transform xs:rounded-full w-10 h-10 lg:w-auto lg:h-auto p-0 lg:px-4 lg:py-2.5 flex items-center justify-center gap-2"
            >
              <PlusCircle size={20} />
              <span className="hidden lg:inline font-semibold">
                Nuevo Servicio
              </span>
            </Link>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-4 pb-24">
          <div className="max-w-4xl mx-auto relative pl-4 lg:pl-0">
            {sortedServices.length > 0 && (
              <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-dark-100 z-0" />
            )}

            <div className="space-y-6 relative">
              {sortedServices.length === 0 ? (
                <div className="text-center py-20 ml-10 border-2 border-dashed border-slate-200 dark:border-dark-100 rounded-2xl">
                  <FileSearch className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3 opacity-50" />
                  <p className="text-slate-400 dark:text-slate-500 font-medium mb-1">
                    Sin historial de estética
                  </p>
                  <p className="text-xs text-slate-300 dark:text-slate-600">
                    Registra el primer servicio de peluquería
                  </p>
                </div>
              ) : (
                sortedServices.map((service) => {
                  const payment = getPaymentInfo(service);
                  const StatusIcon = payment.icon;

                  return (
                    <div
                      key={service._id}
                      className="relative flex items-start gap-5 group"
                    >
                      <div className="shrink-0 relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-surface-50 dark:border-dark-300 shadow-sm bg-white dark:bg-dark-200 text-pink-500">
                        <Scissors size={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="bg-white dark:bg-dark-200 p-5 rounded-2xl rounded-tl-sm shadow-sm border border-surface-200 dark:border-dark-100 hover:shadow-md transition-all duration-200 relative">
                          {/* Acciones */}
                          <div className="absolute top-4 right-4 flex gap-1.5">
                            {/* Badge Pago */}
                            <div
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide mr-2 ${payment.color}`}
                            >
                              <StatusIcon size={12} />
                              {payment.status}
                            </div>

                            {/* Botones */}
                            <Link
  to={`${service._id}`} // <--- Esto navega a la ruta de detalle
  className="p-1.5 rounded-lg text-surface-400 hover:text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-900/30 transition-colors"
  title="Ver Detalle"
>
  <Eye size={15} />
</Link>
                            <button
                              onClick={() => setServiceToEdit(service)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-900/30 transition-colors"
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setServiceToDelete(service)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/30 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          {/* Info Principal */}
                          <div className="mb-3 pr-32">
                            <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 mb-1">
                              <Calendar size={14} />
                              <span className="text-sm font-bold uppercase tracking-wider">
                                {formatDate(service.date)}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-white leading-tight">
                              {service.service}
                            </h3>
                          </div>

                          {service.specifications && (
                            <div className="bg-surface-50 dark:bg-dark-300/50 p-2.5 rounded-xl border border-surface-200 dark:border-dark-100 mb-3">
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                {service.specifications}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-dashed border-surface-100 dark:border-dark-100">
                            <span className="text-sm font-bold text-slate-800 dark:text-white">
                              ${service.cost.toFixed(2)}
                            </span>
                            <Link
                              to={`${service._id}`}
                              className="text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 font-bold text-sm flex items-center gap-1 transition-colors"
                            >
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

      {/* Modales */}
      {serviceToEdit && (
        <EditGroomingServiceModal
          isOpen={!!serviceToEdit}
          onClose={() => setServiceToEdit(null)}
          service={serviceToEdit}
        />
      )}

      <ConfirmationModal
        isOpen={!!serviceToDelete}
        onClose={() => setServiceToDelete(null)}
        onConfirm={() =>
          serviceToDelete?._id && removeService(serviceToDelete._id)
        }
        variant="danger"
        title="Eliminar Servicio"
        message="¿Estás seguro de eliminar este servicio de estética? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </>
  );
}