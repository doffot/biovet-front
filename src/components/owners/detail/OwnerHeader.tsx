// src/components/owners/detail/OwnerHeader.tsx
import { useNavigate } from 'react-router-dom';
import { ChevronRight, PawPrint, Plus, Menu } from 'lucide-react';
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
  debtInfo,
  onMenuClick 
}: OwnerHeaderProps) {
  const navigate = useNavigate();

  const handleAddPatient = () => {
    navigate(`/owners/${ownerId}/patients/new`);
  };

  return (
    <header className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-dark-200 border-b border-surface-200 dark:border-slate-800">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 sm:mb-4">
        <button 
          onClick={onMenuClick}
          className="p-1.5 -ml-1.5 hover:bg-surface-100 dark:hover:bg-dark-100 rounded-lg transition-colors md:hidden"
        >
          <Menu size={18} className="text-slate-500" />
        </button>
        <span 
          className="hover:text-biovet-500 cursor-pointer hidden sm:inline" 
          onClick={() => navigate('/owners')}
        >
          Dueños
        </span>
        <ChevronRight size={10} className="hidden sm:block" />
        <span className="text-biovet-500 truncate max-w-[150px] sm:max-w-none">{ownerName}</span>
      </div>
      
      {/* Title Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            Expediente
          </h2>
          <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500">
              <PawPrint size={14} className="sm:w-4 sm:h-4" />
              <span>{patients.length} mascota{patients.length !== 1 ? 's' : ''}</span>
            </div>
            
            {/* Patient avatars */}
            {patients.length > 0 && (
              <div className="flex -space-x-1.5 sm:-space-x-2">
                {patients.slice(0, 3).map((patient) => (
                  <div 
                    key={patient._id} 
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white dark:border-dark-200 
                               overflow-hidden bg-biovet-100 dark:bg-biovet-900/30" 
                    title={patient.name}
                  >
                    {patient.photo ? (
                      <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] sm:text-[10px] 
                                      font-bold text-biovet-600 dark:text-biovet-400">
                        {patient.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}
                {patients.length > 3 && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white dark:border-dark-200 
                                  bg-biovet-500 flex items-center justify-center text-[8px] sm:text-[10px] 
                                  font-bold text-white">
                    +{patients.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <button onClick={handleAddPatient} className="btn-primary text-xs sm:text-sm w-full sm:w-auto">
          <Plus size={16} className="sm:w-[18px] sm:h-[18px]" /> 
          <span className="sm:hidden">NUEVA</span>
          <span className="hidden sm:inline">NUEVA MASCOTA</span>
        </button>
      </div>

      {/* Tabs */}
      <nav className="flex gap-4 sm:gap-6 lg:gap-10 mt-6 sm:mt-8 lg:mt-12 overflow-x-auto no-scrollbar pb-1 -mb-1 
                      border-b border-surface-50 dark:border-slate-800/30">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-3 sm:pb-4 text-[10px] sm:text-xs font-black uppercase tracking-widest 
                       transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id
                ? 'text-slate-900 dark:text-white border-b-3 sm:border-b-4 border-biovet-500'
                : 'text-slate-400 hover:text-biovet-400'
            }`}
          >
            {tab.label}
            {tab.id === 'mascotas' && patients.length > 0 && (
              <span className="ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-biovet-500 text-white rounded text-[8px] sm:text-[9px]">
                {patients.length}
              </span>
            )}
            {tab.id === 'transacciones' && debtInfo.pendingCount > 0 && (
              <span className="ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-amber-500 text-white rounded text-[8px] sm:text-[9px]">
                {debtInfo.pendingCount}
              </span>
            )}
          </button>
        ))}
      </nav>
    </header>
  );
}