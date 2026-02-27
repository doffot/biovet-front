// src/components/layout/Sidebar.tsx

import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  LogOut,
  X,
} from "lucide-react";
import { useLayoutStore } from "@/store/useLayoutStore";
import { menuItems, type MenuItem } from "@/data/menuItems";
import { getMyClinic } from "@/api/veterinaryClinicAPI";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";

/* ══════════════════════════════════════════
   COMPONENTES INTERNOS
   ══════════════════════════════════════════ */

const SidebarItem = ({
  item,
  collapsed,
  onClick,
}: {
  item: MenuItem & { to: string };
  collapsed: boolean;
  onClick?: () => void;
}) => {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) => `
        group relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg 
        transition-all duration-200 text-xs font-medium
        ${
          isActive
            ? "bg-linear-to-r from-biovet-600 to-biovet-500 text-white shadow-lg shadow-biovet-900/40"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
        }
        ${collapsed ? "justify-center px-2" : ""}
      `}
    >
      <item.icon
        className={`shrink-0 transition-all duration-200 ${collapsed ? "w-5 h-5" : "w-4 h-4"}`}
      />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-dark-400 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-100 shadow-xl border border-white/10 pointer-events-none">
          {item.label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-6 border-transparent border-r-dark-400" />
        </div>
      )}
    </NavLink>
  );
};

