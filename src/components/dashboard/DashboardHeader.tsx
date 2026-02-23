// src/components/dashboard/DashboardHeader.tsx
import { Settings2, Camera, MapPin, Hash } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardHeaderProps {
  userName: string;
  clinicData?: {
    name?: string;
    logo?: string | null;
    rif?: string;
    city?: string;
    country?: string;
  } | null;
  authData?: {
    name?: string;
    isLegacyUser?: boolean;
    planType?: "trial" | "basic" | "premium";
    trialEndedAt?: string | null;
    patientCount?: number;
  };
}

export function DashboardHeader({ userName, authData, clinicData }: DashboardHeaderProps) {
  const isClinicIncomplete = !clinicData?.logo || !clinicData?.rif || !clinicData?.name || clinicData?.name === "Mi Clínica Veterinaria";

  return (
    <div className="bg-biovet-50 dark:bg-dark-200 rounded-lg p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
      
      {/* Decoración de fondo sutil */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-biovet-500/5 rounded-md -mr-32 -mt-32 blur-3xl pointer-events-none" />

      {/* SECCIÓN 1: LOGO DE LA CLÍNICA */}
      <div className="relative shrink-0">
        <Link 
          to="/settings/clinic"
          className={`relative flex items-center justify-center w-28 h-28 rounded-3xl border-2 transition-all overflow-hidden group ${
            !clinicData?.logo 
              ? "border-dashed border-warning-300 bg-warning-50 dark:border-warning-900/50 dark:bg-warning-500/5 animate-pulse" 
              : "border-none  "
          }`}
        >
          {clinicData?.logo ? (
            <img src={clinicData.logo} alt="Clinic Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="flex flex-col items-center text-warning-500">
              <Camera size={28} />
              <span className="text-[10px] font-black mt-1">SUBIR LOGO</span>
            </div>
          )}
        </Link>
      </div>

      {/* SECCIÓN 2: NOMBRE CLÍNICA + SALUDO + INFO */}
      <div className="flex-1 space-y-2 text-center md:text-left z-10">
        <div className="space-y-0.5">
          {/* Nombre de la Clínica como Título Principal */}
          <h2 className="text-biovet-500 font-black text-xs uppercase tracking-[0.2em]">
            {clinicData?.name || "Mi Clínica Veterinaria"}
          </h2>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">
              ¡Bienvenido, <span className="text-slate-400 dark:text-slate-500">{userName}</span>!
            </h1>
            
            {authData?.isLegacyUser && (
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-biovet-500/10 text-biovet-600 border border-biet-200 dark:border-biovet-500/30">
                • PLATINUM VIP
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm font-semibold text-slate-500 dark:text-slate-400 pt-3">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-biovet-500" />
              <span>{clinicData?.city ? `${clinicData.city}, ${clinicData.country}` : "Ubicación pendiente"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-biovet-500" />
              <span>{clinicData?.rif ? `RIF: ${clinicData.rif}` : "RIF: J-00000000-0"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: SETTINGS (ARRIBA) Y POWERED BY (ABAJO) */}
      <div className="flex flex-col items-end justify-between self-stretch shrink-0">
        
        {/* Botón de Configuración en la esquina superior derecha del bloque */}
        <Link
          to="/settings/clinic"
          className={`group flex items-center justify-center w-14 h-14 rounded-2xl transition-all shadow-sm ${
            isClinicIncomplete
              ? "bg-warning-50 text-warning-500 animate-pulse ring-4 ring-warning-500/10"
              : "bg-slate-50 text-slate-400 hover:text-biovet-500 hover:bg-biovet-50 dark:bg-white/5"
          }`}
        >
          <Settings2 size={24} className={isClinicIncomplete ? "animate-spin-slow" : "group-hover:rotate-180 transition-transform duration-700"} />
        </Link>

        {/* POWERED BY + LOGO APP en una sola línea (Esquina inferior derecha) */}
        <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity mt-4 md:mt-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Powered by</span>
          <img src="/logo_main.webp" alt="Biovet Track" className="h-5 grayscale contrast-125" />
        </div>
        
      </div>
    </div>
  );
}