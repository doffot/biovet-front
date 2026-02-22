// src/views/dashboard/DashboardView.tsx
import { useMemo, useState } from "react";
import { Stethoscope, PawPrint, Building2, MapPin, Phone, Hash, Settings2 } from "lucide-react";
import { Link } from "react-router-dom"; // Importar Link
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useQuery } from "@tanstack/react-query";
import { getMyClinic } from "@/api/veterinaryClinicAPI";
import { 
  AgendaSection, 
  AlertsSection, 
  DashboardHeader, 
  MetricsGrid, 
  PendingInvoicesModal, 
  PieChartCard, 
  RevenueChart 
} from "@/components/dashboard";
import { ConsultationsSection } from "@/components/dashboard/ConsultationsSection";
import { GroomingSection } from "@/components/dashboard/GroomingSection";

export default function DashboardView() {
  const { data: authData } = useAuth();
  const dashboard = useDashboardData();
  const [showPendingInvoices, setShowPendingInvoices] = useState(false);

  const { data: clinic } = useQuery({
    queryKey: ["my-clinic"],
    queryFn: getMyClinic,
  });

  const displayName = useMemo(() => {
    return authData?.name || "Doctor";
  }, [authData]);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* ═══ SECCIÓN DE IDENTIDAD DE LA CLÍNICA ═══ */}
      <div className="bg-white dark:bg-dark-100 p-5 rounded-2xl border border-surface-200 dark:border-slate-800 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-biovet-50 dark:bg-biovet-950 flex items-center justify-center overflow-hidden border-2 border-biovet-100 dark:border-biovet-900 shadow-inner">
                {clinic?.logo ? (
                  <img src={clinic.logo} alt={clinic.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <Building2 className="w-10 h-10 text-biovet-400 opacity-50" />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-heading font-bold text-slate-800 dark:text-white tracking-tight">
                  {clinic?.name || "Configura tu Clínica"}
                </h1>
                {!clinic && (
                  <Link 
                    to="/clinic" 
                    className="flex items-center gap-1.5 px-2 py-1 bg-warning-50 text-warning-600 dark:bg-warning-900/20 dark:text-warning-400 rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-warning-100 transition-colors border border-warning-200 dark:border-warning-800"
                  >
                    <Settings2 size={12} />
                    Completar Perfil
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                {clinic?.rif && (
                  <span className="flex items-center gap-1.5 font-semibold text-biovet-600 dark:text-biovet-400 bg-biovet-50 dark:bg-biovet-900/30 px-2 py-0.5 rounded-lg border border-biovet-100 dark:border-biovet-800">
                    <Hash size={14} /> {clinic.rif}
                  </span>
                )}
                {clinic?.phone && (
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Phone size={14} className="text-biovet-500" /> {clinic.phone}
                  </span>
                )}
                {clinic?.city && (
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <MapPin size={14} className="text-biovet-500" /> {clinic.city}, {clinic.country}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0">
            <DashboardHeader 
              userName={displayName} 
              authData={{
                isLegacyUser: authData?.isLegacyUser,
                planType: authData?.planType,
                trialEndedAt: authData?.trialEndedAt ?? undefined,
                patientCount: authData?.patientCount,
              }}
            />
          </div>
        </div>
      </div>

      {/* ═══ RESTO DE MÉTRICAS (Igual al original) ═══ */}
      <MetricsGrid
        todayAppointments={dashboard.todayAppointments.length}
        todayConsultations={dashboard.todayConsultations.length}
        todayGrooming={dashboard.todayGrooming.length}
        todayRevenue={dashboard.todayRevenue}
        totalPatients={dashboard.patients.length}
        totalOwners={dashboard.owners.length}
        pendingDebt={dashboard.pendingDebt}
        pendingInvoicesCount={dashboard.pendingInvoicesCount}
        monthRevenue={dashboard.monthRevenue}
        onPendingDebtClick={() => setShowPendingInvoices(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgendaSection appointments={dashboard.todayAppointments} />
        <AlertsSection vaccinations={dashboard.upcomingVaccinations} dewormings={dashboard.upcomingDewormings} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConsultationsSection consultations={dashboard.todayConsultations} />
        <GroomingSection groomingServices={dashboard.todayGrooming} />
      </div>

      <RevenueChart data={dashboard.revenueChartData} weekRevenue={dashboard.weekRevenue} monthRevenue={dashboard.monthRevenue} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartCard title="Servicios Realizados" icon={Stethoscope} data={dashboard.servicesChartData} tooltipLabel="Total" />
        <PieChartCard title="Especies Atendidas" icon={PawPrint} data={dashboard.speciesChartData} tooltipLabel="Pacientes" />
      </div>

      <PendingInvoicesModal isOpen={showPendingInvoices} onClose={() => setShowPendingInvoices(false)} invoices={dashboard.pendingInvoices} />
    </div>
  );
}