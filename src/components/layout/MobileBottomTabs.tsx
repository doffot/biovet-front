import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  PawPrint,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import { MobileMainMenu } from "./MobileMainMenu";

export function MobileBottomTabs() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Determinar si estamos en una ruta de detalle (paciente)
const isPatientLayout = location.pathname.startsWith('/patients/') && 
                        location.pathname !== '/patients';

  // Si estamos en detalle, no mostrar bottom tabs
 if (isPatientLayout) return null;

  return (
    <>
      {/* Bottom Tabs - Solo visible en mobile/tablet */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-200 border-t border-surface-200 dark:border-dark-100 shadow-lg">
        <div className="flex justify-around items-center h-16 px-2">
          {/* Botón: Inicio */}
          <NavLink
            to="/"
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 flex-1
              ${isActive 
                ? 'text-biovet-600 dark:text-biovet-400' 
                : 'text-slate-500 dark:text-slate-400'
              }
              py-2 transition-all
            `}
          >
            {({ isActive }) => (
              <>
                <Home size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">Inicio</span>
              </>
            )}
          </NavLink>

          {/* Botón: Dueños */}
          <NavLink
            to="/owners"
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 flex-1
              ${isActive 
                ? 'text-biovet-600 dark:text-biovet-400' 
                : 'text-slate-500 dark:text-slate-400'
              }
              py-2 transition-all
            `}
          >
            {({ isActive }) => (
              <>
                <Users size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">Dueños</span>
              </>
            )}
          </NavLink>

          {/* Botón: Mascotas */}
          <NavLink
            to="/patients"
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 flex-1
              ${isActive 
                ? 'text-biovet-600 dark:text-biovet-400' 
                : 'text-slate-500 dark:text-slate-400'
              }
              py-2 transition-all
            `}
          >
            {({ isActive }) => (
              <>
                <PawPrint size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">Mascotas</span>
              </>
            )}
          </NavLink>

          {/* Botón: Más (abre drawer) */}
          <button
            onClick={() => setMenuOpen(true)}
            className={`
              flex flex-col items-center justify-center gap-1 flex-1
              text-slate-500 dark:text-slate-400
              py-2 transition-all
              ${location.pathname.includes('services') || 
                location.pathname.includes('sales') || 
                location.pathname.includes('inventory') || 
                location.pathname.includes('purchases') || 
                location.pathname.includes('reports') || 
                location.pathname.includes('settings')
                ? 'text-biovet-600 dark:text-biovet-400'
                : ''
              }
            `}
          >
            <MoreHorizontal size={24} strokeWidth={2.5} />
            <span className="text-xs font-medium">Más</span>
          </button>
        </div>
      </nav>

      {/* Drawer del menú "Más" */}
      <MobileMainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}