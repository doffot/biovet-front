// src/views/patients/CreatePatientView.tsx
import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  Camera,
  Loader2,
  PawPrint,
  User,
  X,
  FileText,
  Save,
} from "lucide-react";
import { toast } from "@/components/Toast";
import { createPatient } from "@/api/patientAPI";
import { getOwnersById } from "@/api/OwnerAPI";
import { useAuth } from "@/hooks/useAuth";
import type { PatientFormData } from "@/types/patient";

const SPECIES_OPTIONS = [
  { value: "Canino", label: "Canino" },
  { value: "Felino", label: "Felino" },
  { value: "Ave", label: "Ave" },
  { value: "Reptil", label: "Reptil" },
  { value: "Roedor", label: "Roedor" },
  { value: "Hurón", label: "Hurón" },
  { value: "Otro", label: "Otro" },
];

// Mapeo especie → archivo en /public/defaults/
const SPECIES_DEFAULT_PHOTO: Record<string, string> = {
  Canino: "canino.png",
  Felino: "felino.png",
  Ave: "ave.png",
  Reptil: "reptil.png",
  Roedor: "roedor.png",
  Hurón: "huron.png",
  Otro: "otro.png",
};

// Función para cargar imagen de public y convertirla a File
async function loadDefaultPhoto(species: string): Promise<File | null> {
  const filename = SPECIES_DEFAULT_PHOTO[species];
  if (!filename) return null;

  try {
    const response = await fetch(`/defaults/${filename}`);
    if (!response.ok) {
      console.error(`No se encontró /defaults/${filename}`);
      return null;
    }

    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type || "image/png" });
    return file;
  } catch (error) {
    console.error("Error cargando imagen por defecto:", error);
    return null;
  }
}

