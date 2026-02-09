import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Eye,
 
} from "lucide-react";
import {  differenceInYears, differenceInMonths } from "date-fns";
import type { Patient } from "@/types/patient";

type PatientSortField = "name" | "species" | "birthDate";

interface PatientTableProps {
  patients: Patient[];
  sortField: PatientSortField;
  sortDirection: "asc" | "desc";
  onSort: (field: PatientSortField) => void;
  selectedIds: Set<string>;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onNavigate: (id: string) => void;
  onWhatsApp: (phone: string) => void;
}

export default function PatientTable({
  patients,
  sortField,
  sortDirection,
  onSort,
  selectedIds,
  allSelected,
  onSelectAll,
  onSelectOne,
  onNavigate,
  onWhatsApp,
}: PatientTableProps) {
  
  const SortIcon = ({ field }: { field: PatientSortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-30 text-[#498c9c]" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-biovet-500" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-biovet-500" />
    );
  };

  const getAge = (birthDate: string) => {
    const date = new Date(birthDate);
    const years = differenceInYears(new Date(), date);
    if (years > 0) return `${years} ${years === 1 ? 'año' : 'años'}`;
    const months = differenceInMonths(new Date(), date);
    return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  };

 
  const gridLayout = "grid grid-cols-[50px_70px_1fr_60px] md:grid-cols-[50px_80px_1fr_100px_100px] lg:grid-cols-[50px_80px_1fr_120px_180px_110px_100px_70px]";

  return (
    <div className="flex flex-col overflow-hidden bg-white dark:bg-dark-200 rounded-xl border border-[#cee3e8] dark:border-dark-100 shadow-sm">
      
      {/* HEADER */}
      <div className={`${gridLayout} bg-biovet-50 dark:bg-dark-300 border-b border-[#cee3e8] dark:border-dark-100 items-center pr-4`}>
        <div className="px-4 py-4 flex items-center justify-center">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="w-4 h-4 rounded border-[#cee3e8] text-biovet-500 cursor-pointer"
          />
        </div>
        <div className="px-2 py-4 text-[10px] font-black uppercase tracking-wider text-[#498c9c] text-center">Perfil</div>
        <div className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-[#498c9c] cursor-pointer flex items-center gap-2" onClick={() => onSort("name")}>
          Paciente <SortIcon field="name" />
        </div>
        <div className="hidden md:block px-4 py-4 text-[10px] font-black uppercase tracking-wider text-[#498c9c] text-center">Especie</div>
        <div className="hidden lg:block px-4 py-4 text-[10px] font-black uppercase tracking-wider text-[#498c9c]">Propietario</div>
        <div className="hidden lg:block px-4 py-4 text-[10px] font-black uppercase tracking-wider text-[#498c9c] text-center">Edad</div>
        <div className="hidden lg:block px-4 py-4 text-[10px] font-black uppercase tracking-wider text-[#498c9c] text-center">Peso</div>
        <div className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-[#498c9c] text-right">Ficha</div>
      </div>

      {/* BODY */}
      <div className="overflow-y-auto custom-scrollbar h-[calc(100vh-380px)]">
        <div className="flex flex-col divide-y divide-[#e7f1f4] dark:divide-dark-100">
          {patients.map((patient) => {
            const ownerName = typeof patient.owner === 'object' ? patient.owner.name : "Ver Dueño";
            const ownerContact = typeof patient.owner === 'object' ? (patient.owner as any).contact : "";

            return (
              <div
                key={patient._id}
                className={`${gridLayout} items-center transition-colors hover:bg-[#f8fbfc] dark:hover:bg-dark-100 cursor-pointer ${
                  selectedIds.has(patient._id) ? "bg-biovet-50/50 dark:bg-biovet-900/20" : ""
                }`}
                onClick={() => onNavigate(patient._id)}
              >
                {/* Checkbox */}
                <div className="px-4 py-4 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(patient._id)}
                    onChange={(e) => onSelectOne(patient._id, e.target.checked)}
                    className="w-4 h-4 rounded border-[#cee3e8] text-biovet-500 cursor-pointer"
                  />
                </div>

                {/* Foto */}
                <div className="px-2 py-3 flex justify-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                    <img 
                      src={patient.photo || ""} 
                      className="w-full h-full object-cover"
                      alt=""
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Pet')}
                    />
                  </div>
                </div>
                
                {/* Mascota y Raza */}
                <div className="px-4 py-4 flex flex-col min-w-0">
                  <span className="text-biovet-add dark:text-white font-bold text-md truncate capitalize">{patient.name}</span>
                  <span className="text-gray-400 text-[10px]  capitalize italic tracking-tighter truncate">{patient.breed || "Sin raza"}</span>
                </div>

                {/* Especie */}
                <div className="hidden md:flex px-4 py-4 justify-center">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-dark-300 text-[9px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-dark-100">
                    {patient.species}
                  </span>
                </div>

                {/* Dueño */}
                <div className="hidden lg:flex px-4 py-4 flex-col min-w-0">
                  <span className="text-slate-700 dark:text-slate-300 font-bold text-xs truncate">{ownerName}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onWhatsApp(ownerContact); }}
                      className="text-[#25D366] hover:opacity-70 transition-opacity"
                    >
                      <MessageCircle size={12} fill="currentColor" fillOpacity={0.1} />
                    </button>
                    <span className="text-[10px] text-slate-400 font-medium">Responsable</span>
                  </div>
                </div>

                {/* Edad */}
                <div className="hidden lg:flex px-4 py-4 flex-col items-center">
                  <span className="text-slate-700 dark:text-slate-300 font-bold text-xs">{getAge(patient.birthDate)}</span>
                  
                </div>

                {/* Peso */}
                <div className="hidden lg:flex px-4 py-4 flex-col items-center">
                  <span className="text-slate-700 dark:text-slate-300 font-bold text-xs">{patient.weight || '0'} kg</span>
                  
                </div>

                {/* Acciones */}
                <div className="px-4 py-4 text-right flex justify-end">
                  <div className="p-2 text-biovet-500 group-hover:bg-biovet-50 rounded-lg transition-colors">
                    <Eye size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}