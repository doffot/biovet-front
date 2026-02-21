// src/views/staff/StaffTable.tsx
import { Users, Pencil, Trash2, Phone, Stethoscope, Scissors, UserCog, Headphones, Shield } from "lucide-react";
import type { Staff, StaffRole } from "@/types/staff";

interface StaffTableProps {
  staff: Staff[];
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
}

const ROLE_CONFIG: Record<StaffRole, { label: string; icon: typeof Stethoscope; color: string }> = {
  veterinario: {
    label: "Veterinario",
    icon: Stethoscope,
    color: "bg-biovet-50 dark:bg-biovet-950 text-biovet-600 dark:text-biovet-400 border-biovet-200 dark:border-biovet-800",
  },
  groomer: {
    label: "Peluquero",
    icon: Scissors,
    color: "bg-warning-50 dark:bg-warning-950 text-warning-600 dark:text-warning-400 border-warning-200 dark:border-warning-800",
  },
  asistente: {
    label: "Asistente",
    icon: UserCog,
    color: "bg-success-50 dark:bg-success-950 text-success-600 dark:text-success-400 border-success-200 dark:border-success-800",
  },
  recepcionista: {
    label: "Recepcionista",
    icon: Headphones,
    color: "bg-surface-100 dark:bg-dark-200 text-surface-600 dark:text-slate-400 border-surface-300 dark:border-slate-700",
  },
};

function RoleBadge({ role }: { role: StaffRole }) {
  const config = ROLE_CONFIG[role];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
        active
          ? "bg-success-50 dark:bg-success-950 text-success-600 dark:text-success-400 border-success-200 dark:border-success-800"
          : "bg-surface-100 dark:bg-dark-200 text-surface-500 dark:text-slate-500 border-surface-300 dark:border-slate-700"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-success-500" : "bg-surface-400"}`} />
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

export function StaffTable({ staff, onEdit, onDelete }: StaffTableProps) {
  if (staff.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm">
        <div className="py-16 text-center">
          <div className="w-14 h-14 mx-auto mb-3 bg-surface-100 dark:bg-dark-200 rounded-full flex items-center justify-center border border-surface-300 dark:border-slate-700">
            <Users className="w-7 h-7 text-surface-400 dark:text-slate-500" />
          </div>
          <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
            No hay personal registrado
          </p>
          <p className="text-surface-500 dark:text-slate-400 text-xs">
            Agrega miembros del equipo para comenzar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm">
          <thead className="bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700">
            <tr>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                Nombre
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                Rol
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                Teléfono
              </th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-200 dark:divide-slate-700/50">
            {staff.map((member) => (
              <tr
                key={member._id}
                className="hover:bg-surface-50 dark:hover:bg-dark-200/50 transition-colors"
              >
                {/* Nombre */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-9 h-9 rounded-full flex items-center justify-center
                      ${member.isOwner 
                        ? 'bg-linear-to-br from-biovet-500 to-biovet-600 shadow-sm' 
                        : 'bg-biovet-100 dark:bg-biovet-900'
                      }
                    `}>
                      {member.isOwner ? (
                        <Shield className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-sm font-bold text-biovet-600 dark:text-biovet-400">
                          {member.name.charAt(0)}
                          {member.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-700 dark:text-slate-200">
                          {member.name} {member.lastName}
                        </p>
                        {member.isOwner && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-biovet-100 dark:bg-biovet-900 text-biovet-600 dark:text-biovet-400 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Rol */}
                <td className="px-4 py-3">
                  <RoleBadge role={member.role} />
                </td>

                {/* Teléfono */}
                <td className="px-4 py-3 hidden sm:table-cell">
                  {member.phone ? (
                    <div className="flex items-center gap-1.5 text-surface-500 dark:text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{member.phone}</span>
                    </div>
                  ) : (
                    <span className="text-surface-400 dark:text-slate-600">—</span>
                  )}
                </td>

                {/* Estado */}
                <td className="px-4 py-3 text-center">
                  <StatusBadge active={member.active} />
                </td>

                {/* Acciones */}
                <td className="px-4 py-3">
                  {member.isOwner ? (
                    <div className="flex items-center justify-end">
                      <span className="text-[10px] text-surface-400 dark:text-slate-500 italic">
                        Protegido
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(member)}
                        className="btn-icon-edit w-8 h-8"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(member)}
                        className="btn-icon-delete w-8 h-8"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}