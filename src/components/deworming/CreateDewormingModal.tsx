import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  X,
  Building2,
  Home,
  Beaker,
  Package,
  Calendar,
  Syringe,
} from "lucide-react";
import { createDeworming, updateDeworming } from "@/api/dewormingAPI";
import { getActiveProducts } from "@/api/productAPI";
import { toast } from "@/components/Toast";

import type { Patient } from "@/types/patient";
import type { Deworming, DewormingFormData } from "@/types/deworming";
import type { Product } from "@/types/product";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  dewormingToEdit?: Deworming | null;
}

const DEWORMING_TYPES = ["Interna", "Externa", "Ambas"] as const;

export default function CreateDewormingModal({
  isOpen,
  onClose,
  patient,
  dewormingToEdit,
}: Props) {
  const queryClient = useQueryClient();
  const isEditing = !!dewormingToEdit;

  const { register, handleSubmit, watch, setValue } =
    useForm<DewormingFormData>({
      defaultValues: {
        applicationDate: new Date().toISOString().split("T")[0],
        source: "Interno",
        dewormingType: "Interna",
        productName: "",
        dose: "",
        cost: 0,
        productId: "",
        isFullUnit: true,
        quantity: 1,
      },
    });

  const watchedSource = watch("source");
  const watchedProductId = watch("productId");
  const isInternal = watchedSource === "Interno";
  const watchedIsFullUnit = watch("isFullUnit");
  const watchedQuantity = watch("quantity") || 1;

  // Lógica de productos internos
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products", "active"],
    queryFn: getActiveProducts,
    enabled: isOpen && isInternal,
  });
  const dewormingProducts = products.filter(
    (p) => p.category === "desparasitante",
  );

  // EFECTO: Si es Externo, bloquear y resetear costo
  useEffect(() => {
    if (!isInternal) {
      setValue("cost", 0);
      setValue("productId", "");
    }
  }, [isInternal, setValue]);

  // Autocompletado de precios (Solo si es Interno)
  useEffect(() => {
    if (isInternal && watchedProductId) {
      const prod = dewormingProducts.find((p) => p._id === watchedProductId);
      if (prod) {
        setValue("productName", prod.name);
        const basePrice = watchedIsFullUnit
          ? prod.salePrice || 0
          : prod.salePricePerDose || 0;
        setValue("cost", basePrice * watchedQuantity);
        if (!isEditing)
          setValue(
            "dose",
            `${watchedQuantity} ${watchedIsFullUnit ? prod.unit : prod.doseUnit}`,
          );
      }
    }
  }, [
    watchedProductId,
    isInternal,
    watchedIsFullUnit,
    watchedQuantity,
    dewormingProducts,
    setValue,
    isEditing,
  ]);

  const { mutate: handleSave, isPending } = useMutation({
    mutationFn: (data: DewormingFormData) =>
      isEditing
        ? updateDeworming(dewormingToEdit!._id, data)
        : createDeworming(patient._id, data),
    onSuccess: () => {
      toast.success(
        isEditing ? "Actualizado" : "Guardado",
        "Registro procesado con éxito",
      );
      queryClient.invalidateQueries({ queryKey: ["dewormings", patient._id] });
      onClose();
    },
    onError: (e: any) => toast.error("Error", e.message),
  });

  const onSubmit = (data: DewormingFormData) => {
    if (isInternal && !data.productId) {
      return toast.warning("Atención", "Selecciona un producto del inventario");
    }
    handleSave({
      ...data,
      cost: isInternal ? Number(data.cost) : 0, // Forzar 0 si es externo
      quantity: Number(data.quantity),
      productId: isInternal ? data.productId : undefined,
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-200 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-dark-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${isInternal ? "bg-biovet-50 text-biovet-600" : "bg-warning-50 text-warning-600"}`}
            >
              <Syringe size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {isEditing ? "Editar" : "Nueva"} Desparasitación
              </h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Paciente: {patient.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-dark-100 rounded-xl transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-y-auto p-6 space-y-6"
        >
          {/* Selector de Origen */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setValue("source", "Interno")}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${isInternal ? "border-biovet-500 bg-biovet-50/50" : "border-slate-100 opacity-60"}`}
            >
              <Building2
                className={isInternal ? "text-biovet-600" : "text-slate-400"}
              />
              <div className="text-left">
                <p
                  className={`font-bold text-sm ${isInternal ? "text-biovet-700" : "text-slate-500"}`}
                >
                  Interno
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Stock Clínica
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setValue("source", "Externo")}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${!isInternal ? "border-warning-500 bg-warning-50/50" : "border-slate-100 opacity-60"}`}
            >
              <Home
                className={!isInternal ? "text-warning-600" : "text-slate-400"}
              />
              <div className="text-left">
                <p
                  className={`font-bold text-sm ${!isInternal ? "text-warning-700" : "text-slate-500"}`}
                >
                  Externo
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Fuera de Clínica
                </p>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">
                  Tipo de aplicación
                </label>
                <select
                  {...register("dewormingType")}
                  className="w-full bg-slate-50 dark:bg-dark-300 border-none rounded-xl p-3 text-sm dark:text-white"
                >
                  {DEWORMING_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {isInternal ? (
                <div className="p-4 bg-biovet-50/30 dark:bg-dark-300 rounded-2xl border border-biovet-100 space-y-3">
                  <label className="text-[11px] font-bold text-biovet-600 uppercase block">
                    Producto en Inventario
                  </label>
                  <select
                    {...register("productId")}
                    className="w-full bg-white dark:bg-dark-200 border-slate-200 rounded-lg p-2.5 text-sm dark:text-white"
                  >
                    <option value="">Seleccionar producto...</option>
                    {dewormingProducts.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.stockUnits} unid.)
                      </option>
                    ))}
                  </select>

                  <div className="flex bg-white dark:bg-dark-200 p-1 rounded-lg border border-slate-100">
                    <button
                      type="button"
                      onClick={() => setValue("isFullUnit", true)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${watchedIsFullUnit ? "bg-biovet-500 text-white shadow-sm" : "text-slate-400"}`}
                    >
                      <Package size={14} /> Unidad
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("isFullUnit", false)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${!watchedIsFullUnit ? "bg-biovet-500 text-white shadow-sm" : "text-slate-400"}`}
                    >
                      <Beaker size={14} /> Dosis
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">
                    Nombre del Producto (Externo)
                  </label>
                  <input
                    {...register("productName")}
                    placeholder="Ej. Bravecto comprado fuera"
                    className="w-full bg-slate-50 dark:bg-dark-300 border-none rounded-xl p-3 text-sm dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">
                    Fecha
                  </label>
                  <input
                    type="date"
                    {...register("applicationDate")}
                    className="w-full bg-slate-50 dark:bg-dark-300 border-none rounded-xl p-3 text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register("quantity")}
                    className="w-full bg-slate-50 dark:bg-dark-300 border-none rounded-xl p-3 text-sm dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">
                  Dosis e Instrucciones
                </label>
                <input
                  {...register("dose")}
                  placeholder="Ej. 1 tableta masticable"
                  className="w-full bg-slate-50 dark:bg-dark-300 border-none rounded-xl p-3 text-sm dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-biovet-600 uppercase mb-1.5  flex items-center gap-2">
                  <Calendar size={12} /> Próxima Cita
                </label>
                <input
                  type="date"
                  {...register("nextApplicationDate")}
                  className="w-full bg-biovet-50/50 dark:bg-biovet-900/10 border-biovet-100 rounded-xl p-3 text-sm dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Costo: Bloqueado si es Externo */}
          <div
            className={`flex items-center justify-between p-4 rounded-2xl transition-colors ${isInternal ? "bg-slate-50 dark:bg-dark-300/50" : "bg-orange-50/50 opacity-80"}`}
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Costo total
              </span>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-lg font-black ${isInternal ? "text-biovet-600" : "text-slate-400"}`}
                >
                  $
                </span>
                <input
                  type="number"
                  {...register("cost")}
                  readOnly={!isInternal}
                  className={`bg-transparent border-none p-0 text-xl font-black w-24 focus:ring-0 ${isInternal ? "text-biovet-600" : "text-slate-400 cursor-not-allowed"}`}
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic max-w-50 text-right">
              {isInternal
                ? "* Se generará una factura automática y se descontará del inventario."
                : "* Aplicación externa: No se genera factura ni afecta el inventario."}
            </p>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white dark:bg-dark-200">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex items-center gap-2"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="btn-primary flex items-center gap-2"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} /> {isEditing ? "Actualizar" : "Guardar"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
