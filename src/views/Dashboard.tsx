// src/views/dashboard/DashboardView.tsx
import { useMemo, useState } from "react";
import { Stethoscope, PawPrint } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { AgendaSection, AlertsSection, DashboardHeader, MetricsGrid, PendingInvoicesModal, PieChartCard, RevenueChart } from "@/components/dashboard";
import { ConsultationsSection } from "@/components/dashboard/ConsultationsSection";
import { GroomingSection } from "@/components/dashboard/GroomingSection";



export default function DashboardView() {
  const { data: authData } = useAuth();
  const dashboard = useDashboardData();
  
  // Estado para el modal de facturas pendientes
  const [showPendingInvoices, setShowPendingInvoices] = useState(false);

  // Nombre del usuario
  const displayName = useMemo(() => {
    if (authData?.name && authData?.lastName) {
      return authData.name;
    }
    return authData?.name || "Doctor";
  }, [authData]);

  // Loading solo en primera carga
  // if (dashboard.isFirstLoad) {
  //   return <DashboardLoading />;
  // }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
     <DashboardHeader 
  userName={displayName} 
  authData={{
    isLegacyUser: authData?.isLegacyUser,
    planType: authData?.planType,
    trialEndedAt: authData?.trialEndedAt ?? undefined,
    patientCount: authData?.patientCount,
    // isActive?: authData?.isActive
  }}
/>

      {/* Métricas Financieras (solo 3 cards) */}
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

      {/* Citas y Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgendaSection appointments={dashboard.todayAppointments} />
        <AlertsSection
          vaccinations={dashboard.upcomingVaccinations}
          dewormings={dashboard.upcomingDewormings}
        />
      </div>

      {/* Consultas y Peluquería */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConsultationsSection consultations={dashboard.todayConsultations} />
        <GroomingSection groomingServices={dashboard.todayGrooming} />
      </div>

      {/* Gráfico de ingresos */}
      <RevenueChart
        data={dashboard.revenueChartData}
        weekRevenue={dashboard.weekRevenue}
        monthRevenue={dashboard.monthRevenue}
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartCard
          title="Servicios Realizados"
          icon={Stethoscope}
          data={dashboard.servicesChartData}
          tooltipLabel="Total"
        />
        <PieChartCard
          title="Especies Atendidas"
          icon={PawPrint}
          data={dashboard.speciesChartData}
          tooltipLabel="Pacientes"
        />
      </div>

      {/* Modal de Facturas Pendientes */}
      <PendingInvoicesModal
        isOpen={showPendingInvoices}
        onClose={() => setShowPendingInvoices(false)}
        invoices={dashboard.pendingInvoices}
      />
    </div>
  );
}