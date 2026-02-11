import { 
  User, 
  ClipboardList, 
  Microscope, 
  FileText,
  Lock,
  Check
} from "lucide-react";

type TabType = 'patient' | 'general' | 'differential' | 'observations';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isPatientSelected?: boolean;
}

export function TabNavigation({ activeTab, onTabChange, isPatientSelected = false }: TabNavigationProps) {
  const tabs = [
    { 
      id: 'patient' as const, 
      label: 'Paciente', 
      shortLabel: 'Paciente',
      icon: User,
      enabled: true,
    },
    { 
      id: 'general' as const, 
      label: 'Datos Generales', 
      shortLabel: 'General',
      icon: ClipboardList,
      enabled: isPatientSelected,
    },
    { 
      id: 'differential' as const, 
      label: 'Diferencial', 
      shortLabel: 'Conteo',
      icon: Microscope,
      enabled: isPatientSelected,
    },
    { 
      id: 'observations' as const, 
      label: 'Observaciones', 
      shortLabel: 'Notas',
      icon: FileText,
      enabled: isPatientSelected,
    },
  ];

  const getTabIndex = (tabId: TabType) => tabs.findIndex(t => t.id === tabId);
  const currentIndex = getTabIndex(activeTab);

  return (
    <div className="border-b border-border bg-vet-light">
      <nav className="flex">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isEnabled = tab.enabled;
          const isCompleted = index < currentIndex && isEnabled;
          
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => isEnabled && onTabChange(tab.id)}
              disabled={!isEnabled}
              className={`
                relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 
                px-2 sm:px-4 py-3 sm:py-3.5
                text-xs sm:text-sm font-medium
                transition-all duration-200
                group
                ${isActive 
                  ? 'text-vet-primary bg-card font-bold border-b-2 border-vet-primary' 
                  : isEnabled
                    ? 'text-vet-muted hover:text-vet-text hover:bg-hover'
                    : 'text-vet-muted/50 cursor-not-allowed bg-vet-light'
                }
              `}
            >
              {/* Indicador de paso / estado */}
              <span className={`
                flex items-center justify-center
                w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-xs font-bold
                transition-all duration-200
                ${isCompleted
                  ? 'bg-emerald-500 text-white'
                  : isActive 
                    ? 'bg-vet-primary text-white shadow-soft' 
                    : isEnabled
                      ? 'bg-vet-light border border-border text-vet-muted group-hover:border-vet-primary group-hover:text-vet-primary'
                      : 'bg-vet-light border border-border text-vet-muted/30'
                }
              `}>
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : !isEnabled ? (
                  <Lock className="w-2.5 h-2.5" />
                ) : (
                  index + 1
                )}
              </span>
              
              {/* Icono en móvil */}
              <Icon className={`w-4 h-4 sm:hidden ${
                isActive ? 'text-vet-primary' : isEnabled ? 'text-vet-muted' : 'text-vet-muted/50'
              }`} />
              
              <span className="hidden sm:inline truncate">{tab.label}</span>
              
              <span className="sm:hidden text-[10px]">{tab.shortLabel}</span>
              
              {/* Línea completada (decorativa) */}
              {isCompleted && !isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-500/50 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Mensaje si no hay paciente */}
      {!isPatientSelected && activeTab === 'patient' && (
        <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20">
          <p className="text-xs text-amber-600 dark:text-amber-400 text-center flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            <span>Selecciona un paciente para desbloquear las siguientes secciones</span>
          </p>
        </div>
      )}
    </div>
  );
}