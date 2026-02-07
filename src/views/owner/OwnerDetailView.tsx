// src/views/owners/OwnerDetailView.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';

import { getOwnersById, deleteOwners } from '@/api/OwnerAPI';
import { getPatientsByOwner } from '@/api/patientAPI';
import { getInvoices } from '@/api/invoiceAPI';
import { toast } from '@/components/Toast';

import type { Owner } from '@/types/owner';
import type { Patient } from '@/types/patient';
import type { Invoice } from '@/types/invoice';
import { getPatientName } from '@/types/invoice';

import { OwnerSidebar } from '@/components/owners/detail/OwnerSidebar';
import { OwnerHeader } from '@/components/owners/detail/OwnerHeader';
import { GeneralTab } from '@/components/owners/detail/tabs/GeneralTab';
import { PatientsTab } from '@/components/owners/detail/tabs/PatientsTab';
import { TransactionsTab } from '@/components/owners/detail/tabs/TransactionsTab';
import { EmptyTab } from '@/components/owners/detail/tabs/EmptyTab';

import type { TabType, TimelineItem, DebtInfo } from '@/utils/ownerHelpers';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function OwnerDetailView() {
  const { ownerId } = useParams<{ ownerId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>('mascotas');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ==================== QUERIES ====================
  const { data: owner, isLoading: isLoadingOwner } = useQuery<Owner>({
    queryKey: ["owner", ownerId],
    queryFn: () => getOwnersById(ownerId!),
    enabled: !!ownerId,
  });

  const { data: patientsData = [], isLoading: isLoadingPatients } = useQuery<Patient[]>({
    queryKey: ["patients", { ownerId }],
    queryFn: () => getPatientsByOwner(ownerId!),
    enabled: !!ownerId,
  });

  const { data: invoicesResponse, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["invoices", { ownerId }],
    queryFn: () => getInvoices({ ownerId }),
    enabled: !!ownerId,
  });

  const invoices = invoicesResponse?.invoices || [];

  // ==================== DELETE MUTATION ====================
  const deleteMutation = useMutation({
    mutationFn: deleteOwners,
    onSuccess: (data) => {
      toast.success("Eliminado", data.msg || "Propietario eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      navigate('/owners');
    },
    onError: (err: Error) => {
      toast.error("Error", err.message);
    },
  });

  // ==================== COMPUTED ====================
  const debtInfo = useMemo<DebtInfo>(() => {
    const pendingInvoices = invoices.filter(
      (inv) => inv.paymentStatus === 'Pendiente' || inv.paymentStatus === 'Parcial'
    );

    const totalDebt = pendingInvoices.reduce((sum, inv) => {
      const remaining = inv.total - (inv.amountPaid || 0);
      if (inv.currency === 'Bs' && inv.exchangeRate) {
        return sum + remaining / inv.exchangeRate;
      }
      return sum + remaining;
    }, 0);

    return { totalDebt, pendingCount: pendingInvoices.length };
  }, [invoices]);

  const timelineItems = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];

    invoices.forEach((invoice: Invoice) => {
      const patientName = getPatientName(invoice);
      const isPending = invoice.paymentStatus === 'Pendiente' || invoice.paymentStatus === 'Parcial';

      invoice.items?.forEach((item) => {
        items.push({
          id: `${invoice._id}-${item.resourceId}`,
          type: item.type,
          description: item.description,
          date: invoice.date,
          amount: item.cost * item.quantity,
          status: invoice.paymentStatus,
          patientName,
          currency: invoice.currency,
          isPending,
        });
      });
    });

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [invoices]);

  // ==================== HANDLERS ====================
  const handleViewAllTransactions = () => {
    setActiveTab('transacciones');
    setIsMobileSidebarOpen(false);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleMenuClick = () => {
    setIsMobileSidebarOpen(true);
  };

  const handleCloseMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (ownerId) {
      deleteMutation.mutate(ownerId);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleteMutation.isPending) {
      setShowDeleteModal(false);
    }
  };

  // ==================== RENDER TAB CONTENT ====================
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab owner={owner} />;
      case 'mascotas':
        return (
          <PatientsTab
            patients={patientsData}
            isLoading={isLoadingPatients}
            ownerId={ownerId!}
          />
        );
      case 'transacciones':
        return (
          <TransactionsTab
            invoices={invoices}
            patients={patientsData}
            owner={owner}
            isLoading={isLoadingInvoices}
            creditBalance={owner?.creditBalance || 0}
            totalDebt={debtInfo.totalDebt}
          />
        );
      default:
        return <EmptyTab tabName={activeTab} />;
    }
  };

  // ==================== LOADING STATE ====================
  if (isLoadingOwner) {
    return <OwnerDetailSkeleton />;
  }

  // ==================== RENDER ====================
  return (
    <>
      <div className="flex flex-col md:flex-row h-screen w-full bg-surface-100 dark:bg-dark-300 transition-colors duration-300 overflow-hidden">
        {/* Sidebar */}
        <OwnerSidebar
          owner={owner}
          creditBalance={owner?.creditBalance || 0}
          debtInfo={debtInfo}
          timelineItems={timelineItems}
          isLoadingTimeline={isLoadingInvoices}
          onViewAllTransactions={handleViewAllTransactions}
          onDelete={handleDeleteClick}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleCloseMobileSidebar}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <OwnerHeader
            ownerName={owner?.name || ''}
            ownerId={ownerId!}
            patients={patientsData}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            debtInfo={debtInfo}
            onMenuClick={handleMenuClick}
          />

          {/* Tab Content */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 overflow-y-auto scrollbar-thin bg-surface-50/50 dark:bg-dark-300 flex-1">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        variant="danger"
        title="Eliminar Propietario"
        message={
          <div className="space-y-2">
            <p>
              ¿Estás seguro de que deseas eliminar a{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {owner?.name}
              </span>
              ?
            </p>
            {patientsData.length > 0 && (
              <p className="text-sm text-warning-600 dark:text-warning-400">
                ⚠️ Este propietario tiene {patientsData.length} mascota{patientsData.length !== 1 ? 's' : ''} registrada{patientsData.length !== 1 ? 's' : ''}.
              </p>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Esta acción no se puede deshacer.
            </p>
          </div>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmIcon={Trash2}
        isLoading={deleteMutation.isPending}
        loadingText="Eliminando..."
      />
    </>
  );
}

// ==================== SKELETON ====================
function OwnerDetailSkeleton() {
  return (
    <div className="flex h-screen w-full bg-surface-100 dark:bg-dark-300">
      {/* Sidebar Skeleton */}
      <aside className="hidden md:flex w-80 lg:w-96 bg-white dark:bg-dark-200 border-r border-surface-200 dark:border-slate-800 flex-col">
        <div className="p-6 flex flex-col items-center border-b border-surface-100 dark:border-slate-800/50 animate-pulse">
          <div className="w-16 h-16 bg-surface-200 dark:bg-slate-700 rounded-full mb-3" />
          <div className="h-5 w-32 bg-surface-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-3 w-20 bg-surface-100 dark:bg-slate-800 rounded" />
          <div className="flex gap-3 mt-4">
            <div className="w-9 h-9 bg-surface-200 dark:bg-slate-700 rounded-full" />
            <div className="w-9 h-9 bg-surface-200 dark:bg-slate-700 rounded-full" />
            <div className="w-9 h-9 bg-surface-200 dark:bg-slate-700 rounded-full" />
            <div className="w-9 h-9 bg-surface-200 dark:bg-slate-700 rounded-full" />
          </div>
        </div>

        <div className="p-4 border-b border-surface-100 dark:border-slate-800 space-y-3 animate-pulse">
          <div className="h-16 bg-surface-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-16 bg-surface-100 dark:bg-slate-800 rounded-xl" />
        </div>

        <div className="px-5 py-4 border-b border-surface-100 dark:border-slate-800 animate-pulse">
          <div className="h-4 w-24 bg-surface-200 dark:bg-slate-700 rounded" />
        </div>

        <div className="flex-1 p-4 space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 bg-surface-200 dark:bg-slate-700 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 bg-surface-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-full bg-surface-100 dark:bg-slate-800 rounded" />
                <div className="h-3 w-24 bg-surface-100 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-dark-200 border-b border-surface-200 dark:border-slate-800 animate-pulse">
          <div className="h-3 w-32 bg-surface-200 dark:bg-slate-700 rounded mb-4" />
          <div className="flex justify-between items-start">
            <div>
              <div className="h-10 w-48 bg-surface-200 dark:bg-slate-700 rounded mb-3" />
              <div className="flex items-center gap-4">
                <div className="h-4 w-24 bg-surface-100 dark:bg-slate-800 rounded" />
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 bg-surface-200 dark:bg-slate-700 rounded-full border-2 border-white dark:border-dark-200" />
                  ))}
                </div>
              </div>
            </div>
            <div className="h-10 w-36 bg-surface-200 dark:bg-slate-700 rounded-lg" />
          </div>
          
          <div className="flex gap-6 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-4 w-20 bg-surface-100 dark:bg-slate-800 rounded" />
            ))}
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-surface-200 dark:bg-slate-700 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 w-20 bg-surface-200 dark:bg-slate-700 rounded mb-1.5" />
                    <div className="h-3 w-28 bg-surface-100 dark:bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="h-5 w-14 bg-surface-100 dark:bg-slate-800 rounded-md" />
                  <div className="h-5 w-16 bg-surface-100 dark:bg-slate-800 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}