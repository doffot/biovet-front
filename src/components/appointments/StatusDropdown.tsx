import { useState, useRef, useEffect } from "react";
import { 
  ChevronDown, 
  CalendarClock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2 
} from "lucide-react";
import type { AppointmentStatus } from "../../types/appointment";

interface StatusDropdownProps {
  currentStatus: AppointmentStatus;
  onStatusChange: (status: AppointmentStatus) => void;
  isUpdating?: boolean;
}

const statusOptions: {
  value: AppointmentStatus;
  label: string;
  icon: React.ReactNode;
  colors: {
    bg: string;
    text: string;
    hover: string;
    activeBg: string;
  };
}[] = [
  {
    value: "Programada",
    label: "Programada",
    icon: <CalendarClock className="w-4 h-4" />,
    colors: {
      bg: "bg-blue-600/10",
      text: "text-blue-400",
      hover: "hover:bg-blue-600/20",
      activeBg: "bg-blue-600/20",
    },
  },
  {
    value: "Completada",
    label: "Completada",
    icon: <CheckCircle2 className="w-4 h-4" />,
    colors: {
      bg: "bg-emerald-600/10",
      text: "text-emerald-400",
      hover: "hover:bg-emerald-600/20",
      activeBg: "bg-emerald-600/20",
    },
  },
  {
    value: "Cancelada",
    label: "Cancelada",
    icon: <XCircle className="w-4 h-4" />,
    colors: {
      bg: "bg-red-600/10",
      text: "text-red-400",
      hover: "hover:bg-red-600/20",
      activeBg: "bg-red-600/20",
    },
  },
  {
    value: "No asistió",
    label: "No asistió",
    icon: <AlertCircle className="w-4 h-4" />,
    colors: {
      bg: "bg-amber-600/10",
      text: "text-amber-400",
      hover: "hover:bg-amber-600/20",
      activeBg: "bg-amber-600/20",
    },
  },
];

export default function StatusDropdown({ 
  currentStatus, 
  onStatusChange, 
  isUpdating = false 
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = statusOptions.find(opt => opt.value === currentStatus) || statusOptions[0];

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSelect = (status: AppointmentStatus) => {
    if (status !== currentStatus && !isUpdating) {
      onStatusChange(status);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón del Dropdown */}
      <button
        onClick={() => !isUpdating && setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`
          flex items-center gap-3 px-4 py-2.5 rounded-xl border
          ${currentOption.colors.bg} ${currentOption.colors.text} 
          border-current/20 hover:border-current/40
          transition-all duration-200 min-w-[180px]
          disabled:opacity-70 disabled:cursor-not-allowed
        `}
      >
        {isUpdating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          currentOption.icon
        )}
        <span className="font-semibold flex-1 text-left">
          {isUpdating ? "Actualizando..." : currentOption.label}
        </span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-[var(--color-card)] rounded-xl shadow-lg border border-[var(--color-border)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {statusOptions.map((option) => {
            const isActive = option.value === currentStatus;
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left
                  transition-colors duration-150
                  ${option.colors.text}
                  ${isActive ? option.colors.activeBg : option.colors.hover}
                  ${isActive ? "font-semibold" : "font-medium"}
                `}
              >
                {option.icon}
                <span className="flex-1">{option.label}</span>
                {isActive && (
                  <div className={`w-2 h-2 rounded-full ${option.colors.text} bg-current`} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}