export default function CreatePatientView() {
  const { ownerId } = useParams<{ ownerId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: vetData } = useAuth();

  const [isClosing, setIsClosing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isCustomPhoto, setIsCustomPhoto] = useState(false);
  const [selectedSex, setSelectedSex] = useState<"Macho" | "Hembra" | null>(null);

  const { data: owner } = useQuery({
    queryKey: ["owner", ownerId],
    queryFn: () => getOwnersById(ownerId!),
    enabled: !!ownerId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
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
      observations: "",
    },
  });

  const selectedSpecies = watch("species");

  // Cargar foto por defecto cuando cambia la especie
  useEffect(() => {
    if (selectedSpecies && !isCustomPhoto) {
      const filename = SPECIES_DEFAULT_PHOTO[selectedSpecies];
      if (filename) {
        setPhotoPreview(`/defaults/${filename}`);
        // Cargar el archivo para enviarlo
        loadDefaultPhoto(selectedSpecies).then((file) => {
          if (file) {
            setPhotoFile(file);
          }
        });
      }
    }
  }, [selectedSpecies, isCustomPhoto]);

  useEffect(() => {
    if (vetData?.name) {
      const vetName = `M.V. ${vetData.name} ${vetData.lastName || ""}`.trim();
      setValue("mainVet", vetName);
      setValue("referringVet", vetName);
    }
  }, [vetData, setValue]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => navigate(`/owners/${ownerId}`), 300);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: PatientFormData) => {
      const form = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.append(key, String(value));
        }
      });

      // Siempre enviar foto (custom o por defecto)
      if (photoFile) {
        form.append("photo", photoFile);
      }

      return await createPatient(form, ownerId!);
    },
    onError: (error: Error) => toast.error("Error", error.message),
    onSuccess: (data) => {
      toast.success("Éxito", `"${data.name}" registrado`);
      queryClient.invalidateQueries({ queryKey: ["patients", { ownerId }] });
      handleClose();
    },
  });

  const handleSexChange = (sex: "Macho" | "Hembra") => {
    setSelectedSex(sex);
    setValue("sex", sex, { shouldValidate: true });
  };

  const onSubmit = (data: PatientFormData) => {
    if (!selectedSex) {
      toast.error("Falta información", "El sexo es obligatorio");
      return;
    }
    if (!photoFile) {
      toast.error("Falta información", "Selecciona una especie para cargar la foto");
      return;
    }
    mutate(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setIsCustomPhoto(true);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setIsCustomPhoto(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Si hay especie seleccionada, volver a la foto por defecto
    if (selectedSpecies) {
      const filename = SPECIES_DEFAULT_PHOTO[selectedSpecies];
      if (filename) {
        setPhotoPreview(`/defaults/${filename}`);
        loadDefaultPhoto(selectedSpecies).then((file) => {
          if (file) setPhotoFile(file);
        });
      }
    } else {
      setPhotoPreview(null);
      setPhotoFile(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`}
        onClick={handleClose}
      />

      {/* Fullscreen Panel */}
      <div
        className={`fixed inset-0 z-50 bg-white dark:bg-dark-200 flex flex-col transform transition-transform duration-300 ease-out ${isClosing ? "translate-x-full" : "translate-x-0"}`}
      >
        {/* Header */}
        <header className="shrink-0 bg-linear-to-r from-biovet-600 to-biovet-700 text-white px-4 sm:px-6 py-4 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold font-heading flex items-center gap-2">
                  <PawPrint className="w-5 h-5" /> Registrar Mascota
                </h1>
                {owner && (
                  <p className="text-biovet-100 text-xs font-medium flex items-center gap-1.5 mt-0.5">
                    <User className="w-3 h-3" />
                    Propietario: {owner.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-surface-50 dark:bg-dark-300 p-4 sm:p-6 pb-40 sm:pb-32">
          <div className="max-w-4xl mx-auto">
            <form id="patient-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-sm border border-surface-200 dark:border-dark-100 overflow-hidden">
                <div className="flex flex-col md:flex-row">

                  {/* FOTO */}
                  <div className="w-full md:w-1/3 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-surface-100 dark:border-slate-800 flex flex-col items-center justify-center gap-5 bg-slate-50/30 dark:bg-dark-100/30">
                    <div className="w-full aspect-square max-w-52 rounded-2xl bg-white dark:bg-dark-100 flex flex-col items-center justify-center border-2 border-dashed border-surface-200 dark:border-slate-700 relative overflow-hidden group shadow-inner">
                      {photoPreview ? (
                        <>
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className={`absolute inset-0 w-full h-full object-cover ${!isCustomPhoto ? "opacity-70" : ""}`}
                          />
                          {!isCustomPhoto && (
                            <div className="absolute bottom-2 left-2 right-2">
                              <span className="block text-center text-[9px] font-bold uppercase tracking-wider text-white bg-black/50 px-2 py-1 rounded">
                                Foto por defecto
                              </span>
                            </div>
                          )}
                          {isCustomPhoto && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={removeImage}
                                className="p-2 bg-danger-500 text-white rounded-full hover:bg-danger-600 transition-colors"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-center gap-2 text-slate-300 dark:text-slate-600">
                          <Camera size={44} strokeWidth={1} />
                          <span className="text-[10px] font-black uppercase tracking-widest px-4">
                            Selecciona una especie
                          </span>
                        </div>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 bg-white dark:bg-dark-300 text-biovet-600 dark:text-biovet-400 border border-biovet-100 dark:border-biovet-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-biovet-50 dark:hover:bg-biovet-950/30 transition-all shadow-sm"
                    >
                      <Upload size={16} />
                      {isCustomPhoto ? "CAMBIAR FOTO" : "SUBIR FOTO PERSONALIZADA"}
                    </button>

                    {isCustomPhoto && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="text-[11px] text-surface-500 dark:text-slate-400 hover:text-danger-500 transition-colors"
                      >
                        Usar foto por defecto
                      </button>
                    )}
                  </div>

                  {/* CAMPOS */}
                  <div className="w-full md:w-2/3 p-6 sm:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                      {/* Nombre */}
                      <div className="flex flex-col gap-1.5">
                        <label className="label">
                          Nombre <span className="text-danger-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Max"
                          className={`input ${errors.name ? "input-error" : ""}`}
                          {...register("name", { required: "Requerido" })}
                        />
                        {errors.name && <p className="error-text">Campo obligatorio</p>}
                      </div>

                      {/* Fecha de nacimiento */}
                      <div className="flex flex-col gap-1.5">
                        <label className="label">
                          F. Nacimiento <span className="text-danger-500">*</span>
                        </label>
                        <input
                          type="date"
                          className={`input ${errors.birthDate ? "input-error" : ""}`}
                          {...register("birthDate", { required: "Requerido" })}
                        />
                        {errors.birthDate && <p className="error-text">Campo obligatorio</p>}
                      </div>

                      {/* Especie */}
                      <div className="flex flex-col gap-1.5">
                        <label className="label">
                          Especie <span className="text-danger-500">*</span>
                        </label>
                        <select
                          className={`input ${errors.species ? "input-error" : ""}`}
                          {...register("species", { required: "Requerido" })}
                        >
                          <option value="">Seleccione</option>
                          {SPECIES_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        {errors.species && <p className="error-text">Campo obligatorio</p>}
                      </div>

                      {/* Raza */}
                      <div className="flex flex-col gap-1.5">
                        <label className="label">Raza</label>
                        <input
                          type="text"
                          placeholder="Ej: Poodle"
                          className="input"
                          {...register("breed")}
                        />
                      </div>

                      {/* Sexo */}
                      <div className="flex flex-col gap-1.5">
                        <label className="label">
                          Sexo <span className="text-danger-500">*</span>
                        </label>
                        <div
                          className={`flex bg-surface-100 dark:bg-dark-300 rounded-xl p-1 border ${
                            !selectedSex && errors.sex
                              ? "border-danger-500"
                              : "border-transparent"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSexChange("Macho")}
                            className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-lg transition-all ${
                              selectedSex === "Macho"
                                ? "bg-white dark:bg-dark-100 shadow-sm text-blue-500"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            }`}
                          >
                            ♂ Macho
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSexChange("Hembra")}
                            className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-lg transition-all ${
                              selectedSex === "Hembra"
                                ? "bg-white dark:bg-dark-100 shadow-sm text-pink-500"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            }`}
                          >
                            ♀ Hembra
                          </button>
                        </div>
                      </div>

                      {/* Peso */}
                      <div className="flex flex-col gap-1.5">
                        <label className="label">Peso (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          className="input"
                          {...register("weight")}
                        />
                      </div>

                      {/* Color */}
                      <div className="flex flex-col gap-1.5">
                        <label className="label">Color / Pelaje</label>
                        <input
                          type="text"
                          placeholder="Ej: Negro"
                          className="input"
                          {...register("color")}
                        />
                      </div>

                      {/* Identificación */}
                      <div className="flex flex-col gap-1.5">
                        <label className="label">Identificación</label>
                        <input
                          type="text"
                          placeholder="Chip o ID"
                          className="input"
                          {...register("identification")}
                        />
                      </div>

                      {/* Observaciones */}
                      <div className="sm:col-span-2 flex flex-col gap-1.5 mt-1">
                        <label className="label flex items-center gap-2">
                          <FileText size={14} className="text-surface-400" />
                          Observaciones Médicas o Alergias
                        </label>
                        <textarea
                          placeholder="Ej: Alérgico a la Penicilina, carácter nervioso..."
                          className="input min-h-24 py-3 resize-none"
                          {...register("observations")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>

        {/* Footer */}
        <footer className="shrink-0 fixed bottom-0 left-0 right-0 sm:relative bg-white dark:bg-dark-200 border-t border-surface-200 dark:border-dark-100 px-6 py-4 z-10 mb-16 sm:mb-0">
          <div className="max-w-4xl mx-auto flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary px-6"
            >
              Cancelar
            </button>
            <button
              form="patient-form"
              type="submit"
              disabled={isPending}
              className="btn-primary px-8 shadow-lg shadow-biovet-500/20"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isPending ? "Registrando..." : "Registrar Mascota"}
            </button>
          </div>
        </footer>

        {/* Hidden fields */}
        <input type="hidden" {...register("mainVet")} />
        <input type="hidden" {...register("referringVet")} />
      </div>
    </>
  );
}