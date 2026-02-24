// src/components/layout/MobileHeader.tsx
import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
import {
  Bell,
  Calendar,
  Syringe,
  Bug,
  CheckCheck,
  PawPrint,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { getMyClinic } from "@/api/veterinaryClinicAPI";
import { getAllAppointments } from "../../api/appointmentAPI";
import { getAllVaccinations } from "../../api/vaccinationAPI";
import { getAllDewormings } from "../../api/dewormingAPI";
import type { Appointment } from "../../types/appointment";
import type { Vaccination } from "../../types/vaccination";
import type { Deworming } from "../../types/deworming";

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════
const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const getDatePart = (dateString: string) => dateString.split("T")[0];

const getDaysFromNowString = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const getDaysLeft = (dateString: string) => {
  const targetDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  return Math.ceil(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRelativeTime = (daysLeft: number) => {
  if (daysLeft === 0) return "Hoy";
  if (daysLeft === 1) return "Mañana";
  if (daysLeft <= 7) return `En ${daysLeft} días`;
  return `En ${Math.ceil(daysLeft / 7)} sem`;
};

const getPatientId = (obj: any): string | undefined => {
  if (!obj) return undefined;
  if (typeof obj === "string") return obj;
  return obj._id;
};

const getPatientName = (obj: any): string => {
  if (!obj) return "Paciente";
  if (typeof obj === "object" && obj.name) return obj.name;
  return "Paciente";
};

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════
type NotificationType = "all" | "appointments" | "vaccines" | "dewormings";

interface UnifiedNotification {
  id: string;
  type: "appointment" | "vaccine" | "deworming";
  title: string;
  subtitle: string;
  time: string;
  daysLeft: number;
  isUrgent: boolean;
  icon: React.ReactNode;
  iconBg: string;
  data: Appointment | Vaccination | Deworming;
}

// ═══════════════════════════════════════════
// NOTIFICATION DROPDOWN (Portal) - MOBILE
// ═══════════════════════════════════════════
interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: UnifiedNotification[];
  onNotificationClick: (notification: UnifiedNotification) => void;
}

function MobileNotificationDropdown({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<NotificationType>("all");

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filtrar por tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "appointments") return n.type === "appointment";
    if (activeTab === "vaccines") return n.type === "vaccine";
    if (activeTab === "dewormings") return n.type === "deworming";
    return true;
  });

  // Agrupar por urgencia
  const urgentNotifications = filteredNotifications.filter((n) => n.isUrgent);
  const upcomingNotifications = filteredNotifications.filter((n) => !n.isUrgent);

  // Contadores por tipo
  const counts = {
    all: notifications.length,
    appointments: notifications.filter((n) => n.type === "appointment").length,
    vaccines: notifications.filter((n) => n.type === "vaccine").length,
    dewormings: notifications.filter((n) => n.type === "deworming").length,
  };

  const tabs: { key: NotificationType; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "Todas", icon: <Bell className="w-3 h-3" /> },
    { key: "appointments", label: "Citas", icon: <Calendar className="w-3 h-3" /> },
    { key: "vaccines", label: "Vacunas", icon: <Syringe className="w-3 h-3" /> },
    { key: "dewormings", label: "Despar.", icon: <Bug className="w-3 h-3" /> },
  ];

  const dropdownContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-99998"
        onClick={onClose}
      />
      
      <div
        ref={dropdownRef}
        className="fixed top-16 left-2 right-2 z-99999"
      >
        <div 
          className="bg-dark-100 rounded-xl shadow-2xl border border-slate-700 overflow-hidden"
          style={{
            animation: "dropdownIn 0.2s ease-out",
          }}
        >
          {/* ═══ HEADER ═══ */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-white">
                Notificaciones
              </h2>
              
              {/* ═══ TABS - Compactos ═══ */}
              <div className="flex gap-1 ml-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold transition-all
                      ${activeTab === tab.key
                        ? "bg-biovet-500 text-white"
                        : "bg-dark-200 text-slate-400 hover:bg-dark-50"
                      }
                    `}
                    title={tab.label}
                  >
                    {tab.icon}
                    {counts[tab.key] > 0 && (
                      <span>{counts[tab.key]}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ CONTENT ═══ */}
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-14 h-14 rounded-full bg-dark-200 mx-auto mb-3 flex items-center justify-center">
                  <CheckCheck className="w-7 h-7 text-slate-600" />
                </div>
                <p className="text-sm text-slate-400 font-medium">
                  No hay notificaciones
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  ¡Todo está al día!
                </p>
              </div>
            ) : (
              <>
                {/* Urgentes (Hoy/Mañana) */}
                {urgentNotifications.length > 0 && (
                  <div className="px-2 py-2">
                    <p className="px-2 py-1.5 text-[10px] font-bold text-danger-400 uppercase tracking-wider">
                      Requiere atención
                    </p>
                    {urgentNotifications.map((notification) => (
                      <MobileNotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => onNotificationClick(notification)}
                      />
                    ))}
                  </div>
                )}

                {/* Próximas */}
                {upcomingNotifications.length > 0 && (
                  <div className="px-2 pb-2">
                    {urgentNotifications.length > 0 && (
                      <p className="px-2 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Próximamente
                      </p>
                    )}
                    {upcomingNotifications.map((notification) => (
                      <MobileNotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => onNotificationClick(notification)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <style>{`
          @keyframes dropdownIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>
      </div>
    </>
  );

  return createPortal(dropdownContent, document.body);
}

