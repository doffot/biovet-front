import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Save,  Building2, Home } from "lucide-react";
import { createVaccination, updateVaccination } from "@/api/vaccinationAPI";
import { getActiveProducts } from "@/api/productAPI";
import { toast } from "@/components/Toast";
import type { Vaccination, VaccinationFormData } from "@/types/vaccination";
import type { Patient } from "@/types/patient";
import type { Product } from "@/types/product";

import { VaccinationModalHeader } from "./modal/VaccinationModalHeader";
import { VaccinationMainForm } from "./modal/VaccinationMainForm";
import { VaccinationDetailsForm } from "./modal/VaccinationDetailsForm";
import type { VaccinationFormValues } from "./modal/formSchema";

const VACCINE_TYPES = [
  "Antirrábica", "Parvovirus", "Parvovirus y Moquillo", "Triple Canina",
  "Tos de Perrera", "Quíntuple", "Séxtuple", "Quíntuple Felina",
  "Triple Felina", "Otra",
];

interface Props {
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
}: Props) {
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

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products", "active"],
    queryFn: getActiveProducts,
    enabled: isOpen,
  });
  
  const vaccineProducts = products.filter((p) => p.category === "vacuna");

  // EFECTO: Carga de datos iniciales al editar
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
        });
      }
    }
  }, [isOpen, vaccinationToEdit, reset]);

  // EFECTO: Igual que Desparasitación - Sincroniza precio y producto
  useEffect(() => {
    if (isInternal && watchedProductId && vaccineProducts.length > 0) {
      const prod = vaccineProducts.find((p) => String(p._id) === String(watchedProductId));
      if (prod) {
        setValue("cost", prod.salePrice, { shouldValidate: true, shouldDirty: true });
        // Si no hay tipo seleccionado, sugerimos el nombre del producto
        if (!watchedVaccineType) {
           setValue("vaccineType", "Otra");
           setValue("customVaccineName", prod.name);
        }
      }
    }
  }, [watchedProductId, isInternal, vaccineProducts, setValue]);

  // EFECTO: Limpieza al cambiar origen (Evita basura en el payload)
  useEffect(() => {
    if (!isInternal) {
      setValue("cost", 0);
      setValue("productId", "");
    }
  }, [isInternal, setValue]);

  useEffect(() => {
    if (!isInternal && watchedDate) {
      const nextDate = calculateNextDose(watchedDate);
      setValue("nextVaccinationDate", nextDate);
    }
  }, [watchedDate, isInternal, setValue]);

  const { mutate: handleSave, isPending } = useMutation({
    mutationFn: (data: VaccinationFormData & { productId?: string }) => 
      isEditing ? updateVaccination(vaccinationToEdit!._id!, data) : createVaccination(patient._id, data),
    onSuccess: () => {
      toast.success(isEditing ? "Actualizado" : "Guardado", "Registro procesado con éxito");
      queryClient.invalidateQueries({ queryKey: ["vaccinations", patient._id] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "all"] });
      onClose();
    },
    onError: (e: any) => toast.error("Error", e.message),
  });

  const onSubmit = (data: VaccinationFormValues) => {
    // Validaciones manuales antes de enviar (Copia de Desparasitación)
    if (isInternal && !data.productId) {
      return toast.warning("Atención", "Selecciona un producto del inventario");
    }

    const finalType = data.vaccineType === "Otra" ? data.customVaccineName : data.vaccineType;
    if (!finalType) return toast.warning("Atención", "Especifica el tipo de vacuna");

    const payload: VaccinationFormData & { productId?: string } = {
      ...data,
      cost: isInternal ? Number(data.cost) : 0,
      vaccineType: finalType!,
      productId: isInternal ? data.productId : undefined,
    };

    handleSave(payload);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-200 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-dark-100">
        <VaccinationModalHeader patient={patient} isEditing={isEditing} onClose={onClose} isPending={isPending} />
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Selector de Origen (Estilo Desparasitación) */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue("source", "internal")}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${isInternal ? "border-biovet-500 bg-biovet-50/50" : "border-slate-100 opacity-60"}`}
              >
                <Building2 className={isInternal ? "text-biovet-600" : "text-slate-400"} />
                <div className="text-left">
                  <p className={`font-bold text-sm ${isInternal ? "text-biovet-700" : "text-slate-500"}`}>Interno</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Stock Clínica</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setValue("source", "external")}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${!isInternal ? "border-warning-500 bg-warning-50/50" : "border-slate-100 opacity-60"}`}
              >
                <Home className={!isInternal ? "text-warning-600" : "text-slate-400"} />
                <div className="text-left">
                  <p className={`font-bold text-sm ${!isInternal ? "text-warning-700" : "text-slate-500"}`}>Externo</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Fuera de Clínica</p>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white dark:bg-dark-200">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isPending} className="btn-primary flex items-center gap-2">
              {isPending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
              {isEditing ? "Actualizar" : "Guardar Vacuna"}
            </button>
          </div>
        </form>
      </div>
    </div>, document.body
  );
}