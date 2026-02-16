// src/views/grooming/GroomingServicesView.tsx

import { useState, useMemo, type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Scissors,
  AlertCircle,
  Plus,
  Search,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { getAllGroomingServices } from "../../api/groomingAPI";
import { getInvoices } from "../../api/invoiceAPI";
import { Link } from "react-router-dom";
import ServiceStatsCards from "../../components/grooming/ServiceStatsCards";
import ServiceMobileCards from "../../components/grooming/ServiceMobileCards";
import ServiceTable from "../../components/grooming/ServiceTable";
import type { Invoice } from "../../types/invoice";
import type { GroomingService } from "../../types/grooming";

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

export default function GroomingServicesView() {
  const [searchTerm, setSearchTerm] = useState("");

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

  const formatCurrency = (amount: number, currency: string): string => {
    if (currency === "Bs") {
      return `Bs. ${amount.toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `$${amount.toFixed(2)}`;
  };

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

  const getServiceIcon = (serviceType: string): string => {
    const icons: Record<string, string> = {
      Corte: "✂️",
      Baño: "🛁",
      "Corte y Baño": "✨",
    };
    return icons[serviceType] || "🐾";
  };

  const getPaymentStatusBadge = (status: string): string => {
    const styles: Record<string, string> = {
      Pendiente: "badge badge-warning",
      Pagado: "badge badge-success",
      Parcial: "badge badge-biovet",
      Cancelado: "badge badge-danger",
      "Sin facturar": "badge badge-neutral",
    };
    return styles[status] || "badge badge-neutral";
  };

  const getPaymentStatusIcon = (status: string): ReactElement => {
    switch (status) {
      case "Pagado":
        return (
          <CheckCircle className="w-3 h-3 text-success-500 dark:text-success-400" />
        );
      case "Pendiente":
        return (
          <Clock className="w-3 h-3 text-warning-500 dark:text-warning-400" />
        );
      case "Parcial":
        return (
          <AlertTriangle className="w-3 h-3 text-biovet-500 dark:text-biovet-400" />
        );
      case "Cancelado":
        return (
          <XCircle className="w-3 h-3 text-danger-500 dark:text-danger-400" />
        );
      case "Sin facturar":
        return (
          <AlertCircle className="w-3 h-3 text-surface-500 dark:text-slate-400" />
        );
      default:
        return (
          <Clock className="w-3 h-3 text-surface-500 dark:text-slate-400" />
        );
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

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

  const incomeStats = useMemo(() => {
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

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState error={error as Error} />;

  return (
    <>
      <Header
        totalsCount={filteredServices.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div className="h-32 lg:h-28"></div>

      <div className="px-4 mt-10 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12 transition-colors duration-300">
        <ServiceStatsCards
          filteredServices={filteredServices}
          incomeStats={incomeStats}
        />

        {filteredServices.length === 0 ? (
          <EmptyState searchTerm={searchTerm} />
        ) : (
          <>
            <ServiceMobileCards
              filteredServices={filteredServices}
              getPatientName={getPatientName}
              getPatientSpecies={getPatientSpecies}
              getPatientBreed={getPatientBreed}
              formatDate={formatDate}
              getServiceIcon={getServiceIcon}
              getPaymentStatusBadge={getPaymentStatusBadge}
              getPaymentStatusIcon={getPaymentStatusIcon}
              formatCurrency={formatCurrency}
            />

            <ServiceTable
              filteredServices={filteredServices}
              getPatientName={getPatientName}
              getPatientSpecies={getPatientSpecies}
              getPatientBreed={getPatientBreed}
              formatDate={formatDate}
              getServiceIcon={getServiceIcon}
              getPaymentStatusBadge={getPaymentStatusBadge}
              getPaymentStatusIcon={getPaymentStatusIcon}
              formatCurrency={formatCurrency}
            />
          </>
        )}
      </div>
    </>
  );
}

// ==========================================
// LoadingState
// ==========================================
function LoadingState() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-biovet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-surface-800 dark:text-slate-200 font-medium">
            Cargando servicios...
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ErrorState
// ==========================================
function ErrorState({ error }: { error: Error }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center h-[70vh]">
        <div
          className="bg-white dark:bg-dark-100 
                        p-8 rounded-2xl 
                        border border-danger-200 dark:border-danger-800 
                        text-center max-w-md mx-auto shadow-sm"
        >
          <AlertCircle className="w-16 h-16 mx-auto text-danger-500 dark:text-danger-400 mb-4" />
          <h2 className="text-2xl font-bold text-surface-800 dark:text-white mb-3">
            Error al cargar servicios
          </h2>
          <p className="text-surface-500 dark:text-slate-400 mb-6">
            {error.message || "Error desconocido"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// EmptyState
// ==========================================
function EmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <div
      className="bg-white dark:bg-dark-100 
                    rounded-2xl p-12 text-center 
                    border border-surface-300 dark:border-slate-700 
                    shadow-sm"
    >
      <Scissors className="w-16 h-16 text-surface-400 dark:text-slate-600 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-surface-800 dark:text-white mb-3">
        {searchTerm ? "No hay resultados" : "No hay servicios hoy"}
      </h3>
      <p className="text-surface-500 dark:text-slate-400 mb-6">
        {searchTerm
          ? "Intenta con otros términos de búsqueda"
          : "No se encontraron servicios programados para hoy"}
      </p>
      {!searchTerm && (
        <Link to="/patients" className="btn-primary">
          <Plus className="w-5 h-5" />
          Crear Primer Servicio
        </Link>
      )}
    </div>
  );
}

// ==========================================
// Header
// ==========================================
function Header({
  totalsCount,
  searchTerm,
  setSearchTerm,
}: {
  totalsCount: number;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}) {
  return (
    <div
      className="fixed top-15 left-0 right-0 lg:left-64 z-30 
                    bg-white dark:bg-dark-100 
                    border-b border-surface-300 dark:border-slate-700 
                    shadow-sm transition-colors duration-300"
    >
      <div className="px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Link
              to="/"
              className="flex items-center justify-center 
                         w-9 h-9 rounded-lg 
                         bg-surface-50 dark:bg-dark-200 
                         hover:bg-surface-100 dark:hover:bg-dark-50 
                         text-biovet-500 dark:text-biovet-400 
                         transition-colors shrink-0 
                         border border-surface-300 dark:border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div
                  className="hidden sm:block p-2 
                                bg-biovet-50 dark:bg-biovet-950 
                                border border-biovet-200 dark:border-biovet-800 
                                rounded-lg"
                >
                  <Scissors className="w-5 h-5 text-biovet-500 dark:text-biovet-400" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-surface-800 dark:text-white">
                    Peluquería
                  </h1>
                  <p className="text-xs sm:text-sm text-surface-500 dark:text-slate-400">
                    {totalsCount} servicios hoy
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            {/* Mobile */}
            <Link
              to="/patients"
              className="sm:hidden btn-primary w-10 h-10 p-0! rounded-lg!"
            >
              <Plus className="w-5 h-5" />
            </Link>
            {/* Desktop */}
            <Link
              to="/patients"
              className="hidden sm:inline-flex btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Servicio</span>
            </Link>
          </div>
        </div>

        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 dark:text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}