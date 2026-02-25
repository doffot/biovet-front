// src/components/dashboard/DashboardHeader.tsx
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Settings2, 
  Camera, 
  MapPin, 
  Hash, 
  CalendarIcon, 
  Crown, 
  Sparkles, 
  Clock, 
  Users,
  AlertTriangle
} from "lucide-react";
import { formatLongDate } from "@/utils/dashboardUtils";

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
    isActive?: boolean;
  };
}

// ═══════════════════════════════════════════
// PLAN BADGE COMPONENT (TODOS TUS DATOS ORIGINALES)
// ═══════════════════════════════════════════
interface PlanBadgeProps {
  planType?: "trial" | "basic" | "premium";
  isLegacyUser?: boolean;
  trialEndedAt?: string | null;
  patientCount?: number;
}

function PlanBadge({ planType, isLegacyUser, trialEndedAt, patientCount = 0 }: PlanBadgeProps) {
  const MAX_PATIENTS_TRIAL = 50;

  const trialDaysLeft = useMemo(() => {
    if (planType !== "trial" || !trialEndedAt) return null;
    const endDate = new Date(trialEndedAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [planType, trialEndedAt]);

  const patientPercentage = (patientCount / MAX_PATIENTS_TRIAL) * 100;

  if (isLegacyUser) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-300 dark:border-amber-700 shadow-sm">
        <Crown className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
          Platinum VIP
        </span>
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
      </div>
    );
  }

  if (planType === "trial") {
    const isUrgent = trialDaysLeft !== null && trialDaysLeft <= 7;
    const isExpired = trialDaysLeft !== null && trialDaysLeft <= 0;
    const isPatientLimitClose = patientPercentage >= 90;
    
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm ${
          isExpired ? "bg-danger-50 dark:bg-danger-950 border-danger-300 dark:border-danger-800" : 
          isUrgent ? "bg-warning-50 dark:bg-warning-950 border-warning-300 dark:border-warning-800" : 
          "bg-biovet-50 dark:bg-biovet-950 border-biovet-300 dark:border-biovet-800"
        }`}>
          <Clock className={`w-4 h-4 ${isExpired ? "text-danger-500" : isUrgent ? "text-warning-500" : "text-biovet-500"}`} />
          <span className={`text-xs font-black uppercase tracking-widest ${isExpired ? "text-danger-700 dark:text-danger-400" : isUrgent ? "text-warning-700 dark:text-warning-400" : "text-biovet-700 dark:text-biovet-400"}`}>
            Trial
          </span>
          {trialDaysLeft !== null && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isExpired ? "bg-danger-500 text-white" : isUrgent ? "bg-warning-500 text-white" : "bg-biovet-500 text-white"}`}>
              {isExpired ? "Expirado" : `${trialDaysLeft}d`}
            </span>
          )}
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm ${isPatientLimitClose ? "bg-warning-50 dark:bg-warning-950 border-warning-300 dark:border-warning-800" : "bg-surface-50 dark:bg-dark-100 border-surface-300 dark:border-slate-700"}`}>
          <Users className={`w-4 h-4 ${isPatientLimitClose ? "text-warning-500" : "text-slate-500"}`} />
          <div className="flex items-center gap-1">
            <span className={`text-xs font-black ${isPatientLimitClose ? "text-warning-700 dark:text-warning-400" : "text-slate-700 dark:text-slate-300"}`}>
              {patientCount}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">/</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{MAX_PATIENTS_TRIAL}</span>
          </div>
          <div className="w-12 h-1.5 bg-surface-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${patientPercentage >= 100 ? "bg-danger-500" : patientPercentage >= 90 ? "bg-warning-500" : "bg-biovet-500"}`} style={{ width: `${Math.min(100, patientPercentage)}%` }} />
          </div>
          {isPatientLimitClose && patientPercentage < 100 && <AlertTriangle className="w-3.5 h-3.5 text-warning-500 animate-pulse" />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-biovet-50 dark:bg-biovet-950 border border-biovet-300 dark:border-biovet-800 shadow-sm">
      <Sparkles className="w-4 h-4 text-biovet-500" />
      <span className="text-xs font-black uppercase tracking-widest text-biovet-700 dark:text-biovet-400">Plan {planType}</span>
    </div>
  );
}

