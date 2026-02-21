import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  Loader2,
  FileText,
  Activity,
  PawPrint,
  ChevronRight,
} from "lucide-react";
import { toast } from "../../components/Toast";
import { getLabExamById, updateLabExam } from "../../api/labExamAPI";
import { useForm } from "react-hook-form";
import type { LabExamFormData } from "@/types/labExam";

const normalValues = {
  canino: {
    hematocrit: [37, 55],
    whiteBloodCells: [6, 17],
    totalProtein: [5.4, 7.8],
    platelets: [175, 500],
  },
  felino: {
    hematocrit: [30, 45],
    whiteBloodCells: [5.5, 19.5],
    totalProtein: [5.7, 8.9],
    platelets: [180, 500],
  },
};

type EditableFields = {
  patientName: string;
  species: "canino" | "felino";
  breed: string;
  sex: string;
  age: string;
  ownerName: string;
  ownerPhone: string;
  date: string;
  hematocrit: number;
  whiteBloodCells: number;
  totalProtein: number;
  platelets: number;
  hemotropico: string;
  observacion: string;
};

export default function EditLabExamView() {
  const { id, labExamId } = useParams<{ id?: string; labExamId?: string }>();
  const examId = id || labExamId;
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"patient" | "general" | "observations">("patient");

  const { data: exam, isLoading, isError } = useQuery({
    queryKey: ["labExam", examId],
    queryFn: () => getLabExamById(examId!),
    enabled: !!examId,
  });

  const { register, handleSubmit, formState: { isDirty }, reset, watch } = useForm<EditableFields>();

  useEffect(() => {
    if (exam) {
      reset({
        patientName: exam.patientName || "",
        species: (exam.species?.toLowerCase() === "felino" ? "felino" : "canino") as "canino" | "felino",
        breed: exam.breed || "",
        sex: exam.sex || "",
        age: exam.age || "",
        ownerName: exam.ownerName || "",
        ownerPhone: exam.ownerPhone || "",
        date: exam.date ? new Date(exam.date).toISOString().split("T")[0] : "",
        hematocrit: exam.hematocrit,
        whiteBloodCells: exam.whiteBloodCells,
        totalProtein: exam.totalProtein,
        platelets: exam.platelets,
        hemotropico: exam.hemotropico || "",
        observacion: exam.observacion || "",
      });
    }
  }, [exam, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Partial<LabExamFormData>) => updateLabExam(examId!, data),
    onSuccess: () => {
      toast.success("Examen actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["labExam", examId] });
      navigate(`/lab`); // Ajustado a tu ruta base de laboratorios
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: EditableFields) => mutate(data);

  const species = watch("species") || "canino";
  const isOutOfRange = (value: number | undefined, key: keyof typeof normalValues.canino) => {
    if (value === undefined) return false;
    const range = normalValues[species][key];
    return value < range[0] || value > range[1];
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-10 h-10 text-biovet-500 animate-spin" />
    </div>
  );

  if (isError || !exam) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertTriangle className="w-12 h-12 text-red-500" />
      <p className="text-slate-400">Examen no encontrado</p>
      <Link to="/lab" className="btn-secondary">Volver a la lista</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-surface-100 dark:bg-dark-100 text-slate-500 hover:text-biovet-500 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Editar Hemograma</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-bold text-biovet-500 uppercase tracking-widest text-xs">ID: {examId?.slice(-6)}</span>
              <ChevronRight className="w-3 h-3" />
              <span>Paciente: {watch("patientName")}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-wider rounded-lg">
            Modo Edición
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-200 border border-surface-200 dark:border-dark-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
        
        {/* Tabs Estilizados */}
        <div className="flex border-b border-surface-200 dark:border-dark-100 bg-surface-50/50 dark:bg-dark-300/50">
          {[
            { id: "patient", label: "Paciente", icon: PawPrint },
            { id: "general", label: "Valores", icon: Activity },
            { id: "observations", label: "Observaciones", icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                ? "text-biovet-500 border-b-2 border-biovet-500 bg-white dark:bg-dark-200" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-surface-100 dark:hover:bg-dark-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
          
          {/* TAB: PACIENTE */}
          {activeTab === "patient" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label">Nombre del Paciente</label>
                  <input {...register("patientName", { required: true })} className="input" placeholder="Nombre completo" />
                </div>
                <div className="space-y-2">
                  <label className="label">Especie</label>
                  <select {...register("species")} className="input">
                    <option value="canino">Canino</option>
                    <option value="felino">Felino</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="label">Raza</label>
                  <input {...register("breed")} className="input" placeholder="Ej: Beagle" />
                </div>
                <div className="space-y-2">
                  <label className="label">Sexo</label>
                  <select {...register("sex")} className="input">
                    <option value="macho">Macho</option>
                    <option value="hembra">Hembra</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-6 border-t border-surface-200 dark:border-dark-100">
                <h3 className="text-[10px] font-black text-biovet-500 uppercase tracking-[0.2em] mb-6">Información del Propietario</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label">Nombre del Dueño</label>
                    <input {...register("ownerName")} className="input" placeholder="Nombre completo" />
                  </div>
                  <div className="space-y-2">
                    <label className="label">Teléfono de Contacto</label>
                    <input {...register("ownerPhone")} className="input" placeholder="Ej: +58..." />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VALORES */}
          {activeTab === "general" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-full md:w-1/3 space-y-2">
                <label className="label">Fecha del Examen</label>
                <input type="date" {...register("date")} className="input" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { name: "hematocrit", label: "Hematocrito (%)", key: "hematocrit" as const },
                  { name: "whiteBloodCells", label: "WBC (x10³/µL)", key: "whiteBloodCells" as const },
                  { name: "totalProtein", label: "Proteínas (g/dL)", key: "totalProtein" as const },
                  { name: "platelets", label: "Plaquetas (x10³/µL)", key: "platelets" as const },
                ].map((field) => {
                  const outOfRange = isOutOfRange(watch(field.name as any), field.key);
                  return (
                    <div key={field.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="label">{field.label}</label>
                        <span className="text-[10px] font-bold text-slate-400">Ref: {normalValues[species][field.key][0]} - {normalValues[species][field.key][1]}</span>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        {...register(field.name as any, { valueAsNumber: true })}
                        className={`input ${outOfRange ? "border-red-500 text-red-500 focus:border-red-500 focus:ring-red-500/10" : ""}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: OBSERVACIONES */}
          {activeTab === "observations" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-2">
                <label className="label">Hemotrópicos</label>
                <textarea {...register("hemotropico")} rows={3} className="input min-h-25 resize-none" placeholder="Hallazgos de parásitos en sangre..." />
              </div>
              <div className="space-y-2">
                <label className="label">Observaciones Generales</label>
                <textarea {...register("observacion")} rows={6} className="input min-h-50 resize-none" placeholder="Notas adicionales del examen..." />
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="mt-10 pt-8 border-t border-surface-200 dark:border-dark-100 flex flex-col md:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary flex-1 py-4 uppercase text-xs tracking-widest"
            >
              Descartar Cambios
            </button>
            <button
              type="submit"
              disabled={isPending || !isDirty}
              className="btn-primary flex-2 py-4 uppercase text-xs tracking-widest flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Actualizar Hemograma
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}