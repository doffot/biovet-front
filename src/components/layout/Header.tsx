import { Moon, Sun, Bell, Calendar, Menu } from 'lucide-react';
import { useLayoutStore } from '../../store/useLayoutStore';

export const Header = () => {
  const theme = useLayoutStore((s) => s.theme);
  const toggleTheme = useLayoutStore((s) => s.toggleTheme);
  const toggleMobileSidebar = useLayoutStore((s) => s.toggleMobileSidebar);
  
  const isDark = theme === 'dark';

  return (
    <header className="header h-16 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300">
      
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden btn-icon-neutral"
        >
          <Menu size={20} />
        </button>

        
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="btn-icon-neutral group"
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

        <button className="btn-icon-neutral hidden sm:flex">
          <Calendar size={20} />
        </button>
        
        {/* Notifications */}
        <button className="btn-icon-neutral relative">
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-dark-200">
            3
          </span>
        </button>

        {/* User Avatar */}
        <div className="hidden sm:block w-px h-8 bg-surface-300 dark:bg-slate-700 mx-2" />
        
        <button className="flex items-center gap-3 p-1.5 pr-4 rounded-xl hover:bg-surface-100 dark:hover:bg-dark-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-biovet-400 to-biovet-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            DR
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-700 dark:text-white leading-tight">
              Dr. Rodríguez
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Veterinario
            </p>
          </div>
        </button>
      </div>
    </header>
  );
};