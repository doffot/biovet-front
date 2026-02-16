import { Bell, Calendar } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export const MobileHeader = () => {
  const { data: user } = useAuth();

  const getInitials = () => {
    if (!user) return "??";
    const first = user.name?.charAt(0)?.toUpperCase() || "";
    const last = user.lastName?.charAt(0)?.toUpperCase() || "";
    return `${first}${last}`;
  };

  const getFullName = () => {
    if (!user) return "Cargando...";
    return `${user.name} ${user.lastName}`;
  };

  return (
    <header
      className="
        h-16 px-4
        flex items-center justify-between 
        sticky top-0 z-40 
        bg-dark-200
        border-b border-dark-300
        transition-colors duration-300
      "
    >
      {/* Logo */}
      <div className="flex items-center">
        <img
          src="/logo_main.webp"
          alt="BioVet Track"
          className="h-8 object-contain"
        />
      </div>

      <div className="flex items-center gap-2">
        <button className="hidden sm:flex btn-icon-mobile">
          <Calendar size={20} />
        </button>

        <button className="btn-icon-mobile relative">
          <Bell size={20} className="text-biovet-500 fill-biovet-500" />
          <span
            className="absolute -top-0.5 -right-0.5 
                          w-4 h-4 bg-danger-500 text-white text-[10px] 
                          font-bold rounded-full flex items-center justify-center 
                          border-2 border-dark-200"
          >
            3
          </span>
        </button>

        <div className="hidden sm:block w-px h-8 bg-white/20 mx-2" />

        <button className="flex items-center gap-3 p-1.5 pr-4 rounded-xl hover:bg-dark-300 transition-colors">
          <div
            className="w-9 h-9 rounded-full 
                          bg-biovet-500 
                          flex items-center justify-center 
                          text-white font-bold text-sm shadow-sm"
          >
            {getInitials()}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-white leading-tight">
              {getFullName()}
            </p>
            <p className="text-xs text-white/80">Veterinario</p>
          </div>
        </button>
      </div>
    </header>
  );
};