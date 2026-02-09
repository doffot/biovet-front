import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getPatients } from "@/api/patientAPI";
import PatientTable from "@/components/patients/PatientTable";
import Spinner from "@/components/Spinner";
import { Search, Plus, Download, ArrowLeft, Filter } from "lucide-react";

export default function PatientsListView() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients,
  });

  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof p.owner === 'object' && p.owner.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [patients, searchTerm]);

  if (isLoading) return <Spinner fullScreen size="xl" />;

  return (
    <div className="flex flex-col h-full dark:bg-dark-300">
      
      {/* HEADER */}
      <div className="px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#0d191c] dark:text-white leading-tight">
                Pacientes
              </h1>
              <p className="text-[13px] text-[#498c9c] font-medium">
                {filteredPatients.length} mascotas registradas
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/owners")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00738c] hover:bg-[#005f73] text-white rounded-lg font-bold text-[13px] transition-all shadow-sm"
          >
            <div className="p-0.5 border-2 border-white rounded-full">
               <Plus size={12} strokeWidth={3} />
            </div>
            Nuevo
          </button>
        </div>
<div className="border border-biovet-200/50"></div>
        {/* BARRA DE BÚSQUEDA Y FILTROS - CLON DE TU IMAGEN 1 */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, raza o responsable..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-dark-200 border border-slate-200 dark:border-dark-100 rounded-lg text-sm placeholder:text-slate-300 focus:ring-1 focus:ring-[#00738c] outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center bg-white dark:bg-dark-200 border border-slate-200 dark:border-dark-100 rounded-lg overflow-hidden shadow-sm">
            <div className="pl-3 text-slate-300">
              <Filter size={18} />
            </div>
            <select className="pl-2 pr-8 py-2.5 bg-transparent text-sm font-medium text-slate-600 dark:text-slate-300 outline-none appearance-none cursor-pointer">
              <option>Todos</option>
              <option>Canino</option>
              <option>Felino</option>
            </select>
          </div>

          <button 
            onClick={() => {}} 
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-200 border border-slate-200 dark:border-dark-100 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={18} className="text-[#00738c]" />
            Exportar
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="flex-1 px-8 pb-8">
        <PatientTable
          patients={filteredPatients}
          sortField="name"
          sortDirection="asc"
          onSort={() => {}}
          selectedIds={selectedIds}
          allSelected={selectedIds.size === filteredPatients.length}
          onSelectAll={(checked) => {
            if (checked) setSelectedIds(new Set(filteredPatients.map(p => p._id)));
            else setSelectedIds(new Set());
          }}
          onSelectOne={(id, checked) => {
            const next = new Set(selectedIds);
            if (checked) next.add(id); else next.delete(id);
            setSelectedIds(next);
          }}
          onNavigate={(id) => navigate(`/patients/${id}`)}
          onWhatsApp={() => {}}
        />
      </div>
    </div>
  );
}