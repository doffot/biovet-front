// src/components/owners/detail/OwnerHeader.tsx
import { useNavigate } from 'react-router-dom';
import { ChevronRight, PawPrint, Plus, ArrowLeft } from 'lucide-react';
import type { Patient } from '@/types/patient';
import { TABS, type TabType, type DebtInfo } from '@/utils/ownerHelpers';

interface OwnerHeaderProps {
  ownerName: string;
  ownerId: string;
  patients: Patient[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  debtInfo: DebtInfo;
  onMenuClick?: () => void;
}

export function OwnerHeader({ 
  ownerName, 
  ownerId,
  patients, 
  activeTab, 
  onTabChange, 
}: OwnerHeaderProps) {
  const navigate = useNavigate();

  const handleAddPatient = () => {
    navigate(`/owners/${ownerId}/patients/new`);
  };

  const handleGoBack = () => {
    navigate('/owners');
  };

  return (
    <header className="p-4 sm:p-6 bg-biovet-100 dark:bg-dark-200 border-b border-surface-200 dark:border-slate-800 h-52">
      {/* Breadcrumb con flecha de regreso */}
      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">
        
        {/* Flecha de regreso - Visible SIEMPRE (Mobile y Desktop) */}
        <button 
          onClick={handleGoBack}
          className="flex items-center justify-center w-8 h-8 -ml-2 mr-1 rounded-full hover:bg-white/50 dark:hover:bg-dark-100 transition-colors active:scale-95"
          title="Volver a propietarios"
        >
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
        </button>

        <span 
          className="hover:text-biovet-500 cursor-pointer hidden sm:inline" 
          onClick={handleGoBack}
        >
          Propietarios
        </span>
        <ChevronRight size={10} className="hidden sm:block" />
        <span className="text-biovet-500 truncate max-w-37.5 sm:max-w-none">{ownerName}</span>
      </div>
      
      {/* Title Row - (Igual que antes) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            Expediente
          </h2>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <PawPrint size={14} className="text-biovet-500" />
              <span>{patients.length} mascota{patients.length !== 1 ? 's' : ''}</span>
            </div>
            
            {patients.length > 0 && (
              <div className="flex -space-x-2">
                {patients.slice(0, 3).map((patient) => (
                  <div 
                    key={patient._id} 
                    className="w-7 h-7 rounded-full border-2 border-white dark:border-dark-200 overflow-hidden bg-slate-100"
                  >
                    {patient.photo ? (
                      <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-biovet-600">
                        {patient.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <button onClick={handleAddPatient} className="btn-primary text-xs font-bold w-full sm:w-auto px-6">
          <Plus size={16} /> 
          <span>NUEVA MASCOTA</span>
        </button>
      </div>

      {/* Tabs Responsivos - (Igual que antes) */}
      <nav className="flex w-full mt-8 border-b border-slate-100 dark:border-slate-800/50 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 min-w-20 sm:min-w-0 pb-3 transition-all relative group ${
                isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-tighter sm:tracking-widest">
                  {tab.label}
                  {tab.id === 'mascotas' && patients.length > 0 && (
                    <span className={`ml-1 px-1 rounded ${isActive ? 'bg-biovet-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {patients.length}
                    </span>
                  )}
                </span>
                
                <div className={`
                  absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300
                  ${isActive ? 'bg-biovet-500 scale-x-100' : 'bg-transparent scale-x-0 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}
                `} />
              </div>
            </button>
          );
        })}
      </nav>
    </header>
  );
}