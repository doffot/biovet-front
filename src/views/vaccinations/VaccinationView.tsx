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
  AlertCircle,
  Loader2,
  Syringe,
  Trash2,
  Pencil,
  PlusCircleIcon,
} from "lucide-react";
import type { Patient } from "@/types/patient";
import type { Vaccination } from "@/types/vaccination"; // Importamos el tipo Vaccination
import CreateVaccinationModal from "@/components/vaccinations/CreateVaccinationModal";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function VaccinationView() {
  const contextData = useOutletContext<any>();
  const patient: Patient = contextData.patient || contextData;
  const queryClient = useQueryClient();

  // --- ESTADOS ---
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal de Crear/Editar
  const [editItem, setEditItem] = useState<Vaccination | null>(null); // Vacuna a editar
  const [deleteId, setDeleteId] = useState<string | null>(null); // ID para eliminar

  // Query vacunas
  const { data: vaccinations = [], isLoading } = useQuery({
    queryKey: ["vaccinations", patient._id],
    queryFn: () => getVaccinationsByPatient(patient._id),
    enabled: !!patient._id,
  });

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: deleteVaccination,
    onSuccess: () => {
      toast.success("Eliminado", "El registro de vacuna ha sido eliminado");
      queryClient.invalidateQueries({
        queryKey: ["vaccinations", patient._id],
      });
      queryClient.invalidateQueries({ queryKey: ["inventory", "all"] });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error("Error", error.message || "No se pudo eliminar el registro");
    },
  });

  // --- HANDLERS ---

  const handleOpenCreate = () => {
    setEditItem(null); // Limpiamos para modo creación
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vac: Vaccination) => {
    setEditItem(vac); // Seteamos la vacuna a editar
    setIsModalOpen(true);
  };

  // --- FORMATO Y ESTILOS ---

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(dateStr));
  };

  const sortedVaccinations = [...vaccinations].sort(
    (a, b) =>
      new Date(b.vaccinationDate).getTime() -
      new Date(a.vaccinationDate).getTime(),
  );

  const getVaccineStyle = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("sextuple") || n.includes("múltiple"))
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200";
    if (n.includes("rabia"))
      return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200";
    if (n.includes("parvo"))
      return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200";
    if (n.includes("tos") || n.includes("kennel"))
      return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200";
    return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200";
  };

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
          <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Control de Vacunas
                </p>
              </div>
              <h1 className="hidden lg:block text-xl font-bold font-heading text-slate-800 dark:text-white">
                Control de Vacunación
              </h1>
            </div>

            <button
              onClick={handleOpenCreate}
              className="btn-primary shadow-lg  active:scale-95 transition-transform xs:rounded-full  w-10 h-10 lg:w-auto lg:h-auto p-0 lg:px-3 lg:py-2.5 flex items-center justify-center gap-2"
            >
              <PlusCircleIcon size={20} />
              <span className="hidden lg:inline font-semibold ">Agregar</span>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-4 pb-24">
          <div className="max-w-3xl mx-auto relative pl-4 lg:pl-0">
            {/* Línea vertical */}
            <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-dark-100 z-0"></div>

            <div className="space-y-6 relative">
              {sortedVaccinations.length === 0 ? (
                <div className="text-center py-20 ml-10 border-2 border-dashed border-slate-200 dark:border-dark-100 rounded-2xl">
                  <Syringe className="w-12 h-12 mx-auto text-slate-300 mb-2 opacity-50" />
                  <p className="text-slate-400 font-medium">
                    No hay vacunas registradas
                  </p>
                </div>
              ) : (
                sortedVaccinations.map((vac) => {
                  const isPending =
                    vac.nextVaccinationDate &&
                    new Date(vac.nextVaccinationDate) > new Date();
                  const style = getVaccineStyle(vac.vaccineType);

                  return (
                    <div
                      key={vac._id}
                      className="relative flex items-start gap-5 group"
                    >
                      {/* Icono jeringa */}
                      <div
                        className={`
                          shrink-0 relative z-10
                          w-10 h-10 rounded-full flex items-center justify-center 
                          border-4 border-surface-50 dark:border-dark-300 shadow-sm
                          ${style}
                        `}
                      >
                        <Syringe size={16} strokeWidth={2.5} />
                      </div>

                      {/* Tarjeta */}
                      <div className="flex-1 min-w-0">
                        <div
                          className={`
                            bg-white dark:bg-dark-200 p-4 rounded-2xl rounded-tl-sm shadow-sm border border-surface-200 dark:border-dark-100
                            hover:shadow-md transition-all duration-200
                            relative
                          `}
                        >
                          {/* Botones de acción */}
                          <div className="absolute top-3 right-3 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                            {/* Botón Editar Activo */}
                            <button
                              onClick={() => handleOpenEdit(vac)}
                              className="p-1.5 text-slate-400 hover:text-biovet-600 hover:bg-biovet-50 dark:hover:bg-dark-100 rounded-lg transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Pencil size={14} />
                            </button>

                            {/* Botón Eliminar */}
                            <button
                              onClick={() => setDeleteId(vac._id!)}
                              className="p-1.5 text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar registro"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Cabecera */}
                          <div className="flex justify-between items-start mb-2 pr-16">
                            <h3 className="font-bold text-slate-800 dark:text-white text-base leading-tight">
                              {vac.vaccineType}
                            </h3>
                          </div>

                          <div className="mb-3">
                            <span className="text-[11px] font-mono text-slate-500 bg-surface-50 dark:bg-dark-100 px-2 py-0.5 rounded-md border border-surface-100 dark:border-dark-50 inline-block">
                              Aplicada: {formatDate(vac.vaccinationDate)}
                            </span>
                          </div>

                          {/* Detalles */}
                          {(vac.laboratory || vac.batchNumber) && (
                            <div className="flex flex-wrap gap-2 mb-3 text-xs">
                              {vac.laboratory && (
                                <span className="text-slate-600 dark:text-slate-300 bg-surface-50 dark:bg-dark-100 px-1.5 py-0.5 rounded border border-surface-200 dark:border-dark-50">
                                  Lab: {vac.laboratory}
                                </span>
                              )}
                              {vac.batchNumber && (
                                <span className="font-mono text-slate-500 dark:text-slate-400 bg-surface-50 dark:bg-dark-100 px-1.5 py-0.5 rounded border border-surface-200 dark:border-dark-50">
                                  Lote: {vac.batchNumber}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-dashed border-surface-100 dark:border-dark-100">
                            <span
                              className={`
                                text-xs font-bold flex items-center gap-1.5
                                ${isPending ? "text-warning-600" : "text-success-600"}
                              `}
                            >
                              {isPending ? (
                                <>
                                  <AlertCircle size={14} /> Refuerzo:{" "}
                                  {formatDate(vac.nextVaccinationDate!)}
                                </>
                              ) : (
                                <>
                                  <Check size={14} /> Completado
                                </>
                              )}
                            </span>

                            <span
                              className={`
                              text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                              ${
                                vac.source === "internal"
                                  ? "bg-biovet-50 text-biovet-700 dark:bg-biovet-950 dark:text-biovet-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-dark-100 dark:text-slate-400"
                              }
                            `}
                            >
                              {vac.source === "internal"
                                ? "Interna"
                                : "Externa"}
                            </span>
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

      {/* Modal Crear/Editar (Reutilizado) */}
      <CreateVaccinationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={patient}
        vaccinationToEdit={editItem} // Pasamos la vacuna si estamos editando
      />

      {/* Modal Confirmación Eliminar */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
        title="Eliminar Vacuna"
        message="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer y podría afectar el historial médico."
        variant="danger"
        confirmText="Eliminar"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
