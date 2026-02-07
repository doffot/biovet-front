// src/layouts/AppLayout.tsx
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useLayoutStore } from "../store/useLayoutStore";
import { Header } from "@/components/layout/Header";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBottomTabs } from "@/components/layout/MobileBottomTabs";

export const AppLayout = () => {
  const sidebarCollapsed = useLayoutStore((s) => s.sidebarCollapsed);
  const initializeTheme = useLayoutStore((s) => s.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    // Quitamos 'flex' aquí para que el margen funcione correctamente con el sidebar fijo
    <div className="h-screen bg-surface-100 dark:bg-dark-300 transition-colors duration-300 overflow-hidden font-sans">
      
      {/* Sidebar - Solo visible en desktop (controlado internamente por CSS del componente) */}
      <Sidebar />

      {/* Contenedor Principal */}
      <div
        className={`
          flex flex-col h-full transition-all duration-300
          
          /* MÓVIL: Sin margen a la izquierda (ocupa todo) */
          ml-0 
          
          /* DESKTOP: Margen izquierdo según el estado del sidebar */
          ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}
        `}
      >
        {/* Header - Desktop (Solo se ve en pantallas grandes) */}
        <div className="hidden lg:block sticky top-0 z-30">
          <Header />
        </div>

        {/* Header - Mobile/Tablet (Solo se ve en pantallas pequeñas) */}
        <div className="lg:hidden block sticky top-0 z-30">
          <MobileHeader />
        </div>

        {/* Área de Contenido */}
        <main className="flex-1 overflow-hidden relative">
          {/* Ajustado max-w para que no se corte en desktop */}
          <div className="h-full w-full max-w-7xl mx-auto p-0 lg:p-6 overflow-y-auto no-scrollbar">
            <Outlet />
          </div>
        </main>

        {/* Bottom Tabs - Solo visible en mobile/tablet */}
        <div className="lg:hidden block">
          <MobileBottomTabs />
        </div>
      </div>
    </div>
  );
};