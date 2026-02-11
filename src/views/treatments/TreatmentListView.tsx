import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Pill,
  PlusCircle,
  Calendar,
  Trash2,
  Pencil,
  Loader2,
  FileSearch,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity
} from "lucide-react";
import { getTreatmentsByPatient, deleteTreatment } from "@/api/treatmentAPI";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import EditTreatmentModal from "@/components/treatments/EditTreatmentModal";
import type { Treatment } from "@/types/treatment";

export default function TreatmentListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();

  // Estados para modales
  const [treatmentToDelete, setTreatmentToDelete] = useState<{ id: string; name: string } | null>(null);
  const [treatmentToEdit, setTreatmentToEdit] = useState<Treatment | null>(null);

  const { data: treatments = [], isLoading } = useQuery({
    queryKey: ["treatments", patientId],
    queryFn: () => getTreatmentsByPatient(patientId!),
    enabled: !!patientId,
  });

  const { mutate: removeTreatment, isPending: isDeleting } = useMutation({
    mutationFn: deleteTreatment,
    onSuccess: () => {
      toast.success("Tratamiento eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["treatments", patientId] });
      setTreatmentToDelete(null);
    },
    onError: (error: Error) => toast.error("Error al eliminar", error.message),
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Activo":
        return { color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400", icon: Activity };
      case "Completado":
        return { color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle2 };
      case "Suspendido":
        return { color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400", icon: AlertCircle };
      default:
        return { color: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400", icon: Clock };
    }
  };

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));

  const sortedTreatments = [...treatments].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  if (isLoading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-biovet-500 w-8 h-8" /></div>;

  return (
    <>
      <div className="flex flex-col bg-surface-50 dark:bg-dark-300 min-h-screen lg:min-h-0 lg:h-[calc(100vh-14rem)] lg:rounded-2xl lg:border lg:border-surface-200 lg:dark:border-dark-100 lg:overflow-hidden">
        
        {/* Header */}
        <div className="sticky top-0 lg:static z-40 bg-cyan-50 dark:bg-dark-200 border-b border-surface-200 dark:border-dark-100 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-heading text-slate-800 dark:text-white">Tratamientos</h1>
              {treatments.length > 0 && <span className="badge badge-neutral">{treatments.length}</span>}
            </div>
            <Link to="create" className="btn-primary bg-cyan-500 hover:bg-cyan-600 border-cyan-600 shadow-lg active:scale-95 transition-transform xs:rounded-full w-10 h-10 lg:w-auto lg:h-auto p-0 lg:px-4 lg:py-2.5 flex items-center justify-center gap-2">
              <PlusCircle size={20} />
              <span className="hidden lg:inline font-semibold">Agregar</span>
            </Link>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-4 pb-24">
          <div className="max-w-4xl mx-auto relative pl-4 lg:pl-0">
            {sortedTreatments.length > 0 && <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-dark-100 z-0" />}

            <div className="space-y-6 relative">
              {sortedTreatments.length === 0 ? (
                <div className="text-center py-20 ml-10 border-2 border-dashed border-slate-200 dark:border-dark-100 rounded-2xl">
                  <FileSearch className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3 opacity-50" />
                  <p className="text-slate-400 dark:text-slate-500 font-medium mb-1">Sin tratamientos activos</p>
                  <p className="text-xs text-slate-300 dark:text-slate-600">Registra un nuevo tratamiento médico</p>
                </div>
              ) : (
                sortedTreatments.map((treatment) => {
                  const statusInfo = getStatusConfig(treatment.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div key={treatment._id} className="relative flex items-start gap-5 group">
                      <div className="shrink-0 relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-surface-50 dark:border-dark-300 shadow-sm bg-white dark:bg-dark-200 text-cyan-500">
                        <Pill size={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="bg-white dark:bg-dark-200 p-5 rounded-2xl rounded-tl-sm shadow-sm border border-surface-200 dark:border-dark-100 hover:shadow-md transition-all duration-200 relative">
                          
                          {/* Acciones */}
                          <div className="absolute top-4 right-4 flex gap-1.5">
                            {/* Badge Estado */}
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide mr-2 ${statusInfo.color}`}>
                              <StatusIcon size={12} />
                              {treatment.status}
                            </div>

                            {/* Botón Editar - Abre Modal */}
                            <button
                              onClick={() => setTreatmentToEdit(treatment)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-900/30 transition-colors"
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>

                            {/* Botón Eliminar - Abre Modal Confirmación */}
                            <button
                              onClick={() => setTreatmentToDelete({ id: treatment._id, name: treatment.productName })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/30 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          {/* Info Principal */}
                          <div className="mb-3 pr-32">
                            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-1">
                              <Calendar size={14} />
                              <span className="text-sm font-bold uppercase tracking-wider">Inicio: {formatDate(treatment.startDate)}</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-white leading-tight">{treatment.productName}</h3>
                            <p className="text-xs text-slate-500 mt-1">
                              {treatment.treatmentType === "Otro" ? treatment.treatmentTypeOther : treatment.treatmentType} • {treatment.route}
                            </p>
                          </div>

                          {/* Detalles Dosis */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                            <div className="bg-surface-50 dark:bg-dark-300/50 p-2 rounded-lg border border-surface-200 dark:border-dark-100">
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Dosis</p>
                              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{treatment.dose}</p>
                            </div>
                            <div className="bg-surface-50 dark:bg-dark-300/50 p-2 rounded-lg border border-surface-200 dark:border-dark-100">
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Frecuencia</p>
                              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{treatment.frequency}</p>
                            </div>
                            <div className="bg-surface-50 dark:bg-dark-300/50 p-2 rounded-lg border border-surface-200 dark:border-dark-100">
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Duración</p>
                              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{treatment.duration}</p>
                            </div>
                          </div>

                          {treatment.observations && (
                            <div className="bg-amber-50 dark:bg-amber-900/10 p-2.5 rounded-xl border border-amber-100 dark:border-amber-800 mb-3 flex gap-2 items-start">
                              <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                              <p className="text-xs text-amber-800 dark:text-amber-200 line-clamp-2 italic">"{treatment.observations}"</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-dashed border-surface-100 dark:border-dark-100">
                            <span className="text-sm font-bold text-slate-800 dark:text-white">${treatment.cost.toFixed(2)}</span>
                            
                            {/* Link a Detalle Completo */}
                            <Link to={`${treatment._id}`} className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-bold text-sm flex items-center gap-1 transition-colors">
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

      {/* Modal Editar */}
      {treatmentToEdit && (
        <EditTreatmentModal
          isOpen={!!treatmentToEdit}
          onClose={() => setTreatmentToEdit(null)}
          treatment={treatmentToEdit}
        />
      )}

      {/* Modal Confirmación Eliminar */}
      <ConfirmationModal
        isOpen={!!treatmentToDelete}
        onClose={() => setTreatmentToDelete(null)}
        onConfirm={() => treatmentToDelete?.id && removeTreatment(treatmentToDelete.id)}
        variant="danger"
        title="Eliminar Tratamiento"
        message={
          <span>
            ¿Estás seguro de eliminar el tratamiento <strong>{treatmentToDelete?.name}</strong>? Esta acción no se puede deshacer.
          </span>
        }
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </>
  );
}