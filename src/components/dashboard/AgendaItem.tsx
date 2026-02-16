import { Calendar, Stethoscope, Scissors, User, Clock } from "lucide-react";

export type AgendaItemType = "cita" | "consulta" | "peluqueria";

interface AgendaItemProps {
  time: string;
  patientName: string;
  patientPhoto?: string | null;
  ownerName: string;
  reason?: string;
  type: AgendaItemType;
}

const CONFIG = {
  cita: {
    icon: Calendar,
    color: "text-biovet-500 dark:text-biovet-400",
    bg: "bg-biovet-50 dark:bg-biovet-950",
    border: "border-biovet-200 dark:border-biovet-800",
    iconBg: "bg-biovet-100 dark:bg-biovet-900",
    glow: "group-hover:shadow-biovet-500/10",
  },
  consulta: {
    icon: Stethoscope,
    color: "text-success-600 dark:text-success-400",
    bg: "bg-success-50 dark:bg-success-950",
    border: "border-success-200 dark:border-success-800",
    iconBg: "bg-success-100 dark:bg-success-900",
    glow: "group-hover:shadow-success-500/10",
  },
  peluqueria: {
    icon: Scissors,
    color: "text-warning-600 dark:text-warning-400",
    bg: "bg-warning-50 dark:bg-warning-950",
    border: "border-warning-200 dark:border-warning-800",
    iconBg: "bg-warning-100 dark:bg-warning-900",
    glow: "group-hover:shadow-warning-500/10",
  },
} as const;

export function AgendaItem({
  time,
  patientName,
  patientPhoto,
  ownerName,
  reason,
  type,
}: AgendaItemProps) {
  const { icon: Icon, color, bg, border, iconBg, glow } = CONFIG[type];

  return (
    <div
      className={`
        flex items-center gap-3 p-3
        bg-white/60 dark:bg-dark-100/60 
        backdrop-blur-sm
        rounded-xl border ${border}
        hover:bg-surface-50 dark:hover:bg-dark-50
        hover:shadow-sm ${glow}
        transition-all duration-300
        group
      `}
    >
      {/* Foto del paciente */}
      <div className="relative shrink-0">
        {patientPhoto ? (
          <img
            src={patientPhoto}
            alt={patientName}
            className="w-12 h-12 rounded-xl object-cover 
                       border-2 border-surface-300 dark:border-slate-700 
                       group-hover:border-biovet-400 dark:group-hover:border-biovet-500 
                       transition-colors"
          />
        ) : (
          <div
            className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center border ${border}`}
          >
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        )}

        {/* Badge tipo de evento */}
        <div
          className={`
            absolute -bottom-1 -right-1
            w-5 h-5 ${iconBg}
            rounded-full
            flex items-center justify-center
            border border-white dark:border-dark-100
            shadow-sm
          `}
        >
          <Icon className={`w-3 h-3 ${color}`} />
        </div>
      </div>

      {/* Información */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-surface-800 dark:text-white text-sm truncate">
          {patientName}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-slate-400 mt-0.5">
          <User className="w-3 h-3 shrink-0" />
          <span className="truncate">{ownerName}</span>
        </div>

        {reason && (
          <p className="text-xs text-surface-500/80 dark:text-slate-500 mt-1 truncate italic">
            "{reason}"
          </p>
        )}
      </div>

      {/* Hora con badge */}
      <div
        className={`
          flex items-center gap-1.5
          text-xs font-semibold
          ${color}
          bg-surface-50 dark:bg-dark-200
          px-3 py-2
          rounded-lg
          border border-surface-300 dark:border-slate-700
          shrink-0
          shadow-sm
        `}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>{time}</span>
      </div>
    </div>
  );
}