import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { createVaccination, updateVaccination } from "@/api/vaccinationAPI";
import { getActiveProducts } from "@/api/productAPI";
import { toast } from "@/components/Toast";
import type { Vaccination, VaccinationFormData } from "@/types/vaccination";
import type { Patient } from "@/types/patient";

import { VaccinationModalHeader } from "./modal/VaccinationModalHeader";
import { VaccinationSourceSelector } from "./modal/VaccinationSourceSelector";
import { VaccinationMainForm } from "./modal/VaccinationMainForm";
import { VaccinationDetailsForm } from "./modal/VaccinationDetailsForm";
import type { VaccinationFormValues } from "./modal/formSchema";

const VACCINE_TYPES = [
  "Antirrábica", "Parvovirus", "Parvovirus y Moquillo", "Triple Canina",
  "Tos de Perrera", "Quíntuple", "Séxtuple", "Quíntuple Felina",
  "Triple Felina", "Otra",
];

interface CreateVaccinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  vaccinationToEdit?: Vaccination | null;
}

export default function CreateVaccinationModal({
  isOpen,
  onClose,
  patient,
  vaccinationToEdit,
}: CreateVaccinationModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!vaccinationToEdit;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<VaccinationFormValues>({
    defaultValues: {
      vaccinationDate: new Date().toISOString().split("T")[0],
      source: "internal",
      cost: 0,
      vaccineType: "",
      productId: "",
    },
  });

  const watchedSource = watch("source");
  const watchedProductId = watch("productId");
  const watchedVaccineType = watch("vaccineType");
  const watchedDate = watch("vaccinationDate");
  const isInternal = watchedSource === "internal";

  const isPuppy = () => {
    if (!patient.birthDate) return false;
    const birth = new Date(patient.birthDate);
    const now = new Date();
    return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()) < 12;
  };

  const calculateNextDose = (fromDate: string) => {
    if (!fromDate) return "";
    const date = new Date(fromDate);
    if (isPuppy()) date.setDate(date.getDate() + 21);
    else date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split("T")[0];
  };

  const { data: products = [] } = useQuery({
    queryKey: ["products", "active"],
    queryFn: getActiveProducts,
    enabled: isOpen,
  });
  
  const vaccineProducts = products.filter((p) => p.category === "vacuna");

  useEffect(() => {
    if (isOpen) {
      if (vaccinationToEdit) {
        const typeExists = VACCINE_TYPES.includes(vaccinationToEdit.vaccineType);
        let pId = "";
        if (vaccinationToEdit.productId) {
           pId = typeof vaccinationToEdit.productId === 'object' 
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
          laboratory: vaccinationToEdit.laboratory || "",
          batchNumber: vaccinationToEdit.batchNumber || "",
          expirationDate: vaccinationToEdit.expirationDate ? vaccinationToEdit.expirationDate.toString().split("T")[0] : "",
          nextVaccinationDate: vaccinationToEdit.nextVaccinationDate ? vaccinationToEdit.nextVaccinationDate.toString().split("T")[0] : "",
          observations: vaccinationToEdit.observations || "",
        });
      } else {
        reset({
          vaccinationDate: new Date().toISOString().split("T")[0],
          source: "internal",
          cost: 0,
          vaccineType: "",
          productId: "",
          customVaccineName: "",
          nextVaccinationDate: "",
        });
      }
    }
  }, [isOpen, vaccinationToEdit, reset]);

  // CORRECCIÓN PARA PRODUCCIÓN: Llenado de precio
  useEffect(() => {
    if (isInternal && watchedProductId && vaccineProducts.length > 0) {
      const product = vaccineProducts.find((p) => String(p._id) === String(watchedProductId));
      if (product) {
        setValue("cost", product.salePrice);
      }
    }
  }, [watchedProductId, isInternal, vaccineProducts, setValue]);

  useEffect(() => {
    if (!isInternal && watchedDate) {
      const nextDate = calculateNextDose(watchedDate);
      setValue("nextVaccinationDate", nextDate);
    }
  }, [watchedDate, isInternal, setValue]);

  const handleSuccess = (action: string) => {
    toast.success(`Vacuna ${action}`, `Registro procesado correctamente.`);
    queryClient.invalidateQueries({ queryKey: ["vaccinations", patient._id] });
    queryClient.invalidateQueries({ queryKey: ["inventory", "all"] });
    onClose();
  };
  const handleError = (error: Error) => toast.error("Error", error.message);

  const createMutation = useMutation({
    mutationFn: (data: VaccinationFormData & { productId?: string }) => 
      createVaccination(patient._id, data),
    onSuccess: () => handleSuccess("creada"),
    onError: handleError,
  });

  const updateMutation = useMutation({
    mutationFn: (data: VaccinationFormData & { productId?: string }) => 
      updateVaccination(vaccinationToEdit!._id!, data),
    onSuccess: () => handleSuccess("actualizada"),
    onError: handleError,
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: VaccinationFormValues) => {
    if (!data.vaccineType) return toast.warning("Requerido", "Selecciona el tipo de vacuna");
    
    if (data.vaccineType === "Otra" && !data.customVaccineName?.trim()) {
      return toast.warning("Requerido", "Especifica el nombre de la vacuna");
    }

    if (data.source === "internal") {
      if (!data.productId) return toast.warning("Requerido", "Selecciona un producto del inventario");
      if ((data.cost || 0) <= 0) return toast.warning("Requerido", "El costo es obligatorio para vacunas internas");
      if (!data.nextVaccinationDate) return toast.warning("Requerido", "Define la próxima dosis");
    }

    const finalVaccineType = data.vaccineType === "Otra" ? data.customVaccineName! : data.vaccineType;

    const payload: VaccinationFormData & { productId?: string } = {
      vaccinationDate: data.vaccinationDate,
      vaccineType: finalVaccineType,
      source: data.source,
      cost: data.cost || 0,
      nextVaccinationDate: data.nextVaccinationDate || undefined,
      laboratory: data.laboratory || undefined,
      batchNumber: data.batchNumber || undefined,
      expirationDate: data.expirationDate || undefined,
      observations: data.observations || undefined,
    };

    if (data.source === "internal") {
      payload.productId = data.productId;
    }

    if (isEditing) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-200 w-full sm:rounded-2xl sm:max-w-4xl sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl border-t sm:border border-surface-200 dark:border-dark-100 flex flex-col rounded-t-2xl">
        <VaccinationModalHeader patient={patient} isEditing={isEditing} onClose={onClose} isPending={isPending} />
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            <VaccinationSourceSelector source={watchedSource} setValue={setValue} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              <VaccinationMainForm 
                register={register} 
                errors={errors} 
                isInternal={isInternal} 
                vaccineProducts={vaccineProducts} 
                selectedProduct={watchedProductId || ""} 
                vaccineType={watchedVaccineType || ""} 
                vaccineTypesList={VACCINE_TYPES} 
                isPuppy={isPuppy()} 
              />
              <VaccinationDetailsForm register={register} />
            </div>
          </div>
          <div className="bg-surface-50 dark:bg-dark-300 border-t border-surface-200 dark:border-dark-100 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
            <div className="flex gap-3 sm:justify-end">
              <button type="button" onClick={onClose} disabled={isPending} className="btn-secondary flex-1 sm:flex-none text-sm">Cancelar</button>
              <button type="submit" disabled={isPending} className="btn-primary flex items-center gap-2">
                {isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                <span className="ml-2">{isPending ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>, document.body
  );
}