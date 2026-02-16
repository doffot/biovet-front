import { formatLongDate } from "@/utils/dashboardUtils";
import { Clock } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
  authData?: {
    isLegacyUser?: boolean;
    planType?: "trial" | "basic" | "premium";
    trialEndedAt?: string;
    patientCount?: number;
  };
}

export function DashboardHeader({ userName, authData }: DashboardHeaderProps) {
  const getTrialInfo = () => {
    if (!authData || authData.isLegacyUser) return null;
    if (authData.planType === "trial" && authData.trialEndedAt) {
      const now = new Date();
      const end = new Date(authData.trialEndedAt);
      const diffDays = Math.ceil(
        (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays > 0) {
        return `${diffDays} día${diffDays !== 1 ? "s" : ""} restante${diffDays !== 1 ? "s" : ""}`;
      } else {
        return "Trial expirado";
      }
    }
    return null;
  };

  const getPatientInfo = () => {
    if (!authData || authData.isLegacyUser) return null;
    const limit =
      authData.planType === "trial"
        ? 50
        : authData.planType === "basic"
          ? 100
          : 500;
    return `${authData.patientCount || 0}/${limit} pacientes`;
  };

  const trialInfo = getTrialInfo();
  const patientInfo = getPatientInfo();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Texto principal */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-800 dark:text-white">
          ¡Bienvenido,{" "}
          <span className="text-biovet-500 dark:text-biovet-400">
            {userName}
          </span>
          !
        </h1>
        <p className="text-surface-500 dark:text-slate-400 mt-1">
          Panel de control de tu clínica veterinaria
        </p>

        {/* Badges de plan */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {authData?.isLegacyUser ? (
            <span className="badge bg-biovet-50 text-biovet-700 border-biovet-200 dark:bg-biovet-950 dark:text-biovet-300 dark:border-biovet-800">
              Versión Platinum VIP
            </span>
          ) : (
            <>
              <span className="badge badge-success">Versión Gratuita</span>

              {trialInfo && (
                <span className="badge badge-warning">{trialInfo}</span>
              )}

              {patientInfo && (
                <span className="badge badge-biovet">{patientInfo}</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Fecha */}
      <div
        className="flex items-center gap-2 
                      bg-white/60 dark:bg-dark-100/60 
                      backdrop-blur-sm 
                      px-4 py-2.5 
                      rounded-xl 
                      border border-surface-300 dark:border-slate-700 
                      shadow-sm"
      >
        <Clock className="w-4 h-4 text-biovet-500 dark:text-biovet-400 animate-pulse" />
        <span className="text-sm font-medium text-surface-700 dark:text-slate-200">
          {formatLongDate(new Date())}
        </span>
      </div>
    </div>
  );
}