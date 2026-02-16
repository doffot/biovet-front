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
import { defaultPhotoFile } from "@/utils/defaultPhoto";

const SPECIES_OPTIONS = [
  { value: "Canino", label: "🐕 Canino" },
  { value: "Felino", label: "🐈 Felino" },
  { value: "Ave", label: "🐦 Ave" },
  { value: "Reptil", label: "🦎 Reptil" },
  { value: "Roedor", label: "🐹 Roedor" },
  { value: "Hurón", label: "🦦 Hurón" },
  { value: "Otro", label: "🐾 Otro" },
];

export default function CreatePatientView() {
  const { ownerId } = useParams<{ ownerId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: vetData } = useAuth();

  const [isClosing, setIsClosing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
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
        if (value !== undefined && value !== null)
          form.append(key, String(value));
      });

      if (photoFile) {
        form.append("photo", photoFile);
      } else {
        const defaultPng = await defaultPhotoFile();
        if (defaultPng) form.append("photo", defaultPng);
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
    mutate(data);
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
        {/* ============================================
            HEADER
            ============================================ */}
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

        {/* ============================================
            CONTENT
            ============================================ */}
        <main className="flex-1 overflow-y-auto bg-surface-50 dark:bg-dark-300 p-4 sm:p-6 pb-40 sm:pb-32">
          <div className="max-w-4xl mx-auto">
            <form id="patient-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-sm border border-surface-200 dark:border-dark-100 overflow-hidden">
                <div className="flex flex-col md:flex-row">

                  {/* ---- FOTO (Lado izquierdo) ---- */}
                  <div className="w-full md:w-1/3 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-surface-100 dark:border-slate-800 flex flex-col items-center justify-center gap-5 bg-slate-50/30 dark:bg-dark-100/30">
                    <div className="w-full aspect-square max-w-52 rounded-2xl bg-white dark:bg-dark-100 flex flex-col items-center justify-center border-2 border-dashed border-surface-200 dark:border-slate-700 relative overflow-hidden group shadow-inner">
                      {photoPreview ? (
                        <>
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                setPhotoPreview(null);
                                setPhotoFile(null);
                              }}
                              className="p-2 bg-danger-500 text-white rounded-full hover:bg-danger-600 transition-colors"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-center gap-2 text-slate-300 dark:text-slate-600">
                          <Camera size={44} strokeWidth={1} />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            Subir Fotografía
                          </span>
                        </div>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPhotoFile(file);
                          setPhotoPreview(URL.createObjectURL(file));
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 bg-white dark:bg-dark-300 text-biovet-600 dark:text-biovet-400 border border-biovet-100 dark:border-biovet-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-biovet-50 dark:hover:bg-biovet-950/30 transition-all shadow-sm"
                    >
                      <Upload size={16} /> SELECCIONAR ARCHIVO
                    </button>
                  </div>

                  {/* ---- CAMPOS (Lado derecho) ---- */}
                  <div className="w-full md:w-2/3 p-6 sm:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                      {/* Nombre */}
                      <div className="relative flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-tight text-slate-500 dark:text-slate-400">
                          Nombre <span className="text-danger-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Max"
                          className={`input h-11 ${errors.name ? "border-danger-500" : ""}`}
                          {...register("name", { required: "Requerido" })}
                        />
                        {errors.name && (
                          <span className="absolute -bottom-4 left-0 text-[9px] text-danger-500 font-black uppercase tracking-tighter">
                            Campo obligatorio
                          </span>
                        )}
                      </div>

                      {/* Fecha de nacimiento */}
                      <div className="relative flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-tight text-slate-500 dark:text-slate-400">
                          F. Nacimiento <span className="text-danger-500">*</span>
                        </label>
                        <input
                          type="date"
                          className={`input h-11 ${errors.birthDate ? "border-danger-500" : ""}`}
                          {...register("birthDate", { required: "Requerido" })}
                        />
                        {errors.birthDate && (
                          <span className="absolute -bottom-4 left-0 text-[9px] text-danger-500 font-black uppercase tracking-tighter">
                            Campo obligatorio
                          </span>
                        )}
                      </div>

                      {/* Especie */}
                      <div className="relative flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-tight text-slate-500 dark:text-slate-400">
                          Especie <span className="text-danger-500">*</span>
                        </label>
                        <select
                          className={`input h-11 ${errors.species ? "border-danger-500" : ""}`}
                          {...register("species", { required: "Requerido" })}
                        >
                          <option value="">Seleccione</option>
                          {SPECIES_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        {errors.species && (
                          <span className="absolute -bottom-4 left-0 text-[9px] text-danger-500 font-black uppercase tracking-tighter">
                            Campo obligatorio
                          </span>
                        )}
                      </div>

                      {/* Raza */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-tight text-slate-500 dark:text-slate-400">
                          Raza
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Poodle"
                          className="input h-11"
                          {...register("breed")}
                        />
                      </div>

                      {/* Sexo */}
                      <div className="relative flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-tight text-slate-500 dark:text-slate-400">
                          Sexo <span className="text-danger-500">*</span>
                        </label>
                        <div
                          className={`flex bg-slate-100 dark:bg-dark-300 rounded-xl p-1 h-11 border ${errors.sex ? "border-danger-500" : "border-transparent"}`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSexChange("Macho")}
                            className={`flex-1 text-[11px] font-black uppercase rounded-lg transition-all ${
                              selectedSex === "Macho"
                                ? "bg-white dark:bg-slate-600 shadow-sm text-blue-500"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            ♂ Macho
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSexChange("Hembra")}
                            className={`flex-1 text-[11px] font-black uppercase rounded-lg transition-all ${
                              selectedSex === "Hembra"
                                ? "bg-white dark:bg-slate-600 shadow-sm text-pink-500"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            ♀ Hembra
                          </button>
                        </div>
                      </div>

                      {/* Peso */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-tight text-slate-500 dark:text-slate-400">
                          Peso (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          className="input h-11"
                          {...register("weight")}
                        />
                      </div>

                      {/* Color */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-tight text-slate-500 dark:text-slate-400">
                          Color / Pelaje
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Negro"
                          className="input h-11"
                          {...register("color")}
                        />
                      </div>

                      {/* Identificación */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-tight text-slate-500 dark:text-slate-400">
                          Identificación
                        </label>
                        <input
                          type="text"
                          placeholder="Chip o ID"
                          className="input h-11"
                          {...register("identification")}
                        />
                      </div>

                      {/* Observaciones (ancho completo) */}
                      <div className="sm:col-span-2 flex flex-col gap-1.5 mt-1">
                        <label className="text-xs font-black uppercase tracking-tight text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <FileText size={14} className="text-slate-400" />
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

        {/* ============================================
            FOOTER - Fijo abajo
            ============================================ */}
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