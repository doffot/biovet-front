import { NavLink } from "react-router-dom";
import {
  X,
  Info,
  Stethoscope,
  Bandage,
  BriefcaseMedical,
  FileText,
  Syringe,
  ShieldCheck,
  Microscope,
  ScanLine,
  Scissors,
  CalendarClock,
  PawPrint,
} from "lucide-react";
import type { Patient } from "@/types/patient";

interface PatientMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export function PatientMobileMenu({
  isOpen,
  onClose,
  patient,
}: PatientMobileMenuProps) {
  // Lista exacta solicitada
  const menuItems = [
    { to: ".", label: "Info", icon: Info, end: true },
    { to: "consultations", label: "Consultas", icon: Stethoscope },
    { to: "treatments", label: "Tratamientos", icon: Bandage },
    { to: "services", label: "Servicios", icon: BriefcaseMedical },
    { to: "prescriptions", label: "Recetas", icon: FileText },
    { to: "vaccines", label: "Vacunas", icon: Syringe },
    { to: "deworming", label: "Antiparasit.", icon: ShieldCheck },
    { to: "exams", label: "Exámenes", icon: Microscope },
    { to: "studies", label: "Estudios", icon: ScanLine },
    { to: "grooming", label: "Estética", icon: Scissors },
    { to: "appointments", label: "Citas", icon: CalendarClock },
  ];

  return (
    <>
      {/* 1. OVERLAY (FONDO OSCURO) - Z-Index alto para tapar todo */}
      <div
        className={`
          fixed inset-0 z-60 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />

      {/* 2. DRAWER (EL MENÚ LATERAL) */}
      <div
        className={`
          fixed inset-y-0 left-0 z-70 w-[80%] max-w-75 
          bg-white dark:bg-dark-200 shadow-2xl 
          transform transition-transform duration-300 ease-out 
          lg:hidden flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* CABECERA ESTILO MATERIAL DESIGN (Azul con datos) */}
        <div className="relative h-44 bg-biovet-600 p-6 flex flex-col justify-end text-white overflow-hidden shrink-0">
          {/* Decoración de fondo */}
          <PawPrint className="absolute -top-4 -right-4 w-32 h-32 text-white/10 rotate-12" />

          {/* Botón cerrar sutil */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Avatar con borde blanco */}
          <div className="w-16 h-16 rounded-full border-2 border-white bg-white/20 backdrop-blur-sm overflow-hidden mb-3 shadow-md z-10">
            {patient.photo ? (
              <img
                src={patient.photo}
                alt={patient.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-2xl">
                {patient.name[0]} 
              </div>
            )}
          </div>

          {/* Textos */}
          <div className="z-10">
            <h2 className="text-xl font-bold leading-tight">{patient.name}</h2>
            <p className="text-biovet-100 text-xs font-medium opacity-90">
              {patient.breed || "Mestizo"} • {patient.sex}
            </p>
          </div>
        </div>

        {/* LISTA DE OPCIONES SCROLLABLE */}
        <div className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) => `
                 flex items-center gap-4 px-6 py-3.5 text-sm font-medium transition-all
                 ${
                   isActive
                     ? "text-biovet-600 bg-biovet-50 dark:bg-biovet-900/20 dark:text-biovet-400 border-r-4 border-biovet-500"
                     : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-100"
                 }
               `}
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  <item.icon
                    size={22}
                    className={
                      isActive
                        ? "text-biovet-600 dark:text-biovet-400"
                        : "text-slate-400"
                    }
                  />
                  <span className="tracking-wide">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* FOOTER PEQUEÑO */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-surface-50 dark:bg-dark-300">
          <p className="text-[10px] text-slate-400 text-center font-mono">
            ID: {patient._id.slice(-8).toUpperCase()}
          </p>
        </div>
      </div>
    </>
  );
}
