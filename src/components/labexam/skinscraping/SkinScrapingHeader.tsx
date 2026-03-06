// src/components/labexam/skinscraping/SkinScrapingHeader.tsx
import { X, Scissors, Check } from "lucide-react";
import { SKIN_SCRAPING_TABS } from "@/constants/skinScraping";
import type { SkinScrapingTabId } from "@/types/labExam/skinScraping";

interface SkinScrapingHeaderProps {
  patientName: string;
  species: string;
  breed?: string;
  isPatientSelected: boolean;
  activeTab: SkinScrapingTabId;
  currentTabIndex: number;
  onClose: () => void;
  onClearPatient: () => void;
  onTabChange: (tab: SkinScrapingTabId) => void;
}

export function SkinScrapingHeader({
  patientName,
  species,
  breed,
  isPatientSelected,
  activeTab,
  currentTabIndex,
  onClose,
  onClearPatient,
  onTabChange,
}: SkinScrapingHeaderProps) {
  return (
    <header className="shrink-0 bg-linear-to-r from-amber-600 to-amber-700 text-white px-4 sm:px-6 py-4 sm:py-5">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Scissors className="w-5 h-5 hidden sm:block" />
                <h1 className="text-lg sm:text-xl font-bold font-heading">
                  Raspado Cutáneo
                </h1>
              </div>
              {isPatientSelected && (
                <p className="text-amber-100 text-xs sm:text-sm mt-0.5">
                  {patientName} • {species}
                  <span className="hidden sm:inline"> • {breed}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {isPatientSelected && (
              <button
                type="button"
                onClick={onClearPatient}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cambiar paciente</span>
              </button>
            )}
          </div>
        </div>

        <nav className="flex gap-1 mt-4 sm:mt-5 bg-white/10 p-1 rounded-xl">
          {SKIN_SCRAPING_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const tabIndex = SKIN_SCRAPING_TABS.findIndex((t) => t.id === tab.id);
            const isCompleted = tabIndex < currentTabIndex && isPatientSelected;
            const isLocked = tab.id !== "patient" && !isPatientSelected;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                disabled={isLocked}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-white text-amber-600 shadow-lg"
                    : isLocked
                      ? "text-white/30 cursor-not-allowed"
                      : isCompleted
                        ? "text-white/90 hover:bg-white/10"
                        : "text-white/60 hover:bg-white/10"
                }`}
              >
                {isCompleted && !isActive ? (
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
                ) : (
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}