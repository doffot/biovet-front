import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  getConsultationsByPatient,
  deleteConsultation,
} from "@/api/consultationAPI";
import {
  Stethoscope,
  Trash2,
  Pencil,
  PlusCircleIcon,
  Loader2,
  Calendar,
  ClipboardList,
  Weight,
  Thermometer,
  ChevronRight,
} from "lucide-react";
import type { Patient } from "@/types/patient";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function ConsultationView() {
  const contextData = useOutletContext<any>();
  const patient: Patient = contextData.patient || contextData;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Query consultas
  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ["consultations", patient._id],
    queryFn: () => getConsultationsByPatient(patient._id),
    enabled: !!patient._id,
  });

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: deleteConsultation,
    onSuccess: () => {
      toast.success("Eliminado", "La consulta médica ha sido eliminada");
      queryClient.invalidateQueries({
        queryKey: ["consultations", patient._id],
      });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error("Error", error.message || "No se pudo eliminar la consulta");
    },
  });

  // --- HANDLERS ---
  const handleCreateNew = () => {
    // Navegamos al formulario de nueva consulta pasándole el ID del paciente
    navigate(`/patients/${patient._id}/consultations/new`);
  };

  // const handleEdit = (id: string) => {
  //   navigate(`/patients/${patient._id}/consultations/edit/${id}`);
  // };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  const sortedConsultations = [...consultations].sort(
    (a, b) =>
      new Date(b.consultationDate).getTime() -
      new Date(a.consultationDate).getTime(),
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
        <div className="sticky top-0 lg:static z-40 bg-biovet-50 dark:bg-dark-200 border-b border-surface-200 dark:border-dark-100 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-heading text-slate-800 dark:text-white">
                Historial de Consultas
              </h1>
            </div>

            <button
              onClick={handleCreateNew}
              className="btn-primary shadow-lg active:scale-95 transition-transform xs:rounded-full w-10 h-10 lg:w-auto lg:h-auto p-0 lg:px-4 lg:py-2.5 flex items-center justify-center gap-2"
            >
              <PlusCircleIcon size={20} />
              <span className="hidden lg:inline font-semibold">
               Agregar
              </span>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-4 pb-24">
          <div className="max-w-4xl mx-auto relative pl-4 lg:pl-0">
            {/* Línea vertical de la línea de tiempo */}
            <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-dark-100 z-0"></div>

            <div className="space-y-6 relative">
              {sortedConsultations.length === 0 ? (
                <div className="text-center py-20 ml-10 border-2 border-dashed border-slate-200 dark:border-dark-100 rounded-2xl">
                  <Stethoscope className="w-12 h-12 mx-auto text-slate-300 mb-2 opacity-50" />
                  <p className="text-slate-400 font-medium">
                    No hay consultas registradas para este paciente
                  </p>
                </div>
              ) : (
                sortedConsultations.map((consultation) => (
                  <div
                    key={consultation._id}
                    className="relative flex items-start gap-5 group"
                  >
                    {/* Icono Línea de tiempo */}
                    <div className="shrink-0 relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-surface-50 dark:border-dark-300 shadow-sm bg-white dark:bg-dark-200 text-biovet-500">
                      <Stethoscope size={18} />
                    </div>

                    {/* Tarjeta de Consulta */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-white dark:bg-dark-200 p-5 rounded-2xl rounded-tl-sm shadow-sm border border-surface-200 dark:border-dark-100 hover:shadow-md transition-all duration-200 relative">
                        {/* Botones de acción */}
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/patients/${patient._id}/consultations/${consultation._id}/edit`,
                              )
                            }
                            className="btn-icon-edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteId(consultation._id)}
                            className="btn-icon-delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Fecha y Diagnóstico Presuntivo */}
                        <div className="mb-4 pr-20">
                          <div className="flex items-center gap-2 text-biovet-600 dark:text-biovet-400 mb-1">
                            <Calendar size={14} />
                            <span className="text-sm font-bold uppercase tracking-wider">
                              {formatDate(consultation.consultationDate)}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-biovet-400 dark:text-white leading-tight">
                            {consultation.reasonForVisit || "Consulta General"}
                          </h3>
                        </div>

                        {/* Info rápida (Peso, Temperatura) */}
                        <div className="flex gap-4 mb-4">
                          {consultation.weight && (
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs bg-slate-50 dark:bg-dark-100 px-2 py-1 rounded-md border border-slate-100 dark:border-dark-50">
                              <Weight size={14} className="text-slate-400" />
                              <span className="font-bold">
                                {consultation.weight} kg
                              </span>
                            </div>
                          )}
                          {consultation.temperature && (
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs bg-slate-50 dark:bg-dark-100 px-2 py-1 rounded-md border border-slate-100 dark:border-dark-50">
                              <Thermometer
                                size={14}
                                className="text-slate-400"
                              />
                              <span className="font-bold">
                                {consultation.temperature} °C
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Resumen del Diagnóstico/Plan */}
                        {consultation.presumptiveDiagnosis && (
                          <div className="bg-biovet-50/50 dark:bg-biovet-950/20 p-3 rounded-xl border border-biovet-100/50 dark:border-biovet-800/30 mb-3">
                            <p className="text-xs font-bold text-biovet-700 dark:text-biovet-300 uppercase mb-1 flex items-center gap-1">
                              <ClipboardList size={12} /> Diagnóstico Presuntivo
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 italic">
                              "{consultation.presumptiveDiagnosis}"
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-dashed border-surface-100 dark:border-dark-100">
                          <span className="text-[11px] text-slate-400 font-medium">
                            ID: {consultation._id.slice(-6).toUpperCase()}
                          </span>
                          <button
                            onClick={() =>
                              navigate(
                                `/patients/${patient._id}/consultations/${consultation._id}`,
                              )
                            }
                            className="text-biovet-600 hover:text-biovet-800 font-bold text-sm flex items-center gap-1 transition-colors"
                          >
                            Ver más
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Confirmación Eliminar */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
        title="Eliminar Consulta"
        message="¿Estás seguro de que deseas eliminar este registro clínico? Esta acción eliminará permanentemente los datos de la anamnesis, examen físico y tratamiento de esta visita."
        variant="danger"
        confirmText="Eliminar permanentemente"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
