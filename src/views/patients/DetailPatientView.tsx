// src/views/patients/DetailPatientView.tsx
import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Syringe,
  Info,
  CheckCircle2,
  AlertCircle,
  Activity,
  ClipboardList,
  Menu,
  ArrowLeft,
  PawPrint,
  ShieldCheck,
} from "lucide-react";
import type { Patient } from "@/types/patient";
import { getVaccinationsByPatient } from "@/api/vaccinationAPI";
import { getDewormingsByPatient } from "@/api/dewormingAPI";
import { usePatientHealth } from "@/hooks/usePatientHealth";
import { useDewormingHealth } from "@/hooks/useDewormingHealth";
import { PatientMobileMenu } from "@/components/patients/PatientMobileMenu";
import { PatientMedicalLog } from "@/components/patients/PatientHistory";

export default function DetailPatientView() {
  const patient = useOutletContext<Patient>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"health" | "history">("health");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/40 pointer-events-none" />
          <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-30">
            <button onClick={() => navigate("/owners")} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white"><ArrowLeft size={22} /></button>
            <button onClick={() => setIsMenuOpen(true)} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white"><Menu size={22} /></button>
          </div>
        </div>

        <div className="relative -mt-12 flex-1 bg-white dark:bg-dark-200 rounded-t-4xl px-5 pt-6 shadow-xl flex flex-col overflow-hidden z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{patient.name}</h1>
              <span className="text-sm font-semibold text-biovet-500">{patient.breed || "Mestizo"}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase ${dwHealth.colorClass}`}>{dwHealth.status}</span>
              <span className="text-xs font-bold text-slate-400">{patient.sex}</span>
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
                  <div className="text-center"><p className="text-[10px] text-slate-400 font-bold uppercase">Edad</p><p className="font-bold text-slate-700 dark:text-slate-200">{calculateAge()}</p></div>
                  <div className="text-center border-l border-slate-100 dark:border-slate-800"><p className="text-[10px] text-slate-400 font-bold uppercase">Peso</p><p className="font-bold text-slate-700 dark:text-slate-200">{patient.weight}kg</p></div>
                  <div className="text-center border-l border-slate-100 dark:border-slate-800"><p className="text-[10px] text-slate-400 font-bold uppercase">Dueño</p><p className="font-bold text-slate-700 dark:text-slate-200 truncate px-1">{getOwnerName().split(" ")[0]}</p></div>
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
        <PatientMobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} patient={patient} />
      </div>

      {/* ================= VISTA DESKTOP ================= */}
      <div className="hidden lg:flex lg:flex-col lg:h-full">
        <div className="flex gap-6 h-full overflow-hidden">
          
          {/* Columna izquierda: Historial con scroll propio */}
          <div className="w-2/5 shrink-0 flex flex-col min-h-0">
            <PatientMedicalLog patientId={patient._id!} />
          </div>

          {/* Columna derecha: Salud - scroll propio */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0">
            <div className="space-y-4 pb-4">
              
              {/* Observaciones - Primero si existe */}
              {patient.observations && (
                <div className="bg-danger-50 dark:bg-danger-900/10 p-4 rounded-xl border border-danger-100 dark:border-danger-900/30 flex gap-3 items-start">
                  <div className="p-1.5 bg-white dark:bg-danger-900/20 rounded-lg text-danger-500 shrink-0">
                    <Info size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-danger-400 uppercase mb-0.5">Nota Clínica</p>
                    <p className="text-sm text-danger-800 dark:text-danger-300 font-medium italic leading-relaxed">"{patient.observations}"</p>
                  </div>
                </div>
              )}

              {/* Desparasitación */}
              <HealthCardCompact
                title="Desparasitación"
                icon={<ShieldCheck size={16} className="text-biovet-500" />}
                status={dwHealth.status}
                colorClass={dwHealth.colorClass}
              >
                <HealthRowCompact
                  name="Parásitos Internos"
                  isMissing={dwHealth.status === "Sin registros"}
                  alert={dwHealth.alert}
                  nextDate={dwHealth.nextDate}
                  product={dwHealth.productName}
                />
              </HealthCardCompact>

              {/* Vacunas */}
              <HealthCardCompact
                title="Plan de Vacunación"
                icon={<Syringe size={16} className="text-biovet-500" />}
                status={vaxHealth.status}
                colorClass={vaxHealth.colorClass}
              >
                {[...vaxHealth.applied, ...vaxHealth.missing].map((name) => (
                  <HealthRowCompact
                    key={name}
                    name={name}
                    isMissing={vaxHealth.missing.includes(name)}
                    alert={vaxHealth.alerts.find(a => a.name === name)}
                  />
                ))}
              </HealthCardCompact>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ==================== CARD COMPACTA DESKTOP ====================
function HealthCardCompact({ title, icon, status, colorClass, children }: any) {
  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl p-4 shadow-sm border border-surface-200 dark:border-dark-100">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {icon} {title}
        </h3>
        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${colorClass}`}>
          {status}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// ==================== ROW COMPACTA DESKTOP ====================
function HealthRowCompact({ name, isMissing, alert, nextDate, product }: any) {
  const isExpired = alert?.isExpired;
  const statusColor = isMissing || isExpired ? "text-danger-500" : alert ? "text-warning-500" : "text-success-500";

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-surface-50 dark:bg-dark-100 rounded-lg border border-surface-100 dark:border-dark-50">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0">
          {isMissing || isExpired ? (
            <AlertCircle size={15} className="text-danger-500" />
          ) : alert ? (
            <AlertCircle size={15} className="text-warning-500" />
          ) : (
            <CheckCircle2 size={15} className="text-success-500" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`text-xs font-bold truncate ${isMissing ? "text-danger-600" : "text-slate-700 dark:text-slate-300"}`}>
            {name}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {product && (
              <span className="text-[9px] font-bold text-biovet-600 dark:text-biovet-400">
                {product}
              </span>
            )}
            {nextDate && (
              <span className={`text-[9px] font-semibold ${isExpired ? "text-danger-500" : "text-slate-400"}`}>
                Sig: {new Date(nextDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
              </span>
            )}
          </div>
        </div>
      </div>
      <span className={`shrink-0 text-[9px] font-black uppercase ml-2 ${statusColor}`}>
        {isMissing ? "Falta" : isExpired ? "Vencida" : "OK"}
      </span>
    </div>
  );
}

// ==================== CARDS ORIGINALES MOBILE ====================
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
          {product && (
            <span className="text-[10px] font-bold text-biovet-600 dark:text-biovet-400">Prod: {product}</span>
          )}
          {showDetails && nextDate && (
            <span className={`text-[10px] font-semibold ${isExpired ? "text-danger-500" : "text-slate-500"}`}>
              Siguiente: {new Date(nextDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>
      <span className={`shrink-0 text-[10px] font-black uppercase ml-2 ${statusColor}`}>
        {isMissing ? "Falta" : isExpired ? "Vencida" : "OK"}
      </span>
    </div>
  );
}