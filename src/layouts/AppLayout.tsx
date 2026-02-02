import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useLayoutStore } from '../store/useLayoutStore';

export const AppLayout = () => {
  const sidebarCollapsed = useLayoutStore((s) => s.sidebarCollapsed);
  const initializeTheme = useLayoutStore((s) => s.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-dark-300 transition-colors duration-300">
      <Sidebar />

      <div className={`
        min-h-screen flex flex-col transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
      `}>
        <Header />

        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer opcional */}
        <footer className="px-4 lg:px-6 py-4 border-t border-surface-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            © 2025 BioVet Track
          </p>
        </footer>
      </div>
    </div>
  );
};