import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Eye,
  Phone,
  PawPrint,
  AlertCircle,
  CheckCircle,
 
} from "lucide-react";
import type { OwnerWithStats, SortField, SortDirection } from "@/types/owner";

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
}: OwnerTableProps) {
  
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-30 text-[#498c9c]" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-biovet-500" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-biovet-500" />
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  
  const gridLayout = "grid grid-cols-[60px_1fr_120px_180px_150px_120px]";

  return (
    <div className="flex flex-col  overflow-hidden bg-white dark:bg-dark-200 ">
      
      
      <div className={`${gridLayout} bg-biovet-50 dark:bg-dark-300 border-b border-[#cee3e8] dark:border-dark-100 pr-4`}>
        <div className="px-6 py-4 flex items-center justify-center">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="w-4 h-4 rounded border-[#cee3e8] text-biovet-500 cursor-pointer"
          />
        </div>
        <div className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#498c9c] cursor-pointer flex items-center gap-2" onClick={() => onSort("name")}>
          Cliente <SortIcon field="name" />
        </div>
        <div className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#498c9c] text-center">Mascotas</div>
        <div className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#498c9c] text-center">Estado</div>
        <div className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#498c9c]">Visita</div>
        <div className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#498c9c] text-right">Acciones</div>
      </div>

      {/* 2. CUERPO CON SCROLL FORZADO: Altura fija para asegurar que el scroll aparezca */}
      <div className="overflow-y-scroll custom-scrollbar h-125 xl:h-[calc(100vh-380px)]">
        <div className="flex flex-col divide-y divide-[#e7f1f4] dark:divide-dark-100">
          {owners.map((owner) => (
            <div
              key={owner._id}
              className={`${gridLayout} items-center transition-colors hover:bg-[#f8fbfc] dark:hover:bg-dark-100 cursor-pointer ${
                selectedIds.has(owner._id) ? "bg-[#e7f1f4]/50 dark:bg-biovet-900/20" : ""
              }`}
              onClick={() => onNavigate(owner._id)}
            >
              <div className="px-6 py-4 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(owner._id)}
                  onChange={(e) => onSelectOne(owner._id, e.target.checked)}
                  className="w-4 h-4 rounded border-[#cee3e8] text-biovet-500"
                />
              </div>
              
              <div className="px-6 py-4 flex flex-col min-w-0">
                <span className="text-[#0d191c] dark:text-white font-bold text-sm truncate">{owner.name}</span>
                <span className="text-[#498c9c] text-xs flex items-center gap-1 mt-0.5">
                  <Phone size={10} className="text-[#25D366]" fill="currentColor" fillOpacity={0.2} />
                  {owner.contact}
                </span>
              </div>

              <div className="px-6 py-4 text-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded bg-biovet-500 text-white text-[11px] font-bold shadow-sm">
                  <PawPrint size={12} className="mr-1" /> {owner.petsCount}
                </span>
              </div>

              <div className="px-6 py-4 text-center">
                {owner.totalDebt > 0 ? (
                  <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200 uppercase">
                    Debe {formatCurrency(owner.totalDebt)} <AlertCircle size={12} className="ml-1" />
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-green-100 text-green-600 border border-green-200 uppercase">
                    Al día <CheckCircle size={12} className="ml-1" />
                  </span>
                )}
              </div>

              <div className="px-6 py-4 text-xs text-[#498c9c] font-medium italic">
                {owner.lastVisit ? new Date(owner.lastVisit).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric'}) : '—'}
              </div>

              <div className="px-6 py-4 text-right flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => onWhatsApp(owner.contact)} className="p-2 text-[#25D366] hover:bg-green-50 rounded-full transition-all active:scale-95">
                  <MessageCircle size={18} />
                </button>
                <button onClick={() => onNavigate(owner._id)} className="p-2 text-biovet-500 hover:bg-biovet-50 rounded-full transition-all active:scale-95">
                  <Eye size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}