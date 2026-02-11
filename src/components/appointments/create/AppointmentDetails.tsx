import { FileText, MessageSquare } from "lucide-react";

type AppointmentDetailsProps = {
  reason: string;
  observations: string;
  onReasonChange: (value: string) => void;
  onObservationsChange: (value: string) => void;
  errors?: {
    reason?: string;
    observations?: string;
  };
};

export default function AppointmentDetails({
  reason,
  observations,
  onReasonChange,
  onObservationsChange,
  errors,
}: AppointmentDetailsProps) {
  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-dark-100 p-4 shadow-sm space-y-4">
      {/* Motivo */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          <FileText className="w-4 h-4 text-surface-500 dark:text-slate-400" />
          Motivo de la cita *
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Ej: Control postoperatorio, Vacuna antirrábica..."
          className={`input ${errors?.reason ? "input-error" : ""}`}
        />
        {errors?.reason && (
          <p className="error-text">{errors.reason}</p>
        )}
      </div>

      {/* Observaciones */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          <MessageSquare className="w-4 h-4 text-surface-500 dark:text-slate-400" />
          Observaciones
          <span className="text-surface-500 dark:text-slate-400 font-normal">(opcional)</span>
        </label>
        <textarea
          value={observations}
          onChange={(e) => onObservationsChange(e.target.value)}
          placeholder="Notas adicionales..."
          rows={3}
          className={`input resize-none ${errors?.observations ? "input-error" : ""}`}
        />
        {errors?.observations && (
          <p className="error-text">{errors.observations}</p>
        )}
      </div>
    </div>
  );
}