const SidebarGroup = ({
  item,
  collapsed,
  expandSidebar,
  onClickMobile,
}: {
  item: MenuItem;
  collapsed: boolean;
  expandSidebar: () => void;
  onClickMobile?: () => void;
}) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveChild = item.submenu?.some((sub) =>
    location.pathname.startsWith(sub.to),
  );

  useEffect(() => {
    if (hasActiveChild) setIsOpen(true);
  }, [hasActiveChild]);

  const handleToggle = () => {
    if (collapsed) {
      expandSidebar();
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div>
      <button
        onClick={handleToggle}
        className={`
          w-full group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg 
          transition-all duration-200 text-xs font-medium cursor-pointer 
          ${hasActiveChild ? "bg-white/5 text-white" : "text-slate-400 hover:bg-white/10 hover:text-white"} 
          ${collapsed ? "justify-center px-2" : ""}
        `}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <item.icon
            className={`shrink-0 transition-colors ${collapsed ? "w-5 h-5" : "w-4 h-4"} ${hasActiveChild ? "text-success-500" : ""}`}
          />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </div>
        {!collapsed && (
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen && !collapsed ? "max-h-64 opacity-100 mt-0.5" : "max-h-0 opacity-0"}`}
      >
        <div className="ml-3 pl-3 border-l border-white/10 space-y-0.5 py-0.5">
          {item.submenu?.map((subItem) => (
            <NavLink
              key={subItem.to}
              to={subItem.to}
              onClick={onClickMobile}
              className={({ isActive }) => `
                flex items-center gap-2 px-2 py-1 rounded-md text-[11px] transition-all duration-200 
                ${
                  isActive
                    ? "text-success-400 font-medium bg-success-500/10"
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <span
                className={`w-1 h-1 rounded-full ${location.pathname.startsWith(subItem.to) ? "bg-success-500 shadow-[0_0_8px_rgba(132,204,22,0.6)]" : "bg-slate-600"}`}
              />
              <span className="truncate">{subItem.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   SIDEBAR PRINCIPAL
   ══════════════════════════════════════════ */

export const Sidebar = () => {
  const queryClient = useQueryClient();
  const {
    sidebarCollapsed,
    toggleSidebar,
    sidebarMobileOpen,
    closeMobileSidebar,
  } = useLayoutStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: clinic } = useQuery({
    queryKey: ["my-clinic"],
    queryFn: getMyClinic,
  });

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    toast.info("Cerrando sesión", "Finalizando tu sesión de forma segura...");

    setTimeout(() => {
      localStorage.removeItem("AUTH_TOKEN");
      queryClient.clear();
      window.location.href = "/auth/login";
    }, 800);
  };

  const SidebarContent = ({
    collapsed,
    isMobile = false,
  }: {
    collapsed: boolean;
    isMobile?: boolean;
  }) => (
    <div className="flex flex-col h-full">
      {/* HEADER LOGO */}
      <div
        className={`flex items-center h-16 shrink-0 transition-all duration-300 ${isMobile ? "justify-between px-4" : "justify-center"}`}
      >
        <NavLink
          to="/"
          className="flex items-center gap-2.5 overflow-hidden px-2 group"
        >
          <div className="relative shrink-0">
            <img
              src={clinic?.logo || "/logobiovet.png"}
              alt={clinic?.name || ""}
              className={`object-contain transition-all duration-500 ${collapsed && !isMobile ? "h-8 w-8" : "h-9 w-auto max-w-32.5"} rounded-md`}
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-fade-in overflow-hidden">
              <span className="text-white font-heading font-bold text-[13px] leading-tight truncate capitalizee tracking-tight">
                {clinic?.name || (
                  <>
                    <span className="text-biovet-400">Bio</span>
                    <span className="text-success-400">Vet</span>
                    <span className="text-white">Track</span>
                  </>
                )}
              </span>
            </div>
          )}
        </NavLink>
        {isMobile && (
          <button
            onClick={closeMobileSidebar}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Línea divisoria (sin botón) */}
      {!isMobile && (
        <div className="relative flex items-center justify-center h-4 shrink-0 px-2">
          <div className="w-full h-px bg-linear-to-r from-transparent via-white/5 to-transparent" />
        </div>
      )}

      {/* NAVEGACIÓN */}
      <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {menuItems.map((section, idx) => (
          <div key={idx} className="space-y-2">
            {!collapsed && (
              <h3 className="px-3 mb-1 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                {section.groupLabel}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item, itemIdx) =>
                item.submenu ? (
                  <SidebarGroup
                    key={itemIdx}
                    item={item}
                    collapsed={collapsed}
                    expandSidebar={toggleSidebar}
                    onClickMobile={isMobile ? closeMobileSidebar : undefined}
                  />
                ) : (
                  <SidebarItem
                    key={itemIdx}
                    item={item as MenuItem & { to: string }}
                    collapsed={collapsed}
                    onClick={isMobile ? closeMobileSidebar : undefined}
                  />
                ),
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* FOOTER - LOGOUT */}
      <div className="shrink-0 p-3 space-y-2 border-t border-white/5 bg-black/20">
        {!collapsed && (
          <div className="px-3 py-1">
            <p className="text-[9px] text-slate-600 font-bold tracking-widest">
              POWERED BY <span className="text-biovet-400">BIOVET TRACK</span>
            </p>
          </div>
        )}

        <button
          onClick={() => setIsModalOpen(true)}
          className={`
            w-full group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg 
            transition-all duration-200 text-xs font-medium cursor-pointer 
            text-slate-500 hover:bg-danger-500/10 hover:text-danger-400 
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <LogOut className={`shrink-0 ${collapsed ? "w-5 h-5" : "w-4 h-4"}`} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* MODAL DE CONFIRMACIÓN */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="¿Cerrar sesión?"
        message="¿Estás seguro de que deseas salir del sistema? Deberás ingresar tus credenciales nuevamente."
        variant="warning"
        confirmText="Sí, cerrar sesión"
        confirmIcon={LogOut}
        isLoading={isLoggingOut}
        loadingText="Cerrando..."
      />

      {/* OVERLAY MOBILE */}
      <div
        className={`
          fixed inset-0 bg-dark-500/80 backdrop-blur-md z-40 lg:hidden 
          transition-opacity duration-300 
          ${sidebarMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={closeMobileSidebar}
      />

      {/* SIDEBAR MOBILE */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 
          bg-linear-to-b from-dark-400 to-dark-300 
          transform transition-transform duration-300 ease-out lg:hidden 
          ${sidebarMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent collapsed={false} isMobile={true} />
      </aside>

      {/* SIDEBAR DESKTOP */}
      <aside
        className={`
          hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 
          bg-linear-to-b from-dark-400 via-dark-400 to-dark-300 
          border-r border-white/5 
          transition-all duration-300 ease-in-out 
          ${sidebarCollapsed ? "w-16" : "w-60"}
        `}
      >
        <SidebarContent collapsed={sidebarCollapsed} isMobile={false} />
      </aside>

      {/* ═══════════════════════════════════════
          BOTÓN TOGGLE - FUERA DEL ASIDE
          Con z-50 propio, siempre visible
          ═══════════════════════════════════════ */}
      <button
        onClick={toggleSidebar}
        className={`
          hidden lg:flex fixed top-5 z-50
          w-6 h-6 rounded-full 
          bg-biovet-500 border border-white/20
          items-center justify-center text-white 
          hover:bg-success-500 hover:scale-110 
          transition-all duration-300 ease-in-out
          shadow-lg shadow-biovet-500/30
          cursor-pointer
          ${sidebarCollapsed ? "left-13" : "left-57"}
        `}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </>
  );
};
