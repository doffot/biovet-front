import { useNavigate } from "react-router-dom";
import { Syringe, Bug, PawPrint, User } from "lucide-react";
import type { Patient } from "@/types/patient";
import type { Owner } from "@/types/appointment";

export type AlertType = "vacuna" | "desparasitacion";

interface AlertItemProps {
  title: string;
  type: AlertType;
  daysLeft: number;
  patientData?: Patient;
  ownerData?: Owner;
}

export function AlertItem({
  title,
  type,
  daysLeft,
  patientData,
  ownerData,
}: AlertItemProps) {
  const navigate = useNavigate();
  const isUrgent = daysLeft <= 3;
  const Icon = type === "vacuna" ? Syringe : Bug;

  const getDaysLabel = () => {
    if (daysLeft === 0) return "Hoy";
    if (daysLeft === 1) return "Mañana";
    return `${daysLeft}d`;
  };

  return (
    <div
      onClick={() =>
        patientData?._id && navigate(`/patients/${patientData._id}`)
      }
      style={{
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      className={`
        flex items-center gap-2.5 p-2.5 rounded-xl
        border backdrop-blur-sm cursor-pointer
        hover:translate-x-1 hover:shadow-md
        ${
          isUrgent
            ? "bg-danger-50/50 dark:bg-danger-950/50 border-danger-200 dark:border-danger-800 hover:bg-danger-50 dark:hover:bg-danger-950 hover:border-danger-300 dark:hover:border-danger-700 hover:shadow-danger-500/10"
            : "bg-warning-50/50 dark:bg-warning-950/50 border-warning-200 dark:border-warning-800 hover:bg-warning-50 dark:hover:bg-warning-950 hover:border-warning-300 dark:hover:border-warning-700 hover:shadow-warning-500/10"
        }
      `}
    >
      {/* Miniatura de la Mascota */}
      <div className="relative shrink-0">
        <div
          className={`
            w-9 h-9 rounded-full border overflow-hidden 
            flex items-center justify-center 
            bg-white dark:bg-dark-100
            ${isUrgent ? "border-danger-300 dark:border-danger-700" : "border-warning-300 dark:border-warning-700"}
          `}
        >
          {patientData?.photo ? (
            <img
              src={patientData.photo}
              alt={patientData.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="bg-surface-100 dark:bg-dark-200 
                         w-full h-full flex items-center justify-center 
                         text-surface-500 dark:text-slate-500"
            >
              <PawPrint className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Mini badge de tipo */}
        <div
          className={`
            absolute -bottom-0.5 -right-0.5 p-0.5 
            rounded-full border shadow-sm
            ${
              isUrgent
                ? "bg-danger-500 text-white border-danger-200 dark:border-danger-800"
                : "bg-warning-500 text-white border-warning-200 dark:border-warning-800"
            }
          `}
        >
          <Icon className="w-2.5 h-2.5" />
        </div>
      </div>

      {/* Información principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-bold text-surface-800 dark:text-white text-xs sm:text-sm truncate">
            {patientData?.name || "Cargando..."}
          </p>
          {isUrgent && (
            <div className="flex h-1.5 w-1.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-danger-500"></span>
            </div>
          )}
        </div>

        <p className="text-[10px] font-medium text-surface-500 dark:text-slate-400 truncate leading-tight mt-0.5">
          {title}
        </p>

        <div className="flex items-center gap-1 text-[10px] text-surface-500/70 dark:text-slate-500 mt-0.5">
          <User className="w-2.5 h-2.5 shrink-0" />
          <span className="truncate">
            {ownerData
              ? `${ownerData.name}${ownerData.contact ? ` • ${ownerData.contact}` : ""}`
              : patientData
                ? "Buscando dueño..."
                : "---"}
          </span>
        </div>
      </div>

      {/* Badge de días restantes */}
      <div
        className={`
          text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0
          ${
            isUrgent
              ? "bg-danger-50 dark:bg-danger-950 text-danger-600 dark:text-danger-400 border-danger-200 dark:border-danger-800"
              : "bg-warning-50 dark:bg-warning-950 text-warning-600 dark:text-warning-400 border-warning-200 dark:border-warning-800"
          }
        `}
      >
        {getDaysLabel()}
      </div>
    </div>
  );
}