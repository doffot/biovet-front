// src/components/layout/MobileMainMenu.tsx
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { 
  X, 
  LogOut, 
  ChevronDown,
  Moon,
  Sun 
} from "lucide-react";

// Importaciones de tu proyecto
import { menuItems, type MenuItem } from "@/data/menuItems";
import { toast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useTheme } from "@/hooks/useTheme";

interface MobileMainMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// Componente para items con submenú (acordeón)
const MobileMenuGroup = ({ 
  item, 
  onClose 
}: { 
  item: MenuItem; 
  onClose: () => void;
}) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const hasActiveChild = item.submenu?.some(sub => 
    location.pathname.startsWith(sub.to)
  );

  useEffect(() => {
    if (hasActiveChild) setIsOpen(true);
  }, [hasActiveChild]);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-3 
          rounded-xl transition-all duration-200 text-sm font-medium
          ${hasActiveChild 
            ? 'bg-biovet-50 dark:bg-biovet-950 text-biovet-600 dark:text-biovet-400' 
            : 'text-slate-700 dark:text-slate-300 hover:bg-surface-100 dark:hover:bg-dark-100'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <item.icon 
            size={20} 
            className={hasActiveChild ? 'text-biovet-500' : 'text-slate-400'} 
          />
          <span>{item.label}</span>
        </div>
        <ChevronDown 
          size={16} 
          className={`
            transition-transform duration-300 text-slate-400
            ${isOpen ? "rotate-180" : ""}
          `} 
        />
      </button>
      
      {/* Submenú expandible */}
      <div 
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="ml-4 pl-4 mt-1 space-y-1 border-l-2 border-surface-200 dark:border-dark-100">
          {item.submenu?.map((subItem) => (
            <NavLink
              key={subItem.to}
              to={subItem.to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm transition-all duration-200
                ${isActive 
                  ? "text-biovet-600 dark:text-biovet-400 bg-biovet-50 dark:bg-biovet-950 font-medium" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-surface-100 dark:hover:bg-dark-100"
                }
              `}
            >
              <subItem.icon size={16} />
              <span>{subItem.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente para items simples (sin submenú)
const MobileMenuItem = ({ 
  item, 
  onClose 
}: { 
  item: MenuItem & { to: string }; 
  onClose: () => void;
}) => {
  return (
    <NavLink
      to={item.to}
      onClick={onClose}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-xl
        text-sm font-medium transition-all duration-200
        ${isActive 
          ? 'bg-biovet-50 dark:bg-biovet-950 text-biovet-600 dark:text-biovet-400' 
          : 'text-slate-700 dark:text-slate-300 hover:bg-surface-100 dark:hover:bg-dark-100'
        }
      `}
    >
      <item.icon size={20} className="text-slate-400" />
      <span>{item.label}</span>
    </NavLink>
  );
};

export function MobileMainMenu({ isOpen, onClose }: MobileMainMenuProps) {
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Filtrar solo las secciones que NO están en el BottomTabs
  // (Inicio, Dueños, Mascotas ya están en los tabs)
  const filteredMenuItems = menuItems.filter(
    section => section.groupLabel !== "Accesos Directos"
  );

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    toast.info("Cerrando sesión", "Finalizando tu sesión de forma segura...");

    setTimeout(() => {
      localStorage.removeItem("AUTH_TOKEN");
      queryClient.clear();
      window.location.href = "/auth/login";
    }, 800);
  };

  return (
    <>
      {/* Modal de confirmación de logout */}
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

      {/* Overlay oscuro */}
      <div
        className={`
          fixed inset-0 z-60 bg-black/60 backdrop-blur-[2px] 
          transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />

      {/* Drawer lateral */}
      <div
        className={`
          fixed inset-y-0 right-0 z-70 w-[85%] max-w-[320px]
          bg-white dark:bg-dark-200 shadow-2xl
          transform transition-transform duration-300 ease-out
          flex flex-col
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header del drawer */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-surface-200 dark:border-dark-100 shrink-0">
          <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
            Menú
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 dark:hover:text-slate-300 dark:hover:bg-dark-100 transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3">
          {filteredMenuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {/* Título de sección */}
              <h3 className="px-4 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {section.groupLabel}
              </h3>

              {/* Items de la sección */}
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  item.submenu ? (
                    <MobileMenuGroup 
                      key={itemIndex} 
                      item={item} 
                      onClose={onClose} 
                    />
                  ) : (
                    <MobileMenuItem 
                      key={itemIndex} 
                      item={item as MenuItem & { to: string }} 
                      onClose={onClose} 
                    />
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer con acciones */}
        <div className="shrink-0 p-3 border-t border-surface-200 dark:border-dark-100 space-y-1 bg-surface-50 dark:bg-dark-300">
          {/* Toggle Theme */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-surface-100 dark:hover:bg-dark-100 transition-colors text-sm font-medium"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
          </button>

          {/* Cerrar Sesión */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950 transition-colors text-sm font-medium"
          >
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>

          {/* Powered by */}
          <div className="pt-2">
            <p className="text-[9px] text-slate-400 dark:text-slate-600 text-center font-bold tracking-widest">
              POWERED BY <span className="text-biovet-500">BIOVET TRACK</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}