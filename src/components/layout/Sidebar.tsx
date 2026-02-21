// src/components/layout/Sidebar.tsx
import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown, 
  LogOut, 
  X 
} from "lucide-react";
import { useLayoutStore } from "@/store/useLayoutStore";
import { menuItems, type MenuItem } from "@/data/menuItems";

/* ══════════════════════════════════════════
   SIDEBAR ITEM
   ══════════════════════════════════════════ */
const SidebarItem = ({ 
  item, 
  collapsed, 
  onClick 
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
        ${isActive
          ? 'bg-linear-to-r from-biovet-500 to-biovet-600 text-white shadow-md shadow-biovet-500/25'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }
        ${collapsed ? 'justify-center px-2' : ''}
      `}
    >
      <item.icon 
        className={`
          shrink-0 transition-all duration-200
          ${collapsed ? 'w-5 h-5' : 'w-4 h-4'}
        `} 
      />
      
      {!collapsed && (
        <span className="flex-1 truncate">{item.label}</span>
      )}

      {/* Tooltip colapsado */}
      {collapsed && (
        <div className="
          absolute left-full ml-3 px-2.5 py-1.5 
          bg-slate-900 text-white text-xs font-medium rounded-md
          opacity-0 invisible group-hover:opacity-100 group-hover:visible 
          transition-all duration-200 whitespace-nowrap z-100
          shadow-xl border border-white/10
          pointer-events-none
        ">
          {item.label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-6 border-transparent border-r-slate-900" />
        </div>
      )}
    </NavLink>
  );
};

/* ══════════════════════════════════════════
   SIDEBAR GROUP (con submenu)
   ══════════════════════════════════════════ */
const SidebarGroup = ({ 
  item, 
  collapsed, 
  expandSidebar,
  onClickMobile 
}: { 
  item: MenuItem; 
  collapsed: boolean; 
  expandSidebar: () => void;
  onClickMobile?: () => void;
}) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const hasActiveChild = item.submenu?.some(sub => location.pathname.startsWith(sub.to));

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
          ${hasActiveChild
            ? 'bg-white/5 text-white'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }
          ${collapsed ? 'justify-center px-2' : ''}
        `}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <item.icon 
            className={`
              shrink-0 transition-colors
              ${collapsed ? 'w-5 h-5' : 'w-4 h-4'} 
              ${hasActiveChild ? 'text-biovet-400' : ''}
            `} 
          />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </div>
        
        {!collapsed && (
          <ChevronDown 
            className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        )}

        {/* Tooltip colapsado */}
        {collapsed && (
          <div className="
            absolute left-full ml-3 px-2.5 py-1.5 
            bg-slate-900 text-white text-xs font-medium rounded-md
            opacity-0 invisible group-hover:opacity-100 group-hover:visible 
            transition-all duration-200 whitespace-nowrap z-100
            shadow-xl border border-white/10
            pointer-events-none
          ">
            {item.label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-6 border-transparent border-r-slate-900" />
          </div>
        )}
      </button>

      {/* Submenu */}
      <div 
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen && !collapsed ? "max-h-64 opacity-100 mt-0.5" : "max-h-0 opacity-0"}
        `}
      >
        <div className="ml-3 pl-3 border-l border-biovet-500/30 space-y-0.5 py-0.5">
          {item.submenu?.map((subItem) => (
            <NavLink
              key={subItem.to}
              to={subItem.to}
              onClick={onClickMobile}
              className={({ isActive }) => `
                flex items-center gap-2 px-2 py-1 rounded-md text-[11px]
                transition-all duration-200
                ${isActive 
                  ? "text-biovet-400 font-medium bg-biovet-500/10" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }
              `}
            >
              {/* Dot indicator */}
              <span 
                className={`
                  w-1 h-1 rounded-full transition-colors
                  ${location.pathname.startsWith(subItem.to) 
                    ? 'bg-biovet-400' 
                    : 'bg-slate-600'
                  }
                `} 
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { 
    sidebarCollapsed, 
    toggleSidebar,
    sidebarMobileOpen,
    closeMobileSidebar 
  } = useLayoutStore();

  const logout = () => {
    localStorage.removeItem("AUTH_TOKEN_LABVET");
    queryClient.invalidateQueries({ queryKey: ["user"] });
    navigate("/auth/login");
  };

  /* ── SIDEBAR CONTENT ── */
  const SidebarContent = ({ collapsed, isMobile = false }: { collapsed: boolean; isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      
      {/* ═══ HEADER CON LOGO ═══ */}
      <div className={`
        flex items-center h-12 shrink-0
        ${isMobile ? 'justify-between px-3' : 'justify-center'}
      `}>
        <NavLink to="/" className="flex items-center justify-center">
          <img 
            src="/logo_main.webp" 
            alt="BioVet Track" 
            className={`
              object-contain transition-all duration-300 h-10 w-10 lg:mt-2
              ${collapsed && !isMobile ? 'h-7 w-7' : 'h-7 w-auto max-w-32'}
            `}
          />
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

      {/* ═══ DIVISOR + BOTÓN COLAPSAR ═══ */}
      {!isMobile && (
        <div className="relative flex items-center justify-center h-4 shrink-0 px-2">
          <div className="w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
          <button
            onClick={toggleSidebar}
            className="
              hidden lg:flex absolute -right-2.5 
              w-5 h-5 rounded-full 
              bg-biovet-500 border border-biovet-400 
              items-center justify-center text-white 
              hover:bg-biovet-400 hover:scale-110
              transition-all duration-200 
              shadow-lg shadow-biovet-500/40 
              z-50 cursor-pointer
            "
          >
            {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
        </div>
      )}

      {isMobile && <div className="h-px bg-white/10 shrink-0 mx-2" />}

      {/* ═══ NAVEGACIÓN ═══ */}
      <nav className="flex-1 py-2 px-2 space-y-2 overflow-y-auto scrollbar-thin">
        {menuItems.map((section, idx) => (
          <div key={idx}>
            {/* Label del grupo */}
            {!collapsed && (
              <h3 className="px-2.5 mb-1 text-[9px] font-bold text-biovet-400/70 uppercase tracking-widest">
                {section.groupLabel}
              </h3>
            )}
            {collapsed && idx > 0 && (
              <div className="w-5 h-px bg-white/10 mx-auto my-1.5" />
            )}
            
            {/* Items */}
            <div className="space-y-0.5">
              {section.items.map((item, itemIdx) => (
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
                )
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ═══ FOOTER - LOGOUT ═══ */}
      <div className="shrink-0 p-2 border-t border-white/10">
        <button
          onClick={logout}
          className={`
            w-full group relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg 
            transition-all duration-200 text-xs font-medium cursor-pointer
            text-slate-400 
            hover:bg-danger-500/15 hover:text-danger-400
            ${collapsed ? 'justify-center px-2' : ''}
          `}
        >
          <LogOut 
            className={`
              shrink-0 transition-colors
              group-hover:text-danger-400 
              ${collapsed ? 'w-5 h-5' : 'w-4 h-4'}
            `} 
          />
          {!collapsed && <span>Cerrar sesión</span>}
          
          {/* Tooltip colapsado */}
          {collapsed && (
            <div className="
              absolute left-full ml-3 px-2.5 py-1.5 
              bg-slate-900 text-white text-xs font-medium rounded-md
              opacity-0 invisible group-hover:opacity-100 group-hover:visible 
              transition-all duration-200 whitespace-nowrap z-100
              shadow-xl border border-white/10
              pointer-events-none
            ">
              Cerrar sesión
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-6 border-transparent border-r-slate-900" />
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ═══ OVERLAY MÓVIL ═══ */}
      <div 
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden 
          transition-opacity duration-300 
          ${sidebarMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={closeMobileSidebar}
      />

      {/* ═══ SIDEBAR MÓVIL ═══ */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 
          bg-linear-to-b from-biovet-950 to-biovet-900
          shadow-2xl shadow-black/50
          transform transition-transform duration-300 ease-out 
          lg:hidden 
          ${sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent collapsed={false} isMobile={true} />
      </aside>

      {/* ═══ SIDEBAR DESKTOP ═══ */}
      <aside 
        className={`
          hidden lg:flex flex-col 
          fixed inset-y-0 left-0 z-40 
          bg-linear-to-b from-biovet-950 via-biovet-950 to-biovet-900
          border-r border-white/5
          transition-all duration-300 ease-in-out 
          ${sidebarCollapsed ? 'w-16' : 'w-56'}
        `}
      >
        <SidebarContent collapsed={sidebarCollapsed} isMobile={false} />
      </aside>
    </>
  );
};