// ═══════════════════════════════════════════
// DASHBOARD HEADER (TODO COMPLETO)
// ═══════════════════════════════════════════
export function DashboardHeader({ userName, authData, clinicData }: DashboardHeaderProps) {
  const isClinicIncomplete = !clinicData?.logo || !clinicData?.rif || !clinicData?.name || clinicData?.name === "Mi Clínica Veterinaria";

  return (
    <div className="bg-white dark:bg-dark-200 rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center gap-10 relative overflow-hidden transition-all duration-300">
      
      {/* 1. LOGO CLÍNICA (TAMAÑO PROTAGONISTA) */}
      <div className="relative shrink-0 z-10">
        <Link to="/settings/clinic" className={`relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-3xl border-2 transition-all overflow-hidden group shadow-xl ${!clinicData?.logo ? "border-dashed border-warning-300 bg-warning-50 dark:bg-warning-500/10" : "border-white/20 dark:border-white/5"}`}>
          {clinicData?.logo ? (
            <img src={clinicData.logo} alt="Clinic" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="flex flex-col items-center text-warning-500"><Camera size={32} /><span className="text-[10px] font-black mt-2 uppercase tracking-widest">Logo Clínica</span></div>
          )}
        </Link>
      </div>

      {/* 2. INFO CENTRAL (TUS DATOS ORIGINALES: NOMBRE, RIF, UBICACIÓN, FECHA) */}
      <div className="flex-1 space-y-4 text-center lg:text-left z-10">
        <div>
          <h2 className="text-biovet-600 dark:text-biovet-400 font-black text-lg md:text-xl uppercase tracking-[0.2em] mb-1">
            {clinicData?.name || "Mi Clínica Veterinaria"}
          </h2>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            ¡HOLA, <span className="text-slate-400 dark:text-slate-600 uppercase">{userName}</span>!
          </h1>
        </div>

        <div className="flex justify-center lg:justify-start">
          <PlanBadge {...authData} />
        </div>

        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pt-2">
          <div className="flex items-center gap-2 hover:text-biovet-500 transition-colors">
            <MapPin size={16} className="text-biovet-500" />
            <span>{clinicData?.city ? `${clinicData.city}, ${clinicData.country}` : "Ubicación pendiente"}</span>
          </div>
          <div className="flex items-center gap-2 hover:text-biovet-500 transition-colors">
            <Hash size={16} className="text-biovet-500" />
            <span>{clinicData?.rif ? `RIF: ${clinicData.rif}` : "RIF: Pendiente"}</span>
          </div>
          <div className="flex items-center gap-2 text-biovet-500">
            <CalendarIcon size={16} />
            <span className="font-black">{formatLongDate(new Date())}</span>
          </div>
        </div>
      </div>

      {/* 3. LADO DERECHO: AJUSTES Y MARCA DE AGUA (CENTRADOS ENTRE SÍ) */}
      <div className="flex flex-col items-center lg:items-end justify-between self-stretch shrink-0 z-10 gap-8 py-2">
        
        <Link to="/settings/clinic" className={`group p-4 bg-slate-50 dark:bg-dark-100 rounded-2xl transition-all border border-slate-100 dark:border-slate-800 ${isClinicIncomplete ? "ring-4 ring-warning-500/20 text-warning-500" : "text-slate-400 hover:text-biovet-500 shadow-sm"}`}>
          <Settings2 size={24} className={isClinicIncomplete ? "animate-spin" : "group-hover:rotate-90 transition-transform duration-500"} style={isClinicIncomplete ? { animationDuration: "3s" } : {}} />
        </Link>

        {/* Branding BioVetTrack: Logo arriba, Nombre medio, Slogan abajo (TODO CENTRADO) */}
        <div className="flex flex-col items-center opacity-25 hover:opacity-100 transition-all duration-700 group cursor-default">
          <img src="/logobiovet.png" alt="BioVet" className="w-12 h-12 object-contain grayscale group-hover:grayscale-0 transition-all duration-500 mb-2" />
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-black tracking-tight text-slate-600 dark:text-slate-300 leading-none">
              BioVet<span className="text-biovet-500">Track</span>
            </h3>
            <p className="text-[8px] font-bold uppercase text-slate-500 dark:text-slate-500 mt-1.5 border-t border-slate-200 dark:border-slate-700 pt-1 w-full text-center">
              Control Clínico Avanzado
            </p>
          </div>
        </div>
      </div>

      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-biovet-500/5 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
    </div>
  );
}