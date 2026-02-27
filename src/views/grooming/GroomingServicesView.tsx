// src/views/grooming/GroomingServicesView.tsx

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Scissors, AlertCircle, Plus, RefreshCw } from "lucide-react";

import { getAllGroomingServices } from "@/api/groomingAPI";
import { getInvoices } from "@/api/invoiceAPI";
import { createPayment } from "@/api/paymentAPI";

import Spinner from "@/components/Spinner";
import { GroomingListHeader } from "@/components/grooming/GroomingListHeader";
import { GroomingStats } from "@/components/grooming/GroomingStats";
import { GroomingFilters } from "@/components/grooming/GroomingFilters";
import { GroomingTable } from "@/components/grooming/GroomingTable";
import { GroomingMobileCard } from "@/components/grooming/GroomingMobileCard";
import EditGroomingServiceModal from "@/components/grooming/EditGroomingServiceModal";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { toast } from "@/components/Toast";

import type { Invoice } from "@/types/invoice";
import type { GroomingService } from "@/types/grooming";

// ══════════════════════════════════════════
// TIPOS
// ══════════════════════════════════════════

interface PaymentInfo {
  paymentStatus: string;
  paymentMethod: string | null;
  paymentReference: string | null;
  amountPaid: number;
  amountPaidInCurrency: number;
  currency: string;
  exchangeRate?: number;
  isPaid: boolean;
}

interface EnrichedGroomingService extends GroomingService {
  paymentInfo: PaymentInfo;
}

type PatientField = GroomingService["patientId"];

interface IncomeStats {
  totalUSD: number;
  totalBs: number;
  paidUSD: number;
  paidBs: number;
  pendingUSD: number;
  pendingBs: number;
  hasBsTransactions: boolean;
  hasUSDTransactions: boolean;
}

// ══════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════

