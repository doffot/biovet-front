// src/views/vaccinations/VaccinationView.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import {
  getVaccinationsByPatient,
  deleteVaccination,
} from "@/api/vaccinationAPI";
import {
  Check,
  Loader2,
  Syringe,
  Trash2,
  Pencil,
  FlaskConical,
  Clock,
  ChevronRight,
} from "lucide-react";
import type { Patient } from "@/types/patient";
import type { Vaccination } from "@/types/vaccination";
import CreateVaccinationModal from "@/components/vaccinations/CreateVaccinationModal";
import VaccinationDetailModal from "@/components/vaccinations/VaccinationDetailModal";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import TimelineLayout from "@/components/ui/TimeLineLayout";

export default function VaccinationView() {
  const contextData = useOutletContext<any>();
  const patient: Patient = contextData.patient || contextData;
  const queryClient = useQueryClient();

  // Estados
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Vaccination | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [vaccinationToView, setVaccinationToView] =
    useState<Vaccination | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  // Query
  const { data: vaccinations = [], isLoading } = useQuery({
    queryKey: ["vaccinations", patient._id],
    queryFn: () => getVaccinationsByPatient(patient._id),
    enabled: !!patient._id,
  });

  // Mutation eliminar
  const deleteMutation = useMutation({
    mutationFn: deleteVaccination,
    onSuccess: () => {
      toast.success("Eliminado", "Registro borrado correctamente");
      queryClient.invalidateQueries({
        queryKey: ["vaccinations", patient._id],
      });
      setDeleteId(null);
    },
    onError: (error: Error) => toast.error("Error", error.message),
  });

  // Handler para abrir detalle con posición
  const handleOpenDetail = (
    vaccination: Vaccination,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTriggerRect(rect);
    setVaccinationToView(vaccination);
  };

  const getVaccineColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("rabia"))
      return "text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";
    if (t.includes("sextuple") || t.includes("múltiple"))
      return "text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800";
    if (t.includes("parvo"))
      return "text-purple-500 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800";
    if (t.includes("tos") || t.includes("kennel"))
      return "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800";
    return "text-biovet-500 bg-biovet-50 dark:bg-biovet-950/30 border-biovet-200 dark:border-biovet-800";
  };

  const sortedVaccinations = [...vaccinations].sort(
    (a, b) =>
      new Date(b.vaccinationDate).getTime() -
      new Date(a.vaccinationDate).getTime(),
  );

  if (isLoading)
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-biovet-500 animate-spin" />
      </div>
    );

  return (
    <TimelineLayout
      title="Vacunación"
      subtitle={`Historial de ${patient?.name}`}
      headerIcon={Syringe}
      count={vaccinations.length}
      countLabel="vacunas"
      onAdd={() => {
        setEditItem(null);
        setIsModalOpen(true);
      }}
      variant="vacunas"
    >
      {sortedVaccinations.map((vac) => {
        const isPending =
          vac.nextVaccinationDate &&
          new Date(vac.nextVaccinationDate) > new Date();
        const colorClasses = getVaccineColor(vac.vaccineType);

        return (
          <div
            key={vac._id}
            className="relative flex gap-6 md:gap-8 group animate-fade-in"
          >
            {/* Icono con color dinámico */}
            <div
              className={`relative z-10 shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-lg border flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${colorClasses}`}
            >
              <Syringe size={14} strokeWidth={2.5} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                    {vac.vaccineType}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {new Date(vac.vaccinationDate).toLocaleDateString()}
                    </span>
                    {vac.laboratory && (
                      <span className="flex items-center gap-1 opacity-70">
                        <FlaskConical size={14} /> {vac.laboratory}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditItem(vac);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-biovet-500 transition-colors"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteId(vac._id!)}
                    className="p-2 text-slate-400 hover:text-danger-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Refuerzo */}
              {vac.nextVaccinationDate && (
                <div className="mt-3 flex items-center gap-2 text-[13px] text-slate-500 font-medium italic">
                  {isPending ? (
                    <Clock size={14} className="text-warning-500" />
                  ) : (
                    <Check size={14} className="text-success-500" />
                  )}
                  Refuerzo:{" "}
                  <span
                    className={`font-bold ${isPending ? "text-warning-600" : "text-success-600"}`}
                  >
                    {new Date(vac.nextVaccinationDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Botón Ver Detalle */}
              <div className="mt-3 flex justify-end">
                <button
                  onClick={(e) => handleOpenDetail(vac, e)}
                  className="text-biovet-600 dark:text-biovet-400 hover:text-biovet-800 font-bold text-sm flex items-center gap-1 transition-colors"
                >
                  Ver detalle <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Modal Ver Detalle */}
      <VaccinationDetailModal
        isOpen={!!vaccinationToView}
        onClose={() => setVaccinationToView(null)}
        vaccination={vaccinationToView}
        triggerRect={triggerRect}
      />

      {/* Modal Crear/Editar */}
      <CreateVaccinationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={patient}
        vaccinationToEdit={editItem}
      />

      {/* Modal Eliminar */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Eliminar"
        message="¿Borrar registro?"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </TimelineLayout>
  );
}
