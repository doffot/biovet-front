// src/components/appointments/AppointmentCard.tsx
import React from 'react';
import { PawPrint } from 'lucide-react';
import type { PopulatedAppointment } from '../../types/appointment';


interface AppointmentCardProps {
  appointment: PopulatedAppointment;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const getPetInfo = () => {
    if (typeof appointment.patient === 'object' && appointment.patient !== null) {
      return {
        name: appointment.patient.name,
        photo: appointment.patient.photo,
      };
    }
    return {
      name: 'Mascota no disponible',
      photo: null,
    };
  };

  const getOwnerInfo = () => {
    if (typeof appointment.patient === 'object' && 
        appointment.patient !== null && 
        typeof appointment.patient.owner === 'object') {
      
      const owner = appointment.patient.owner;
      return {
        name: `${owner.name} ${owner.lastName || ''}`.trim(),
      };
    }
    
    return {
      name: 'Dueño no disponible',
    };
  };

  const petInfo = getPetInfo();
  const ownerInfo = getOwnerInfo();

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
      {/* Foto de la mascota */}
      <div className="shrink-0">
        {petInfo.photo ? (
          <img 
            src={petInfo.photo} 
            alt={petInfo.name}
            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center border border-gray-200">
            <PawPrint className="w-6 h-6 text-green-600" />
          </div>
        )}
      </div>

      {/* Información principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {petInfo.name}
          </p>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            appointment.status === 'Programada' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {appointment.status}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-1">
          {new Date(appointment.date).toLocaleDateString('es-ES', { 
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          })} • {new Date(appointment.date).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
        
        <p className="text-gray-500 text-xs">
          {ownerInfo.name}
        </p>
      </div>

      {/* Tipo de cita */}
      <div className="shrink-0">
        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
          {appointment.type}
        </span>
      </div>
    </div>
  );
};