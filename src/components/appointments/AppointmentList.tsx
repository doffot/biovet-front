// src/components/appointments/AppointmentList.tsx
import React from 'react';
import { Calendar } from 'lucide-react';
import { AppointmentCard } from './AppointmentCard';
import type { Appointment, PopulatedAppointment } from '../../types/appointment';

interface AppointmentListProps {
  appointments: (PopulatedAppointment | Appointment)[];
  title?: string;
  description?: string;
  emptyMessage?: string;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({ 
  appointments, 
  title = "Citas Programadas",
  description = "Próximas citas",
  emptyMessage = "No hay citas para mostrar en este momento"
}) => {
  // Filtrar solo las citas que tienen patient poblado
  const populatedAppointments = appointments.filter(apt => 
    typeof apt.patient === 'object' && apt.patient !== null
  ) as PopulatedAppointment[];

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {title}
          </h2>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
        <div className="text-sm text-gray-500">
          {populatedAppointments.length} citas
        </div>
      </div>

      <div className="space-y-3">
        {populatedAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment._id}
            appointment={appointment}
          />
        ))}
      </div>

      {populatedAppointments.length === 0 && (
        <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-md font-semibold text-gray-900 mb-1">No hay citas programadas</h3>
          <p className="text-gray-500 text-sm">{emptyMessage}</p>
        </div>
      )}
    </section>
  );
};