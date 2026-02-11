// components/LabExamHeader.tsx
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  PawPrint,
  Calendar,
  TestTube,
  Scissors,
  Camera,
} from "lucide-react";
import { toast } from "../Toast";
import type { Patient } from "@/types/patient";

interface LabExamHeaderProps {
  patientId: string;
  patient: Patient | undefined;
  patientLoading: boolean;
  hasActiveAppointments: boolean;
}

export function LabExamHeader({
  patientId,
  patient,
  patientLoading,
  hasActiveAppointments,
}: LabExamHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="fixed top-14 left-0 right-0 lg:top-16 lg:left-64 z-30 bg-surface-50/95 dark:bg-dark-200/95 backdrop-blur-sm border-b border-surface-200 dark:border-dark-100 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-surface-200 dark:hover:bg-dark-100 text-slate-500 dark:text-slate-400 hover:text-biovet-600 dark:hover:text-biovet-400 transition-all duration-200"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-biovet-500 to-biovet-600 rounded-xl shadow-sm">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-800 dark:text-white font-heading">
                  {patientLoading ? "Cargando..." : patient?.name || "Paciente"}
                </h1>
                {hasActiveAppointments && (
                  <span className="px-3 py-1.5 bg-success-50 dark:bg-success-950/30 text-success-600 dark:text-success-400 text-xs font-semibold rounded-full border border-success-200 dark:border-success-800 flex items-center gap-1.5 shadow-sm">
                    <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                    Cita Activa
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/patients/${patientId}/appointments/create`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-500 hover:text-white text-purple-600 dark:text-purple-400 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md border border-purple-200 dark:border-purple-800"
              title="Nueva cita"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Cita</span>
            </Link>

            <Link
              to={`/patients/${patientId}/lab-exams`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-biovet-50 dark:bg-biovet-950/20 hover:bg-biovet-500 hover:text-white text-biovet-600 dark:text-biovet-400 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md border border-biovet-200 dark:border-biovet-800"
              title="Exámenes de laboratorio"
            >
              <TestTube className="w-4 h-4" />
              <span className="hidden sm:inline">Exámenes</span>
            </Link>

            <Link
              to={`/patients/${patientId}/grooming-services/create`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-500 hover:text-white text-blue-600 dark:text-blue-400 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md border border-blue-200 dark:border-blue-800"
              title="Servicio de peluquería"
            >
              <Scissors className="w-4 h-4" />
              <span className="hidden sm:inline">Peluquería</span>
            </Link>

            <button
              onClick={() =>
                toast.info("Función de cambio de foto en desarrollo")
              }
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-100 dark:bg-dark-100 hover:bg-surface-200 dark:hover:bg-dark-50 text-slate-500 dark:text-slate-400 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md border border-surface-200 dark:border-slate-700"
              title="Cambiar foto"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Foto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}