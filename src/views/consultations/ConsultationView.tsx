// src/views/consultations/ConsultationView.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, useNavigate } from "react-router-dom";
import { getConsultationsByPatient, deleteConsultation } from "@/api/consultationAPI";
import { Stethoscope, Trash2, Pencil, Loader2, Weight, ChevronRight, ClipboardList } from "lucide-react";
import type { Patient } from "@/types/patient";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import TimelineLayout from "@/components/ui/TimelineLayout";

export default function ConsultationView() {
  const contextData = useOutletContext<any>();
  const patient: Patient = contextData.patient || contextData;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ["consultations", patient._id],
    queryFn: () => getConsultationsByPatient(patient._id),
    enabled: !!patient._id,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteConsultation,
    onSuccess: () => {
      toast.success("Eliminado", "Registro borrado");
      queryClient.invalidateQueries({ queryKey: ["consultations", patient._id] });
      setDeleteId(null);
    },
    onError: (error: Error) => toast.error("Error", error.message),
  });

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <TimelineLayout
      title="Consultas"
      subtitle={`Historial clínico de ${patient?.name}`}
      headerIcon={Stethoscope}
      count={consultations.length}
      countLabel="visitas"
      onAdd={() => navigate(`/patients/${patient._id}/consultations/new`)}
      variant="consultas"
    >
      {consultations.length === 0 ? (
        <div className="ml-8 text-center py-16 border-2 border-dashed border-purple-200 dark:border-purple-900 rounded-2xl">
          <Stethoscope className="w-12 h-12 mx-auto text-purple-300 dark:text-purple-700 mb-3 opacity-50" />
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-1">Sin consultas registradas</p>
          <p className="text-xs text-slate-300 dark:text-slate-600">Registra la primera visita del paciente</p>
        </div>
      ) : (
        consultations.map((consultation) => (
          <div key={consultation._id} className="relative flex gap-6 md:gap-8 group animate-fade-in">
            {/* Icono Timeline */}
            <div className="relative z-10 shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-500 shadow-sm transition-transform group-hover:scale-110">
              <Stethoscope size={14} strokeWidth={2.5} />
            </div>

            {/* Card */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                    {consultation.reasonForVisit || "Consulta General"}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {new Date(consultation.consultationDate).toLocaleDateString()}
                    </span>
                    {consultation.weight && (
                      <span className="flex items-center gap-1 opacity-70">
                        <Weight size={12} /> {consultation.weight}kg
                      </span>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/patients/${patient._id}/consultations/${consultation._id}/edit`)}
                    className="p-2 text-slate-400 hover:text-purple-500 transition-colors"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteId(consultation._id)}
                    className="p-2 text-slate-400 hover:text-danger-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Diagnóstico */}
              {consultation.presumptiveDiagnosis && (
                <div className="mt-3 bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900/50">
                  <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase flex items-center gap-1 mb-1">
                    <ClipboardList size={12} /> Diagnóstico
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                    "{consultation.presumptiveDiagnosis}"
                  </p>
                </div>
              )}

              {/* Link a detalle */}
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => navigate(`/patients/${patient._id}/consultations/${consultation._id}`)}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-800 font-bold text-sm flex items-center gap-1 transition-colors"
                >
                  Ver Detalles <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Eliminar Consulta"
        message="¿Estás seguro de eliminar esta consulta?"
        confirmText="Eliminar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </TimelineLayout>
  );
}