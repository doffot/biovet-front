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
// PLAN BADGE COMPONENT
// ═══════════════════════════════════════════
interface PlanBadgeProps {
  planType?: "trial" | "basic" | "premium";
  isLegacyUser?: boolean;
  trialEndedAt?: string | null;
  patientCount?: number;
}

function PlanBadge({ planType, isLegacyUser, trialEndedAt, patientCount = 0 }: PlanBadgeProps) {
  const MAX_PATIENTS_TRIAL = 50;

  // Calcular días restantes del trial
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

  // Porcentaje de pacientes usados
  const patientPercentage = (patientCount / MAX_PATIENTS_TRIAL) * 100;

  // Usuario Legacy/VIP
  if (isLegacyUser) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-300 dark:border-amber-700 shadow-sm">
        <Crown className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
          Platinum VIP
        </span>
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
      </div>
    );
  }

  // Plan Trial
  if (planType === "trial") {
    const isUrgent = trialDaysLeft !== null && trialDaysLeft <= 7;
    const isExpired = trialDaysLeft !== null && trialDaysLeft <= 0;
    const isPatientLimitClose = patientPercentage >= 90;
    
    return (
      <div className="flex flex-wrap items-center gap-2">
        {/* Badge del Plan Trial */}
        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm
          ${isExpired 
            ? "bg-danger-50 dark:bg-danger-950 border-danger-300 dark:border-danger-800" 
            : isUrgent 
              ? "bg-warning-50 dark:bg-warning-950 border-warning-300 dark:border-warning-800"
              : "bg-biovet-50 dark:bg-biovet-950 border-biovet-300 dark:border-biovet-800"
          }
        `}>
          <Clock className={`w-4 h-4 ${
            isExpired ? "text-danger-500" : isUrgent ? "text-warning-500" : "text-biovet-500"
          }`} />
          <span className={`text-xs font-black uppercase tracking-wider ${
            isExpired 
              ? "text-danger-700 dark:text-danger-400" 
              : isUrgent 
                ? "text-warning-700 dark:text-warning-400" 
                : "text-biovet-700 dark:text-biovet-400"
          }`}>
            Trial
          </span>
          {trialDaysLeft !== null && (
            <span className={`
              px-2 py-0.5 rounded-full text-[10px] font-black
              ${isExpired 
                ? "bg-danger-500 text-white" 
                : isUrgent 
                  ? "bg-warning-500 text-white"
                  : "bg-biovet-500 text-white"
              }
            `}>
              {isExpired ? "Expirado" : `${trialDaysLeft}d`}
            </span>
          )}
        </div>

        {/* Contador de Pacientes */}
        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm
          ${isPatientLimitClose 
            ? "bg-warning-50 dark:bg-warning-950 border-warning-300 dark:border-warning-800" 
            : "bg-surface-50 dark:bg-dark-100 border-surface-300 dark:border-slate-700"
          }
        `}>
          <Users className={`w-4 h-4 ${isPatientLimitClose ? "text-warning-500" : "text-slate-500"}`} />
          <div className="flex items-center gap-1">
            <span className={`text-xs font-black ${isPatientLimitClose ? "text-warning-700 dark:text-warning-400" : "text-slate-700 dark:text-slate-300"}`}>
              {patientCount}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">/</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{MAX_PATIENTS_TRIAL}</span>
          </div>
          
          {/* Barra de progreso mini */}
          <div className="w-12 h-1.5 bg-surface-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                patientPercentage >= 100 
                  ? "bg-danger-500" 
                  : patientPercentage >= 90 
                    ? "bg-warning-500" 
                    : "bg-biovet-500"
              }`}
              style={{ width: `${Math.min(100, patientPercentage)}%` }}
            />
          </div>

          {isPatientLimitClose && patientPercentage < 100 && (
            <AlertTriangle className="w-3.5 h-3.5 text-warning-500 animate-pulse" />
          )}
        </div>

        {/* Alerta si está lleno */}
        {patientCount >= MAX_PATIENTS_TRIAL && (
          <span className="px-2 py-1 rounded-full bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-300 text-[10px] font-bold">
            Límite alcanzado
          </span>
        )}
      </div>
    );
  }

  // Plan Basic
  if (planType === "basic") {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-biovet-50 dark:bg-biovet-950 border border-biovet-300 dark:border-biovet-800 shadow-sm">
        <Sparkles className="w-4 h-4 text-biovet-500" />
        <span className="text-xs font-black uppercase tracking-wider text-biovet-700 dark:text-biovet-400">
          Plan Basic
        </span>
      </div>
    );
  }

  // Plan Premium
  if (planType === "premium") {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-300 dark:border-emerald-700 shadow-sm">
        <Crown className="w-4 h-4 text-emerald-500" />
        <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          Plan Premium
        </span>
        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
      </div>
    );
  }

  // Sin plan definido
  return null;
}

// ═══════════════════════════════════════════
// DASHBOARD HEADER
// ═══════════════════════════════════════════
export function DashboardHeader({ userName, authData, clinicData }: DashboardHeaderProps) {
  const isClinicIncomplete = !clinicData?.logo || !clinicData?.rif || !clinicData?.name || clinicData?.name === "Mi Clínica Veterinaria";

  return (
    <div className="bg-biovet-50 dark:bg-dark-200 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center gap-6 lg:gap-8 relative overflow-hidden">
      
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-biovet-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-biovet-500/5 rounded-full -ml-24 -mb-24 blur-3xl pointer-events-none" />

      {/* SECCIÓN 1: LOGO DE LA CLÍNICA */}
      <div className="relative shrink-0">
        <Link 
          to="/settings/clinic"
          className={`relative flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-2xl border-2 transition-all overflow-hidden group ${
            !clinicData?.logo 
              ? "border-dashed border-warning-300 bg-warning-50 dark:border-warning-700 dark:bg-warning-500/10" 
              : "border-transparent shadow-lg"
          }`}
        >
          {clinicData?.logo ? (
            <img 
              src={clinicData.logo} 
              alt="Clinic Logo" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
          ) : (
            <div className="flex flex-col items-center text-warning-500">
              <Camera size={24} />
              <span className="text-[9px] font-black mt-1 uppercase">Subir Logo</span>
            </div>
          )}
        </Link>
      </div>

      {/* SECCIÓN 2: CONTENIDO PRINCIPAL */}
      <div className="flex-1 space-y-3 text-center lg:text-left z-10">
        {/* Nombre de la Clínica */}
        <p className="text-biovet-600 dark:text-biovet-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">
          {clinicData?.name || "Mi Clínica Veterinaria"}
        </p>
        
        {/* Saludo */}
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">
          ¡Bienvenido, <span className="text-slate-400 dark:text-slate-500">{userName}</span>!
        </h1>

        {/* Badge del Plan */}
        <div className="flex justify-center lg:justify-start pt-1">
          <PlanBadge 
            planType={authData?.planType}
            isLegacyUser={authData?.isLegacyUser}
            trialEndedAt={authData?.trialEndedAt}
            patientCount={authData?.patientCount}
          />
        </div>

        {/* Info adicional */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm font-medium text-slate-500 dark:text-slate-400 pt-2">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-biovet-500" />
            <span>{clinicData?.city ? `${clinicData.city}, ${clinicData.country}` : "Ubicación pendiente"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Hash size={14} className="text-biovet-500" />
            <span>{clinicData?.rif ? `RIF: ${clinicData.rif}` : "RIF: Pendiente"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarIcon size={14} className="text-biovet-500" />
            <span className="text-xs font-bold uppercase tracking-wide">
              {formatLongDate(new Date())}
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: ACCIONES */}
      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-center gap-4 lg:justify-between lg:self-stretch shrink-0 z-10">
        
        {/* Botón de Configuración */}
        <Link
          to="/settings/clinic"
          className={`group flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl transition-all shadow-sm ${
            isClinicIncomplete
              ? "bg-warning-100 dark:bg-warning-900/30 text-warning-500 ring-4 ring-warning-500/20"
              : "bg-white dark:bg-dark-100 text-slate-400 hover:text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-950"
          }`}
          title={isClinicIncomplete ? "Completa los datos de tu clínica" : "Configuración"}
        >
          <Settings2 
            size={22} 
            className={isClinicIncomplete ? "animate-spin" : "group-hover:rotate-90 transition-transform duration-500"} 
            style={isClinicIncomplete ? { animationDuration: "3s" } : {}}
          />
        </Link>

        {/* Powered by */}
        <div className="hidden lg:flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
            Powered by
          </span>
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
            BioVetTrack
          </span>
        </div>
      </div>
    </div>
  );
}