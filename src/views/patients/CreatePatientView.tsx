// src/views/patients/CreatePatientView.tsx
import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Upload, 
  Camera, 
  Loader2, 
  PawPrint,
  User,
  X
} from "lucide-react";
import { toast } from "@/components/Toast";
import { createPatient } from "@/api/patientAPI";
import { getOwnersById } from "@/api/OwnerAPI";
import { useAuth } from "@/hooks/useAuth";
import type { PatientFormData } from "@/types/patient";
import { defaultPhotoFile } from "@/utils/defaultPhoto";

const SPECIES_OPTIONS = [
  { value: "Canino", label: "Canino" },
  { value: "Felino", label: "Felino" },
  { value: "Ave", label: "Ave" },
  { value: "Reptil", label: "Reptil" },
  { value: "Roedor", label: "Roedor" },
  { value: "Exótico", label: "Exótico" },
];

export default function CreatePatientView() {
  const { ownerId } = useParams<{ ownerId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: vetData } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [selectedSex, setSelectedSex] = useState<"Macho" | "Hembra" | null>(null);

  const { data: owner, isLoading: isLoadingOwner } = useQuery({
    queryKey: ["owner", ownerId],
    queryFn: () => getOwnersById(ownerId!),
    enabled: !!ownerId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PatientFormData>({
    defaultValues: {
      name: "",
      birthDate: "",
      species: "",
      breed: "",
      sex: undefined,
      weight: undefined,
      color: "",
      identification: "",
      mainVet: "",
      referringVet: "",
    },
  });

  useEffect(() => {
    if (vetData?.name) {
      const vetName = `M.V. ${vetData.name} ${vetData.lastName || ""}`.trim();
      setValue("mainVet", vetName);
      setValue("referringVet", vetName);
    }
  }, [vetData, setValue]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: PatientFormData) => {
      if (!ownerId) {
        throw new Error("ID del dueño no encontrado en la URL");
      }

      const form = new FormData();
      form.append("name", data.name);
      form.append("birthDate", data.birthDate);
      form.append("species", data.species);
      form.append("sex", data.sex);
      if (data.breed) form.append("breed", data.breed);
      if (data.color) form.append("color", data.color);
      if (data.identification) form.append("identification", data.identification);
      if (data.weight) form.append("weight", String(data.weight));
      form.append("mainVet", data.mainVet);
      form.append("referringVet", data.referringVet || data.mainVet);

      // Manejar la foto correctamente
      if (photoFile) {
        form.append("photo", photoFile);
      } else {
        const defaultPng = await defaultPhotoFile();
        if (defaultPng) {
          form.append("photo", defaultPng);
        }
      }

      return await createPatient(form, ownerId);
    },
    onError: (error: Error) => {
      toast.error("Error al registrar", error.message || "No se pudo crear la mascota");
    },
    onSuccess: (data) => {
      toast.success("¡Mascota registrada!", `"${data.name}" ha sido añadida exitosamente`);
      queryClient.invalidateQueries({ queryKey: ["patients", { ownerId }] });
      queryClient.invalidateQueries({ queryKey: ["owner", ownerId] });
      navigate(`/owners/${ownerId}`);
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Archivo muy grande", "La imagen debe ser menor a 5MB");
        return;
      }
      
      setPhotoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSexChange = (sex: "Macho" | "Hembra") => {
    setSelectedSex(sex);
    setValue("sex", sex);
  };

  const onSubmit = (data: PatientFormData) => {
    if (!selectedSex) {
      toast.error("Campo requerido", "Por favor selecciona el sexo de la mascota");
      return;
    }
    mutate(data);
  };

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-dark-300">
      <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="w-full max-w-4xl flex flex-col gap-6 sm:gap-8">
          
          {/* Header */}
          <div 
            className={`flex flex-col gap-2 transition-all duration-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Link
                to={`/owners/${ownerId}`}
                className="flex items-center justify-center w-10 h-10 rounded-xl 
                           bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-700
                           text-slate-500 hover:text-biovet-500 hover:border-biovet-300
                           dark:hover:border-biovet-700 transition-all"
              >
                <ArrowLeft size={20} />
              </Link>
              
              {isLoadingOwner ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-dark-200 
                               rounded-lg border border-surface-200 dark:border-slate-700">
                  <Loader2 size={14} className="animate-spin text-slate-400" />
                  <span className="text-sm text-slate-500">Cargando...</span>
                </div>
              ) : owner && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-biovet-50 dark:bg-biovet-950/30
                               rounded-lg border border-biovet-200 dark:border-biovet-800">
                  <User size={14} className="text-biovet-500" />
                  <span className="text-sm font-medium text-biovet-700 dark:text-biovet-300">
                    {owner.name}
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800 dark:text-white tracking-tight">
              Registrar Mascota
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
              Complete la información para registrar una nueva mascota en el sistema.
            </p>
          </div>

          {/* Main Card */}
          <div 
            className={`bg-white dark:bg-dark-200 rounded-2xl shadow-sm border border-surface-200 
                       dark:border-slate-800 overflow-hidden transition-all duration-500 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="flex flex-col md:flex-row">
                
                {/* Left Column - Photo Upload */}
                <div className="w-full md:w-1/3 bg-surface-50 dark:bg-dark-100 flex flex-col items-center 
                               justify-center p-6 sm:p-8 border-b md:border-b-0 md:border-r 
                               border-surface-200 dark:border-slate-800">
                  
                  <div className="w-full aspect-square max-w-[240px] rounded-xl bg-surface-100 dark:bg-dark-200 
                                 flex flex-col items-center justify-center border-2 border-dashed 
                                 border-surface-300 dark:border-slate-700 relative overflow-hidden group
                                 hover:border-biovet-400 dark:hover:border-biovet-600 transition-colors">
                    
                    {photoPreview ? (
                      <>
                        <img 
                          src={photoPreview} 
                          alt="Vista previa" 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                                       transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="p-2 bg-danger-500 rounded-full text-white hover:bg-danger-600 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-center gap-2 p-4">
                        <div className="w-14 h-14 rounded-full bg-surface-200 dark:bg-dark-100 
                                       flex items-center justify-center">
                          <Camera size={28} className="text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Subir Foto
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          JPG o PNG (máx. 5MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Input de archivo separado - sin register */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-6 w-full max-w-[240px] flex items-center justify-center gap-2 
                              rounded-xl bg-biovet-50 dark:bg-biovet-950/30 
                              hover:bg-biovet-100 dark:hover:bg-biovet-900/40
                              border border-biovet-200 dark:border-biovet-800
                              text-biovet-700 dark:text-biovet-300 h-11 px-4 font-semibold 
                              transition-colors"
                  >
                    <Upload size={18} />
                    Seleccionar Archivo
                  </button>
                </div>

                {/* Right Column - Form Fields */}
                <div className="w-full md:w-2/3 p-6 sm:p-8 flex flex-col gap-5">
                  
                  {/* Row 1: Nombre y Fecha */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Nombre <span className="text-danger-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Nombre de la mascota"
                        className={`input ${errors.name ? 'input-error' : ''}`}
                        {...register("name", { 
                          required: "El nombre es obligatorio",
                          minLength: { value: 2, message: "Mínimo 2 caracteres" }
                        })}
                      />
                      {errors.name && (
                        <span className="text-xs text-danger-500">{errors.name.message}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Fecha de Nacimiento <span className="text-danger-500">*</span>
                      </label>
                      <input
                        type="date"
                        className={`input ${errors.birthDate ? 'input-error' : ''}`}
                        {...register("birthDate", { required: "La fecha es obligatoria" })}
                      />
                      {errors.birthDate && (
                        <span className="text-xs text-danger-500">{errors.birthDate.message}</span>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Especie y Raza */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Especie <span className="text-danger-500">*</span>
                      </label>
                      <select
                        className={`input ${errors.species ? 'input-error' : ''}`}
                        {...register("species", { required: "Selecciona una especie" })}
                      >
                        <option value="">Seleccione especie</option>
                        {SPECIES_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.species && (
                        <span className="text-xs text-danger-500">{errors.species.message}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Raza
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Labrador, Maine Coon"
                        className="input"
                        {...register("breed")}
                      />
                    </div>
                  </div>

                  {/* Row 3: Sexo y Peso */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Sexo <span className="text-danger-500">*</span>
                      </label>
                      <div className="flex p-1 bg-surface-100 dark:bg-dark-100 rounded-lg 
                                     border border-surface-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => handleSexChange("Macho")}
                          className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                            selectedSex === "Macho"
                              ? "bg-blue-500 text-white shadow-sm"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          }`}
                        >
                          Macho
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSexChange("Hembra")}
                          className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                            selectedSex === "Hembra"
                              ? "bg-pink-500 text-white shadow-sm"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          }`}
                        >
                          Hembra
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Peso (kg)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="0.0"
                          className="input pr-12"
                          {...register("weight", { 
                            valueAsNumber: true,
                            min: { value: 0, message: "El peso debe ser positivo" }
                          })}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 
                                        dark:text-slate-500 font-medium text-sm">
                          kg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Color e Identificación */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Color / Pelaje
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Blanco con manchas"
                        className="input"
                        {...register("color")}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Identificación (Microchip/ID)
                      </label>
                      <input
                        type="text"
                        placeholder="Número de serie o placa"
                        className="input"
                        {...register("identification")}
                      />
                    </div>
                  </div>

                  {/* Hidden fields for vets */}
                  <input type="hidden" {...register("mainVet")} />
                  <input type="hidden" {...register("referringVet")} />

                  {/* Submit Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:justify-end mt-4 pt-4 
                                 border-t border-surface-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => navigate(`/owners/${ownerId}`)}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl 
                                bg-surface-100 dark:bg-dark-100 
                                border border-surface-200 dark:border-slate-700
                                hover:bg-surface-200 dark:hover:bg-dark-50
                                text-slate-700 dark:text-slate-200 font-medium 
                                transition-colors"
                    >
                      Cancelar
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 
                                min-w-[180px] px-6 py-3 rounded-xl 
                                bg-biovet-500 hover:bg-biovet-600 active:scale-[0.98]
                                text-white font-bold shadow-lg shadow-biovet-500/20
                                transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <PawPrint size={20} />
                          <span>Registrar Mascota</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div 
            className={`flex justify-center transition-all duration-500 delay-200 ${
              mounted ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
              © 2024 BioVet Track - Sistema de Seguimiento Veterinario Profesional
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}