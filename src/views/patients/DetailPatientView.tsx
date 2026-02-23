// src/views/patients/DetailPatientView.tsx
import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Syringe,
  CheckCircle2,
  AlertCircle,
  Activity,
  ClipboardList,
  Menu,
  ArrowLeft,
  PawPrint,
  ShieldCheck,
  Edit3,
  Camera,
  X
} from "lucide-react";
import type { Patient } from "@/types/patient";
import { getVaccinationsByPatient } from "@/api/vaccinationAPI";
import { getDewormingsByPatient } from "@/api/dewormingAPI";
import { usePatientHealth } from "@/hooks/usePatientHealth";
import { useDewormingHealth } from "@/hooks/useDewormingHealth";
import { PatientMedicalLog } from "@/components/patients/PatientHistory";

interface PatientEditMenuProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onEditClick: () => void;
  onPhotoClick: () => void;
}

function PatientEditMenu({ isOpen, onClose, patient, onEditClick, onPhotoClick }: PatientEditMenuProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-999 bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 left-0 z-1000 w-[80%] max-w-75 bg-white dark:bg-dark-200 shadow-2xl transform transition-transform duration-300 ease-out lg:hidden flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-48 bg-slate-900 p-6 flex flex-col justify-end text-white overflow-hidden shrink-0">
          <PawPrint className="absolute -top-4 -right-4 w-32 h-32 text-white/5 rotate-12" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20">
            <X size={20} />
          </button>
          <div className="w-20 h-20 rounded-2xl border-2 border-white/20 overflow-hidden mb-4 z-10">
            {patient.photo ? (
              <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-800 font-bold text-3xl">{patient.name[0]}</div>
            )}
          </div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-biovet-400 mb-1">Gestión de Ficha</p>
            <h2 className="text-2xl font-black leading-tight">{patient.name}</h2>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-3">
          <button
            onClick={() => { onEditClick(); onClose(); }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-biovet-50 dark:bg-biovet-500/10 text-biovet-600 dark:text-biovet-400 border border-biovet-100 dark:border-biovet-500/20 active:scale-95 transition-all"
          >
            <Edit3 size={20} />
            <div className="text-left">
              <span className="block text-sm font-bold uppercase">Editar Información</span>
              <span className="block text-[10px] opacity-70">Nombre, raza, peso y más</span>
            </div>
          </button>
          <button
            onClick={() => { onPhotoClick(); onClose(); }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-white/10 active:scale-95 transition-all"
          >
            <Camera size={20} />
            <div className="text-left">
              <span className="block text-sm font-bold uppercase">Cambiar Foto</span>
              <span className="block text-[10px] opacity-70">Actualizar imagen de perfil</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}

// --- VISTA PRINCIPAL ---
export default function DetailPatientView() {
  const patient = useOutletContext<Patient>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"health" | "history">("health");
  
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);

  const { data: vaccinations = [] } = useQuery({
    queryKey: ["vaccinations", patient._id],
    queryFn: () => getVaccinationsByPatient(patient._id!),
    enabled: !!patient._id,
  });

  const { data: dewormings = [] } = useQuery({
    queryKey: ["dewormings", patient._id],
    queryFn: () => getDewormingsByPatient(patient._id!),
    enabled: !!patient._id,
  });

  const vaxHealth = usePatientHealth(vaccinations, patient.species);
  const dwHealth = useDewormingHealth(dewormings);

  const calculateAge = () => {
    if (!patient?.birthDate) return "—";
    const birth = new Date(patient.birthDate);
    const today = new Date();
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    if (months < 1) return "< 1 mes";
    if (months < 12) return `${months} m`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths === 0 ? `${years} años` : `${years}a ${remainingMonths}m`;
  };

  const getOwnerName = () => typeof patient.owner === "object" ? patient.owner.name : "Sin dueño";

  return (
    <>
      {/* ================= VISTA MÓVIL ================= */}
      <div className="lg:hidden fixed inset-0 z-50 bg-slate-50 dark:bg-dark-300 flex flex-col overflow-hidden font-sans">
        <div className="relative h-[35vh] w-full shrink-0 bg-slate-900">
          {patient.photo ? (
            <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover object-top" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-50">
              <PawPrint size={80} className="text-white" />
            </div>
          )}
          
          <div onClick={() => setIsEditMenuOpen(true)} className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/40 flex items-center justify-center" />

          <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-30">
            <button onClick={() => navigate("/owners")} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-transform"><ArrowLeft size={22} /></button>
            <button onClick={() => setIsEditMenuOpen(true)} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-transform"><Menu size={22} /></button>
          </div>
        </div>

        <div className="relative -mt-12 flex-1 bg-white dark:bg-dark-200 rounded-t-4xl px-5 pt-6 shadow-xl flex flex-col overflow-hidden z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{patient.name}</h1>
                <button 
                  onClick={() => setIsEditMenuOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-biovet-50 dark:bg-biovet-500/10 border border-biovet-200 dark:border-biovet-500/30 rounded-full text-biovet-600 dark:text-biovet-400 active:scale-95 transition-all"
                >
                  <Edit3 size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Editar ficha</span>
                </button>
              </div>
              <span className="text-sm font-semibold text-biovet-500">{patient.breed || "Mestizo"}</span>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase ${dwHealth.colorClass}`}>{dwHealth.status}</span>
              <span className="text-xs font-bold text-slate-400 capitalize">{patient.sex}</span>
            </div>
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-dark-100 rounded-xl mb-4 shrink-0">
            <button onClick={() => setActiveTab("health")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "health" ? "bg-white dark:bg-dark-200 text-biovet-600 shadow-sm" : "text-slate-400"}`}><Activity size={16} /> Salud</button>
            <button onClick={() => setActiveTab("history")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "history" ? "bg-white dark:bg-dark-200 text-biovet-600 shadow-sm" : "text-slate-400"}`}><ClipboardList size={16} /> Historial</button>
          </div>

          <div className="flex-1 overflow-y-auto pb-20">
            {activeTab === "health" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-dashed border-slate-100 dark:border-slate-800 mb-2">
                  <div className="text-center"><p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Edad</p><p className="font-bold text-slate-700 dark:text-slate-200">{calculateAge()}</p></div>
                  <div className="text-center border-l border-slate-100 dark:border-slate-800"><p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Peso</p><p className="font-bold text-slate-700 dark:text-slate-200">{patient.weight}kg</p></div>
                  <div className="text-center border-l border-slate-100 dark:border-slate-800"><p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Dueño</p><p className="font-bold text-slate-700 dark:text-slate-200 truncate px-1">{getOwnerName().split(" ")[0]}</p></div>
                </div>
                <HealthCard title="Control Interno" icon={<ShieldCheck size={18} className="text-biovet-500" />} status={dwHealth.status} colorClass={dwHealth.colorClass}>
                  <HealthRow name="Parásitos Internos" isMissing={dwHealth.status === "Sin registros"} alert={dwHealth.alert} nextDate={dwHealth.nextDate} product={dwHealth.productName} showDetails />
                </HealthCard>
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Plan Vacunación</h3>
                  {[...vaxHealth.applied, ...vaxHealth.missing].map((name) => (
                    <HealthRow key={name} name={name} isMissing={vaxHealth.missing.includes(name)} alert={vaxHealth.alerts.find(a => a.name === name)} />
                  ))}
                </div>
              </div>
            ) : (
              <PatientMedicalLog patientId={patient._id!} />
            )}
          </div>
        </div>
        
        {/* PANEL DE ACCIONES EXCLUSIVO */}
        <PatientEditMenu 
          isOpen={isEditMenuOpen} 
          onClose={() => setIsEditMenuOpen(false)} 
          patient={patient}
          onEditClick={() => navigate("?editPatient=true")}
          onPhotoClick={() => navigate("?updatePhoto=true")}
        />
      </div>

      {/* ================= VISTA DESKTOP ================= */}
      <div className="hidden lg:flex lg:flex-col lg:h-full">
        <div className="flex gap-6 h-full overflow-hidden">
          <div className="w-2/5 shrink-0 flex flex-col min-h-0">
            <PatientMedicalLog patientId={patient._id!} />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0">
            <div className="space-y-4 pb-4">
              <HealthCardCompact title="Desparasitación" icon={<ShieldCheck size={16} className="text-biovet-500" />} status={dwHealth.status} colorClass={dwHealth.colorClass}>
                <HealthRowCompact name="Parásitos Internos" isMissing={dwHealth.status === "Sin registros"} alert={dwHealth.alert} nextDate={dwHealth.nextDate} product={dwHealth.productName} />
              </HealthCardCompact>
              <HealthCardCompact title="Plan de Vacunación" icon={<Syringe size={16} className="text-biovet-500" />} status={vaxHealth.status} colorClass={vaxHealth.colorClass}>
                {[...vaxHealth.applied, ...vaxHealth.missing].map((name) => (
                  <HealthRowCompact key={name} name={name} isMissing={vaxHealth.missing.includes(name)} alert={vaxHealth.alerts.find(a => a.name === name)} />
                ))}
              </HealthCardCompact>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// --- SUB-COMPONENTES DE UI ---
function HealthCardCompact({ title, icon, status, colorClass, children }: any) {
  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl p-4 shadow-sm border border-surface-200 dark:border-dark-100">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">{icon} {title}</h3>
        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${colorClass}`}>{status}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function HealthRowCompact({ name, isMissing, alert, nextDate, product }: any) {
  const isExpired = alert?.isExpired;
  const statusColor = isMissing || isExpired ? "text-danger-500" : alert ? "text-warning-500" : "text-success-500";
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-surface-50 dark:bg-dark-100 rounded-lg border border-surface-100 dark:border-dark-50">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0">
          {isMissing || isExpired ? <AlertCircle size={15} className="text-danger-500" /> : alert ? <AlertCircle size={15} className="text-warning-500" /> : <CheckCircle2 size={15} className="text-success-500" />}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`text-xs font-bold truncate ${isMissing ? "text-danger-600" : "text-slate-700 dark:text-slate-300"}`}>{name}</span>
          <div className="flex items-center gap-2 flex-wrap">
            {product && <span className="text-[9px] font-bold text-biovet-600 dark:text-biovet-400">{product}</span>}
            {nextDate && <span className={`text-[9px] font-semibold ${isExpired ? "text-danger-500" : "text-slate-400"}`}>Sig: {new Date(nextDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>}
          </div>
        </div>
      </div>
      <span className={`shrink-0 text-[9px] font-black uppercase ml-2 ${statusColor}`}>{isMissing ? "Falta" : isExpired ? "Vencida" : "OK"}</span>
    </div>
  );
}

function HealthCard({ title, icon, status, colorClass, children }: any) {
  return (
    <div className="bg-white dark:bg-dark-200 rounded-2xl p-5 shadow-sm border border-surface-200 dark:border-dark-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">{icon} {title}</h3>
        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${colorClass}`}>{status}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function HealthRow({ name, isMissing, alert, nextDate, product, showDetails }: any) {
  const isExpired = alert?.isExpired;
  const statusColor = isMissing || isExpired ? "text-danger-500" : alert ? "text-warning-500" : "text-success-500";
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-surface-50 dark:bg-dark-100 rounded-xl border border-surface-100 dark:border-dark-50 transition-colors">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="shrink-0">
          {isMissing || isExpired ? <AlertCircle size={18} className="text-danger-500" /> : alert ? <AlertCircle size={18} className="text-warning-500" /> : <CheckCircle2 size={18} className="text-success-500" />}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`text-sm font-bold truncate ${isMissing ? "text-danger-600" : "text-slate-700 dark:text-slate-300"}`}>{name}</span>
          {product && <span className="text-[10px] font-bold text-biovet-600 dark:text-biovet-400">Prod: {product}</span>}
          {showDetails && nextDate && (
            <span className={`text-[10px] font-semibold ${isExpired ? "text-danger-500" : "text-slate-500"}`}>
              Siguiente: {new Date(nextDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>
      <span className={`shrink-0 text-[10px] font-black uppercase ml-2 ${statusColor}`}>{isMissing ? "Falta" : isExpired ? "Vencida" : "OK"}</span>
    </div>
  );
}