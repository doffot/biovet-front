// src/views/dashboard/Dashboard.tsx
import { useMemo, useState } from "react";
import { Stethoscope, PawPrint } from "lucide-react";
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

  const displayName = useMemo(() => authData?.name || "Doctor", [authData]);

  return (
    <div className="relative p-4 lg:p-8 max-w-7xl mx-auto space-y-10 animate-fade-in">
      
      {/* MARCA DE AGUA */}
      <div className="fixed inset-0 flex justify-center pointer-events-none z-20 overflow-hidden">
        <img 
          src={clinic?.logo || "/logobiovet.png"} 
          alt="Watermark" 
          className="w-250 h-250 object-contain opacity-[0.03] dark:opacity-[0.06] grayscale select-none"
        />
      </div>

      {/* HEADER */}
      <DashboardHeader 
        userName={displayName}
        clinicData={clinic} 
        authData={authData}
      />

      {/* CONTENIDO */}
      <div className="relative z-10 space-y-10">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AgendaSection appointments={dashboard.todayAppointments} />
          <AlertsSection vaccinations={dashboard.upcomingVaccinations} dewormings={dashboard.upcomingDewormings} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ConsultationsSection consultations={dashboard.todayConsultations} />
          <GroomingSection groomingServices={dashboard.todayGrooming} />
        </div>

        <div className="rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-dark-200 p-2">
          <RevenueChart data={dashboard.revenueChartData} weekRevenue={dashboard.weekRevenue} monthRevenue={dashboard.monthRevenue} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PieChartCard title="Servicios Realizados" icon={Stethoscope} data={dashboard.servicesChartData} tooltipLabel="Total" />
          <PieChartCard title="Especies Atendidas" icon={PawPrint} data={dashboard.speciesChartData} tooltipLabel="Pacientes" />
        </div>
      </div>

     
      <PendingInvoicesModal 
        isOpen={showPendingInvoices} 
        onClose={() => setShowPendingInvoices(false)} 
        invoices={dashboard.pendingInvoices}
        onRefresh={dashboard.refetchInvoices}
        isRefreshing={dashboard.isRefetchingInvoices}
      />
    </div>
  );
}