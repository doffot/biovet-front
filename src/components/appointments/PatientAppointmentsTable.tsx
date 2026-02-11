// src/components/appointment/PatientAppointmentsTable.tsx

import { Eye, Pencil, Trash2 } from "lucide-react";
import type { Appointment } from "../../types/appointment";

interface PatientAppointmentsTableProps {
  appointments: Appointment[];
  loading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (appointment: Appointment) => void;
  onView: (id: string) => void;
}

export default function PatientAppointmentsTable({
  appointments,
  loading = false,
  onEdit,
  onDelete,
  onView,
}: PatientAppointmentsTableProps) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <h2 className="text-white font-bold text-lg mb-4">Citas programadas</h2>
        <p className="text-gray-400 text-center py-4">Cargando citas...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
      <h2 className="text-white font-bold text-lg mb-4">Citas programadas</h2>

      {appointments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No hay citas registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-left text-gray-400">
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Tipo</th>
                <th className="pb-2">Estado</th>
                <th className="pb-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => {
                const date = new Date(apt.date);
                const options: Intl.DateTimeFormatOptions = {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                };
                const formattedDate = date.toLocaleDateString("es-ES", options);

                return (
                  <tr key={apt._id} className="border-b border-gray-700/50 last:border-0 py-3">
                    <td className="py-3 text-white">{formattedDate}</td>
                    <td className="py-3 text-white">{apt.type}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          apt.status === "Programada"
                            ? "bg-blue-500/20 text-blue-300"
                            : apt.status === "Completada"
                            ? "bg-green-500/20 text-green-300"
                            : apt.status === "Cancelada"
                            ? "bg-vet-danger/20 text-vet-danger"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => onView(apt._id)}
                        className="text-gray-400 hover:text-blue-400"
                        title="Ver"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(apt._id)}
                        className="text-gray-400 hover:text-yellow-400"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(apt)}
                        className="text-gray-400 hover:text-vet-danger"
                        title="Borrar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}