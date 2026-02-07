import { NavLink, useLocation } from "react-router-dom";
import {
  Info,
  Stethoscope,
  Syringe,
  CalendarClock,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import type { Patient } from "@/types/patient";
import { useQuery } from "@tanstack/react-query";
import { getPatientById } from "@/api/patientAPI";
import { PatientMobileMenu } from "@/components/patients/PatientMobileMenu";

export function PatientBottomTabs() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const patientId = location.pathname.split('/')[2];
  
  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const isPatientDetail = location.pathname.startsWith('/patients/') && 
                         !location.pathname.endsWith('/patients');

  // Solo mostrar en pantallas de detalle de paciente
  if (!isPatientDetail || !patient) return null;

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-200 border-t border-surface-200 dark:border-dark-100 shadow-lg">
        <div className="flex justify-around items-center h-16 px-2">
          {/* Info */}
          <NavLink
            to="."
            end
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 flex-1
              ${isActive 
                ? 'text-biovet-600 dark:text-biovet-400' 
                : 'text-slate-500 dark:text-slate-400'
              }
              py-2 transition-all
            `}
          >
            <Info size={24} strokeWidth={2.5} />
            <span className="text-xs font-medium">Info</span>
          </NavLink>
          
          {/* Consultas */}
          <NavLink
            to="consultations"
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 flex-1
              ${isActive 
                ? 'text-biovet-600 dark:text-biovet-400' 
                : 'text-slate-500 dark:text-slate-400'
              }
              py-2 transition-all
            `}
          >
            <Stethoscope size={24} strokeWidth={2.5} />
            <span className="text-xs font-medium">Consultas</span>
          </NavLink>
          
          {/* Vacunas */}
          <NavLink
            to="vaccines"
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 flex-1
              ${isActive 
                ? 'text-biovet-600 dark:text-biovet-400' 
                : 'text-slate-500 dark:text-slate-400'
              }
              py-2 transition-all
            `}
          >
            <Syringe size={24} strokeWidth={2.5} />
            <span className="text-xs font-medium">Vacunas</span>
          </NavLink>
          
          {/* Citas */}
          <NavLink
            to="appointments"
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 flex-1
              ${isActive 
                ? 'text-biovet-600 dark:text-biovet-400' 
                : 'text-slate-500 dark:text-slate-400'
              }
              py-2 transition-all
            `}
          >
            <CalendarClock size={24} strokeWidth={2.5} />
            <span className="text-xs font-medium">Citas</span>
          </NavLink>

          {/* Botón: Más (abre drawer) */}
          <button
            onClick={() => setMenuOpen(true)}
            className={`
              flex flex-col items-center justify-center gap-1 flex-1
              text-slate-500 dark:text-slate-400
              py-2 transition-all
              ${location.pathname.includes('treatments') || 
                location.pathname.includes('services') || 
                location.pathname.includes('prescriptions') || 
                location.pathname.includes('deworming') || 
                location.pathname.includes('exams') || 
                location.pathname.includes('studies') || 
                location.pathname.includes('grooming')
                ? 'text-biovet-600 dark:text-biovet-400'
                : ''
              }
            `}
          >
            <MoreHorizontal size={24} strokeWidth={2.5} />
            <span className="text-xs font-medium">Más</span>
          </button>
        </div>
      </nav>

      {/* Drawer del menú "Más" */}
      <PatientMobileMenu 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)} 
        patient={patient as Patient} 
      />
    </>
  );
}