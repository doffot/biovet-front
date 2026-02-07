import { useQuery } from "@tanstack/react-query";
import { getInvoices } from "@/api/invoiceAPI";
import {
  Loader2,
  Activity,
  Stethoscope,
  Syringe,
  Microscope,
  Scissors,
  Pill,
  Bug,
  FileText,
  FlaskConical,
  Calendar,
} from "lucide-react";

export function PatientMedicalLog({ patientId }: { patientId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["invoices", "patient", patientId],
    queryFn: () => getInvoices({ patientId, limit: 20 }),
  });

  const activities = (data?.invoices || [])
    .flatMap((inv: any) =>
      inv.items.map((item: any) => ({
        ...item,
        date: inv.date,
      })),
    )
    .sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

  const getCategoryConfig = (type: string, description: string) => {
    const desc = description.toLowerCase();
    const t = type.toLowerCase();

    if (
      desc.includes("hematologia") ||
      desc.includes("hemograma") ||
      desc.includes("laboratorio")
    )
      return {
        icon: FlaskConical,
        color: "text-red-500",
        bg: "bg-red-50 dark:bg-red-950/30",
        label: "Hematología/Lab",
      };
    if (t.includes("consulta"))
      return {
        icon: Stethoscope,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-950/30",
        label: "Consulta Médica",
      };
    if (t.includes("vacuna"))
      return {
        icon: Syringe,
        color: "text-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        label: "Vacunación",
      };
    if (t.includes("desparasitacion") || desc.includes("desparasitante"))
      return {
        icon: Bug,
        color: "text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-950/30",
        label: "Desparasitación",
      };
    if (
      t.includes("receta") ||
      t.includes("servicio") ||
      desc.includes("pastilla")
    )
      return {
        icon: Pill,
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-950/30",
        label: "Receta/Medicamento",
      };
    if (t.includes("examen") || t.includes("estudio"))
      return {
        icon: Microscope,
        color: "text-indigo-500",
        bg: "bg-indigo-50 dark:bg-indigo-950/30",
        label: "Examen/Estudio",
      };
    if (
      t.includes("estetica") ||
      t.includes("peluqueria") ||
      t.includes("grooming")
    )
      return {
        icon: Scissors,
        color: "text-pink-500",
        bg: "bg-pink-50 dark:bg-pink-950/30",
        label: "Estética",
      };

    return {
      icon: FileText,
      color: "text-slate-500",
      bg: "bg-slate-50 dark:bg-dark-100",
      label: "Servicio",
    };
  };

  if (isLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-biovet-500" />
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-200 lg:rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="p-5 border-b border-slate-50 dark:border-dark-100 flex justify-between items-center shrink-0">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-tighter italic">
          <Activity className="text-biovet-500" size={18} /> Historial Clínico
        </h3>
        <span className="text-[10px] font-bold bg-slate-100 dark:bg-dark-100 px-3 py-1 rounded-full text-slate-500 uppercase">
          {activities.length} Eventos
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {/* CONTENEDOR RELATIVO CON LA LÍNEA VERTICAL CORREGIDA */}
        <div className="relative space-y-6 before:absolute before:left-3.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-dark-100">
          {activities.map((activity: any, i: number) => {
            const config = getCategoryConfig(
              activity.type,
              activity.description,
            );
            const Icon = config.icon;

            return (
              <div key={i} className="relative pl-10">
                {/* PUNTO ICONO */}
                <div
                  className={`absolute left-0 top-0 w-8 h-8 rounded-full ${config.bg} ${config.color} flex items-center justify-center border-4 border-white dark:border-dark-200 z-10 shadow-sm`}
                >
                  <Icon size={14} strokeWidth={2.5} />
                </div>

                {/* TARJETA */}
                <div className="bg-slate-50 dark:bg-dark-100 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}
                    >
                      {config.label}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <Calendar size={10} />
                      {new Date(activity.date).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">
                    {activity.description}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
