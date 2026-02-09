import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft, Printer, Calendar, User, Stethoscope,
  ClipboardList, Activity, Heart, Wind,
  Thermometer, Info, Syringe, Eye, Brain, Beef, Droplets, FlaskConical,
  Scale, Zap, Scissors, AlertTriangle
} from "lucide-react";
import { getConsultationById } from "@/api/consultationAPI";
import { getPatientById } from "@/api/patientAPI";

export default function ConsultationDetailView() {
  const { patientId, consultationId } = useParams();
  const navigate = useNavigate();

  const { data: consultation, isLoading: loadingConsultation } = useQuery({
    queryKey: ["consultation", consultationId],
    queryFn: () => getConsultationById(consultationId!),
    enabled: !!consultationId,
  });

  const { data: patient, isLoading: loadingPatient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  if (loadingConsultation || loadingPatient) return (
    <div className="fixed inset-0 bg-white dark:bg-dark-400 z-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-biovet-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando Expediente...</p>
      </div>
    </div>
  );

  if (!consultation || !patient) return <div className="p-20 text-center text-red-500 font-bold">Error: Datos no localizados.</div>;

  const BoolBadge = ({ val }: { val: any }) => {
    if (val === null || val === undefined) return <span className="text-surface-400 dark:text-slate-600 text-xs">N/R</span>;
    return val ? (
      <span className="badge badge-success">Sí</span>
    ) : (
      <span className="badge badge-danger">No</span>
    );
  };

  /* Helper para filas de dato */
  const DataRow = ({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-surface-200 dark:border-dark-100 last:border-0">
      <span className="text-xs font-semibold text-surface-500 dark:text-slate-400">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-danger-600 dark:text-danger-400' : 'text-slate-700 dark:text-slate-200'}`}>
        {value || <span className="text-surface-400 dark:text-slate-600">N/R</span>}
      </span>
    </div>
  );

  /* Helper para card de sistema */
  const SystemCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex gap-3 p-4 bg-surface-50 dark:bg-dark-300 rounded-xl border border-surface-200 dark:border-dark-100">
        <div className="text-biovet-500 mt-0.5 shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-60 bg-surface-100 dark:bg-dark-400 flex flex-col overflow-hidden animate-fade-in">

      {/* ═══════════════ HEADER ═══════════════ */}
      <header className="bg-white dark:bg-dark-200 border-b border-surface-200 dark:border-dark-100 px-4 md:px-6 py-3 shrink-0 z-20 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="btn-icon-neutral w-9! h-9! rounded-xl!"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-white leading-none">Historia Clínica</h1>
              <p className="text-[11px] text-surface-500 dark:text-slate-400 font-medium mt-1 flex items-center gap-1.5">
                <Calendar size={11} className="text-biovet-500" />
                {new Date(consultation.consultationDate).toLocaleDateString('es-ES', { dateStyle: 'full' })}
              </p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="btn-icon-neutral rounded-xl!"
            title="Imprimir Historia"
          >
            <Printer size={18} />
          </button>
        </div>
      </header>

      {/* ═══════════════ CUERPO ═══════════════ */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-5 pb-16">

          {/* ═══════════════ BANNER PACIENTE ═══════════════ */}
          <section className="bg-white dark:bg-dark-200 rounded-2xl border border-surface-200 dark:border-dark-100 p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            {/* Info paciente */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 shrink-0 bg-surface-100 dark:bg-dark-300 rounded-2xl overflow-hidden border border-surface-200 dark:border-dark-100 flex items-center justify-center">
                {patient.photo ? (
                  <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-surface-400" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">{patient.name}</h2>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="badge badge-neutral">{patient.species}</span>
                  <span className="badge badge-neutral">{patient.breed}</span>
                  <span className="badge badge-biovet">{patient.sex}</span>
                </div>
              </div>
            </div>

            {/* Métricas rápidas */}
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              {[
                { label: 'Peso', val: `${consultation.weight} kg`, icon: <Scale size={13} /> },
                { label: 'Castrado', val: <BoolBadge val={consultation.isNeutered} />, icon: <Scissors size={13} /> },
                { label: 'Apetito', val: consultation.appetite || 'N/R', icon: <Beef size={13} /> },
                { label: 'ID', val: `#${consultationId?.slice(-4).toUpperCase()}`, icon: <Zap size={13} /> },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-surface-50 dark:bg-dark-300 rounded-xl border border-surface-200 dark:border-dark-100 min-w-25">
                  <span className="text-biovet-500">{item.icon}</span>
                  <div>
                    <p className="text-[10px] text-surface-500 dark:text-slate-400 font-medium leading-none">{item.label}</p>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{item.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ═══════════════ GRID PRINCIPAL ═══════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

            {/* ══════ COLUMNA PRINCIPAL ══════ */}
            <div className="lg:col-span-8 space-y-5">

              {/* ANAMNESIS */}
              <section className="bg-white dark:bg-dark-200 rounded-2xl border border-surface-200 dark:border-dark-100 p-5 md:p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-5 flex items-center gap-2 text-biovet-600 dark:text-biovet-400">
                  <ClipboardList size={16} /> Anamnesis y Estilo de Vida
                </h3>

                {/* Motivo consulta */}
                <div className="p-4 bg-biovet-50 dark:bg-biovet-950/30 rounded-xl border border-biovet-100 dark:border-biovet-900/30 mb-5">
                  <p className="text-[10px] font-semibold text-biovet-500 uppercase tracking-wider mb-1">Motivo de consulta</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">"{consultation.reasonForVisit}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <div>
                    <DataRow label="Alimentación" value={consultation.feeding} />
                    <DataRow label="Animales Cohabitantes" value={consultation.cohabitantAnimals || 'Ninguno'} />
                  </div>
                  <div>
                    <DataRow label="Contacto Callejeros" value={consultation.contactWithStrays || 'No'} />
                    <DataRow label="Evolución" value={
                      consultation.symptomEvolution
                        ? <span className="badge badge-biovet">{consultation.symptomEvolution}</span>
                        : undefined
                    } />
                  </div>
                </div>
              </section>

              {/* GASTROINTESTINAL / URINARIO */}
              <section className="bg-white dark:bg-dark-200 rounded-2xl border border-surface-200 dark:border-dark-100 p-5 md:p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-5 flex items-center gap-2 text-biovet-600 dark:text-biovet-400">
                  <Droplets size={16} /> Sistema Gastrointestinal / Urinario
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <div>
                    <DataRow label="Vómitos" value={consultation.vomiting || 'No'} />
                    <DataRow label="Consistencia Heces" value={consultation.stoolConsistency || 'Normal'} />
                    <DataRow label="Sangre/Parásitos" value={consultation.bloodOrParasitesInStool || 'No'} />
                  </div>
                  <div>
                    <DataRow label="Micción Normal" value={consultation.normalUrination || 'Sí'} />
                    <DataRow label="Color Orina" value={consultation.urineColor} />
                    <DataRow label="Dolor Micción" value={consultation.painOrDifficultyUrinating || 'No'} highlight />
                  </div>
                </div>
              </section>

              {/* RESPIRATORIO Y OTROS */}
              <section className="bg-white dark:bg-dark-200 rounded-2xl border border-surface-200 dark:border-dark-100 p-5 md:p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-5 flex items-center gap-2 text-biovet-600 dark:text-biovet-400">
                  <Info size={16} /> Sistema Respiratorio y Otros
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Tos', val: consultation.cough },
                    { label: 'Estornudos', val: consultation.sneezing },
                    { label: 'Dif. Respirar', val: <BoolBadge val={consultation.breathingDifficulty} /> },
                    { label: 'Picazón/Lamedura', val: <BoolBadge val={consultation.itchingOrExcessiveLicking} /> },
                    { label: 'Pérdida Pelo', val: consultation.hairLossOrSkinLesions },
                    { label: 'Secreción Ocular', val: consultation.eyeDischarge },
                    { label: 'Problemas Oído', val: consultation.earIssues },
                    { label: 'Fiebre/Letargo', val: <BoolBadge val={consultation.feverSigns} /> },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-3.5 py-2.5 bg-surface-50 dark:bg-dark-300 rounded-lg border border-surface-200 dark:border-dark-100">
                      <span className="text-xs font-medium text-surface-500 dark:text-slate-400">{item.label}</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{item.val || 'No'}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* HALLAZGOS FÍSICOS POR SISTEMAS */}
              <section className="bg-white dark:bg-dark-200 rounded-2xl border border-surface-200 dark:border-dark-100 p-5 md:p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-5 flex items-center gap-2 text-biovet-600 dark:text-biovet-400">
                  <Stethoscope size={16} /> Hallazgos Físicos por Sistemas
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <SystemCard icon={<Info size={15} />} label="Piel y Anexos" value={consultation.integumentarySystem} />
                  <SystemCard icon={<Heart size={15} />} label="Cardiovascular" value={consultation.cardiovascularSystem} />
                  <SystemCard icon={<Eye size={15} />} label="Ocular" value={consultation.ocularSystem} />
                  <SystemCard icon={<Wind size={15} />} label="Respiratorio" value={consultation.respiratorySystem} />
                  <SystemCard icon={<Brain size={15} />} label="Nervioso" value={consultation.nervousSystem} />
                  <SystemCard icon={<Activity size={15} />} label="Músculo Esquelético" value={consultation.musculoskeletalSystem} />
                  <SystemCard icon={<Beef size={15} />} label="Gastrointestinal" value={consultation.gastrointestinalSystem} />
                </div>
              </section>
            </div>

            {/* ══════ COLUMNA LATERAL ══════ */}
            <aside className="lg:col-span-4 space-y-5">

              {/* TRIAJE */}
              <section className="bg-white dark:bg-dark-200 rounded-2xl border border-surface-200 dark:border-dark-100 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Activity size={15} className="text-danger-500" /> Triaje Clínico
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Temperatura', val: `${consultation.temperature}°C`, icon: <Thermometer size={15} />, bg: 'bg-warning-50 dark:bg-warning-950/30', text: 'text-warning-600 dark:text-warning-400', border: 'border-warning-100 dark:border-warning-900/30' },
                    { label: 'F. Cardíaca', val: `${consultation.heartRate} bpm`, icon: <Heart size={15} />, bg: 'bg-danger-50 dark:bg-danger-950/30', text: 'text-danger-600 dark:text-danger-400', border: 'border-danger-100 dark:border-danger-900/30' },
                    { label: 'F. Respiratoria', val: `${consultation.respiratoryRate} rpm`, icon: <Wind size={15} />, bg: 'bg-biovet-50 dark:bg-biovet-950/30', text: 'text-biovet-600 dark:text-biovet-400', border: 'border-biovet-100 dark:border-biovet-900/30' },
                  ].map((stat, i) => (
                    <div key={i} className={`flex items-center justify-between p-3.5 rounded-xl ${stat.bg} ${stat.text} border ${stat.border}`}>
                      <div className="flex items-center gap-2">
                        {stat.icon}
                        <span className="text-[11px] font-semibold">{stat.label}</span>
                      </div>
                      <span className="text-base font-bold tabular-nums">{stat.val}</span>
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-surface-50 dark:bg-dark-300 rounded-xl border border-surface-200 dark:border-dark-100 text-center">
                      <p className="text-[10px] text-surface-500 dark:text-slate-400 font-medium mb-1">T. Llen. Capilar</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{consultation.capillaryRefillTime || 'N/R'}</p>
                    </div>
                    <div className="p-3 bg-surface-50 dark:bg-dark-300 rounded-xl border border-surface-200 dark:border-dark-100 text-center">
                      <p className="text-[10px] text-surface-500 dark:text-slate-400 font-medium mb-1">Gang. Linfáticos</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{consultation.lymphNodes || 'Normal'}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* DIAGNÓSTICO */}
              <section className="bg-biovet-500 dark:bg-biovet-700 rounded-2xl p-5 text-white relative overflow-hidden">
                <div className="absolute -top-2 -right-2 opacity-[0.08]">
                  <Stethoscope size={80} />
                </div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-biovet-100">
                  <Stethoscope size={14} /> Diagnóstico
                </h3>
                <p className="text-lg font-bold leading-snug mb-4 relative z-10">
                  {consultation.definitiveDiagnosis || 'Sin diagnóstico definitivo'}
                </p>
                <div className="p-3.5 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase opacity-60 mb-1.5">Presuntivo</p>
                  <p className="text-xs font-medium opacity-90 leading-relaxed">"{consultation.presumptiveDiagnosis || 'No especificado'}"</p>
                </div>
              </section>

              {/* PRUEBAS Y TRATAMIENTO */}
              <section className="bg-white dark:bg-dark-200 rounded-2xl border border-surface-200 dark:border-dark-100 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <FlaskConical size={15} className="text-biovet-500" /> Pruebas y Tratamiento
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold text-surface-500 dark:text-slate-400 mb-2">Pruebas Solicitadas</p>
                    <div className="p-3.5 bg-surface-50 dark:bg-dark-300 rounded-xl text-sm text-slate-700 dark:text-slate-300 border-l-3 border-biovet-400">
                      {consultation.requestedTests || 'Ninguna solicitada.'}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-surface-500 dark:text-slate-400 mb-2">Plan de Tratamiento</p>
                    <div className="p-3.5 bg-surface-50 dark:bg-dark-300 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap border border-dashed border-surface-300 dark:border-dark-100">
                      {consultation.treatmentPlan || 'No hay un plan de tratamiento registrado.'}
                    </div>
                  </div>
                </div>
              </section>

              {/* HISTORIAL PREVIO */}
              <section className="bg-surface-800 dark:bg-dark-100 rounded-2xl p-5 text-white relative overflow-hidden">
                <AlertTriangle className="absolute bottom-2 right-2 text-white/4" size={80} />
                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-biovet-400">
                  <Syringe size={14} /> Historial Clínico Previo
                </h3>
                <div className="space-y-3.5">
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Enfermedades Previas</p>
                    <p className="text-sm font-medium text-slate-200">{consultation.previousIllnesses || 'Sin reportes'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Cirugías</p>
                    <p className="text-sm font-medium text-slate-200">{consultation.previousSurgeries || 'Sin reportes'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-danger-400 uppercase tracking-wider mb-1">Reacciones Adversas</p>
                    <p className="text-sm font-medium text-danger-300">{consultation.adverseReactions || 'Ninguna conocida'}</p>
                  </div>
                </div>
              </section>

            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}