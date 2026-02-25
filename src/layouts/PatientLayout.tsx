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
  Edit3,
  Camera,
} from "lucide-react";
import { useState } from "react";
import { PatientBottomTabs } from "./PatientBottomTabs";
import { PatientMobileMenu } from "@/components/patients/PatientMobileMenu";
import PhotoModal from "@/components/patients/PhotoModal";
import { EditPatientModal } from "@/components/patients/EditPatientModal";

export default function PatientLayout() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- LÓGICA DE MODALES POR URL (Sincroniza PC y Móvil) ---
  const queryParams = new URLSearchParams(location.search);
  const isEditModalOpen = queryParams.get("editPatient") === "true";
  const isPhotoModalOpen = queryParams.get("updatePhoto") === "true";

  // Funciones para abrir/cerrar limpiando la URL
  const openEditModal = () => navigate("?editPatient=true", { replace: true });
  const openPhotoModal = () => navigate("?updatePhoto=true", { replace: true });
  const handleCloseModal = () => navigate(location.pathname, { replace: true });

  const { data: patient, isLoading, isError } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
    retry: 1,
  });

  if (isLoading) return <div className="h-screen flex items-center justify-center text-slate-500 font-bold animate-pulse">Cargando paciente...</div>;
  if (isError || !patient) return <Navigate to="/owners" replace />;

  const ownerId = typeof patient.owner === 'object' ? patient.owner._id : patient.owner;
  const ownerName = typeof patient.owner === 'object' ? patient.owner.name : "Sin dueño";

  const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return "Edad desconocida";
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }
    return years === 0 ? `${months} meses` : `${years} años`;
  };

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
      
      {/* DESKTOP Header */}
      <div className="hidden lg:flex flex-col h-full">
        <div className="sticky top-0 z-30 bg-surface-100/95 dark:bg-dark-300/95 backdrop-blur-md border-b border-surface-300 dark:border-dark-100 px-6 pt-6 ">
          <div className="flex items-start justify-between mb-6">
            <div className="flex gap-5">
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-200 dark:hover:bg-dark-100 text-slate-500">
                <ArrowLeft size={24} />
              </button>
              
              <div className="flex gap-5">
                <div 
                  onClick={openPhotoModal} // Uso de URL
                  className="group relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-200 shadow-md cursor-pointer"
                >
                  {patient.photo ? (
                    <img src={patient.photo} className="w-full h-full object-cover" alt={patient.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-3xl">{patient.name[0]}</div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={20} className="text-white" />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{patient.name}</h1>
                    <button onClick={openEditModal} className="p-1.5 rounded-lg text-slate-400 hover:text-biovet-500 hover:bg-biovet-500/10">
                      <Edit3 size={18} />
                    </button>
                  </div>
                  <div className="flex gap-3 text-sm text-slate-500 mt-1 mb-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{patient.breed}</span> 
                    <span>•</span> 
                    <span>{calculateAge(patient.birthDate)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                    <div className="flex items-center gap-2"><Weight size={14} /> {patient.weight} kg</div>
                    <div className="flex items-center gap-2"><User size={14} /> <Link to={`/owners/${ownerId}`} className="text-biovet-600 font-semibold">{ownerName}</Link></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <nav className="flex gap-1">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `
                flex items-center gap-1 px-3 py-3 text-[12px] font-medium border-b-2 transition-all
                ${isActive ? 'border-biovet-add text-biovet-add bg-biovet-add/5' : 'border-transparent text-slate-500 hover:bg-slate-50'}
              `}>
                <item.icon size={16} /> {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-hidden px-6 py-4">
          <Outlet context={patient} />
        </div>
      </div>

      {/* MOBILE Layout */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <div className="sticky top-0 z-40 bg-white dark:bg-dark-200 border-b border-surface-200">
          <div className="px-4 py-3 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate">{patient.name}</h1>
              <p className="text-xs text-slate-500">{patient.breed} • {patient.sex}</p>
            </div>
            <button onClick={() => setMobileMenuOpen(true)} className="p-1 text-slate-400"><MoreVertical size={20} /></button>
          </div>
        </div>

        <div className="flex-1 pb-24">
          <Outlet context={patient} />
        </div>

        <PatientBottomTabs />

        {/* MENÚ MÓVIL  */}
        <PatientMobileMenu 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
          patient={patient} 
          onEditClick={openEditModal} 
          onPhotoClick={openPhotoModal} 
        />
      </div>

      <EditPatientModal 
        isOpen={isEditModalOpen} 
        onClose={handleCloseModal} 
        patient={patient} 
      />
      
      <PhotoModal 
        isOpen={isPhotoModalOpen} 
        onClose={handleCloseModal} 
        patient={patient} 
      />

    </div>
  );
}