export default function GroomingServicesView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [editingService, setEditingService] = useState<EnrichedGroomingService | null>(null);
  
  // Estados para el modal de pago
  const [paymentService, setPaymentService] = useState<EnrichedGroomingService | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  // ══════════════════════════════════════════
  // QUERIES
  // ══════════════════════════════════════════

  const {
    data: services = [],
    isLoading: isLoadingServices,
    isError,
    error,
  } = useQuery({
    queryKey: ["groomingServices"],
    queryFn: getAllGroomingServices,
    retry: 2,
  });

  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => getInvoices({}),
  });

  const invoices = invoicesData?.invoices || [];
  const isLoading = isLoadingServices || isLoadingInvoices;

  // ══════════════════════════════════════════
  // MUTACIÓN DE PAGO
  // ══════════════════════════════════════════

  const paymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groomingServices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Pago registrado", "El pago se procesó correctamente");
      setPaymentService(null);
      setPaymentInvoice(null);
    },
    onError: (err: Error) => {
      toast.error("Error", err.message || "No se pudo registrar el pago");
    },
  });

  // ══════════════════════════════════════════
  // FUNCIONES HELPER - INVOICE
  // ══════════════════════════════════════════

  const findInvoiceForService = (serviceId: string): Invoice | undefined => {
    return invoices.find((invoice) =>
      invoice.items.some(
        (item) => item.type === "grooming" && item.resourceId === serviceId
      )
    );
  };

  const getPaymentInfo = (service: GroomingService): PaymentInfo => {
    const invoice = findInvoiceForService(service._id!);

    if (!invoice) {
      return {
        paymentStatus: "Sin facturar",
        paymentMethod: null,
        paymentReference: null,
        amountPaid: 0,
        amountPaidInCurrency: 0,
        currency: "USD",
        isPaid: false,
      };
    }

    const serviceItem = invoice.items.find(
      (item) => item.type === "grooming" && item.resourceId === service._id
    );

    const serviceAmount = serviceItem
      ? serviceItem.cost * serviceItem.quantity
      : 0;

    let amountPaid = 0;
    let amountPaidInCurrency = 0;

    if (invoice.amountPaid && invoice.amountPaid > 0 && invoice.total > 0) {
      const proportion = serviceAmount / invoice.total;
      amountPaid = invoice.amountPaid * proportion;

      if (invoice.currency === "Bs" && invoice.exchangeRate) {
        amountPaidInCurrency = amountPaid * invoice.exchangeRate;
      } else {
        amountPaidInCurrency = amountPaid;
      }
    }

    return {
      paymentStatus: invoice.paymentStatus,
      paymentMethod: invoice.paymentMethod
        ? String(invoice.paymentMethod)
        : null,
      paymentReference: invoice.paymentReference || null,
      amountPaid: amountPaid,
      amountPaidInCurrency: amountPaidInCurrency,
      currency: invoice.currency || "USD",
      exchangeRate: invoice.exchangeRate,
      isPaid: invoice.paymentStatus === "Pagado",
    };
  };

  // ══════════════════════════════════════════
  // FUNCIONES HELPER - PACIENTE
  // ══════════════════════════════════════════

  const getPatientName = (patientId: PatientField): string => {
    if (!patientId) return "—";
    if (typeof patientId === "string") return "Mascota";
    return patientId.name || "Mascota";
  };

  const getPatientSpecies = (patientId: PatientField): string => {
    if (!patientId || typeof patientId === "string") return "";
    return patientId.species || "";
  };

  const getPatientBreed = (patientId: PatientField): string => {
    if (!patientId || typeof patientId === "string") return "";
    return patientId.breed || "";
  };

  const getOwnerInfo = (patientId: PatientField): { name: string; phone?: string } => {
    if (!patientId || typeof patientId === "string") {
      return { name: "Propietario" };
    }
    if (patientId.owner && typeof patientId.owner === "object") {
      return {
        name: patientId.owner.name || "Propietario",
        phone: patientId.owner.contact,
      };
    }
    return { name: "Propietario" };
  };

  // ══════════════════════════════════════════
  // FUNCIONES HELPER - FORMATO
  // ══════════════════════════════════════════

  const formatCurrency = (amount: number, currency: string): string => {
    if (currency === "Bs") {
      return `Bs. ${amount.toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // ══════════════════════════════════════════
  // HANDLER DE PAGO
  // ══════════════════════════════════════════

  const handleOpenPayment = (service: EnrichedGroomingService) => {
    const invoice = findInvoiceForService(service._id!);
    if (!invoice) {
      toast.warning("Sin factura", "Este servicio no tiene factura asociada");
      return;
    }
    setPaymentService(service);
    setPaymentInvoice(invoice);
  };

  const handleConfirmPayment = async (paymentData: {
    paymentMethodId?: string;
    reference?: string;
    addAmountPaidUSD: number;
    addAmountPaidBs: number;
    exchangeRate: number;
    isPartial: boolean;
    creditAmountUsed?: number;
  }) => {
    if (!paymentInvoice) return;

    const isBsPayment = paymentData.addAmountPaidBs > 0;
    
    await paymentMutation.mutateAsync({
      invoiceId: paymentInvoice._id!,
      paymentMethod: paymentData.paymentMethodId,
      amount: isBsPayment ? paymentData.addAmountPaidBs : paymentData.addAmountPaidUSD,
      currency: isBsPayment ? "Bs" : "USD",
      exchangeRate: paymentData.exchangeRate,
      reference: paymentData.reference,
      creditAmountUsed: paymentData.creditAmountUsed,
    });
  };

  // ══════════════════════════════════════════
  // DATOS PROCESADOS
  // ══════════════════════════════════════════

  const enrichedServices: EnrichedGroomingService[] = useMemo(() => {
    return services.map((service: GroomingService) => ({
      ...service,
      paymentInfo: getPaymentInfo(service),
    }));
  }, [services, invoices]);

  const filteredServices: EnrichedGroomingService[] = useMemo(() => {
    if (!Array.isArray(enrichedServices)) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysServices = enrichedServices.filter(
      (service: EnrichedGroomingService) => {
        if (!service.date) return false;

        const serviceDate = new Date(service.date);
        serviceDate.setHours(0, 0, 0, 0);
        return serviceDate.getTime() === today.getTime();
      }
    );

    if (!searchTerm) return todaysServices;

    return todaysServices.filter((service: EnrichedGroomingService) => {
      const searchLower = searchTerm.toLowerCase();
      const patientName = getPatientName(service.patientId).toLowerCase();
      const serviceName = service.service.toLowerCase();
      const specs = service.specifications.toLowerCase();
      return (
        patientName.includes(searchLower) ||
        serviceName.includes(searchLower) ||
        specs.includes(searchLower)
      );
    });
  }, [enrichedServices, searchTerm]);

  const incomeStats: IncomeStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayGroomingInvoices = invoices.filter((invoice) => {
      if (!invoice.date) return false;

      const invoiceDate = new Date(invoice.date);
      invoiceDate.setHours(0, 0, 0, 0);

      const isToday = invoiceDate.getTime() === today.getTime();
      const hasGrooming = invoice.items.some(
        (item) => item.type === "grooming"
      );

      return isToday && hasGrooming;
    });

    let paidUSD = 0;
    let paidBs = 0;
    let pendingUSD = 0;

    todayGroomingInvoices.forEach((invoice) => {
      paidUSD += invoice.amountPaidUSD || 0;
      paidBs += invoice.amountPaidBs || 0;

      const totalPaidInUSD =
        (invoice.amountPaidUSD || 0) +
        (invoice.exchangeRate
          ? (invoice.amountPaidBs || 0) / invoice.exchangeRate
          : 0);

      const pending = invoice.total - totalPaidInUSD;
      if (pending > 0) pendingUSD += pending;
    });

    const totalServicesValue = filteredServices.reduce(
      (sum, service) => sum + (service.cost || 0),
      0
    );

    return {
      totalUSD: totalServicesValue,
      totalBs: 0,
      paidUSD,
      paidBs,
      pendingUSD,
      pendingBs: 0,
      hasBsTransactions: paidBs > 0,
      hasUSDTransactions: paidUSD > 0,
    };
  }, [invoices, filteredServices]);

  // ══════════════════════════════════════════
  // STATS CALCULADOS
  // ══════════════════════════════════════════

  const completedServices = filteredServices.filter(
    (s) => s.paymentInfo.paymentStatus === "Pagado"
  ).length;

  const hasActiveFilters = searchTerm.length > 0;

  const handleClearFilters = () => setSearchTerm("");

  // ══════════════════════════════════════════
  // LOADING STATE
  // ══════════════════════════════════════════

  if (isLoading) return <Spinner fullScreen size="xl" />;

  // ══════════════════════════════════════════
  // ERROR STATE
  // ══════════════════════════════════════════

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-100 dark:bg-dark-300">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 bg-danger-50 dark:bg-danger-950 rounded-full flex items-center justify-center border border-danger-200 dark:border-danger-800">
            <AlertCircle className="w-7 h-7 text-danger-500" />
          </div>
          <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
            Error al cargar servicios
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">
            {(error as Error)?.message || "No se pudieron cargar los servicios"}
          </p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // DATOS PARA EL MODAL DE PAGO
  // ══════════════════════════════════════════

  const paymentModalData = useMemo(() => {
    if (!paymentService || !paymentInvoice) return null;

    const remainingAmount = paymentInvoice.total - (paymentInvoice.amountPaid || 0);
    const ownerInfo = getOwnerInfo(paymentService.patientId);

    return {
      amountUSD: remainingAmount,
      services: [{
        description: paymentService.service,
        quantity: 1,
        unitPrice: paymentService.cost,
        total: paymentService.cost,
      }],
      patient: {
        name: getPatientName(paymentService.patientId),
      },
      owner: ownerInfo,
    };
  }, [paymentService, paymentInvoice]);

  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════

  const totalCountText = `${filteredServices.length} servicio${filteredServices.length !== 1 ? "s" : ""} hoy`;

  return (
    <div className="flex flex-col h-full bg-surface-100 dark:bg-dark-300">
      {/* ════════════════════════════════════
          HEADER FIJO
          ════════════════════════════════════ */}
      <div className="shrink-0 px-4 sm:px-8 pt-4 sm:pt-6 pb-0 space-y-4 sm:space-y-5">
        <GroomingListHeader
          totalCount={totalCountText}
          onBack={() => navigate(-1)}
        />

        <GroomingStats
          totalServices={filteredServices.length}
          completedServices={completedServices}
          incomeStats={incomeStats}
        />

        <GroomingFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* ════════════════════════════════════
          CONTENIDO SCROLLEABLE
          ════════════════════════════════════ */}
      <div className="flex-1 overflow-hidden px-4 sm:px-8 pb-4 sm:pb-8 pt-4">
        <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm h-full flex flex-col overflow-hidden">
          {filteredServices.length === 0 ? (
            /* ══════════════════════════════
               EMPTY STATE
               ══════════════════════════════ */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-surface-100 dark:bg-dark-200 rounded-full flex items-center justify-center border border-surface-300 dark:border-slate-700">
                  <Scissors className="w-7 h-7 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
                  {hasActiveFilters ? "Sin resultados" : "No hay servicios hoy"}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">
                  {hasActiveFilters
                    ? "Prueba con otros términos de búsqueda"
                    : "No hay servicios programados para hoy"}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-biovet-500 hover:bg-biovet-50 dark:hover:bg-biovet-950 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Limpiar filtros
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/patients")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-biovet-500 text-white text-sm font-semibold rounded-lg hover:bg-biovet-600 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Primer Servicio
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* ══════════════════════════════
                  DESKTOP TABLE
                  ══════════════════════════════ */}
              <GroomingTable
                services={filteredServices}
                getPatientName={getPatientName}
                getPatientSpecies={getPatientSpecies}
                getPatientBreed={getPatientBreed}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                onEdit={setEditingService}
                onPayment={handleOpenPayment}
              />

              {/* ══════════════════════════════
                  MOBILE CARDS
                  ══════════════════════════════ */}
              <div className="lg:hidden flex-1 overflow-auto custom-scrollbar divide-y divide-surface-200 dark:divide-slate-700/50">
                {filteredServices.map((service) => (
                  <GroomingMobileCard
                    key={service._id}
                    service={service}
                    getPatientName={getPatientName}
                    getPatientSpecies={getPatientSpecies}
                    getPatientBreed={getPatientBreed}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    onEdit={() => setEditingService(service)}
                    onPayment={() => handleOpenPayment(service)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════
          EDIT MODAL
          ════════════════════════════════════ */}
      {editingService && (
        <EditGroomingServiceModal
          isOpen={!!editingService}
          onClose={() => setEditingService(null)}
          service={editingService}
        />
      )}

      {/* ════════════════════════════════════
          PAYMENT MODAL
          ════════════════════════════════════ */}
      {paymentModalData && (
        <PaymentModal
          isOpen={!!paymentService}
          onClose={() => {
            setPaymentService(null);
            setPaymentInvoice(null);
          }}
          onConfirm={handleConfirmPayment}
          amountUSD={paymentModalData.amountUSD}
          services={paymentModalData.services}
          patient={paymentModalData.patient}
          owner={paymentModalData.owner}
          title="Cobrar Servicio"
          allowPartial={true}
        />
      )}
    </div>
  );
}