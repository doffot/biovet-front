// src/components/appointment/UpdateStatusModal.tsx

import { useState } from "react";
import { X } from "lucide-react";
import type { AppointmentStatus } from "../../types/appointment";

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (status: AppointmentStatus) => void;
  currentStatus: AppointmentStatus;
  isUpdating: boolean;
}

export default function UpdateStatusModal({
  isOpen,
  onClose,
  onSubmit,
  currentStatus,
  isUpdating
}: UpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>(currentStatus);

  const statusOptions: { value: AppointmentStatus; label: string; color: string }[] = [
    { value: "Programada", label: "Programada", color: "bg-blue-500 text-white" },
    { value: "Completada", label: "Completada", color: "bg-green-500 text-white" },
    { value: "Cancelada", label: "Cancelada", color: "bg-red-500 text-white" },
    { value: "No asistió", label: "No asistió", color: "bg-yellow-600 text-white" },
  ];

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selectedStatus !== currentStatus) {
      onSubmit(selectedStatus);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 border border-gray-200 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Actualizar Estado</h3>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Selecciona el nuevo estado para esta cita:
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                disabled={isUpdating}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedStatus === option.value
                    ? `${option.color} border-transparent shadow-md`
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="font-medium text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating || selectedStatus === currentStatus}
            className="flex-1 px-4 py-2 bg-vet-primary hover:bg-vet-accent text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Actualizando...
              </>
            ) : (
              "Actualizar Estado"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}