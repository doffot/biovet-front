// src/views/settings/ClinicSettingsView.tsx
import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Save,
  Loader2,
  Camera,
  Trash2,
  Plus,
  Phone,
  Mail,
  MapPin,
  Globe,
  Clock,
  FileText,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  MessageCircle,
  Link as LinkIcon,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Info,
} from "lucide-react";
import {
  getMyClinic,
  createVeterinaryClinic,
  updateVeterinaryClinic,
  deleteClinicLogo,
} from "@/api/veterinaryClinicAPI";
import type { VeterinaryClinicFormData } from "@/types/veterinaryClinic";
import { SOCIAL_PLATFORMS } from "@/types/veterinaryClinic";
import { toast } from "@/components/Toast";

// Iconos por plataforma
const PLATFORM_ICONS: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  tiktok: MessageCircle,
  otro: LinkIcon,
};

// ══════════════════════════════════════════
// REGEX PARA VALIDACIONES
// ══════════════════════════════════════════
const PHONE_REGEX = /^[\+]?[0-9\s\-\(\)]{7,20}$/;
const WHATSAPP_REGEX = /^[\+]?[0-9]{10,15}$/;
const URL_REGEX = /^https?:\/\/.+/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ClinicSettingsView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isDeletingLogo, setIsDeletingLogo] = useState(false);

  // Query: Obtener mi clínica
  const { data: clinic, isLoading } = useQuery({
    queryKey: ["my-clinic"],
    queryFn: getMyClinic,
  });

  const isEditing = !!clinic;

  // Form con validaciones
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<VeterinaryClinicFormData>({
    defaultValues: {
      name: "",
      rif: "",
      phone: "",
      whatsapp: "",
      email: "",
      address: "",
      city: "",
      country: "Venezuela",
      postalCode: "",
      website: "",
      socialMedia: [],
      businessHours: "Lun-Vie: 8:00 AM - 6:00 PM",
      description: "",
    },
  });

  // Field array para redes sociales
  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial,
  } = useFieldArray({
    control,
    name: "socialMedia",
  });

  // Cargar datos cuando exista clínica
  useEffect(() => {
    if (clinic) {
      reset({
        name: clinic.name || "",
        rif: clinic.rif || "",
        phone: clinic.phone || "",
        whatsapp: clinic.whatsapp || "",
        email: clinic.email || "",
        address: clinic.address || "",
        city: clinic.city || "",
        country: clinic.country || "Venezuela",
        postalCode: clinic.postalCode || "",
        website: clinic.website || "",
        socialMedia: clinic.socialMedia || [],
        businessHours: clinic.businessHours || "Lun-Vie: 8:00 AM - 6:00 PM",
        description: clinic.description || "",
      });
      if (clinic.logo) {
        setLogoPreview(clinic.logo);
      }
    }
  }, [clinic, reset]);

  // Mutations
  const { mutate: saveClinic, isPending: isSaving } = useMutation({
    mutationFn: async (data: VeterinaryClinicFormData) => {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "socialMedia") {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (isEditing) {
        return updateVeterinaryClinic(formData);
      } else {
        return createVeterinaryClinic(formData);
      }
    },
    onSuccess: () => {
      toast.success(
        isEditing ? "Clínica Actualizada" : "Clínica Creada",
        "Los datos se han guardado correctamente."
      );
      queryClient.invalidateQueries({ queryKey: ["my-clinic"] });
      setLogoFile(null);
    },
    onError: (error: Error) => {
      toast.error("Error al guardar", error.message);
    },
  });

  // Manejar logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Archivo muy grande", "El logo no puede superar 2MB");
        return;
      }
      // Validar tipo
      if (!file.type.startsWith("image/")) {
        toast.error("Formato inválido", "Solo se permiten imágenes");
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteLogo = async () => {
    if (!clinic?.logo) return;

    setIsDeletingLogo(true);
    try {
      await deleteClinicLogo();
      setLogoPreview(null);
      setLogoFile(null);
      queryClient.invalidateQueries({ queryKey: ["my-clinic"] });
      toast.success("Logo Eliminado", "El logo ha sido removido.");
    } catch (error: any) {
      toast.error("Error", error.message);
    } finally {
      setIsDeletingLogo(false);
    }
  };

  const onSubmit = (data: VeterinaryClinicFormData) => {
    saveClinic(data);
  };

  // Select styles
  const selectStyles = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-biovet-500 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-biovet-600 dark:text-slate-400 dark:hover:text-biovet-400 mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-biovet-100 dark:bg-biovet-900/30 flex items-center justify-center text-biovet-600 dark:text-biovet-400">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading text-slate-800 dark:text-white">
              {isEditing ? "Mi Clínica" : "Configurar Clínica"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isEditing
                ? "Edita la información de tu clínica veterinaria"
                : "Registra los datos de tu clínica veterinaria"}
            </p>
          </div>
        </div>

        {isEditing && (
          <div className="mt-4 flex items-center gap-2">
            <span className="badge badge-success">
              <CheckCircle2 size={12} />
              Clínica configurada
            </span>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-surface-100 dark:bg-dark-100 px-4 py-2.5 rounded-lg border border-surface-200 dark:border-dark-50">
          <Info size={16} className="text-biovet-500 shrink-0" />
          <span>
            Los campos marcados con <span className="text-danger-500 font-bold">*</span> son obligatorios
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ══════════════════════════════════════════
            SECCIÓN: LOGO E IDENTIDAD
            ══════════════════════════════════════════ */}
        <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-dark-100">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-surface-200 dark:border-dark-100 pb-2 mb-6 flex items-center gap-2">
            <Camera size={16} /> Logo e Identidad
          </h3>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Logo Preview */}
            <div className="shrink-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-2xl border-2 border-dashed border-surface-300 dark:border-dark-50 bg-surface-50 dark:bg-dark-100 flex items-center justify-center cursor-pointer hover:border-biovet-400 hover:bg-biovet-50 dark:hover:bg-biovet-900/20 transition-all overflow-hidden group"
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Camera className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-1 group-hover:text-biovet-500 transition-colors" />
                    <span className="text-[10px] text-slate-400">
                      Subir logo
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <p className="text-[10px] text-slate-400 text-center mt-2">
                Máx. 2MB (PNG, JPG)
              </p>

              {logoPreview && clinic?.logo && (
                <button
                  type="button"
                  onClick={handleDeleteLogo}
                  disabled={isDeletingLogo}
                  className="mt-2 w-full text-xs text-danger-500 hover:text-danger-700 font-medium flex items-center justify-center gap-1"
                >
                  {isDeletingLogo ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  Eliminar logo
                </button>
              )}
            </div>

            {/* Nombre y RIF */}
            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="label">
                  Nombre de la Clínica <span className="text-danger-500">*</span>
                </label>
                <input
                  {...register("name", {
                    required: "El nombre es obligatorio",
                    minLength: {
                      value: 3,
                      message: "Mínimo 3 caracteres",
                    },
                    maxLength: {
                      value: 150,
                      message: "Máximo 150 caracteres",
                    },
                  })}
                  className={`input ${errors.name ? "input-error" : ""}`}
                  placeholder="Ej: Clínica Veterinaria San Francisco"
                />
                {errors.name && (
                  <p className="error-text">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="label">RIF / NIF</label>
                <input
                  {...register("rif", {
                    maxLength: {
                      value: 20,
                      message: "Máximo 20 caracteres",
                    },
                    pattern: {
                      value: /^[A-Za-z0-9\-]+$/,
                      message: "Solo letras, números y guiones",
                    },
                  })}
                  className={`input uppercase ${errors.rif ? "input-error" : ""}`}
                  placeholder="Ej: J-12345678-9"
                />
                {errors.rif && (
                  <p className="error-text">{errors.rif.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SECCIÓN: CONTACTO
            ══════════════════════════════════════════ */}
        <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-dark-100">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-surface-200 dark:border-dark-100 pb-2 mb-6 flex items-center gap-2">
            <Phone size={16} /> Información de Contacto
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1.5">
                <Phone size={14} className="text-slate-400" />
                Teléfono
              </label>
              <input
                {...register("phone", {
                  pattern: {
                    value: PHONE_REGEX,
                    message: "Número inválido. Ej: +58 212 1234567",
                  },
                })}
                className={`input ${errors.phone ? "input-error" : ""}`}
                placeholder="+58 212 1234567"
              />
              {errors.phone && (
                <p className="error-text">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                <MessageCircle size={14} className="text-green-500" />
                WhatsApp
              </label>
              <input
                {...register("whatsapp", {
                  pattern: {
                    value: WHATSAPP_REGEX,
                    message: "Solo números (10-15 dígitos). Ej: +584121234567",
                  },
                })}
                className={`input ${errors.whatsapp ? "input-error" : ""}`}
                placeholder="+584121234567"
              />
              {errors.whatsapp ? (
                <p className="error-text">{errors.whatsapp.message}</p>
              ) : (
                <p className="helper-text">Solo números, sin espacios ni guiones</p>
              )}
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                <Mail size={14} className="text-slate-400" />
                Email
              </label>
              <input
                type="email"
                {...register("email", {
                  pattern: {
                    value: EMAIL_REGEX,
                    message: "Email inválido. Ej: contacto@clinica.com",
                  },
                })}
                className={`input ${errors.email ? "input-error" : ""}`}
                placeholder="contacto@miclinica.com"
              />
              {errors.email && (
                <p className="error-text">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                <Globe size={14} className="text-slate-400" />
                Sitio Web
              </label>
              <input
                {...register("website", {
                  pattern: {
                    value: URL_REGEX,
                    message: "URL inválida. Debe comenzar con http:// o https://",
                  },
                })}
                className={`input ${errors.website ? "input-error" : ""}`}
                placeholder="https://www.miclinica.com"
              />
              {errors.website && (
                <p className="error-text">{errors.website.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SECCIÓN: UBICACIÓN
            ══════════════════════════════════════════ */}
        <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-dark-100">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-surface-200 dark:border-dark-100 pb-2 mb-6 flex items-center gap-2">
            <MapPin size={16} /> Ubicación
          </h3>

          <div className="space-y-4">
            <div>
              <label className="label">Dirección</label>
              <textarea
                {...register("address", {
                  maxLength: {
                    value: 250,
                    message: "Máximo 250 caracteres",
                  },
                })}
                rows={2}
                className={`input resize-none ${errors.address ? "input-error" : ""}`}
                placeholder="Av. Principal, Edificio Centro Médico, Piso 2, Local 5"
              />
              {errors.address && (
                <p className="error-text">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Ciudad</label>
                <input
                  {...register("city", {
                    maxLength: {
                      value: 100,
                      message: "Máximo 100 caracteres",
                    },
                  })}
                  className={`input ${errors.city ? "input-error" : ""}`}
                  placeholder="Caracas"
                />
                {errors.city && (
                  <p className="error-text">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="label">País</label>
                <input
                  {...register("country", {
                    maxLength: {
                      value: 100,
                      message: "Máximo 100 caracteres",
                    },
                  })}
                  className={`input ${errors.country ? "input-error" : ""}`}
                  placeholder="Venezuela"
                />
                {errors.country && (
                  <p className="error-text">{errors.country.message}</p>
                )}
              </div>

              <div>
                <label className="label">Código Postal</label>
                <input
                  {...register("postalCode", {
                    maxLength: {
                      value: 20,
                      message: "Máximo 20 caracteres",
                    },
                  })}
                  className={`input ${errors.postalCode ? "input-error" : ""}`}
                  placeholder="1010"
                />
                {errors.postalCode && (
                  <p className="error-text">{errors.postalCode.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SECCIÓN: REDES SOCIALES
            ══════════════════════════════════════════ */}
        <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-dark-100">
          <div className="flex justify-between items-center border-b border-surface-200 dark:border-dark-100 pb-2 mb-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Instagram size={16} /> Redes Sociales
            </h3>
            <button
              type="button"
              onClick={() => appendSocial({ platform: "instagram", url: "" })}
              className="text-xs font-bold text-biovet-600 hover:bg-biovet-50 dark:hover:bg-biovet-900/20 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus size={14} /> Agregar Red
            </button>
          </div>

          <div className="space-y-3">
            {socialFields.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-surface-200 dark:border-dark-50 rounded-xl">
                <Instagram className="w-8 h-8 mx-auto text-slate-300 mb-2 opacity-50" />
                <p className="text-xs text-slate-400">
                  No hay redes sociales agregadas
                </p>
              </div>
            ) : (
              socialFields.map((field, index) => {
                const PlatformIcon =
                  PLATFORM_ICONS[field.platform] || LinkIcon;
                return (
                  <div
                    key={field.id}
                    className="flex gap-3 items-start bg-surface-50 dark:bg-dark-100 p-3 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-dark-200 flex items-center justify-center text-slate-400 border border-surface-200 dark:border-dark-50">
                      <PlatformIcon size={18} />
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <select
                        {...register(`socialMedia.${index}.platform`)}
                        className="input text-sm appearance-none bg-size-[16px_16px] bg-position-[right_12px_center] bg-no-repeat pr-10"
                        style={selectStyles}
                      >
                        {Object.entries(SOCIAL_PLATFORMS).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          )
                        )}
                      </select>

                      <div className="md:col-span-2">
                        <input
                          {...register(`socialMedia.${index}.url`, {
                            pattern: {
                              value: URL_REGEX,
                              message: "URL inválida",
                            },
                          })}
                          className={`input text-sm ${
                            errors.socialMedia?.[index]?.url ? "input-error" : ""
                          }`}
                          placeholder="https://www.instagram.com/tuusuario"
                        />
                        {errors.socialMedia?.[index]?.url && (
                          <p className="error-text text-[10px] mt-1">
                            {errors.socialMedia[index]?.url?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSocial(index)}
                      className="p-2 text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SECCIÓN: HORARIO
            ══════════════════════════════════════════ */}
        <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-dark-100">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-surface-200 dark:border-dark-100 pb-2 mb-6 flex items-center gap-2">
            <Clock size={16} /> Horario de Atención
          </h3>

          <div>
            <label className="label flex items-center gap-1.5">
              <Clock size={14} className="text-slate-400" />
              Horario
            </label>
            <textarea
              {...register("businessHours", {
                maxLength: {
                  value: 500,
                  message: "Máximo 500 caracteres",
                },
              })}
              rows={3}
              className={`input resize-none ${errors.businessHours ? "input-error" : ""}`}
              placeholder="Lun-Vie: 8:00 AM - 6:00 PM&#10;Sáb: 8:00 AM - 12:00 PM&#10;Dom: Cerrado"
            />
            {errors.businessHours ? (
              <p className="error-text">{errors.businessHours.message}</p>
            ) : (
              <p className="helper-text mt-2">
                Puedes escribir el horario en varias líneas
              </p>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SECCIÓN: DESCRIPCIÓN
            ══════════════════════════════════════════ */}
        <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-dark-100">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-surface-200 dark:border-dark-100 pb-2 mb-6 flex items-center gap-2">
            <FileText size={16} /> Descripción
          </h3>

          <textarea
            {...register("description", {
              maxLength: {
                value: 1000,
                message: "Máximo 1000 caracteres",
              },
            })}
            rows={4}
            className={`input resize-none ${errors.description ? "input-error" : ""}`}
            placeholder="Cuéntale a tus clientes sobre tu clínica, especialidades, trayectoria..."
          />
          {errors.description ? (
            <p className="error-text">{errors.description.message}</p>
          ) : (
            <p className="helper-text mt-2">Máximo 1000 caracteres</p>
          )}
        </div>

        {/* ══════════════════════════════════════════
            FOOTER: BOTONES
            ══════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          {isDirty && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 sm:mr-auto">
              <AlertCircle size={16} />
              <span>Tienes cambios sin guardar</span>
            </div>
          )}

          {/* Mostrar cantidad de errores si existen */}
          {Object.keys(errors).length > 0 && (
            <div className="flex items-center gap-2 text-sm text-danger-500 sm:mr-auto">
              <AlertCircle size={16} />
              <span>
                {Object.keys(errors).length} campo(s) con errores
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary px-8 shadow-lg shadow-biovet-500/20"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Guardar Cambios" : "Crear Clínica"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}