// ═══════════════════════════════════════════
// NOTIFICATION ITEM - MOBILE
// ═══════════════════════════════════════════
interface NotificationItemProps {
  notification: UnifiedNotification;
  onClick: () => void;
}

function MobileNotificationItem({ notification, onClick }: NotificationItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-dark-200 active:bg-dark-50 transition-colors group text-left"
    >
      {/* Icon */}
      <div className={`
        relative w-10 h-10 rounded-full flex items-center justify-center shrink-0
        ${notification.iconBg}
      `}>
        {notification.icon}
        
        {/* Urgency indicator */}
        {notification.isUrgent && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-danger-500 rounded-full border-2 border-dark-100" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-[13px] text-white leading-snug">
          <span className="font-semibold">{notification.title}</span>
          {" "}
          <span className="text-slate-400">
            {notification.subtitle}
          </span>
        </p>
        <p className={`
          text-[11px] mt-0.5 font-medium
          ${notification.isUrgent 
            ? "text-danger-400" 
            : "text-slate-500"
          }
        `}>
          {notification.time}
        </p>
      </div>

      {/* Unread indicator */}
      {notification.isUrgent && (
        <div className="shrink-0 pt-3">
          <span className="block w-2 h-2 rounded-full bg-biovet-500" />
        </div>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════
// MOBILE HEADER COMPONENT
// ═══════════════════════════════════════════
export const MobileHeader = () => {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const bellButtonRef = useRef<HTMLButtonElement>(null);

  const todayStr = useMemo(() => getTodayDateString(), []);
  const nextWeekStr = useMemo(() => getDaysFromNowString(7), []);

  // Datos de la clínica
  const { data: clinic } = useQuery({
    queryKey: ["my-clinic"],
    queryFn: getMyClinic,
  });

  // ═══ QUERIES ═══
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: getAllAppointments,
    refetchInterval: 60000,
  });

  const { data: vaccinations = [] } = useQuery<Vaccination[]>({
    queryKey: ["vaccinations"],
    queryFn: getAllVaccinations,
    refetchInterval: 300000,
  });

  const { data: dewormings = [] } = useQuery<Deworming[]>({
    queryKey: ["dewormings"],
    queryFn: getAllDewormings,
    refetchInterval: 300000,
  });

  // ═══ FILTROS ═══
  const todayAppointments = useMemo(() => {
    return appointments
      .filter(
        (apt) =>
          apt.status === "Programada" && getDatePart(apt.date) === todayStr
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments, todayStr]);

  const upcomingVaccinations = useMemo(() => {
    return vaccinations
      .filter((v) => {
        if (!v.nextVaccinationDate) return false;
        const nextDate = getDatePart(v.nextVaccinationDate);
        return nextDate >= todayStr && nextDate <= nextWeekStr;
      })
      .map((v) => ({ ...v, daysLeft: getDaysLeft(v.nextVaccinationDate!) }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 10);
  }, [vaccinations, todayStr, nextWeekStr]);

  const upcomingDewormings = useMemo(() => {
    return dewormings
      .filter((d) => {
        if (!d.nextApplicationDate) return false;
        const nextDate = getDatePart(d.nextApplicationDate);
        return nextDate >= todayStr && nextDate <= nextWeekStr;
      })
      .map((d) => ({ ...d, daysLeft: getDaysLeft(d.nextApplicationDate!) }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 10);
  }, [dewormings, todayStr, nextWeekStr]);

  // ═══ UNIFICAR NOTIFICACIONES ═══
  const unifiedNotifications: UnifiedNotification[] = useMemo(() => {
    const notifications: UnifiedNotification[] = [];

    // Citas de hoy
    todayAppointments.forEach((apt) => {
      notifications.push({
        id: `apt-${apt._id}`,
        type: "appointment",
        title: getPatientName(apt.patient),
        subtitle: `cita de ${apt.type.toLowerCase()} a las ${formatTime(apt.date)}`,
        time: `Hoy, ${formatTime(apt.date)}`,
        daysLeft: 0,
        isUrgent: true,
        icon: <PawPrint className="w-4 h-4 text-white" />,
        iconBg: "bg-gradient-to-br from-biovet-400 to-biovet-600",
        data: apt,
      });
    });

    // Vacunas
    upcomingVaccinations.forEach((vac) => {
      notifications.push({
        id: `vac-${vac._id}`,
        type: "vaccine",
        title: vac.vaccineType,
        subtitle: `aplicación pendiente`,
        time: getRelativeTime(vac.daysLeft),
        daysLeft: vac.daysLeft,
        isUrgent: vac.daysLeft <= 1,
        icon: <Syringe className="w-4 h-4 text-white" />,
        iconBg: "bg-gradient-to-br from-success-400 to-success-600",
        data: vac,
      });
    });

    // Desparasitaciones
    upcomingDewormings.forEach((dew) => {
      notifications.push({
        id: `dew-${dew._id}`,
        type: "deworming",
        title: dew.productName,
        subtitle: `${dew.dewormingType.toLowerCase()} pendiente`,
        time: getRelativeTime(dew.daysLeft),
        daysLeft: dew.daysLeft,
        isUrgent: dew.daysLeft <= 1,
        icon: <Bug className="w-4 h-4 text-white" />,
        iconBg: "bg-gradient-to-br from-warning-400 to-warning-600",
        data: dew,
      });
    });

    return notifications.sort((a, b) => {
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return a.daysLeft - b.daysLeft;
    });
  }, [todayAppointments, upcomingVaccinations, upcomingDewormings]);

  const totalNotifications = unifiedNotifications.length;
  const urgentCount = unifiedNotifications.filter((n) => n.isUrgent).length;

  // ═══ NAVEGACIÓN ═══
  const handleNotificationClick = (notification: UnifiedNotification) => {
    setShowNotifications(false);

    if (notification.type === "appointment") {
      const apt = notification.data as Appointment;
      const patientId = getPatientId(apt.patient);
      if (patientId) {
        navigate(`/patients/${patientId}/appointments/${apt._id}`);
      }
    } else if (notification.type === "vaccine") {
      const vac = notification.data as Vaccination;
      if (vac.patientId) {
        navigate(`/patients/${vac.patientId}/vaccines`);
      }
    } else if (notification.type === "deworming") {
      const dew = notification.data as Deworming;
      if (dew.patientId) {
        navigate(`/patients/${dew.patientId}/deworming`);
      }
    }
  };

  // ═══ USER HELPERS ═══
  const getInitials = () => {
    if (!user) return "??";
    return `${user.name?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getFullName = () => {
    if (!user) return "Cargando...";
    return `${user.name} ${user.lastName}`;
  };

  return (
    <header className="h-16 px-4 flex items-center justify-between sticky top-0 z-40 bg-dark-200 border-b border-dark-300 transition-colors duration-300">
      
      {/* Logo Dinámico */}
      <Link to="/" className="flex items-center gap-2">
        <img
          src={clinic?.logo || "/logo_main.webp"}
          alt={clinic?.name || "BioVet Track"}
          className="h-8 object-contain rounded-sm"
        />
        {clinic?.name && (
          <span className="text-white font-heading font-bold text-xs truncate max-w-25">
            {clinic.name}
          </span>
        )}
      </Link>

      <div className="flex items-center gap-2">
        {/* Notifications Button */}
        <button
          ref={bellButtonRef}
          onClick={() => setShowNotifications(!showNotifications)}
          className={`
            relative w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-200
            ${showNotifications
              ? "bg-biovet-500/20"
              : "bg-dark-400 border border-slate-600"
            }
          `}
        >
          <Bell
            size={20}
            className={`transition-colors ${
              totalNotifications > 0
                ? "text-biovet-400"
                : "text-slate-400"
            }`}
            fill={showNotifications || totalNotifications > 0 ? "currentColor" : "none"}
          />
          
          {/* Badge */}
          {totalNotifications > 0 && (
            <span className={`
              absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 
              text-[10px] font-bold rounded-full 
              flex items-center justify-center 
              border-2 border-dark-200
              ${urgentCount > 0 
                ? "bg-danger-500 text-white" 
                : "bg-biovet-500 text-white"
              }
            `}>
              {totalNotifications > 99 ? "99+" : totalNotifications}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        <MobileNotificationDropdown
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          notifications={unifiedNotifications}
          onNotificationClick={handleNotificationClick}
        />

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-white/20 mx-2" />

        {/* User Avatar */}
        <button className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-dark-300 transition-colors">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-biovet-400 to-biovet-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-biovet-500/30">
            {getInitials()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-white leading-tight">
              {getFullName()}
            </p>
            <p className="text-xs text-white/70">Veterinario</p>
          </div>
        </button>
      </div>
    </header>
  );
};