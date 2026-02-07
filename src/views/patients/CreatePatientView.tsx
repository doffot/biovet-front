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
  X,
  FileText, // Nuevo icono para observaciones
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
  { value: "Hurón", label: "Hurón" },
  { value: "Otro", label: "Otro" },
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
  const [selectedSex, setSelectedSex] = useState<"Macho" | "Hembra" | null>(
    null,
  );

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: PatientFormData) => {
      const form = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        // Aseguramos que se envíe incluso si es string vacío para observaciones
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
      navigate(`/owners/${ownerId}`);
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
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
      {/* Header - Se mantiene igual */}
      <div
        className={`flex flex-col gap-2 transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <Link
            to={`/owners/${ownerId}`}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-700 text-slate-500 hover:text-biovet-500 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
          {owner && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-biovet-50 dark:bg-biovet-950/30 rounded-lg border border-biovet-100 dark:border-biovet-800">
              <User size={14} className="text-biovet-500" />
              <span className="text-xs font-bold text-biovet-700 dark:text-biovet-300 uppercase tracking-tighter">
                Dueño: {owner.name}
              </span>
            </div>
          )}
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight uppercase">
          Registrar Mascota
        </h1>
      </div>

      <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-sm border border-surface-200 dark:border-slate-800 overflow-hidden">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col md:flex-row"
          noValidate
        >
          {/* Foto - Lado Izquierdo (Sin cambios) */}
          <div className="w-full md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-surface-100 dark:border-slate-800 flex flex-col items-center justify-center gap-6 bg-slate-50/30">
            <div className="w-full aspect-square max-w-60 rounded-2xl bg-white dark:bg-dark-100 flex flex-col items-center justify-center border-2 border-dashed border-surface-200 dark:border-slate-700 relative overflow-hidden group shadow-inner">
              {photoPreview ? (
                <>
                  <img
                    src={photoPreview}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview(null);
                        setPhotoFile(null);
                      }}
                      className="p-2 bg-red-500 text-white rounded-full"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-center gap-2 text-slate-300">
                  <Camera size={48} strokeWidth={1} />
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
              className="w-full py-3 px-4 bg-white dark:bg-dark-300 text-biovet-600 border border-biovet-100 dark:border-biovet-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-biovet-50 transition-all shadow-sm"
            >
              <Upload size={16} /> SELECCIONAR ARCHIVO
            </button>
          </div>

          {/* Inputs - Lado Derecho */}
          <div className="w-full md:w-2/3 p-8 flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
              {/* Campos existentes (Name, BirthDate, Species, Breed, Sex, Weight, Color, Identification) */}
              {/* ... (Se mantienen igual a tu código) */}

              <div className="relative flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-tight text-slate-500">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Max"
                  className={`input h-11 ${errors.name ? "border-red-500" : ""}`}
                  {...register("name", { required: "Requerido" })}
                />
                {errors.name && (
                  <span className="absolute -bottom-4 left-0 text-[9px] text-red-500 font-black uppercase tracking-tighter">
                    Campo obligatorio
                  </span>
                )}
              </div>

              <div className="relative flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-tight text-slate-500">
                  F. Nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={`input h-11 ${errors.birthDate ? "border-red-500" : ""}`}
                  {...register("birthDate", { required: "Requerido" })}
                />
              </div>

              <div className="relative flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-tight text-slate-500">
                  Especie <span className="text-red-500">*</span>
                </label>
                <select
                  className={`input h-11 ${errors.species ? "border-red-500" : ""}`}
                  {...register("species", { required: "Requerido" })}
                >
                  <option value="">Seleccione</option>
                  {SPECIES_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-tight text-slate-500">
                  Raza
                </label>
                <input
                  type="text"
                  placeholder="Ej: Poodle"
                  className="input h-11"
                  {...register("breed")}
                />
              </div>

              <div className="relative flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-tight text-slate-500">
                  Sexo <span className="text-red-500">*</span>
                </label>
                <div
                  className={`flex bg-slate-100 dark:bg-dark-300 rounded-xl p-1 h-11 border ${errors.sex ? "border-red-500" : "border-transparent"}`}
                >
                  <button
                    type="button"
                    onClick={() => handleSexChange("Macho")}
                    className={`flex-1 text-[11px] font-black uppercase rounded-lg transition-all ${selectedSex === "Macho" ? "bg-white dark:bg-slate-600 shadow-sm text-biovet-600" : "text-slate-400"}`}
                  >
                    Macho
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSexChange("Hembra")}
                    className={`flex-1 text-[11px] font-black uppercase rounded-lg transition-all ${selectedSex === "Hembra" ? "bg-white dark:bg-slate-600 shadow-sm text-biovet-600" : "text-slate-400"}`}
                  >
                    Hembra
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-tight text-slate-500">
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

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-tight text-slate-500">
                  Color / Pelaje
                </label>
                <input
                  type="text"
                  placeholder="Ej: Negro"
                  className="input h-11"
                  {...register("color")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-tight text-slate-500">
                  Identificación
                </label>
                <input
                  type="text"
                  placeholder="Chip o ID"
                  className="input h-11"
                  {...register("identification")}
                />
              </div>

              {/* NUEVO CAMPO: Observaciones (Ancho completo) */}
              <div className="sm:col-span-2 flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-black uppercase tracking-tight text-slate-500 flex items-center gap-2">
                  <FileText size={14} className="text-slate-400" />
                  Observaciones Médicas o Alergias
                </label>
                <textarea
                  placeholder="Ej: Alérgico a la Penicilina, carácter nervioso..."
                  className="input min-h-25 py-3 resize-none"
                  {...register("observations")}
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-4 mt-10 pt-6 border-t border-slate-50 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate(`/owners/${ownerId}`)}
                className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="bg-biovet-600 hover:bg-biovet-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-biovet-600/20 disabled:opacity-50 transition-all active:scale-95"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <PawPrint size={16} />
                )}
                Registrar Mascota
              </button>
            </div>
          </div>
        </form>
      </div>
      <input type="hidden" {...register("mainVet")} />
      <input type="hidden" {...register("referringVet")} />
    </div>
  );
}
