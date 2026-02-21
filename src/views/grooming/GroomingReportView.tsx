// src/views/reports/GroomingReportView.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { getAllGroomingServices } from "@/api/groomingAPI";
import { getInvoices } from "@/api/invoiceAPI";
import Spinner from "@/components/Spinner";
import type { Invoice } from "@/types/invoice";
import type { GroomingService } from "@/types/grooming";
import { GroomingReportSummary } from "./GroomingSummary";
import { GroomingReportMetrics } from "@/components/grooming/GroomingReportMetrics";
import { GroomingReportTable } from "./GroomingReportTable";

interface PaymentInfo {
  paymentStatus: string;
  amountPaidUSD: number;
  amountPaidBs: number;
  exchangeRate: number;
  isPaid: boolean;
}

export interface EnrichedGroomingService extends GroomingService {
  paymentInfo: PaymentInfo;
  ownerName: string;
  ownerPhone: string;
  patientName: string;
}

export default function GroomingReportView() {
  const navigate = useNavigate();

  const {
    data: services = [],
    isLoading: isLoadingServices,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["groomingServices"],
    queryFn: getAllGroomingServices,
    retry: 2,
  });

  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["invoices", "groomingReport"],
    queryFn: () => getInvoices({ limit: 10000 }),
  });

  const invoices = (invoicesData?.invoices || []) as Invoice[];
  const isLoading = isLoadingServices || isLoadingInvoices;

  const findInvoiceForService = (serviceId: string): Invoice | undefined => {
    return invoices.find((invoice) =>
      invoice.items?.some(
        (item) => item.type === "grooming" && item.resourceId === serviceId
      )
    );
  };

  const getPaymentInfo = (service: GroomingService): PaymentInfo => {
    const invoice = findInvoiceForService(service._id!);

    if (!invoice) {
      return {
        paymentStatus: "Sin facturar",
        amountPaidUSD: 0,
        amountPaidBs: 0,
        exchangeRate: 1,
        isPaid: false,
      };
    }

    return {
      paymentStatus: invoice.paymentStatus,
      amountPaidUSD: invoice.amountPaidUSD || 0,
      amountPaidBs: invoice.amountPaidBs || 0,
      exchangeRate: invoice.exchangeRate || 1,
      isPaid: invoice.paymentStatus === "Pagado",
    };
  };

  const getPatientData = (
    patientId: GroomingService["patientId"]
  ): { patientName: string; ownerName: string; ownerPhone: string } => {
    if (!patientId || typeof patientId === "string") {
      return { patientName: "—", ownerName: "—", ownerPhone: "" };
    }

    const patientName = patientId.name || "—";
    let ownerName = "—";
    let ownerPhone = "";

    if (patientId.owner) {
      if (typeof patientId.owner === "string") {
        ownerName = "Propietario";
      } else if (patientId.owner !== null) {
        ownerName = patientId.owner.name || "—";
        ownerPhone = patientId.owner.contact || "";
      }
    }

    return { patientName, ownerName, ownerPhone };
  };

  const enrichedServices: EnrichedGroomingService[] = useMemo(() => {
    return services.map((service: GroomingService) => {
      const paymentInfo = getPaymentInfo(service);
      const { patientName, ownerName, ownerPhone } = getPatientData(
        service.patientId
      );

      return {
        ...service,
        paymentInfo,
        patientName,
        ownerName,
        ownerPhone,
      };
    });
  }, [services, invoices]);

  if (isLoading) return <Spinner fullScreen size="xl" />;

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-100 dark:bg-dark-300">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 bg-danger-50 dark:bg-danger-950 rounded-full flex items-center justify-center border border-danger-200 dark:border-danger-800">
            <AlertCircle className="w-7 h-7 text-danger-500" />
          </div>
          <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
            Error al cargar el reporte
          </p>
          <p className="text-surface-500 dark:text-slate-400 text-xs mb-3">
            No se pudieron cargar los datos del reporte
          </p>
          <button onClick={() => refetch()} className="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-100 dark:bg-dark-300">
      {/* HEADER FIJO */}
      <div className="shrink-0 px-4 sm:px-8 pt-4 sm:pt-6 pb-0 space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-surface-400 hover:text-surface-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white leading-tight">
                Reporte de Peluquería
              </h1>
              <p className="text-[13px] text-biovet-500 font-medium">
                {enrichedServices.length} servicio
                {enrichedServices.length !== 1 ? "s" : ""} registrado
                {enrichedServices.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-icon-neutral"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="border border-biovet-200/50 dark:border-biovet-800/30" />
      </div>

      {/* CONTENIDO SCROLLEABLE */}
      <div className="flex-1 overflow-auto custom-scrollbar px-4 sm:px-8 py-4 sm:py-6 pb-24 lg:pb-8 space-y-5">
        <GroomingReportSummary services={enrichedServices} />
        <GroomingReportMetrics services={enrichedServices} />
        <GroomingReportTable services={enrichedServices} />
      </div>
    </div>
  );
}