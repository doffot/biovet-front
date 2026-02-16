// src/views/owners/OwnerDetailView.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Trash2, ArrowLeft, Edit3, Phone, Mail,
  CreditCard, PawPrint, Menu, X, ChevronRight,
  AlertTriangle as AlertTriangleIcon, 
  TrendingDown, TrendingUp,
  CirclePlus
} from 'lucide-react';

import { getOwnersById, deleteOwners } from '@/api/OwnerAPI';
import { getPatientsByOwner } from '@/api/patientAPI';
import { getInvoices } from '@/api/invoiceAPI';
import { toast } from '@/components/Toast';

import type { Owner } from '@/types/owner';
import type { Patient } from '@/types/patient';

import { GeneralTab } from '@/components/owners/detail/tabs/GeneralTab';
import { PatientsTab } from '@/components/owners/detail/tabs/PatientsTab';
import { TransactionsTab } from '@/components/owners/detail/tabs/TransactionsTab';
import { EmptyTab } from '@/components/owners/detail/tabs/EmptyTab';

import { formatCurrency, TABS } from '@/utils/ownerHelpers';
import type { TabType,  DebtInfo } from '@/utils/ownerHelpers';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function OwnerDetailView() {
  const { ownerId } = useParams<{ ownerId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>('mascotas');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const totalPaid = useMemo(() => {
    return invoices.reduce((sum, inv) => {
      const paid = inv.amountPaid || 0;
      if (inv.currency === 'Bs' && inv.exchangeRate) {
        return sum + paid / inv.exchangeRate;
      }
      return sum + paid;
    }, 0);
  }, [invoices]);

  // const timelineItems = useMemo<TimelineItem[]>(() => {
  //   const items: TimelineItem[] = [];
  //   invoices.forEach((invoice: Invoice) => {
  //     const patientName = getPatientName(invoice);
  //     const isPending = invoice.paymentStatus === 'Pendiente' || invoice.paymentStatus === 'Parcial';
  //     invoice.items?.forEach((item) => {
  //       items.push({
  //         id: `${invoice._id}-${item.resourceId}`,
  //         type: item.type,
  //         description: item.description,
  //         date: invoice.date,
  //         amount: item.cost * item.quantity,
  //         status: invoice.paymentStatus,
  //         patientName,
  //         currency: invoice.currency,
  //         isPending,
  //       });
  //     });
  //   });
  //   return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  // }, [invoices]);

  // ==================== HANDLERS ====================
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleAddPatient = () => {
    navigate(`/owners/${ownerId}/patients/new`);
  };

  const handleConfirmDelete = () => {
    if (ownerId) deleteMutation.mutate(ownerId);
  };

  const handleCloseDeleteModal = () => {
    if (!deleteMutation.isPending) setShowDeleteModal(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
      <div className="flex flex-col h-full">

        {/* ============================================
            TOP BAR
            ============================================ */}
        <header className="shrink-0 bg-white dark:bg-dark-200 border-b border-surface-200 dark:border-slate-800">
          <div className="px-4 sm:px-6">
            {/* Fila principal */}
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Izquierda */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                  onClick={() => navigate('/owners')}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-surface-100 dark:hover:bg-dark-100 transition-all shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-linear-to-br from-biovet-500 to-biovet-700 flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0">
                    {getInitials(owner?.name || '')}
                  </div>
                  <div className="min-w-0 hidden sm:block">
                    <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                      {owner?.name}
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 leading-tight">
                      <span className="flex items-center gap-1">
                        <PawPrint className="w-3 h-3" />
                        {patientsData.length}
                      </span>
                      {owner?.contact && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {owner.contact}
                        </span>
                      )}
                      {owner?.email && (
                        <span className="hidden lg:flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {owner.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <h1 className="sm:hidden text-sm font-bold text-slate-900 dark:text-white truncate">
                    {owner?.name}
                  </h1>
                </div>
              </div>

              {/* Derecha */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('general')}
                  className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-950/30 transition-all"
                  title="Editar"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/30 transition-all"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="sm:hidden p-2 rounded-xl text-slate-500 hover:bg-surface-100 dark:hover:bg-dark-100 transition-all"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Tabs Desktop */}
            <nav className="hidden sm:flex gap-1 -mb-px">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    relative px-4 py-2.5 text-sm font-semibold transition-all
                    ${activeTab === tab.id
                      ? 'text-biovet-600 dark:text-biovet-400'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }
                  `}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-biovet-500 rounded-full" />
                  )}
                  {tab.id === 'transacciones' && debtInfo.pendingCount > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-danger-500 text-white rounded-full">
                      {debtInfo.pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* ============================================
            MOBILE DROPDOWN
            ============================================ */}
        {mobileMenuOpen && (
          <>
            <div
              className="sm:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="sm:hidden absolute left-0 right-0 z-35 bg-white dark:bg-dark-200 border-b border-surface-200 dark:border-slate-800 shadow-xl animate-fade-in">
              <div className="px-4 py-4 border-b border-surface-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-linear-to-br from-biovet-500 to-biovet-700 flex items-center justify-center text-white font-bold text-sm">
                    {getInitials(owner?.name || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate text-sm">{owner?.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {owner?.contact && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {owner.contact}
                        </span>
                      )}
                      {owner?.email && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {owner.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <MobileStat value={String(patientsData.length)} label="Mascotas" />
                  <MobileStat
                    value={formatCurrency(owner?.creditBalance || 0)}
                    label="Crédito"
                    valueColor={(owner?.creditBalance || 0) >= 0 ? 'text-emerald-500' : 'text-danger-500'}
                  />
                  <MobileStat
                    value={formatCurrency(debtInfo.totalDebt)}
                    label="Deuda"
                    valueColor={debtInfo.totalDebt > 0 ? 'text-danger-500' : 'text-emerald-500'}
                  />
                </div>
              </div>

              <div className="p-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all
                      ${activeTab === tab.id
                        ? 'bg-biovet-50 dark:bg-biovet-950/30 text-biovet-600 dark:text-biovet-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-surface-50 dark:hover:bg-dark-100'
                      }
                    `}
                  >
                    <span className="flex items-center gap-3">
                      {tab.label}
                      {tab.id === 'transacciones' && debtInfo.pendingCount > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-danger-500 text-white rounded-full">
                          {debtInfo.pendingCount}
                        </span>
                      )}
                    </span>
                    <ChevronRight className={`w-4 h-4 ${activeTab === tab.id ? 'text-biovet-500' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>

              <div className="px-4 py-3 border-t border-surface-100 dark:border-slate-800 flex gap-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); setActiveTab('general'); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-surface-50 dark:bg-dark-100 rounded-xl hover:bg-surface-100 transition-all"
                >
                  <Edit3 className="w-4 h-4" /> Editar
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); setShowDeleteModal(true); }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-danger-500 bg-danger-50 dark:bg-danger-950/30 rounded-xl hover:bg-danger-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ============================================
            CONTENT - Scroll solo aquí
            ============================================ */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-4 sm:p-6 pb-20 lg:pb-6 space-y-4 sm:space-y-6">

            {/* Cards financieras (solo cuando NO es tab general) */}
            {activeTab !== 'general' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className={`rounded-xl p-4 border ${
                  debtInfo.totalDebt > 0
                    ? 'bg-danger-50 dark:bg-danger-950/20 border-danger-200 dark:border-danger-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      debtInfo.totalDebt > 0
                        ? 'bg-danger-100 dark:bg-danger-900/30 text-danger-500'
                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500'
                    }`}>
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Deuda</span>
                  </div>
                  <p className={`text-xl sm:text-2xl font-black ${
                    debtInfo.totalDebt > 0 ? 'text-danger-600 dark:text-danger-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {formatCurrency(debtInfo.totalDebt)}
                  </p>
                  {debtInfo.pendingCount > 0 && (
                    <p className="text-[11px] text-danger-500 font-semibold mt-1">
                      {debtInfo.pendingCount} factura{debtInfo.pendingCount !== 1 ? 's' : ''} pendiente{debtInfo.pendingCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-surface-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Pagado</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalPaid)}
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">
                    {invoices.length} factura{invoices.length !== 1 ? 's' : ''} total{invoices.length !== 1 ? 'es' : ''}
                  </p>
                </div>

                <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-surface-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      (owner?.creditBalance || 0) >= 0
                        ? 'bg-biovet-50 dark:bg-biovet-950/30 text-biovet-500'
                        : 'bg-danger-50 dark:bg-danger-950/30 text-danger-500'
                    }`}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Crédito</span>
                  </div>
                  <p className={`text-xl sm:text-2xl font-black ${
                    (owner?.creditBalance || 0) >= 0
                      ? 'text-biovet-600 dark:text-biovet-400'
                      : 'text-danger-600 dark:text-danger-400'
                  }`}>
                    {formatCurrency(owner?.creditBalance || 0)}
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Saldo disponible</p>
                </div>

                <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-surface-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-500">
                      <PawPrint className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Mascotas</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
                    {patientsData.length}
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">
                    Registrada{patientsData.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Alerta de deuda */}
            {debtInfo.totalDebt > 0 && activeTab !== 'transacciones' && activeTab !== 'general' && (
              <div className="flex items-center gap-3 px-4 py-3 bg-danger-50 dark:bg-danger-950/30 border border-danger-200 dark:border-danger-800 rounded-xl">
                <AlertTriangleIcon className="w-5 h-5 text-danger-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-danger-700 dark:text-danger-400">
                    {debtInfo.pendingCount} factura{debtInfo.pendingCount !== 1 ? 's' : ''} pendiente{debtInfo.pendingCount !== 1 ? 's' : ''} · {formatCurrency(debtInfo.totalDebt)}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('transacciones')}
                  className="shrink-0 text-xs font-bold text-danger-600 dark:text-danger-400 hover:text-danger-700 underline underline-offset-2"
                >
                  Ver
                </button>
              </div>
            )}

            {/* Botón agregar mascota - Solo en tab mascotas, antes del contenido */}
            {activeTab === 'mascotas' && (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                    Mascotas
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {patientsData.length} registrada{patientsData.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={handleAddPatient}
                  className="btn-primary py-2.5! px-4! text-xs! gap-1.5!"
                >
                  <CirclePlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Agregar </span>
                  <span className="sm:hidden">Agregar</span>
                </button>
              </div>
            )}

            {/* Tab content */}
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* ============================================
          MODAL ELIMINAR
          ============================================ */}
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

// ==================== SUB-COMPONENTES ====================

function MobileStat({
  value,
  label,
  valueColor = 'text-slate-800 dark:text-white',
}: {
  value: string;
  label: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-surface-50 dark:bg-dark-100 rounded-xl p-2.5 text-center">
      <p className={`text-sm font-bold leading-tight ${valueColor}`}>{value}</p>
      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{label}</p>
    </div>
  );
}

// ==================== SKELETON ====================
function OwnerDetailSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 bg-white dark:bg-dark-200 border-b border-surface-200 dark:border-slate-800">
        <div className="px-4 sm:px-6">
          <div className="flex items-center gap-3 h-14 sm:h-16 animate-pulse">
            <div className="w-9 h-9 bg-surface-200 dark:bg-slate-700 rounded-xl shrink-0" />
            <div className="w-9 h-9 bg-surface-200 dark:bg-slate-700 rounded-full shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-4 w-28 bg-surface-200 dark:bg-slate-700 rounded mb-1" />
              <div className="h-3 w-40 bg-surface-100 dark:bg-slate-800 rounded hidden sm:block" />
            </div>
          </div>
          <div className="hidden sm:flex gap-4 pb-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-20 bg-surface-100 dark:bg-slate-800 rounded" />
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-surface-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-3 w-12 bg-surface-100 dark:bg-slate-800 rounded" />
              </div>
              <div className="h-7 w-20 bg-surface-200 dark:bg-slate-700 rounded mb-1" />
              <div className="h-3 w-24 bg-surface-100 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6 animate-pulse">
          <div>
            <div className="h-5 w-20 bg-surface-200 dark:bg-slate-700 rounded mb-1" />
            <div className="h-3 w-24 bg-surface-100 dark:bg-slate-800 rounded" />
          </div>
          <div className="h-10 w-36 bg-surface-200 dark:bg-slate-700 rounded-lg" />
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-800 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-surface-200 dark:bg-slate-700 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-24 bg-surface-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-32 bg-surface-100 dark:bg-slate-800 rounded" />
                    <div className="flex gap-2">
                      <div className="h-5 w-14 bg-surface-100 dark:bg-slate-800 rounded-md" />
                      <div className="h-5 w-6 bg-surface-100 dark:bg-slate-800 rounded-md" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-surface-100 dark:border-slate-800">
                  <div className="h-3 w-16 bg-surface-100 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-12 bg-surface-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}