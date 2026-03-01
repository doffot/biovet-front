// src/views/grooming/GroomingServiceListView.tsx

import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Scissors,
  Trash2,
  Pencil,
  Loader2,
  FileSearch,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { getGroomingServicesByPatient, deleteGroomingService } from "@/api/groomingAPI";
import { getInvoices } from "@/api/invoiceAPI";
import type { GroomingService } from "@/types/grooming";
import type { Patient } from "@/types/patient";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import EditGroomingServiceModal from "@/components/grooming/EditGroomingServiceModal";
import GroomingServiceDetailModal from "@/components/grooming/GroomingServiceDetailModal";
import TimelineLayout from "@/components/ui/TimelineLayout";

export default function GroomingServiceListView() {
  const contextData = useOutletContext<any>();
  const patient: Patient = contextData.patient || contextData;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [serviceToEdit, setServiceToEdit] = useState<GroomingService | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<GroomingService | null>(null);

  // ══════════════════════════════════════════
  // Estados para el modal de detalle
  // ══════════════════════════════════════════
  const [serviceToView, setServiceToView] = useState<GroomingService | null>(null);
  const [viewPaymentInfo, setViewPaymentInfo] = useState<{
    status: string;
    color: string;
    icon: React.ComponentType<{ size?: number }>;
  } | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ["groomingServices", patient._id],
    queryFn: () => getGroomingServicesByPatient(patient._id),
    enabled: !!patient._id,
  });

  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["invoices", { patientId: patient._id }],
    queryFn: () => getInvoices({ patientId: patient._id }),
    enabled: !!patient._id,
  });

  const { mutate: removeService, isPending: isDeleting } = useMutation({
    mutationFn: deleteGroomingService,
    onSuccess: () => {
      toast.success("Eliminado", "Servicio removido correctamente");
      queryClient.invalidateQueries({ queryKey: ["groomingServices", patient._id] });
      setServiceToDelete(null);
    },
    onError: (error: Error) => toast.error("Error al eliminar", error.message),
  });

  const invoices = invoicesData?.invoices || [];
  const isLoading = isLoadingServices || isLoadingInvoices;

  const getPaymentInfo = (service: GroomingService) => {
    const invoice = invoices.find((inv) =>
      inv.items.some((item) => item.type === "grooming" && item.resourceId === service._id)
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
        color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
        icon: CheckCircle2,
      };
    if (invoice.paymentStatus === "Pendiente")
      return {
        status: "Pendiente",
        color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
        icon: CreditCard,
      };

    return {
      status: "Parcial",
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
      icon: Clock,
    };
  };

  // ══════════════════════════════════════════
  // Handler para abrir detalle con posición
  // ══════════════════════════════════════════
  const handleOpenDetail = (service: GroomingService, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTriggerRect(rect);
    setViewPaymentInfo(getPaymentInfo(service));
    setServiceToView(service);
  };

  const sortedServices = [...services].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <TimelineLayout
      title="Estética"
      subtitle={`Historial de ${patient?.name}`}
      headerIcon={Scissors}
      count={services.length}
      countLabel="servicios"
      onAdd={() => navigate("create")}
      variant="estetica"
    >
      {sortedServices.length === 0 ? (
        <div className="ml-8 text-center py-16 border-2 border-dashed border-pink-200 dark:border-pink-900 rounded-2xl">
          <FileSearch className="w-12 h-12 mx-auto text-pink-300 dark:text-pink-700 mb-3 opacity-50" />
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-1">Sin historial de estética</p>
          <p className="text-xs text-slate-300 dark:text-slate-600">Registra el primer servicio de peluquería</p>
        </div>
      ) : (
        sortedServices.map((service) => {
          const payment = getPaymentInfo(service);
          const StatusIcon = payment.icon;

          return (
            <div key={service._id} className="relative flex gap-6 md:gap-8 group animate-fade-in">
              {/* Icono Timeline */}
              <div className="relative z-10 shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-lg border border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center text-pink-500 shadow-sm transition-transform group-hover:scale-110">
                <Scissors size={14} strokeWidth={2.5} />
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                      {service.service}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {new Date(service.date).toLocaleDateString()}
                      </span>
                      <span className="font-bold text-pink-600 dark:text-pink-400">
                        ${service.cost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1">
                    {/* Badge Estado Pago */}
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${payment.color}`}>
                      <StatusIcon size={12} />
                      <span className="hidden sm:inline">{payment.status}</span>
                    </div>

                    <button
                      onClick={() => setServiceToEdit(service)}
                      className="p-2 text-slate-400 hover:text-pink-500 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => setServiceToDelete(service)}
                      className="p-2 text-slate-400 hover:text-danger-500 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Especificaciones */}
                {service.specifications && (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 italic line-clamp-2">
                    "{service.specifications}"
                  </p>
                )}

                {/* Botón Ver Detalle */}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={(e) => handleOpenDetail(service, e)}
                    className="text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 font-bold text-sm flex items-center gap-1 transition-colors"
                  >
                    Ver Detalle <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Modal Ver Detalle */}
      <GroomingServiceDetailModal
        isOpen={!!serviceToView}
        onClose={() => {
          setServiceToView(null);
          setViewPaymentInfo(null);
        }}
        service={serviceToView}
        paymentInfo={viewPaymentInfo || undefined}
        triggerRect={triggerRect}
      />

      {/* Modal Editar */}
      {serviceToEdit && (
        <EditGroomingServiceModal
          isOpen={!!serviceToEdit}
          onClose={() => setServiceToEdit(null)}
          service={serviceToEdit}
        />
      )}

      {/* Modal Eliminar */}
      <ConfirmationModal
        isOpen={!!serviceToDelete}
        onClose={() => setServiceToDelete(null)}
        onConfirm={() => serviceToDelete?._id && removeService(serviceToDelete._id)}
        variant="danger"
        title="Eliminar Servicio"
        message="¿Eliminar este servicio de estética?"
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </TimelineLayout>
  );
}