import { Outlet, NavLink, useParams, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPatientById } from "@/api/patientAPI";
import {
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
  MoreVertical,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { PatientBottomTabs } from "./PatientBottomTabs";
import { PatientMobileMenu } from "@/components/patients/PatientMobileMenu";

export default function PatientLayout() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: patient, isLoading, isError } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
    retry: 1,
  });

  // Helper para Desktop tabs
  const getTabClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-1 px-2 py-3 text-[12px] font-medium text-biovet-add
    transition-colors
    ${isActive 
      ? 'bg-biovet-add/10  dark:text-biovet-400' 
      : 'border-transparent text-biovet-add hover:bg-biovet-add/20  dark:text-slate-400'
    }
  `;

  // Helper para título mobile
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    const titles: Record<string, string> = {
      '': 'Información',
      'consultations': 'Consultas',
      'treatments': 'Tratamientos',
      'services': 'Servicios',
      'prescriptions': 'Recetas',
      'vaccines': 'Vacunas',
      'deworming': 'Desparasitación',
      'exams': 'Exámenes',
      'studies': 'Estudios',
      'grooming': 'Estética',
      'appointments': 'Citas',
    };
    return titles[path || ''] || 'Paciente';
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center">Cargando...</div>;
  if (isError || !patient) return <Navigate to="/owners" replace />;

  const navItems = [
    { to: ".", label: "Resumen", icon: Info, end: true },
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
    <div className="flex flex-col h-full bg-surface-100 dark:bg-dark-300">
      
      {/* ========================================
         DESKTOP: Header fijo + tabs + scroll interno
         ======================================== */}
      <div className="hidden lg:flex flex-col h-full">
        
        {/* Header Fijo - Desktop */}
        <div className="sticky top-0 z-30 bg-surface-100/95 dark:bg-dark-300/95 backdrop-blur-md border-b pb-2 border-surface-300 dark:border-dark-100  px-6 pt-6 -mx-6 -mt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 -ml-2 rounded-full hover:bg-surface-200 dark:hover:bg-dark-100 text-slate-500 dark:text-slate-400 transition-colors"
                aria-label="Volver atrás"
              >
                <ArrowLeft size={24} />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 shadow-md">
                  {patient.photo ? (
                    <img src={patient.photo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 font-bold text-slate-400 text-2xl">{patient.name[0]}</div>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-white">{patient.name}</h1>
                  <div className="flex gap-3 text-sm text-slate-500 mt-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{patient.breed}</span> 
                    <span>•</span> 
                    <span className="capitalize">{patient.sex}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary">Editar</button>
              <button className="btn-icon-neutral"><MoreVertical /></button>
            </div>
          </div>
          
          {/* Tabs - Desktop */}
          <nav className="flex  justify-center ">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end} className={getTabClass}>
                <item.icon size={18} /> {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Contenido con Scroll Interno - Desktop */}
        <div className="flex-1 lg:mt-4 overflow-hidden px-6 py-4">
          <div className="h-full custom-scrollbar">
            <Outlet context={patient} />
          </div>
        </div>
      </div>

      {/* ========================================
         MOBILE/TABLET: Header minimalista + bottom tabs
         ======================================== */}
      <div className="lg:hidden flex flex-col min-h-screen">
        
        {/* Header Minimalista - Mobile (SIN botón ☰) */}
        <div className="sticky top-0 z-40 bg-white dark:bg-dark-200 border-b border-surface-200 dark:border-dark-100 shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {/* ✅ SOLO flecha atrás */}
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-dark-100 rounded-lg transition-colors"
                aria-label="Volver atrás"
              >
                <ArrowLeft size={24} className="text-slate-700 dark:text-slate-300" />
                
              </button>
              
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-dark-100 overflow-hidden shrink-0">
                  {patient.photo ? (
                    <img src={patient.photo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
                      {patient.name[0]}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">{patient.name}</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {patient.breed} • {patient.sex} 
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Título de la sección actual */}
          <div className="px-4 py-2 bg-surface-50 dark:bg-dark-300">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {getPageTitle()}
            </h2>
          </div>
        </div>

        {/* Drawer del Menú del Paciente */}
        <PatientMobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          patient={patient}
        />

        {/* Contenido FULL WIDTH */}
        <div className="flex-1 overflow-y-auto px-0 pb-24">
          <Outlet context={patient} />
        </div>

        {/* Bottom Tabs del Paciente */}
        <PatientBottomTabs />
      </div>
    </div>
  );
}