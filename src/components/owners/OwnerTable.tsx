import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  MessageCircle, 
  Trash2, 
  Eye, // Usaré Eye para "Ver detalle"
  Edit, // Usaré Edit para "Editar"
  Phone
} from "lucide-react";
import type { Owner, OwnerWithStats, SortField, SortDirection } from "@/types/owner";
import { Link } from "react-router-dom";

interface OwnerTableProps {
  owners: OwnerWithStats[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  selectedIds: Set<string>;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onNavigate: (id: string) => void;
  onWhatsApp: (phone: string) => void;
  onDelete: (owner: Owner) => void;
}

export default function OwnerTable({
  owners,
  sortField,
  sortDirection,
  onSort,
  selectedIds,
  allSelected,
  onSelectAll,
  onSelectOne,
  onNavigate,
  onWhatsApp,
  onDelete,
}: OwnerTableProps) {
  
  // Icono de ordenamiento (adaptado al color del diseñobiovet-500
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-30 text-[#498c9c]" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-biovet-500" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-biovet-500" />
    );
  };

  const formatLastVisit = (date: string | null) => {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    // Card Container (Estilo exacto: border-[#cee3e8] rounded-xl)
    <div className="bg-white dark:bg-dark-200 rounded-xl border border-[#cee3e8] dark:border-dark-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          
          {/* --- HEADER (Estilo exacto: bg-[#f8fbfc]) --- */}
          <thead className="bg-[#f8fbfc] dark:bg-dark-300 border-b border-[#cee3e8] dark:border-dark-100">
            <tr>
              {/* Checkbox */}
              <th className="w-12 px-6 py-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-[#cee3e8] text-biovet-500 focus:ring-biovet-500 cursor-pointer"
                />
              </th>

              {/* CLIENTE */}
              <th
                className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#498c9c] dark:text-slate-400 cursor-pointer hover:text-biovet-500 transition-colors group"
                onClick={() => onSort("name")}
              >
                <div className="flex items-center gap-2">
                  Cliente
                  <SortIcon field="name" />
                </div>
              </th>

              {/* MASCOTAS */}
              <th
                className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#498c9c] dark:text-slate-400 cursor-pointer hover:text-biovet-500 transition-colors"
                onClick={() => onSort("petsCount")}
              >
                <div className="flex items-center gap-2">
                  Mascotas
                  <SortIcon field="petsCount" />
                </div>
              </th>

              {/* ESTADO DE CUENTA (Deuda) */}
              <th
                className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#498c9c] dark:text-slate-400 cursor-pointer hover:text-biovet-500 transition-colors"
                onClick={() => onSort("totalDebt")}
              >
                <div className="flex items-center gap-2">
                  Estado de Cuenta
                  <SortIcon field="totalDebt" />
                </div>
              </th>

              {/* ÚLTIMA VISITA */}
              <th
                className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#498c9c] dark:text-slate-400 cursor-pointer hover:text-biovet-500 transition-colors"
                onClick={() => onSort("lastVisit")}
              >
                <div className="flex items-center gap-2">
                  Última Visita
                  <SortIcon field="lastVisit" />
                </div>
              </th>

              {/* ACCIONES */}
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#498c9c] dark:text-slate-400 text-right">
                Acciones
              </th>
            </tr>
          </thead>

          {/* --- BODY --- */}
          <tbody className="divide-y divide-[#e7f1f4] dark:divide-dark-100">
            {owners.map((owner) => (
              <tr
                key={owner._id}
                className={`
                  transition-colors hover:bg-[#f8fbfc] dark:hover:bg-dark-100 cursor-pointer
                  ${selectedIds.has(owner._id) ? 'bg-[#e7f1f4]/50 dark:bg-biovet-900/20' : ''}
                `}
                onClick={() => onNavigate(owner._id)}
              >
                {/* Checkbox */}
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(owner._id)}
                    onChange={(e) => onSelectOne(owner._id, e.target.checked)}
                    className="w-4 h-4 rounded border-[#cee3e8] text-biovet-500 focus:ring-biovet-500 cursor-pointer"
                  />
                </td>

                {/* Columna: CLIENTE (Nombre + ID + Teléfono) */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-[#0d191c] dark:text-white font-bold text-sm">
                      {owner.name}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {owner.nationalId && (
                        <>
                          <span className="text-[#498c9c] dark:text-slate-400 text-xs font-medium">
                            ID: {owner.nationalId}
                          </span>
                          <span className="text-[#498c9c] text-xs">•</span>
                        </>
                      )}
                      
                      {/* Teléfono con estilo WhatsApp */}
                      <span 
                        className="text-[#498c9c] dark:text-slate-400 text-xs flex items-center gap-1 hover:text-[#25D366] transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWhatsApp(owner.contact);
                        }}
                      >
                        <Phone size={12} className="text-[#25D366]" fill="currentColor" fillOpacity={0.2} />
                        {owner.contact}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Columna: MASCOTAS (Badge azulito) */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#e7f1f4] text-biovet-500 dark:bg-biovet-900 dark:text-biovet-300">
                    {owner.petsCount} {owner.petsCount === 1 ? 'Mascota' : 'Mascotas'}
                  </span>
                </td>

                {/* Columna: ESTADO DE CUENTA (Badges Rojo/Verde) */}
                <td className="px-6 py-4">
                  {owner.totalDebt > 0 ? (
                    <div className="flex flex-col items-start gap-1">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        {formatCurrency(owner.totalDebt)} Deuda
                      </span>
                      {owner.pendingInvoices > 0 && (
                        <span className="text-[10px] text-red-500 font-medium ml-1">
                          ({owner.pendingInvoices} facturas)
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      Al día
                    </span>
                  )}
                </td>

                {/* Columna: ÚLTIMA VISITA */}
                <td className="px-6 py-4 text-sm text-[#498c9c] dark:text-slate-400">
                  {formatLastVisit(owner.lastVisit)}
                </td>

                {/* Columna: ACCIONES */}
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    {/* Botón WhatsApp */}
                    <button
                      onClick={() => onWhatsApp(owner.contact)}
                      className="p-2 rounded-lg bg-green-50 text-[#25D366] hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 transition-colors"
                      title="Contactar por WhatsApp"
                    >
                      <MessageCircle size={18} />
                    </button>

                    {/* Botón Ver Detalle (Navigate) */}
                    <button
                      onClick={() => onNavigate(owner._id)}
                      className="p-2 rounded-lg bg-[#f0f5f6] text-[#498c9c] hover:text-biovet-500 hover:bg-[#e7f1f4] dark:bg-dark-100 dark:text-slate-400 dark:hover:bg-dark-50 transition-colors"
                      title="Ver detalle"
                    >
                      <Eye size={18} />
                    </button>

                    {/* Botón Editar */}
                    <Link
                      to={`/owners/${owner._id}/edit`}
                      className="p-2 rounded-lg bg-[#f0f5f6] text-[#498c9c] hover:text-biovet-500 hover:bg-[#e7f1f4] dark:bg-dark-100 dark:text-slate-400 dark:hover:bg-dark-50 transition-colors inline-flex"
                      title="Editar"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Edit size={18} />
                    </Link>

                    {/* Botón Eliminar */}
                    <button
                      onClick={() => onDelete(owner)}
                      className="p-2 rounded-lg bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}