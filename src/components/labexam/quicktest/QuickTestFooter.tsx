// src/components/labexam/quicktest/QuickTestFooter.tsx
import { ArrowLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { toast } from "@/components/Toast";
import { QUICK_TEST_TABS } from "@/constants/quickTest";
import type { TabId } from "@/types/labExam/quickTest";

interface QuickTestFooterProps {
  activeTab: TabId;
  currentTabIndex: number;
  isPatientSelected: boolean;
  isPending: boolean;
  onTabChange: (tab: TabId) => void;
  onSubmit: () => void;
}

export function QuickTestFooter({
  activeTab,
  currentTabIndex,
  isPatientSelected,
  isPending,
  onTabChange,
  onSubmit,
}: QuickTestFooterProps) {
  return (
    <footer className="shrink-0 fixed bottom-0 left-0 right-0 sm:relative bg-white dark:bg-dark-200 border-t border-surface-200 dark:border-dark-100 px-4 sm:px-6 py-3 sm:py-4 mb-16 sm:mb-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Indicadores - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {QUICK_TEST_TABS.map((tab, index) => {
            const isLocked = tab.id !== "patient" && !isPatientSelected;
            return (
              <div
                key={tab.id}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  activeTab === tab.id
                    ? "bg-cyan-500 scale-125"
                    : isLocked
                      ? "bg-slate-200 dark:bg-dark-100"
                      : index < currentTabIndex
                        ? "bg-emerald-500"
                        : "bg-slate-200 dark:bg-dark-100"
                }`}
              />
            );
          })}
          <span className="text-xs text-slate-400 ml-2">
            Paso {currentTabIndex + 1} de {QUICK_TEST_TABS.length}
          </span>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              if (currentTabIndex > 0)
                onTabChange(QUICK_TEST_TABS[currentTabIndex - 1].id);
            }}
            disabled={currentTabIndex === 0}
            className="btn-secondary px-3 sm:px-6 py-2.5 flex-1 md:flex-none disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {/* Dots móvil */}
          <div className="flex md:hidden items-center gap-1.5 px-2">
            {QUICK_TEST_TABS.map((tab, index) => {
              const isLocked = tab.id !== "patient" && !isPatientSelected;
              return (
                <div
                  key={tab.id}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    activeTab === tab.id
                      ? "bg-cyan-500 scale-125"
                      : isLocked
                        ? "bg-slate-300 dark:bg-slate-600"
                        : index < currentTabIndex
                          ? "bg-emerald-500"
                          : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              );
            })}
          </div>

          {activeTab === "results" ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isPending || !isPatientSelected}
              className="px-4 sm:px-8 py-2.5 flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 text-sm rounded-lg font-semibold transition-all bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <span>{isPending ? "Guardando..." : "Guardar"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (activeTab === "patient" && !isPatientSelected) {
                  toast.error("Selecciona un paciente primero");
                  return;
                }
                if (currentTabIndex < QUICK_TEST_TABS.length - 1) {
                  onTabChange(QUICK_TEST_TABS[currentTabIndex + 1].id);
                }
              }}
              disabled={activeTab === "patient" && !isPatientSelected}
              className="px-4 sm:px-8 py-2.5 flex-1 md:flex-none flex items-center justify-center gap-1 sm:gap-2 text-sm rounded-lg font-semibold transition-all bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}