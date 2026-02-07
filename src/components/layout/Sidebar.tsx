import  { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown, 
  LogOut, 
  X 
} from "lucide-react";
import { useLayoutStore } from "@/store/useLayoutStore";
import { menuItems, type MenuItem } from "@/data/menuItems"; // Importamos tu data


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
        group relative flex items-center gap-3 px-3 py-2.5 rounded-lg 
        transition-all duration-200 text-sm font-medium
        ${isActive
          ? 'bg-biovet-500 text-white shadow-sm'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }
        ${collapsed ? 'justify-center px-2' : ''}
      `}
    >
      <item.icon 
        className={`
          shrink-0 transition-colors
          ${collapsed ? 'w-6 h-6' : 'w-5 h-5'}
        `} 
      />
      
      {!collapsed && (
        <span className="flex-1 truncate">{item.label}</span>
      )}

      {/* Tooltip en modo colapsado */}
      {collapsed && (
        <div className="
          absolute left-full ml-3 px-2.5 py-1.5 
          bg-slate-800 text-white text-sm rounded-lg
          opacity-0 invisible group-hover:opacity-100 group-hover:visible 
          transition-all duration-200 whitespace-nowrap z-50
          shadow-lg pointer-events-none
        ">
          {item.label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-800" />
        </div>
      )}
    </NavLink>
  );
};


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
  
  // Auto-abrir si hijo activo
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
    <div className="mb-1">
      <button
        onClick={handleToggle}
        className={`
          w-full group relative flex items-center justify-between px-3 py-2.5 rounded-lg 
          transition-all duration-200 text-sm font-medium
          ${hasActiveChild && !isOpen
            ? 'bg-white/5 text-white'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }
          ${collapsed ? 'justify-center px-2' : ''}
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <item.icon className={`shrink-0 ${collapsed ? 'w-6 h-6' : 'w-5 h-5'} ${hasActiveChild ? 'text-biovet-400' : ''}`} />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </div>
        
        {!collapsed && (
          <ChevronDown 
            size={16} 
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        )}

        {/* Tooltip colapsado */}
        {collapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 pointer-events-none">
            {item.label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-800" />
          </div>
        )}
      </button>

      {/* Lista Desplegable */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen && !collapsed ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
        <div className="ml-4 pl-4 border-l border-white/10 space-y-1">
          {item.submenu?.map((subItem) => (
            <NavLink
              key={subItem.to}
              to={subItem.to}
              onClick={onClickMobile}
              className={({ isActive }) => `
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors duration-200
                ${isActive 
                  ? "text-biovet-400 font-medium bg-white/5" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <span className="truncate">{subItem.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

//  SIDEBAR PRINCIPAL 
export const Sidebar = () => {
  const { 
    sidebarCollapsed, 
    toggleSidebar,
    sidebarMobileOpen,
    closeMobileSidebar 
  } = useLayoutStore();

  const SidebarContent = ({ collapsed, isMobile = false }: { collapsed: boolean; isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* 3.1 Header con Logo */}
      <div className={`
        flex items-center justify-center h-16
        ${isMobile ? 'justify-between px-4' : ''}
      `}>
        <NavLink to="/" className="flex items-center justify-center">
          <img 
            src="/logo_main.webp" 
            alt="BioVet Track" 
            className={`object-contain transition-all duration-300 ${collapsed && !isMobile ? 'h-10 w-10' : 'h-10 w-auto max-w-40'}`}
          />
        </NavLink>

        {isMobile && (
          <button onClick={closeMobileSidebar} className="absolute right-3 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 3.2 Divisor y Botón Colapsar */}
      {!isMobile && (
        <div className="relative flex items-center justify-center h-6 shrink-0">
          <div className="w-full h-px bg-white/10" />
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex absolute -right-3 w-6 h-6 rounded-full bg-biovet-600 border-2 border-biovet-400 items-center justify-center text-white hover:bg-biovet-500 transition-all duration-200 shadow-lg z-50"
          >
            {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
        </div>
      )}

      {isMobile && <div className="h-px bg-white/10 shrink-0" />}

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4 scrollbar-thin">
        {menuItems.map((section, idx) => (
          <div key={idx}>
            {!collapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {section.groupLabel}
              </h3>
            )}
            {collapsed && <div className="w-8 h-px bg-white/10 mx-auto mb-2" />}
            
            <div className="space-y-1">
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

      {/* 3.4 FOOTER / LOGOUT */}
      <div className="border-t border-white/10 p-3 shrink-0">
        <button
          onClick={() => console.log('Logout')}
          className={`
            w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-lg 
            transition-all duration-200 text-sm font-medium 
            text-slate-300 hover:bg-danger-500/20 hover:text-danger-400
            ${collapsed ? 'justify-center px-2' : ''}
          `}
        >
          <LogOut className={`shrink-0 text-slate-400 group-hover:text-danger-400 ${collapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
          {!collapsed && <span>Cerrar sesión</span>}
          
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg pointer-events-none">
              Cerrar sesión
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-800" />
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay Móvil */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${sidebarMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMobileSidebar}
      />

      {/* Sidebar Móvil */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-biovet-950 transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent collapsed={false} isMobile={true} />
      </aside>

      {/* Sidebar Desktop */}
      <aside className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-biovet-950 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <SidebarContent collapsed={sidebarCollapsed} isMobile={false} />
      </aside>
    </>
  );
};