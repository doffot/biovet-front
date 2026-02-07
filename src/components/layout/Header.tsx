import { Moon, Sun, Bell, Calendar} from 'lucide-react';
import { useLayoutStore } from '../../store/useLayoutStore';

export const Header = () => {
  const theme = useLayoutStore((s) => s.theme);
  const toggleTheme = useLayoutStore((s) => s.toggleTheme);
  
  const isDark = theme === 'dark';

  return (
    <header className="
      h-16 px-4 lg:px-8
      flex items-center justify-between 
      sticky top-0 z-40 
      bg-white dark:bg-dark-200
      border-b border-slate-200 dark:border-slate-800
      transition-colors duration-300
    ">
      
      {/* Logo + Botón Hamburguesa */}
      <div className="flex items-center gap-4">
        {/* Logo - Visible en mobile */}
        <div className="lg:hidden flex items-center">
          <img 
            src="/logo_main.webp" 
            alt="BioVet Track" 
            className="h-8 object-contain"
          />
        </div>

        
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle - Oculto en mobile, visible en desktop */}
        <button 
          onClick={toggleTheme}
          className="hidden lg:flex btn-icon-neutral group"
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          <div className="relative w-5 h-5">
            <Sun 
              size={20} 
              className={`
                absolute inset-0 text-amber-500
                transition-all duration-300 ease-out
                ${isDark 
                  ? 'opacity-100 rotate-0 scale-100' 
                  : 'opacity-0 rotate-90 scale-50'
                }
              `}
            />
            <Moon 
              size={20} 
              className={`
                absolute inset-0 text-slate-600 dark:text-slate-400
                transition-all duration-300 ease-out
                ${isDark 
                  ? 'opacity-0 -rotate-90 scale-50' 
                  : 'opacity-100 rotate-0 scale-100'
                }
              `}
            />
          </div>
        </button>

        <button className="hidden sm:flex lg:flex btn-icon-neutral">
          <Calendar size={20} />
        </button>
        
        {/* Notifications */}
        <button className="btn-icon-neutral relative">
          <Bell size={20} className="text-biovet-500 fill-biovet-850" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-dark-200">
            3
          </span>
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-white/20 lg:bg-slate-200 lg:dark:bg-slate-700 mx-2" />
        
        {/* User Avatar */}
        <button className="flex items-center gap-3 p-1.5 pr-4 rounded-xl hover:bg-dark-300 lg:hover:bg-slate-50 lg:dark:hover:bg-dark-50 transition-colors">
          <div className="w-9 h-9 rounded-full bg-biovet-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            DR
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-white lg:text-slate-700 lg:dark:text-white leading-tight">
              Dr. Rodríguez
            </p>
            <p className="text-xs text-white/80 lg:text-slate-500 lg:dark:text-slate-400">
              Veterinario
            </p>
          </div>
        </button>
      </div>
    </header>
  );
};