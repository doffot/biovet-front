import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { getDewormingsByPatient, deleteDeworming } from "@/api/dewormingAPI";
import {
  Check,
  AlertCircle,
  Loader2,
  Bug,
  Shield,
  Trash2,
  Pencil,
  Syringe,
  Home,
  Building2,
  PlusCircleIcon,
} from "lucide-react";
import type { Patient } from "@/types/patient";
import type { Deworming } from "@/types/deworming";
import CreateDewormingModal from "@/components/deworming/CreateDewormingModal";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function DewormingView() {
  const contextData = useOutletContext<any>();
  const patient: Patient = contextData.patient || contextData;
  const queryClient = useQueryClient();

  // Estados
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Deworming | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Query
  const { data: dewormings = [], isLoading } = useQuery({
    queryKey: ["dewormings", patient._id],
    queryFn: () => getDewormingsByPatient(patient._id),
    enabled: !!patient._id,
  });

  // Mutación Eliminar
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

  // Handlers
  const handleOpenCreate = () => {
    setEditItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Deworming) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  // Utils
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(dateStr));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const sortedDewormings = [...dewormings].sort(
    (a, b) =>
      new Date(b.applicationDate).getTime() -
      new Date(a.applicationDate).getTime()
  );

  const getStyle = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("interna"))
      return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200";
    if (t.includes("externa") || t.includes("pipeta"))
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200";
    return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200";
  };

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("externa") || t.includes("pipeta"))
      return <Shield size={16} strokeWidth={2.5} />;
    if (t.includes("inyectable")) return <Syringe size={16} strokeWidth={2.5} />;
    return <Bug size={16} strokeWidth={2.5} />;
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
        <div className="sticky top-0 lg:static z-40 bg-violet-50 dark:bg-dark-200 border-b border-surface-200 dark:border-dark-100 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Desparasitaciones
                </p>
              </div>
              <h1 className="hidden lg:block text-xl font-bold font-heading text-slate-800 dark:text-white">
                Control de Desparasitación
              </h1>
            </div>
            <button
              onClick={handleOpenCreate}
              className="btn-primary shadow-lg  active:scale-95 transition-transform xs:rounded-full  w-10 h-10 lg:w-auto lg:h-auto p-0 lg:px-3 lg:py-2.5 flex items-center justify-center gap-2"
            >
              <PlusCircleIcon size={20} />
              <span className="hidden lg:inline font-semibold ">
                Agregar
              </span>
            </button>
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-4 pb-24">
          <div className="max-w-3xl mx-auto relative pl-4 lg:pl-0">
            <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-dark-100 z-0"></div>

            <div className="space-y-6 relative">
              {sortedDewormings.length === 0 ? (
                <div className="text-center py-20 ml-10 border-2 border-dashed border-slate-200 dark:border-dark-100 rounded-2xl">
                  <Bug className="w-12 h-12 mx-auto text-slate-300 mb-2 opacity-50" />
                  <p className="text-slate-400 font-medium">
                    No hay desparasitaciones registradas
                  </p>
                </div>
              ) : (
                sortedDewormings.map((item) => {
                  const isPending =
                    item.nextApplicationDate &&
                    new Date(item.nextApplicationDate) > new Date();
                  const style = getStyle(item.dewormingType);

                  return (
                    <div
                      key={item._id}
                      className="relative flex items-start gap-5 group"
                    >
                      {/* Icono */}
                      <div
                        className={`shrink-0 relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-surface-50 dark:border-dark-300 shadow-sm ${style}`}
                      >
                        {getIcon(item.dewormingType)}
                      </div>

                      {/* Tarjeta */}
                      <div className="flex-1 min-w-0">
                        <div className="bg-white dark:bg-dark-200 p-4 rounded-2xl rounded-tl-sm shadow-sm border border-surface-200 dark:border-dark-100 hover:shadow-md transition-all duration-200 relative">
                          {/* Acciones */}
                          <div className="absolute top-3 right-3 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 text-slate-400 hover:text-biovet-600 hover:bg-biovet-50 dark:hover:bg-dark-100 rounded-lg transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteId(item._id!)}
                              className="p-1.5 text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Info */}
                          <div className="mb-2 pr-14">
                            <h3 className="font-bold text-slate-800 dark:text-white text-base leading-tight">
                              {item.productName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style}`}
                              >
                                {item.dewormingType}
                              </span>

                              {/* Badge de Origen - Sincronizado con el Modelo */}
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                  item.source === "Interno"
                                    ? "bg-biovet-50 text-biovet-700 dark:bg-biovet-900/30 dark:text-biovet-400 border border-biovet-100 dark:border-biovet-900/50"
                                    : "bg-slate-100 text-slate-600 dark:bg-dark-100 dark:text-slate-400 border border-slate-200 dark:border-dark-50"
                                }`}
                              >
                                {item.source === "Interno" ? (
                                  <Building2 size={10} />
                                ) : (
                                  <Home size={10} />
                                )}
                                {item.source}
                              </span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <span className="text-[11px] font-mono text-slate-500 bg-surface-50 dark:bg-dark-100 px-2 py-0.5 rounded-md border border-surface-100 dark:border-dark-50 inline-block">
                              Aplicada: {formatDate(item.applicationDate)}
                            </span>
                          </div>

                          {/* Detalles */}
                          <div className="flex flex-wrap gap-2 mb-3 text-xs">
                            {item.dose && (
                              <span className="text-slate-600 dark:text-slate-300 bg-surface-50 dark:bg-dark-100 px-1.5 py-0.5 rounded border border-surface-200 dark:border-dark-50">
                                Dosis: {item.dose}
                              </span>
                            )}
                            {item.cost > 0 ? (
                              <span className="font-mono text-biovet-600 dark:text-biovet-400 bg-biovet-50 dark:bg-biovet-900/20 px-1.5 py-0.5 rounded border border-biovet-100 dark:border-biovet-900/30">
                                {formatCurrency(item.cost)}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic bg-slate-50 dark:bg-dark-100 px-1.5 py-0.5 rounded border border-slate-100 dark:border-dark-50">
                                Sin costo
                              </span>
                            )}
                          </div>

                          {/* Footer */}
                          {item.nextApplicationDate && (
                            <div className="flex items-center justify-between pt-3 border-t border-dashed border-surface-100 dark:border-dark-100">
                              <span
                                className={`text-xs font-bold flex items-center gap-1.5 ${
                                  isPending
                                    ? "text-warning-600"
                                    : "text-success-600"
                                }`}
                              >
                                {isPending ? (
                                  <>
                                    <AlertCircle size={14} /> Próxima:{" "}
                                    {formatDate(item.nextApplicationDate)}
                                  </>
                                ) : (
                                  <>
                                    <Check size={14} /> Ciclo Completado
                                  </>
                                )}
                              </span>
                            </div>
                          )}
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

      <CreateDewormingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={patient}
        dewormingToEdit={editItem}
      />

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
        title="Eliminar Desparasitación"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        variant="danger"
        confirmText="Eliminar"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}