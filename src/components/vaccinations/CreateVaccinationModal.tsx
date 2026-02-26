import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  X,
  Building2,
  Home,
  Package,
  Calendar,
  Syringe,
  DollarSign,
  Clock,
  FlaskConical,
  FileText,
} from "lucide-react";
import { createVaccination, updateVaccination } from "@/api/vaccinationAPI";
import { getActiveProducts } from "@/api/productAPI";
import { toast } from "@/components/Toast";

import type { Patient } from "@/types/patient";
import type { Vaccination, VaccinationFormData } from "@/types/vaccination";
import type { Product } from "@/types/product";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  vaccinationToEdit?: Vaccination | null;
}

const VACCINE_TYPES = [
  "Antirrábica",
  "Parvovirus",
  "Parvovirus y Moquillo",
  "Triple Canina",
  "Tos de Perrera",
  "Quíntuple",
  "Séxtuple",
  "Quíntuple Felina",
  "Triple Felina",
  "Otra",
];

interface FormValues {
  vaccinationDate: string;
  vaccineType: string;
  customVaccineName: string;
  source: "internal" | "external";
  productId: string;
  cost: number;
  nextVaccinationDate: string;
  laboratory: string;
  batchNumber: string;
  expirationDate: string;
  observations: string;
}

export default function CreateVaccinationModal({
  isOpen,
  onClose,
  patient,
  vaccinationToEdit,
}: Props) {
  const queryClient = useQueryClient();
  const isEditing = !!vaccinationToEdit;

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      vaccinationDate: new Date().toISOString().split("T")[0],
      vaccineType: "",
      customVaccineName: "",
      source: "internal",
      productId: "",
      cost: 0,
      nextVaccinationDate: "",
      laboratory: "",
      batchNumber: "",
      expirationDate: "",
      observations: "",
    },
  });

  const watchedSource = watch("source");
  const watchedProductId = watch("productId");
  const watchedVaccineType = watch("vaccineType");
  const watchedDate = watch("vaccinationDate");
  const isInternal = watchedSource === "internal";

  // Helpers
  const isPuppy = () => {
    if (!patient.birthDate) return false;
    const birth = new Date(patient.birthDate);
    const now = new Date();
    return (
      (now.getFullYear() - birth.getFullYear()) * 12 +
        (now.getMonth() - birth.getMonth()) <
      12
    );
  };

  const calculateNextDose = (fromDate: string) => {
    if (!fromDate) return "";
    const date = new Date(fromDate);
    if (isPuppy()) date.setDate(date.getDate() + 21);
    else date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split("T")[0];
  };

  // Query productos
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products", "active"],
    queryFn: getActiveProducts,
    enabled: isOpen && isInternal,
  });

  const vaccineProducts = products.filter((p) => p.category === "vacuna");

  // Reset cuando cambia a externo
  useEffect(() => {
    if (!isInternal) {
      setValue("cost", 0);
      setValue("productId", "");
      // Calcular próxima dosis automáticamente
      if (watchedDate) {
        setValue("nextVaccinationDate", calculateNextDose(watchedDate));
      }
    }
  }, [isInternal, watchedDate, setValue]);

  // Calcular costo cuando selecciona producto
  useEffect(() => {
    if (isInternal && watchedProductId) {
      const product = vaccineProducts.find((p) => p._id === watchedProductId);
      if (product) {
        setValue("cost", product.salePrice || 0);
      }
    }
  }, [watchedProductId, isInternal, vaccineProducts, setValue]);

  // Reset formulario cuando abre/cierra
  useEffect(() => {
    if (isOpen) {
      if (vaccinationToEdit) {
        const typeExists = VACCINE_TYPES.includes(vaccinationToEdit.vaccineType);
        let pId = "";
        if (vaccinationToEdit.productId) {
          pId =
            typeof vaccinationToEdit.productId === "object"
              ? (vaccinationToEdit.productId as any)._id
              : vaccinationToEdit.productId;
        }

        reset({
          vaccinationDate: vaccinationToEdit.vaccinationDate.toString().split("T")[0],
          vaccineType: typeExists ? vaccinationToEdit.vaccineType : "Otra",
          customVaccineName: typeExists ? "" : vaccinationToEdit.vaccineType,
          source: vaccinationToEdit.source,
          productId: pId,
          cost: vaccinationToEdit.cost || 0,
          nextVaccinationDate: vaccinationToEdit.nextVaccinationDate
            ? vaccinationToEdit.nextVaccinationDate.toString().split("T")[0]
            : "",
          laboratory: vaccinationToEdit.laboratory || "",
          batchNumber: vaccinationToEdit.batchNumber || "",
          expirationDate: vaccinationToEdit.expirationDate
            ? vaccinationToEdit.expirationDate.toString().split("T")[0]
            : "",
          observations: vaccinationToEdit.observations || "",
        });
      } else {
        reset({
          vaccinationDate: new Date().toISOString().split("T")[0],
          vaccineType: "",
          customVaccineName: "",
          source: "internal",
          productId: "",
          cost: 0,
          nextVaccinationDate: "",
          laboratory: "",
          batchNumber: "",
          expirationDate: "",
          observations: "",
        });
      }
    }
  }, [isOpen, vaccinationToEdit, reset]);

  // Mutación
  const { mutate: handleSave, isPending } = useMutation({
    mutationFn: (data: VaccinationFormData & { productId?: string }) =>
      isEditing
        ? updateVaccination(vaccinationToEdit!._id!, data)
        : createVaccination(patient._id, data),
    onSuccess: () => {
      toast.success(
        isEditing ? "Actualizado" : "Guardado",
        "Vacuna registrada correctamente"
      );
      queryClient.invalidateQueries({ queryKey: ["vaccinations", patient._id] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "all"] });
      onClose();
    },
    onError: (e: Error) => toast.error("Error", e.message),
  });

  // Submit
  const onSubmit = (data: FormValues) => {
    // Validaciones
    if (!data.vaccineType) {
      return toast.warning("Requerido", "Selecciona el tipo de vacuna");
    }

    if (data.vaccineType === "Otra" && !data.customVaccineName?.trim()) {
      return toast.warning("Requerido", "Especifica el nombre de la vacuna");
    }

    if (isInternal) {
      if (!data.productId) {
        return toast.warning("Requerido", "Selecciona un producto del inventario");
      }
      if (!data.nextVaccinationDate) {
        return toast.warning("Requerido", "Define la fecha de próxima dosis");
      }
    }

    const finalVaccineType =
      data.vaccineType === "Otra" ? data.customVaccineName : data.vaccineType;

    handleSave({
      vaccinationDate: data.vaccinationDate,
      vaccineType: finalVaccineType,
      source: data.source,
      cost: isInternal ? Number(data.cost) : 0,
      nextVaccinationDate: data.nextVaccinationDate || undefined,
      laboratory: data.laboratory || undefined,
      batchNumber: data.batchNumber || undefined,
      expirationDate: data.expirationDate || undefined,
      observations: data.observations || undefined,
      productId: isInternal ? data.productId : undefined,
    });
  };

  if (!isOpen) return null;

  // Obtener precio del producto seleccionado para mostrar
  const selectedProductPrice = vaccineProducts.find(
    (p) => p._id === watchedProductId
  )?.salePrice;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-200 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-dark-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isInternal
                  ? "bg-biovet-50 text-biovet-600"
                  : "bg-warning-50 text-warning-600"
              }`}
            >
              <Syringe size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {isEditing ? "Editar" : "Nueva"} Vacunación
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
              onClick={() => setValue("source", "internal")}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                isInternal
                  ? "border-biovet-500 bg-biovet-50/50"
                  : "border-slate-100 opacity-60"
              }`}
            >
              <Building2
                className={isInternal ? "text-biovet-600" : "text-slate-400"}
              />
              <div className="text-left">
                <p
                  className={`font-bold text-sm ${
                    isInternal ? "text-biovet-700" : "text-slate-500"
                  }`}
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
              onClick={() => setValue("source", "external")}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                !isInternal
                  ? "border-warning-500 bg-warning-50/50"
                  : "border-slate-100 opacity-60"
              }`}
            >
              <Home
                className={!isInternal ? "text-warning-600" : "text-slate-400"}
              />
              <div className="text-left">
                <p
                  className={`font-bold text-sm ${
                    !isInternal ? "text-warning-700" : "text-slate-500"
                  }`}
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
            {/* Columna Izquierda */}
            <div className="space-y-4">
              {/* Tipo de Vacuna */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">
                  <Syringe size={12} className="inline mr-1" />
                  Tipo de Vacuna <span className="text-danger-500">*</span>
                </label>
                <select
                  {...register("vaccineType")}
                  className="w-full bg-slate-50 dark:bg-dark-300 border-none rounded-xl p-3 text-sm dark:text-white"
                >
                  <option value="">-- Seleccionar tipo --</option>
                  {VACCINE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nombre personalizado si es "Otra" */}
              {watchedVaccineType === "Otra" && (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">
                    Especificar Vacuna <span className="text-danger-500">*</span>
                  </label>
                  <input
                    {...register("customVaccineName")}
                    placeholder="Nombre de la vacuna"
                    className="w-full bg-slate-50 dark:bg-dark-300 border-none rounded-xl p-3 text-sm dark:text-white"
                  />
                </div>
              )}

              {/* Producto del inventario (solo interno) */}
              {isInternal && (
                <div className="p-4 bg-biovet-50/30 dark:bg-dark-300 rounded-2xl border border-biovet-100 space-y-3">
                  <label className="text-[11px] font-bold text-biovet-600 uppercase block">
                    <Package size={12} className="inline mr-1" />
                    Producto en Inventario <span className="text-danger-500">*</span>
                  </label>
                  <select
                    {...register("productId")}
                    className="w-full bg-white dark:bg-dark-200 border-slate-200 rounded-lg p-2.5 text-sm dark:text-white"
                  >
                    <option value="">Seleccionar producto...</option>
                    {vaccineProducts.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.stockUnits} unid.) — ${p.salePrice}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Fecha de aplicación */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">
                  <Calendar size={12} className="inline mr-1" />
                  Fecha de Aplicación <span className="text-danger-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("vaccinationDate")}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full bg-slate-50 dark:bg-dark-300 border-none rounded-xl p-3 text-sm dark:text-white"
                />
              </div>

              {/* Próxima dosis */}
              <div>
                <label className="text-[11px] font-bold text-biovet-600 uppercase mb-1.5 flex items-center gap-2">
                  <Clock size={12} />
                  Próxima Dosis {isInternal && <span className="text-danger-500">*</span>}
                  {!isInternal && (
                    <span className="text-slate-400 font-normal">
                      (Auto: {isPuppy() ? "+21 días" : "+1 año"})
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  {...register("nextVaccinationDate")}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-biovet-50/50 dark:bg-biovet-900/10 border-biovet-100 rounded-xl p-3 text-sm dark:text-white"
                  readOnly={!isInternal}
                />
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              {/* Laboratorio */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">
                  <FlaskConical size={12} className="inline mr-1" />
                  Laboratorio
                </label>
                <input
                  {...register("laboratory")}
                  placeholder="Ej. Zoetis, MSD, etc."
                  className="w-full bg-slate-50 dark:bg-dark-300 border-none rounded-xl p-3 text-sm dark:text-white"
                />
              </div>

              {/* Lote y Vencimiento */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">
                    Número de Lote
                  </label>
                  <input
                    {...register("batchNumber")}
                    placeholder="Lote"
                    className="w-full bg-slate-50 dark:bg-dark-300 border-none rounded-xl p-3 text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">
                    Vencimiento
                  </label>
                  <input
                    type="date"
                    {...register("expirationDate")}
                    className="w-full bg-slate-50 dark:bg-dark-300 border-none rounded-xl p-3 text-sm dark:text-white"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">
                  <FileText size={12} className="inline mr-1" />
                  Observaciones
                </label>
                <textarea
                  {...register("observations")}
                  placeholder="Notas adicionales..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-dark-300 border-none rounded-xl p-3 text-sm dark:text-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Costo */}
          <div
            className={`flex items-center justify-between p-4 rounded-2xl transition-colors ${
              isInternal
                ? "bg-slate-50 dark:bg-dark-300/50"
                : "bg-orange-50/50 opacity-80"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                <DollarSign size={10} className="inline" /> Costo total
              </span>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-lg font-black ${
                    isInternal ? "text-biovet-600" : "text-slate-400"
                  }`}
                >
                  $
                </span>
                <span
                  className={`text-xl font-black ${
                    isInternal ? "text-biovet-600" : "text-slate-400"
                  }`}
                >
                  {isInternal ? selectedProductPrice || 0 : 0}
                </span>
                <input type="hidden" {...register("cost", { valueAsNumber: true })} />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic max-w-50 text-right">
              {isInternal
                ? "* Se descontará del inventario automáticamente."
                : "* Aplicación externa: No afecta el inventario."}
            </p>
          </div>
        </form>

        {/* Footer */}
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
    document.body
  );
}