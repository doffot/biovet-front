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
    <div className="h-screen bg-surface-100 dark:bg-dark-300 transition-colors duration-300 overflow-hidden font-sans">
      <Sidebar />

      <div
        className={`
          flex flex-col h-full transition-all duration-300
          ml-0 
          ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-60"}
        `}
      >
        {/* ✅ Header FUERA del scroll - siempre fijo */}
        <div className="hidden lg:block shrink-0">
          <Header />
        </div>

        <div className="lg:hidden block shrink-0">
          <MobileHeader />
        </div>

        {/* ✅ Solo el contenido tiene scroll */}
        <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>

        <div className="lg:hidden block shrink-0">
          <MobileBottomTabs />
        </div>
      </div>
    </div>
  );
};