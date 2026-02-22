import { Outlet, NavLink, useParams, Navigate, useNavigate, useLocation, Link } from "react-router-dom";
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
  User,
  Weight,
  Fingerprint,
  Palette,
  CalendarDays,
  ClipboardList,
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

  const getTabClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-1 px-2 py-3 text-[12px] font-medium text-biovet-add
    transition-colors border-b-2
    ${isActive 
      ? 'bg-biovet-add/5 border-biovet-add dark:text-biovet-400' 
      : 'border-transparent text-biovet-add hover:bg-biovet-add/10 dark:text-slate-400'
    }
  `;

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
      'order': 'Órdenes Médicas',
    };
    return titles[path || ''] || 'Paciente';
  };

  const calculateAge = (birthDateString: string) => {
  if (!birthDateString) return "Edad desconocida";
  
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return "Edad inválida";

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  
  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years--;
    months += 12;
  }

  // Ajuste de días para meses
  if (today.getDate() < birthDate.getDate()) {
    months--;
  }
  
  // Si tiene menos de 1 año, mostrar meses
  if (years === 0) {
    return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  }

  return `${years} ${years === 1 ? 'año' : 'años'}`;
};

  if (isLoading) return <div className="h-screen flex items-center justify-center">Cargando...</div>;
  if (isError || !patient) return <Navigate to="/owners" replace />;

  const ownerId = typeof patient.owner === 'object' ? patient.owner._id : patient.owner;
  const ownerName = typeof patient.owner === 'object' ? patient.owner.name : "Sin dueño";

  const navItems = [
  { to: ".", label: "Resumen", icon: Info, end: true },
  { to: "consultations", label: "Consultas", icon: Stethoscope },
  { to: "treatments", label: "Tratamientos", icon: Bandage },
  { to: "services", label: "Servicios", icon: BriefcaseMedical },
  { to: "prescriptions", label: "Recetas", icon: FileText },
  { to: "medical-orders", label: "Órdenes", icon: ClipboardList },
  { to: "vaccines", label: "Vacunas", icon: Syringe },
  { to: "deworming", label: "Antiparasit.", icon: ShieldCheck },
  { to: "exams", label: "Exámenes", icon: Microscope },
  { to: "studies", label: "Estudios", icon: ScanLine },
  { to: "grooming", label: "Estética", icon: Scissors },
  { to: "appointments", label: "Citas", icon: CalendarClock },
];

  return (
    <div className="flex flex-col h-full bg-surface-100 dark:bg-dark-300">
      
         {/* DESKTOP: Header  */}
      <div className="hidden lg:flex flex-col h-full">
        
        {/* Header Fijo */}
        <div className="sticky top-0 z-30 bg-surface-100/95 dark:bg-dark-300/95 backdrop-blur-md border-b border-surface-300 dark:border-dark-100 px-6 pt-6 -mx-6 -mt-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex gap-5">
              <button 
                onClick={() => navigate(-1)} 
                className="self-start p-2 -ml-2 rounded-full hover:bg-surface-200 dark:hover:bg-dark-100 text-slate-500 dark:text-slate-400 transition-colors"
                aria-label="Volver atrás"
              >
                <ArrowLeft size={24} />
              </button>
              
              <div className="flex gap-5">
                {/* Foto */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-200 shadow-md shrink-0 border border-slate-200 dark:border-slate-700">
                  {patient.photo ? (
                    <img src={patient.photo} className="w-full h-full object-cover" alt={patient.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 font-bold text-slate-400 text-3xl">{patient.name[0]}</div>
                  )}
                </div>
                
                {/* Info Principal + Detalles */}
                <div>
                  <div className="flex items-baseline gap-3">
                    <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-white">{patient.name}</h1>
                    <span className="px-2 py-0.5 rounded-full bg-biovet-50 dark:bg-biovet-900/30 text-biovet-600 dark:text-biovet-400 text-xs font-bold uppercase tracking-wide border border-biovet-200 dark:border-biovet-800">
                      {patient.species}
                    </span>
                  </div>
                  
                  <div className="flex gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{patient.breed}</span> 
                    <span>•</span> 
                    <span className="capitalize">{patient.sex}</span>
                    <span>•</span>
                    <span>{calculateAge(patient.birthDate)}</span>
                  </div>

                  {/* Grid de Datos Extra */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Weight size={14} className="text-slate-400" />
                      <span className="font-medium">Peso:</span> {patient.weight} kg
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <span className="font-medium">Dueño:</span>
                      <Link 
                        to={`/owners/${ownerId}`} 
                        className="text-biovet-600 hover:text-biovet-700 hover:underline font-semibold"
                      >
                        {ownerName}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2">
                      <Fingerprint size={14} className="text-slate-400" />
                      <span className="font-medium">ID:</span> {patient.identification || "N/A"}
                    </div>

                    <div className="flex items-center gap-2">
                      <Palette size={14} className="text-slate-400" />
                      <span className="font-medium">Color:</span> {patient.color || "N/A"}
                    </div>
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
          <nav className="flex justify-start gap-1  pb-0">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end} className={getTabClass}>
                <item.icon size={16} /> {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Contenido */}
        <div className="flex-1 lg:mt-4 overflow-hidden px-6 py-4">
          <div className="h-full custom-scrollbar">
            <Outlet context={patient} />
          </div>
        </div>
      </div>

      {/* ========================================
         MOBILE: Header con datos extra
         ======================================== */}
      <div className="lg:hidden flex flex-col min-h-screen">
        
        <div className="sticky top-0 z-40 bg-white dark:bg-dark-200 border-b border-surface-200 dark:border-dark-100 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-start gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 mt-1 hover:bg-slate-100 dark:hover:bg-dark-100 rounded-lg transition-colors shrink-0"
              >
                <ArrowLeft size={24} className="text-slate-700 dark:text-slate-300" />
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-dark-100 overflow-hidden shrink-0 border border-slate-100 dark:border-dark-50">
                    {patient.photo ? (
                      <img src={patient.photo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-600">
                        {patient.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate leading-tight">
                      {patient.name}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {patient.breed} • {patient.sex}
                    </p>
                  </div>
                </div>

                {/* Datos extra móvil */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 ml-1">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={12} className="text-slate-400" />
                    <span>{new Date(patient.birthDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={12} className="text-slate-400" />
                    <Link 
                      to={`/owners/${ownerId}`} 
                      className="text-biovet-600 font-medium truncate max-w-30"
                    >
                      {ownerName}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-2 bg-surface-50 dark:bg-dark-300 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {getPageTitle()}
            </h2>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 text-slate-400 hover:text-biovet-600"
            >
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        <PatientMobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          patient={patient}
        />

        <div className="flex-1 overflow-y-auto px-0 pb-24">
          <Outlet context={patient} />
        </div>

        <PatientBottomTabs />
      </div>
    </div>
  );
}