import { Shield, AlertTriangle } from "lucide-react";
import { AlertItem } from "./AlertItem";
import type {
  DewormingWithDaysLeft,
  VaccinationWithDaysLeft,
} from "../../hooks/useDashboardData";

interface AlertsSectionProps {
  vaccinations: VaccinationWithDaysLeft[];
  dewormings: DewormingWithDaysLeft[];
}

export function AlertsSection({
  vaccinations,
  dewormings,
}: AlertsSectionProps) {
  const totalAlerts = vaccinations.length + dewormings.length;
  const isEmpty = totalAlerts === 0;

  const allAlerts = [...vaccinations, ...dewormings].sort(
    (a, b) => a.daysLeft - b.daysLeft
  );
  const urgentCount = allAlerts.filter((a) => a.daysLeft <= 3).length;

  return (
    <div
      className="bg-white/40 dark:bg-dark-100/40 
                    backdrop-blur-sm rounded-2xl 
                    border border-surface-300 dark:border-slate-700 
                    overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div
        className="px-4 py-3 
                      bg-warning-50/50 dark:bg-warning-950/30 
                      border-b border-surface-300 dark:border-slate-700 
                      flex items-center justify-between"
      >
        <h2 className="font-semibold text-surface-800 dark:text-white flex items-center gap-2">
          <div
            className="p-1.5 
                          bg-warning-50 dark:bg-warning-950 
                          rounded-lg 
                          border border-warning-200 dark:border-warning-800"
          >
            <Shield className="w-4 h-4 text-warning-500 dark:text-warning-400" />
          </div>
          <span className="hidden sm:inline">Próximos Vencimientos</span>
          <span className="sm:hidden">Vencimientos</span>
        </h2>

        <div className="flex items-center gap-2">
          {urgentCount > 0 && (
            <span
              className="flex items-center gap-1 
                            badge badge-danger animate-pulse"
            >
              <AlertTriangle className="w-3 h-3" />
              {urgentCount} {urgentCount === 1 ? "urgente" : "urgentes"}
            </span>
          )}
          <span className="badge badge-warning">{totalAlerts}</span>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="p-4">
        {isEmpty ? (
          <div className="text-center py-12">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div
                className="absolute inset-0 
                              bg-success-100 dark:bg-success-950 
                              rounded-full animate-pulse blur-xl"
              ></div>
              <div
                className="relative w-16 h-16 
                              bg-success-50 dark:bg-success-950 
                              rounded-full flex items-center justify-center 
                              border border-success-200 dark:border-success-800"
              >
                <Shield className="w-8 h-8 text-success-500 dark:text-success-400" />
              </div>
            </div>
            <p className="text-surface-800 dark:text-slate-200 text-sm font-semibold">
              ¡Todo al día!
            </p>
            <p className="text-surface-500 dark:text-slate-400 text-xs mt-1">
              No hay vencimientos próximos
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-95 overflow-y-auto pr-1 custom-scrollbar">
            {allAlerts.map((item, index) => (
              <div key={item._id}>
                {/* Separador después del tercer elemento */}
                {index === 3 && (
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-surface-300 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span
                        className="bg-white dark:bg-dark-100 
                                      px-3 py-1 
                                      text-surface-500 dark:text-slate-400 
                                      rounded-full 
                                      border border-surface-300 dark:border-slate-700 
                                      shadow-sm font-medium"
                      >
                        +{totalAlerts - 3} vencimientos adicionales
                      </span>
                    </div>
                  </div>
                )}

                <AlertItem
                  title={
                    "vaccineType" in item ? item.vaccineType : item.productName
                  }
                  type={
                    "vaccineType" in item ? "vacuna" : "desparasitacion"
                  }
                  daysLeft={item.daysLeft}
                  patientData={item.patientData}
                  ownerData={item.ownerData}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}