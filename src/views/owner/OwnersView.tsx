import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, Search, Download, Filter, X, Loader2, AlertCircle, User, 
  ArrowLeft,
  PlusCircle
} from "lucide-react";
import { getOwners } from "@/api/OwnerAPI";
import OwnerTable from "@/components/owners/OwnerTable";
import OwnerCard from "@/components/owners/OwnerCard";
import OwnerPagination from "@/components/owners/OwnerPagination";
import OwnerExportModal from "@/components/owners/OwnerExportModal";
import type { OwnerWithStats, SortField, SortDirection } from "@/types/owner";

export default function OwnersView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterDebt, setFilterDebt] = useState<"all" | "withDebt" | "noDebt">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data: rawOwners = [], isLoading, isError, error } = useQuery({
    queryKey: ["owners"],
    queryFn: getOwners,
  });

  const owners: OwnerWithStats[] = useMemo(() => {
    return rawOwners.map((owner: any) => ({
      ...owner,
      petsCount: owner.petsCount ?? 0,
      lastVisit: owner.lastVisit ?? null,
      totalDebt: owner.totalDebt ?? 0,
      pendingInvoices: owner.pendingInvoices ?? 0,
    }));
  }, [rawOwners]);

  const filteredOwners = useMemo(() => {
    let result = [...owners];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(o => 
        o.name.toLowerCase().includes(s) || 
        o.contact.includes(s) || 
        o.email?.toLowerCase().includes(s) || 
        o.nationalId?.includes(s)
      );
    }
    if (filterDebt === "withDebt") result = result.filter(o => o.totalDebt > 0);
    else if (filterDebt === "noDebt") result = result.filter(o => o.totalDebt === 0);

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "petsCount": cmp = a.petsCount - b.petsCount; break;
        case "lastVisit": cmp = (a.lastVisit ? new Date(a.lastVisit).getTime() : 0) - (b.lastVisit ? new Date(b.lastVisit).getTime() : 0); break;
        case "totalDebt": cmp = a.totalDebt - b.totalDebt; break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return result;
  }, [owners, search, filterDebt, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);
  const paginatedOwners = filteredOwners.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDirection(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
  };

  const handleSelectAll = (checked: boolean) => checked ? setSelectedIds(new Set(paginatedOwners.map(o => o._id))) : setSelectedIds(new Set());
  const handleSelectOne = (id: string, checked: boolean) => { const newSet = new Set(selectedIds); checked ? newSet.add(id) : newSet.delete(id); setSelectedIds(newSet); };
  const handleNavigate = (id: string) => navigate(`/owners/${id}`);
  const handleWhatsApp = (phone: string) => window.open(`https://wa.me/${phone.replace(/\D/g, "")}`, "_blank");

  const clearFilters = () => { setSearch(""); setFilterDebt("all"); setCurrentPage(1); setSelectedIds(new Set()); setShowFilters(false); };
  const hasFilters = search || filterDebt !== "all";

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-10 h-10 text-biovet-500 animate-spin" /></div>;
  if (isError) return <div className="text-center p-10"><AlertCircle className="w-12 h-12 text-danger-500 mx-auto" /><p className="text-slate-700 dark:text-slate-300 mt-2">Error al cargar: {error instanceof Error ? error.message : "Error desconocido"}</p><button onClick={() => queryClient.invalidateQueries({ queryKey: ["owners"] })} className="btn-primary mt-4">Reintentar</button></div>;

  return (
    <div className="flex flex-col h-full bg-surface-100 dark:bg-dark-300">
      
      {/* ========================================
         DESKTOP: Layout con scroll interno
         ======================================== */}
      <div className="hidden lg:flex flex-col h-full">
        
        {/* Header Fijo - Desktop */}
        <div className="sticky top-0 z-30  border-b border-slate-200 dark:border-slate-800 px-6 py-4 ">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-100 text-slate-500 dark:text-slate-400 transition-colors"
                aria-label="Volver atrás"
              >
                <ArrowLeft size={22} />
              </button>
              
              <div className="min-w-0">
                <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white truncate">
                  Propietarios
                </h1>
                <p className="text-sm text-biovet-500 dark:text-warning-600 mt-1">
                  {owners.length} clientes registrados
                </p>
              </div>
            </div>

            <Link to="/owners/create" className="btn-primary items-center gap-2 shadow-sm">
              <PlusCircle size={20} />
              <span>Nuevo</span>
            </Link>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros - Desktop */}
        <div className="px-6 py-4  dark:bg-dark-200 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por nombre, DNI, correo o teléfono..." 
                value={search} 
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
                className="w-full input pl-10 pr-10 py-2.5 rounded-md" 
              />
              {search && (
                <button 
                  onClick={() => setSearch("")} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-dark-100 border border-slate-200 dark:border-slate-700 rounded-md px-4 py-2.5">
                <Filter size={18} className="text-slate-400" />
                <select 
                  value={filterDebt} 
                  onChange={(e) => { setFilterDebt(e.target.value as any); setCurrentPage(1); }} 
                  className="bg-transparent border-none text-sm focus:ring-0 text-slate-700 dark:text-slate-200 p-0 cursor-pointer"
                >
                  <option value="all">Todos</option>
                  <option value="withDebt">Con deuda</option>
                  <option value="noDebt">Sin deuda</option>
                </select>
              </div>

              <button 
                onClick={() => setShowExportModal(true)} 
                className="btn-secondary "
              >
                <Download size={18} />
                <span className="hidden xl:inline">Exportar</span>
              </button>
              
              {hasFilters && (
                <button 
                  onClick={clearFilters} 
                  className="text-sm text-biovet-500 hover:text-biovet-600 flex items-center gap-1.5 px-3 py-2 font-medium bg-biovet-50 dark:bg-biovet-900/30 rounded-lg"
                >
                  <X size={14} /> Limpiar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contenido con Scroll Interno - Desktop */}
        <div className="flex-1 overflow-hidden px-6 py-4">
          {paginatedOwners.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-dark-100/50">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <User size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No hay clientes</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 text-center max-w-xs">
                {search ? "No se encontraron resultados" : "Agrega tu primer cliente para comenzar"}
              </p>
              {hasFilters && (
                <button onClick={clearFilters} className="btn-ghost mt-4 text-biovet-600">
                  Limpiar filtros
                </button>
              )}
              {!search && (
                <Link to="/owners/create" className="btn-primary mt-4">
                  <Plus size={18} /> Agregar cliente
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Tabla con scroll interno */}
              <div className="bg-white dark:bg-dark-100 border border-slate-200 dark:border-slate-800  shadow-sm flex-1 overflow-hidden">
                <div className="custom-scrollbar">
                  <OwnerTable
                    owners={paginatedOwners}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    selectedIds={selectedIds}
                    allSelected={paginatedOwners.length > 0 && paginatedOwners.every(o => selectedIds.has(o._id))}
                    onSelectAll={handleSelectAll}
                    onSelectOne={handleSelectOne}
                    onNavigate={handleNavigate}
                    onWhatsApp={handleWhatsApp}
                  />
                </div>
              </div>

              {/* Paginación - Fija abajo */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <OwnerPagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    totalItems={filteredOwners.length} 
                    itemsPerPage={itemsPerPage} 
                    onPageChange={(p) => {setCurrentPage(p); setSelectedIds(new Set())}} 
                    onItemsPerPageChange={(n) => {setItemsPerPage(n); setCurrentPage(1)}} 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================
         MOBILE/TABLET: Layout normal con scroll
         ======================================== */}
      <div className="lg:hidden flex flex-col min-h-screen">
        
        {/* Header Sticky - Mobile */}
        <div className="sticky top-0 z-30 bg-white dark:bg-dark-200 border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-100 text-slate-500 dark:text-slate-400 transition-colors"
                aria-label="Volver atrás"
              >
                <ArrowLeft size={22} />
              </button>
              
              <div className="min-w-0">
                <h1 className="text-lg font-bold font-heading text-slate-900 dark:text-white truncate">
                  Propietarios
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {owners.length} clientes
                </p>
              </div>
            </div>

            <Link to="/owners/create" className="btn-icon-primary fixed bottom-20 right-4 z-40 shadow-lg">
              <Plus size={24} />
            </Link>
          </div>
        </div>

        {/* Búsqueda - Mobile */}
        <div className="px-4 py-3 bg-white dark:bg-dark-200 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
              className="w-full input pl-10 pr-10 py-2.5 text-sm rounded-lg" 
            />
            {search && (
              <button 
                onClick={() => setSearch("")} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Botón Filtros - Mobile */}
        <div className="px-4 py-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-dark-100 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-400" />
              <span>Filtros</span>
            </div>
            <div className="flex items-center gap-2">
              {hasFilters && (
                <span className="px-2 py-0.5 bg-biovet-100 dark:bg-biovet-900 text-biovet-700 dark:text-biovet-300 text-xs rounded-full">
                  {filterDebt === "withDebt" ? "Con deuda" : filterDebt === "noDebt" ? "Sin deuda" : "Todos"}
                </span>
              )}
              <span className={`transform transition-transform ${showFilters ? "rotate-180" : ""}`}>
                <X size={18} className="rotate-45" />
              </span>
            </div>
          </button>
        </div>

        {/* Drawer Filtros - Mobile */}
        {showFilters && (
          <div className="fixed inset-0 z-50 bg-white dark:bg-dark-200 pt-16">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filtros</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 text-slate-500 dark:text-slate-400">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Estado de deuda</label>
                <select 
                  value={filterDebt} 
                  onChange={(e) => { setFilterDebt(e.target.value as any); setCurrentPage(1); }} 
                  className="w-full input text-sm"
                >
                  <option value="all">Todos los clientes</option>
                  <option value="withDebt">Con deuda pendiente</option>
                  <option value="noDebt">Sin deuda</option>
                </select>
              </div>

              {hasFilters && (
                <button 
                  onClick={clearFilters} 
                  className="w-full btn-danger text-sm py-2.5"
                >
                  Limpiar todos los filtros
                </button>
              )}
            </div>
          </div>
        )}

        {/* Contenido - Mobile */}
        <div className="flex-1 px-4 pb-24 overflow-y-auto"> {/* pb-24 para bottom navbar */}
          {paginatedOwners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-dark-100/50">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <User size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No hay clientes</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 text-center max-w-xs">
                {search ? "No se encontraron resultados" : "Agrega tu primer cliente para comenzar"}
              </p>
              {hasFilters && (
                <button onClick={clearFilters} className="btn-ghost mt-4 text-biovet-600">
                  Limpiar filtros
                </button>
              )}
              {!search && (
                <Link to="/owners/create" className="btn-primary mt-4">
                  <Plus size={18} /> Agregar cliente
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedOwners.map(owner => (
                <OwnerCard 
                  key={owner._id} 
                  owner={owner} 
                  isSelected={selectedIds.has(owner._id)}
                  onSelectChange={(sel) => handleSelectOne(owner._id, sel)}
                  onWhatsApp={() => handleWhatsApp(owner.contact)}
                  onNavigate={() => handleNavigate(owner._id)}
                />
              ))}
            </div>
          )}

          {/* Paginación - Mobile */}
          {totalPages > 1 && (
            <div className="mt-4">
              <OwnerPagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                totalItems={filteredOwners.length} 
                itemsPerPage={itemsPerPage} 
                onPageChange={(p) => {setCurrentPage(p); setSelectedIds(new Set())}} 
                onItemsPerPageChange={(n) => {setItemsPerPage(n); setCurrentPage(1)}} 
              />
            </div>
          )}
        </div>
      </div>

      <OwnerExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} owners={filteredOwners} selectedIds={selectedIds} />
    </div>
  );
}