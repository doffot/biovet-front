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

  // Reset formulario
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

  const selectedProductPrice = vaccineProducts.find(
    (p) => p._id === watchedProductId
  )?.salePrice;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-200 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-surface-200 dark:border-dark-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-200 dark:border-dark-100 flex justify-between items-center bg-surface-50 dark:bg-dark-300">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isInternal
                  ? "bg-biovet-100 text-biovet-600 dark:bg-biovet-950 dark:text-biovet-400"
                  : "bg-warning-100 text-warning-600 dark:bg-warning-950 dark:text-warning-400"
              }`}
            >
              <Syringe size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-slate-800 dark:text-white">
                {isEditing ? "Editar" : "Nueva"} Vacunación
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Paciente: <span className="text-biovet-600 dark:text-biovet-400">{patient.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-100 dark:hover:bg-dark-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          {/* Selector de Origen */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue("source", "internal")}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                isInternal
                  ? "border-biovet-500 bg-biovet-50 dark:bg-biovet-950/50 dark:border-biovet-400"
                  : "border-surface-200 dark:border-dark-100 hover:border-surface-300 dark:hover:border-dark-50"
              }`}
            >
              <Building2
                size={20}
                className={isInternal ? "text-biovet-600 dark:text-biovet-400" : "text-slate-400"}
              />
              <div className="text-left">
                <p
                  className={`font-semibold text-sm ${
                    isInternal ? "text-biovet-700 dark:text-biovet-300" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Interno
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-medium tracking-wide">
                  Stock Clínica
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setValue("source", "external")}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                !isInternal
                  ? "border-warning-500 bg-warning-50 dark:bg-warning-950/50 dark:border-warning-400"
                  : "border-surface-200 dark:border-dark-100 hover:border-surface-300 dark:hover:border-dark-50"
              }`}
            >
              <Home
                size={20}
                className={!isInternal ? "text-warning-600 dark:text-warning-400" : "text-slate-400"}
              />
              <div className="text-left">
                <p
                  className={`font-semibold text-sm ${
                    !isInternal ? "text-warning-700 dark:text-warning-300" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Externo
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-medium tracking-wide">
                  Fuera de Clínica
                </p>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda */}
            <div className="space-y-4">
              {/* Tipo de Vacuna */}
              <div>
                <label className="label flex items-center gap-1.5">
                  <Syringe size={14} className="text-slate-400" />
                  Tipo de Vacuna <span className="text-danger-500">*</span>
                </label>
                <select {...register("vaccineType")} className="input">
                  <option value="">-- Seleccionar tipo --</option>
                  {VACCINE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nombre personalizado */}
              {watchedVaccineType === "Otra" && (
                <div>
                  <label className="label">
                    Especificar Vacuna <span className="text-danger-500">*</span>
                  </label>
                  <input
                    {...register("customVaccineName")}
                    placeholder="Nombre de la vacuna"
                    className="input"
                  />
                </div>
              )}

              {/* Producto del inventario */}
              {isInternal && (
                <div className="p-4 bg-biovet-50 dark:bg-biovet-950/30 rounded-xl border border-biovet-200 dark:border-biovet-800">
                  <label className="label flex items-center gap-1.5 text-biovet-700 dark:text-biovet-300">
                    <Package size={14} />
                    Producto en Inventario <span className="text-danger-500">*</span>
                  </label>
                  <select {...register("productId")} className="input">
                    <option value="">-- Seleccionar producto --</option>
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
                <label className="label flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  Fecha de Aplicación <span className="text-danger-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("vaccinationDate")}
                  max={new Date().toISOString().split("T")[0]}
                  className="input"
                />
              </div>

              {/* Próxima dosis */}
              <div>
                <label className="label flex items-center gap-1.5">
                  <Clock size={14} className="text-biovet-500" />
                  <span className="text-biovet-700 dark:text-biovet-300">Próxima Dosis</span>
                  {isInternal && <span className="text-danger-500">*</span>}
                  {!isInternal && (
                    <span className="text-slate-400 text-xs font-normal ml-1">
                      (Auto: {isPuppy() ? "+21 días" : "+1 año"})
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  {...register("nextVaccinationDate")}
                  min={new Date().toISOString().split("T")[0]}
                  className={`input ${!isInternal ? "bg-surface-100 dark:bg-dark-300 cursor-not-allowed" : ""}`}
                  readOnly={!isInternal}
                />
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              {/* Laboratorio */}
              <div>
                <label className="label flex items-center gap-1.5">
                  <FlaskConical size={14} className="text-slate-400" />
                  Laboratorio
                </label>
                <input
                  {...register("laboratory")}
                  placeholder="Ej. Zoetis, MSD, etc."
                  className="input"
                />
              </div>

              {/* Lote y Vencimiento */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Número de Lote</label>
                  <input
                    {...register("batchNumber")}
                    placeholder="Lote"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Vencimiento</label>
                  <input
                    type="date"
                    {...register("expirationDate")}
                    className="input"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="label flex items-center gap-1.5">
                  <FileText size={14} className="text-slate-400" />
                  Observaciones
                </label>
                <textarea
                  {...register("observations")}
                  placeholder="Notas adicionales..."
                  rows={4}
                  className="input resize-none"
                />
              </div>
            </div>
          </div>

          {/* Costo */}
          <div
  className={`flex items-center justify-between p-4 rounded-xl border ${
    isInternal
      ? "bg-biovet-50 dark:bg-biovet-950/30 border-biovet-200 dark:border-biovet-800"
      : "bg-surface-100 dark:bg-dark-300 border-surface-200 dark:border-dark-100"
  }`}
>
  <div className="flex flex-col">
    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide flex items-center gap-1">
      <DollarSign size={12} />
      Costo total
    </span>
    <div className="flex items-baseline gap-0.5 mt-1">
      <span
        className={`text-2xl font-bold font-heading ${
          isInternal ? "text-biovet-600 dark:text-biovet-400" : "text-slate-400"
        }`}
      >
        ${isInternal ? selectedProductPrice || 0 : 0}
      </span>
      <span className="text-xs text-slate-400 ml-1">USD</span>
    </div>
    <input type="hidden" {...register("cost", { valueAsNumber: true })} />
  </div>
  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-50 text-right leading-relaxed">
    {isInternal
      ? "Se descontará del inventario automáticamente."
      : "Aplicación externa: No afecta el inventario."}
  </p>
</div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-200 dark:border-dark-100 flex justify-end gap-3 bg-surface-50 dark:bg-dark-300">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="btn-primary"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span>{isPending ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}