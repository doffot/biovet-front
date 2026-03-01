// src/views/deworming/DewormingView.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { getDewormingsByPatient, deleteDeworming } from "@/api/dewormingAPI";
import {
  Check,
  Clock,
  Loader2,
  Bug,
  Trash2,
  Pencil,
  ChevronRight,
} from "lucide-react";
import type { Patient } from "@/types/patient";
import type { Deworming } from "@/types/deworming";
import CreateDewormingModal from "@/components/deworming/CreateDewormingModal";
import DewormingDetailModal from "@/components/deworming/DewormingDetailModal";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import TimelineLayout from "@/components/ui/TimelineLayout";

export default function DewormingView() {
  const contextData = useOutletContext<any>();
  const patient: Patient = contextData.patient || contextData;
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Deworming | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // ══════════════════════════════════════════
  // NUEVO: Estados para el modal de detalle
  // ══════════════════════════════════════════
  const [dewormingToView, setDewormingToView] = useState<Deworming | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const { data: dewormings = [], isLoading } = useQuery({
    queryKey: ["dewormings", patient._id],
    queryFn: () => getDewormingsByPatient(patient._id),
    enabled: !!patient._id,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDeworming,
    onSuccess: () => {
      toast.success("Eliminado", "Registro eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["dewormings", patient._id] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "all"] });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error("Error", error.message || "No se pudo eliminar");
    },
  });

  const sortedDewormings = [...dewormings].sort(
    (a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()
  );

  const getTypeStyle = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("interna")) return "text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400";
    if (t.includes("externa")) return "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400";
    return "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400";
  };

  // ══════════════════════════════════════════
  // NUEVO: Handler para abrir detalle con posición
  // ══════════════════════════════════════════
  const handleOpenDetail = (deworming: Deworming, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTriggerRect(rect);
    setDewormingToView(deworming);
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <TimelineLayout
      title="Antiparasitarios"
      subtitle={`Historial de ${patient?.name}`}
      headerIcon={Bug}
      count={dewormings.length}
      countLabel="registros"
      onAdd={() => { setEditItem(null); setIsModalOpen(true); }}
      variant="antiparasitarios"
    >
      {sortedDewormings.length === 0 ? (
        <div className="ml-8 text-center py-16 border-2 border-dashed border-amber-200 dark:border-amber-900 rounded-2xl">
          <Bug className="w-12 h-12 mx-auto text-amber-300 dark:text-amber-700 mb-3 opacity-50" />
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-1">Sin desparasitaciones registradas</p>
          <p className="text-xs text-slate-300 dark:text-slate-600">Registra el primer antiparasitario</p>
        </div>
      ) : (
        sortedDewormings.map((item) => {
          const isPending = item.nextApplicationDate && new Date(item.nextApplicationDate) > new Date();

          return (
            <div key={item._id} className="relative flex gap-6 md:gap-8 group animate-fade-in">
              {/* Icono Timeline */}
              <div className="relative z-10 shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-500 shadow-sm transition-transform group-hover:scale-110">
                <Bug size={14} strokeWidth={2.5} />
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                      {item.productName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {new Date(item.applicationDate).toLocaleDateString()}
                      </span>
                      {item.dose && (
                        <span className="opacity-70">Dosis: {item.dose}</span>
                      )}
                      {item.cost > 0 && (
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          ${item.cost.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditItem(item); setIsModalOpen(true); }}
                      className="p-2 text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteId(item._id!)}
                      className="p-2 text-slate-400 hover:text-danger-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Tipo + Fuente */}
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${getTypeStyle(item.dewormingType)}`}>
                    {item.dewormingType}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-dark-100 px-2.5 py-1 rounded-lg">
                    {item.source}
                  </span>
                </div>

                {/* Próxima aplicación */}
                {item.nextApplicationDate && (
                  <div className="mt-3 flex items-center gap-2 text-[13px] text-slate-500 font-medium italic">
                    {isPending ? (
                      <Clock size={14} className="text-warning-500" />
                    ) : (
                      <Check size={14} className="text-success-500" />
                    )}
                    Próxima:{" "}
                    <span className={`font-bold ${isPending ? "text-warning-600" : "text-success-600"}`}>
                      {new Date(item.nextApplicationDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* ══════════════════════════════════════════
                    NUEVO: Botón Ver Detalle
                    ══════════════════════════════════════════ */}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={(e) => handleOpenDetail(item, e)}
                    className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-bold text-sm flex items-center gap-1 transition-colors"
                  >
                    Ver Detalle <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Modal Crear/Editar */}
      <CreateDewormingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={patient}
        dewormingToEdit={editItem}
      />

      {/* ══════════════════════════════════════════
          NUEVO: Modal Ver Detalle
          ══════════════════════════════════════════ */}
      <DewormingDetailModal
        isOpen={!!dewormingToView}
        onClose={() => setDewormingToView(null)}
        deworming={dewormingToView}
        triggerRect={triggerRect}
      />

      {/* Modal Eliminar */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Eliminar Desparasitación"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        variant="danger"
        confirmText="Eliminar"
        isLoading={deleteMutation.isPending}
      />
    </TimelineLayout>
  );
}