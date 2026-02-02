import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Dog,
  Calendar,
  FileText,
  Pill,
  Settings,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Package,
  BarChart3,
  HelpCircle,
  LogOut,
  X
} from 'lucide-react';
import { useLayoutStore } from '../../store/useLayoutStore';

// Tipos
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

// Navegación
const mainNavigation: NavSection[] = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ]
  },
  {
    title: 'Gestión',
    items: [
      { id: 'patients', label: 'Pacientes', icon: Dog, path: '/patients', badge: 12 },
      { id: 'owners', label: 'Propietarios', icon: Users, path: '/owners' },
      { id: 'appointments', label: 'Citas', icon: Calendar, path: '/appointments', badge: 3 },
      { id: 'consultations', label: 'Consultas', icon: Stethoscope, path: '/consultations' },
    ]
  },
  {
    title: 'Clínica',
    items: [
      { id: 'treatments', label: 'Tratamientos', icon: Pill, path: '/treatments' },
      { id: 'inventory', label: 'Inventario', icon: Package, path: '/inventory' },
      { id: 'records', label: 'Historiales', icon: FileText, path: '/records' },
    ]
  },
  {
    title: 'Reportes',
    items: [
      { id: 'reports', label: 'Estadísticas', icon: BarChart3, path: '/reports' },
    ]
  }
];

const bottomNavigation: NavItem[] = [
  { id: 'settings', label: 'Configuración', icon: Settings, path: '/settings' },
  { id: 'help', label: 'Ayuda', icon: HelpCircle, path: '/help' },
];

// Componente NavItem
const NavItemLink = ({ 
  item, 
  collapsed,
  onClick 
}: { 
  item: NavItem; 
  collapsed: boolean;
  onClick?: () => void;
}) => {
  const location = useLocation();
  const isActive = location.pathname === item.path || 
                   location.pathname.startsWith(item.path + '/');

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={`
        group relative flex items-center gap-3 px-3 py-2.5 rounded-lg 
        transition-all duration-200 text-sm font-medium
        ${isActive
          ? 'bg-biovet-500 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
        }
        ${collapsed ? 'justify-center px-2' : ''}
      `}
      title={collapsed ? item.label : undefined}
    >
      <item.icon 
        className={`
          shrink-0 transition-colors
          ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}
          ${collapsed ? 'w-6 h-6' : 'w-5 h-5'}
        `} 
      />
      
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          
          {item.badge !== undefined && (
            <span className={`
              inline-flex items-center justify-center min-w-5 h-5 px-1.5 
              text-xs font-bold rounded-full
              ${isActive 
                ? 'bg-white/20 text-white' 
                : 'bg-biovet-100 text-biovet-600 dark:bg-biovet-500/20 dark:text-biovet-300'
              }
            `}>
              {item.badge}
            </span>
          )}
        </>
      )}

      {/* Tooltip en modo colapsado */}
      {collapsed && (
        <div className="
          absolute left-full ml-3 px-2.5 py-1.5 
          bg-slate-900 text-white text-sm rounded-lg
          opacity-0 invisible group-hover:opacity-100 group-hover:visible 
          transition-all duration-200 whitespace-nowrap z-50
          dark:bg-slate-700 shadow-lg
          pointer-events-none
        ">
          <div className="flex items-center gap-2">
            {item.label}
            {item.badge !== undefined && (
              <span className="px-1.5 py-0.5 bg-biovet-500 rounded-full text-xs">
                {item.badge}
              </span>
            )}
          </div>
          {/* Flecha */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-900 dark:border-r-slate-700" />
        </div>
      )}
    </NavLink>
  );
};

// Componente Principal
export const Sidebar = () => {
  const { 
    sidebarCollapsed, 
    sidebarMobileOpen,
    toggleSidebar,
    closeMobileSidebar 
  } = useLayoutStore();

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`
        flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-800
        ${collapsed ? 'justify-center' : 'justify-between'}
      `}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-biovet-500 flex items-center justify-center shadow-sm">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                BioVet
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">
                Track
              </p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-biovet-500 flex items-center justify-center shadow-sm">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
        )}

        {/* Botón cerrar móvil */}
        <button
          onClick={closeMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
        {mainNavigation.map((section, idx) => (
          <div key={idx}>
            {section.title && !collapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider dark:text-slate-500">
                {section.title}
              </h3>
            )}
            {section.title && collapsed && (
              <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 mx-auto mb-2" />
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItemLink 
                  key={item.id} 
                  item={item} 
                  collapsed={collapsed}
                  onClick={closeMobileSidebar}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Navegación Inferior */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-1">
        {bottomNavigation.map((item) => (
          <NavItemLink 
            key={item.id} 
            item={item} 
            collapsed={collapsed}
            onClick={closeMobileSidebar}
          />
        ))}
        
        {/* Logout */}
        <button
          onClick={() => console.log('Logout')}
          className={`
            w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg 
            transition-all duration-200 text-sm font-medium 
            text-slate-600 hover:bg-danger-50 hover:text-danger-600
            dark:text-slate-300 dark:hover:bg-danger-500/10 dark:hover:text-danger-400
            ${collapsed ? 'justify-center px-2' : ''}
          `}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut className={`shrink-0 text-slate-400 group-hover:text-danger-500 ${collapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>

      {/* Botón Colapsar - Solo Desktop */}
      <div className="hidden lg:block border-t border-slate-200 dark:border-slate-800 p-3">
        <button
          onClick={toggleSidebar}
          className={`
            w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
            text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700
            dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200
            transition-all duration-200
          `}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Colapsar menú</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay Móvil */}
      <div 
        className={`
          fixed inset-0 bg-black/50 z-40 lg:hidden
          transition-opacity duration-300
          ${sidebarMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      {/* Sidebar Móvil */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          transform transition-transform duration-300 ease-in-out 
          lg:hidden
          ${sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent collapsed={false} />
      </aside>

      {/* Sidebar Desktop */}
      <aside
        className={`
          hidden lg:flex flex-col fixed inset-y-0 left-0 z-30
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </aside>
    </>
  );
};