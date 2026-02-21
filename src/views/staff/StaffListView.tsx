// src/views/staff/StaffListView.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, Search, Filter, Trash2 } from "lucide-react";
import { getStaffList, deleteStaff } from "@/api/staffAPI";
import type { Staff, StaffRole } from "@/types/staff";
import { toast } from "@/components/Toast";
import { StaffFormModal } from "@/components/staff/StaffFormModal";
import { StaffTable } from "@/components/staff/StaffTable";
import ConfirmationModal from "@/components/ConfirmationModal";

export function StaffListView() {
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<StaffRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: getStaffList,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Personal eliminado", "El miembro ha sido eliminado correctamente");
      setIsDeleteModalOpen(false);
      setSelectedStaff(null);
    },
    onError: (error: Error) => {
      toast.error("Error al eliminar", error.message);
    },
  });

  // Filtrado
  const filteredStaff = staffList.filter((member) => {
    const fullName = `${member.name} ${member.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && member.active) ||
      (statusFilter === "inactive" && !member.active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handlers
  const handleCreate = () => {
    setSelectedStaff(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsFormModalOpen(true);
  };

  const handleDelete = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedStaff?._id) {
      deleteMutation.mutate(selectedStaff._id);
    }
  };

  // Stats
  const stats = {
    total: staffList.length,
    active: staffList.filter((s) => s.active).length,
    veterinarios: staffList.filter((s) => s.role === "veterinario").length,
    groomers: staffList.filter((s) => s.role === "groomer").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-biovet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-biovet-500 flex items-center justify-center shadow-sm">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading text-slate-800 dark:text-slate-100">
              Personal
            </h1>
            <p className="text-sm text-surface-500 dark:text-slate-400">
              {stats.total} miembro{stats.total !== 1 ? "s" : ""} • {stats.active} activo
              {stats.active !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <button onClick={handleCreate} className="btn-primary">
          <Plus className="w-4 h-4" />
          Agregar Personal
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 p-4">
          <p className="text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Total
          </p>
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">
            {stats.total}
          </p>
        </div>
        <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 p-4">
          <p className="text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Activos
          </p>
          <p className="text-2xl font-bold text-success-600 dark:text-success-400">
            {stats.active}
          </p>
        </div>
        <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 p-4">
          <p className="text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Veterinarios
          </p>
          <p className="text-2xl font-bold text-biovet-600 dark:text-biovet-400">
            {stats.veterinarios}
          </p>
        </div>
        <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 p-4">
          <p className="text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Peluqueros
          </p>
          <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
            {stats.groomers}
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-slate-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as StaffRole | "all")}
              className="input pl-10 pr-8 sm:w-48 appearance-none"
            >
              <option value="all">Todos los roles</option>
              <option value="veterinario">Veterinario</option>
              <option value="groomer">Peluquero</option>
              <option value="asistente">Asistente</option>
              <option value="recepcionista">Recepcionista</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
            className="input sm:w-40 appearance-none"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <StaffTable
        staff={filteredStaff}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* ── Form Modal ── */}
      <StaffFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedStaff(null);
        }}
        staff={selectedStaff}
      />

      {/* ── Delete Confirmation ── */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedStaff(null);
        }}
        onConfirm={handleConfirmDelete}
        variant="danger"
        title="Eliminar Personal"
        message={
          selectedStaff ? (
            <>
              ¿Estás seguro que deseas eliminar a{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {selectedStaff.name} {selectedStaff.lastName}
              </span>
              ? Esta acción no se puede deshacer.
            </>
          ) : ""
        }
        confirmText="Eliminar"
        confirmIcon={Trash2}
        isLoading={deleteMutation.isPending}
        loadingText="Eliminando..."
      />
    </div>
  );
}