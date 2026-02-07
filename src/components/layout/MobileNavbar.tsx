import { NavLink } from "react-router-dom";
import { Menu } from "lucide-react";
import { menuItems } from "@/data/menuItems"; 
import { useLayoutStore } from "@/store/useLayoutStore"; 

export const MobileNavbar = () => {
  const toggleMobileSidebar = useLayoutStore((s) => s.toggleMobileSidebar); 

  
  const allItems = menuItems.flatMap((section) => section.items);


  const navItems = [
    allItems.find((i) => i.to === "/")!,          
    allItems.find((i) => i.to === "/patients")!,  
    allItems.find((i) => i.to === "/owners")!,    
    allItems.find((i) => i.to === "/settings")!,  
  ].filter(Boolean); 

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dark-200 border-t border-dark-100 lg:hidden pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        
       
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to!} 
            className={({ isActive }) => `
              flex flex-col items-center justify-center w-full h-full space-y-1
              transition-all duration-200 select-none
              active:scale-95
              ${isActive 
                ? "text-biovet-400" 
                : "text-slate-500 hover:text-slate-300"
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`
                  relative p-1 rounded-xl transition-all duration-200
                  ${isActive ? "bg-biovet-900/30" : "bg-transparent"}
                `}>
                  <item.icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span className="text-[10px] font-medium tracking-wide">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
        
        {/* Botón Menú: Abre el Sidebar completo para ver el resto de opciones */}
        <button 
          onClick={toggleMobileSidebar}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 active:scale-95"
        >
          <div className="p-1">
             <Menu size={20} />
          </div>
          <span className="text-[10px] font-medium tracking-wide">Menú</span>
        </button>
      </div>
    </nav>
  );
};