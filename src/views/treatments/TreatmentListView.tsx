// src/views/treatments/TreatmentListView.tsx

import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Pill,
  Trash2,
  Pencil,
  Loader2,
  FileSearch,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
} from "lucide-react";
import { getTreatmentsByPatient, deleteTreatment } from "@/api/treatmentAPI";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import EditTreatmentModal from "@/components/treatments/EditTreatmentModal";
import TreatmentDetailModal from "@/components/treatments/TreatmentDetailModal";
import TimelineLayout from "@/components/ui/TimeLineLayout";
import type { Treatment } from "@/types/treatment";
import type { Patient } from "@/types/patient";

export default function TreatmentListView() {
  const contextData = useOutletContext<any>();
  const patient: Patient = contextData.patient || contextData;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Estados para modales
  const [treatmentToDelete, setTreatmentToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [treatmentToEdit, setTreatmentToEdit] = useState<Treatment | null>(
    null,
  );
  const [treatmentToView, setTreatmentToView] = useState<Treatment | null>(
    null,
  );
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  // Query
  const { data: treatments = [], isLoading } = useQuery({
    queryKey: ["treatments", patient._id],
    queryFn: () => getTreatmentsByPatient(patient._id),
    enabled: !!patient._id,
  });

  // Mutation eliminar
  const { mutate: removeTreatment, isPending: isDeleting } = useMutation({
    mutationFn: deleteTreatment,
    onSuccess: () => {
      toast.success("Eliminado", "Tratamiento borrado correctamente");
      queryClient.invalidateQueries({ queryKey: ["treatments", patient._id] });
      setTreatmentToDelete(null);
    },
    onError: (error: Error) => toast.error("Error al eliminar", error.message),
  });

  // Handler para abrir detalle con posición
  const handleOpenDetail = (
    treatment: Treatment,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTriggerRect(rect);
    setTreatmentToView(treatment);
  };

  // Config de estados
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Activo":
        return {
          color:
            "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
          icon: Activity,
        };
      case "Completado":
        return {
          color:
            "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
          icon: CheckCircle2,
        };
      case "Suspendido":
        return {
          color:
            "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800",
          icon: AlertCircle,
        };
      default:
        return {
          color:
            "text-slate-600 bg-slate-50 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800",
          icon: Clock,
        };
    }
  };

  // Ordenar por fecha
  const sortedTreatments = [...treatments].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  // Loading
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <TimelineLayout
      title="Tratamientos"
      subtitle={`Historial de ${patient?.name}`}
      headerIcon={Pill}
      count={treatments.length}
      countLabel="tratamientos"
      onAdd={() => navigate("create")}
      variant="tratamientos"
    >
      {sortedTreatments.length === 0 ? (
        <div className="ml-8 text-center py-16 border-2 border-dashed border-blue-200 dark:border-blue-900 rounded-2xl">
          <FileSearch className="w-12 h-12 mx-auto text-blue-300 dark:text-blue-700 mb-3 opacity-50" />
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-1">
            Sin tratamientos registrados
          </p>
          <p className="text-xs text-slate-300 dark:text-slate-600">
            Registra un nuevo tratamiento médico
          </p>
        </div>
      ) : (
        sortedTreatments.map((treatment) => {
          const statusInfo = getStatusConfig(treatment.status);
          const StatusIcon = statusInfo.icon;

          return (
            <div
              key={treatment._id}
              className="relative flex gap-6 md:gap-8 group animate-fade-in"
            >
              {/* Icono Timeline */}
              <div className="relative z-10 shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-500 shadow-sm transition-transform group-hover:scale-110">
                <Pill size={14} strokeWidth={2.5} />
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                      {treatment.productName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {new Date(treatment.startDate).toLocaleDateString()}
                      </span>
                      <span className="opacity-70">
                        {treatment.treatmentType === "Otro"
                          ? treatment.treatmentTypeOther
                          : treatment.treatmentType}{" "}
                        • {treatment.route}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setTreatmentToEdit(treatment)}
                      className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() =>
                        setTreatmentToDelete({
                          id: treatment._id,
                          name: treatment.productName,
                        })
                      }
                      className="p-2 text-slate-400 hover:text-danger-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Estado + Precio */}
                <div className="mt-3 flex items-center justify-between">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${statusInfo.color}`}
                  >
                    <StatusIcon size={12} />
                    {treatment.status}
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    ${treatment.cost.toFixed(2)}
                  </span>
                </div>

                {/* Botón Ver detalle - Captura posición */}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={(e) => handleOpenDetail(treatment, e)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-bold text-sm flex items-center gap-1 transition-colors"
                  >
                    Ver detalle <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Modal Ver Detalle - Con triggerRect */}
      <TreatmentDetailModal
        isOpen={!!treatmentToView}
        onClose={() => setTreatmentToView(null)} // Solo esto, NO limpiar triggerRect
        treatment={treatmentToView}
        triggerRect={triggerRect}
      />

      {/* Modal Editar */}
      {treatmentToEdit && (
        <EditTreatmentModal
          isOpen={!!treatmentToEdit}
          onClose={() => setTreatmentToEdit(null)}
          treatment={treatmentToEdit}
        />
      )}

      {/* Modal Eliminar */}
      <ConfirmationModal
        isOpen={!!treatmentToDelete}
        onClose={() => setTreatmentToDelete(null)}
        onConfirm={() =>
          treatmentToDelete?.id && removeTreatment(treatmentToDelete.id)
        }
        variant="danger"
        title="Eliminar Tratamiento"
        message={`¿Eliminar "${treatmentToDelete?.name}"?`}
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </TimelineLayout>
  );
}
