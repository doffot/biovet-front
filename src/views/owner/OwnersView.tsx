import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Download,
  Filter,
  X,
  Loader2,
  AlertCircle,
  User,
} from "lucide-react";
import { getOwners, deleteOwners } from "@/api/OwnerAPI";
import { toast } from "@/components/Toast";
import OwnerTable from "@/components/owners/OwnerTable";
import OwnerCard from "@/components/owners/OwnerCard";
import OwnerPagination from "@/components/owners/OwnerPagination";
import OwnerExportModal from "@/components/owners/OwnerExportModal";
import type {
  Owner,
  OwnerWithStats,
  SortField,
  SortDirection,
} from "@/types/owner";

export default function OwnersView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Estados
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterDebt, setFilterDebt] = useState<"all" | "withDebt" | "noDebt">(
    "all",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showExportModal, setShowExportModal] = useState(false);

  // Query
  const {
    data: rawOwners = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["owners"],
    queryFn: getOwners,
  });

  // ✅ CORRECCIÓN PRINCIPAL AQUÍ:
  // Transformar y asegurar datos SIN sobrescribir con ceros
  const owners: OwnerWithStats[] = useMemo(() => {
    // Mapeamos para asegurar valores por defecto si alguno viniera undefined
    return rawOwners.map((owner: any) => ({
      ...owner,
      // Usamos los datos reales del backend.
      // El operador '??' usa el valor de la derecha solo si el de la izquierda es null/undefined
      petsCount: owner.petsCount ?? 0,
      lastVisit: owner.lastVisit ?? null,
      totalDebt: owner.totalDebt ?? 0,
      pendingInvoices: owner.pendingInvoices ?? 0,
    }));
  }, [rawOwners]);

  // Mutation para eliminar
  const deleteMutation = useMutation({
    mutationFn: deleteOwners,
    onSuccess: (data) => {
      toast.success(
        "Eliminado",
        data.msg || "Propietario eliminado correctamente",
      );
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      setSelectedIds(new Set());
    },
    onError: (err: Error) => {
      toast.error("Error", err.message);
    },
  });

  // Filtrar y ordenar
  const filteredOwners = useMemo(() => {
    let result = [...owners];

    // Búsqueda
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.name.toLowerCase().includes(s) ||
          o.contact.includes(s) ||
          o.email?.toLowerCase().includes(s) ||
          o.nationalId?.includes(s),
      );
    }

    // Filtro de deuda
    if (filterDebt === "withDebt") {
      result = result.filter((o) => o.totalDebt > 0);
    } else if (filterDebt === "noDebt") {
      result = result.filter((o) => o.totalDebt === 0);
    }

    // Ordenar
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "petsCount":
          cmp = a.petsCount - b.petsCount;
          break;
        case "lastVisit":
          const dateA = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
          const dateB = b.lastVisit ? new Date(b.lastVisit).getTime() : 0;
          cmp = dateA - dateB;
          break;
        case "totalDebt":
          cmp = a.totalDebt - b.totalDebt;
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
  }, [owners, search, filterDebt, sortField, sortDirection]);

  // Paginación
  const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);
  const paginatedOwners = filteredOwners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedOwners.map((o) => o._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleNavigate = (id: string) => {
    navigate(`/owners/${id}`);
  };

  const handleWhatsApp = (phone: string) => {
    const clean = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${clean}`, "_blank");
  };

  const handleDelete = (owner: Owner) => {
    if (
      window.confirm(
        `¿Eliminar a "${owner.name}"? Esta acción no se puede deshacer.`,
      )
    ) {
      deleteMutation.mutate(owner._id);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds(new Set());
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const clearFilters = () => {
    setSearch("");
    setFilterDebt("all");
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const hasFilters = search || filterDebt !== "all";

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-biovet-500 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400">
            Cargando propietarios...
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-danger-500" />
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              Error al cargar
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              {error instanceof Error ? error.message : "Error desconocido"}
            </p>
          </div>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["owners"] })
            }
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Propietarios
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {owners.length} cliente{owners.length !== 1 ? "s" : ""} registrado
            {owners.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link to="/owners/create" className="btn-primary">
          <Plus size={20} />
          Nuevo Propietario
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="input pl-10 pr-10"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filtro deuda */}
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400 shrink-0" />
          <select
            value={filterDebt}
            onChange={(e) => {
              setFilterDebt(e.target.value as typeof filterDebt);
              setCurrentPage(1);
            }}
            className="input py-2 w-auto"
          >
            <option value="all">Todos</option>
            <option value="withDebt">Con deuda</option>
            <option value="noDebt">Sin deuda</option>
          </select>
        </div>

        {/* Exportar */}
        <button
          onClick={() => setShowExportModal(true)}
          className="btn-secondary shrink-0"
        >
          <Download size={18} />
          <span className="hidden sm:inline">Exportar</span>
          {selectedIds.size > 0 && (
            <span className="bg-biovet-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {selectedIds.size}
            </span>
          )}
        </button>

        {/* Limpiar filtros */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-biovet-500 hover:text-biovet-600 dark:text-biovet-400 dark:hover:text-biovet-300 font-medium flex items-center gap-1 shrink-0"
          >
            <X size={14} />
            Limpiar
          </button>
        )}
      </div>

      {/* Contador de filtrados */}
      {hasFilters && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Mostrando {filteredOwners.length} de {owners.length} propietarios
        </p>
      )}

      {/* Contenido */}
      {paginatedOwners.length === 0 ? (
        <div className="bg-white dark:bg-dark-100 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <User className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {hasFilters ? "Sin resultados" : "No hay propietarios"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {hasFilters
              ? "Intenta con otros filtros de búsqueda"
              : "Comienza agregando el primer propietario"}
          </p>
          {!hasFilters && (
            <Link to="/owners/create" className="btn-primary inline-flex">
              <Plus size={20} />
              Agregar Propietario
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-100 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          {/* Tabla Desktop */}
          <div className="hidden lg:block">
            <OwnerTable
              owners={paginatedOwners}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              selectedIds={selectedIds}
              allSelected={
                paginatedOwners.length > 0 &&
                paginatedOwners.every((o) => selectedIds.has(o._id))
              }
              onSelectAll={handleSelectAll}
              onSelectOne={handleSelectOne}
              onNavigate={handleNavigate}
              onWhatsApp={handleWhatsApp}
              onDelete={handleDelete}
            />
          </div>

          {/* Cards Mobile */}
          <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedOwners.map((owner) => (
              <OwnerCard
                key={owner._id}
                owner={owner}
                isSelected={selectedIds.has(owner._id)}
                onSelectChange={(selected) =>
                  handleSelectOne(owner._id, selected)
                }
                onDelete={() => handleDelete(owner)}
                onWhatsApp={() => handleWhatsApp(owner.contact)}
                onNavigate={() => handleNavigate(owner._id)}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 0 && (
            <OwnerPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredOwners.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>
      )}

      {/* Modal de Exportación */}
      <OwnerExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        owners={filteredOwners}
        selectedIds={selectedIds}
      />
    </div>
  );
}
