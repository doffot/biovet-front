// src/views/dashboard/hooks/useDashboardData.ts
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  QUERY_CONFIG,
  QUERY_CONFIG_EXTENDED,
  EMPTY_CURRENCY,
  type CurrencyAmounts,
} from "../constants/dashboardConstants";

import type { Vaccination } from "../types/vaccination";
import type { Deworming } from "../types/deworming";
import type { Invoice } from "../types/invoice";
import type { Appointment, Owner } from "../types/appointment";
import { getAllAppointments } from "../api/appointmentAPI";
import { getAllGroomingServices } from "../api/groomingAPI";
import type { Consultation } from "../types/consultation";
import { getAllConsultations } from "../api/consultationAPI";
import { getAllVaccinations } from "../api/vaccinationAPI";
import { getAllDewormings } from "../api/dewormingAPI";
import { getInvoices } from "../api/invoiceAPI";
import { getPatients } from "../api/patientAPI";
import { getOwners } from "../api/OwnerAPI";
import type { Patient } from "@/types/patient";
import type { GroomingService } from "@/types/grooming";
import { formatShortDay, getDatePart, getDaysAgoString, getDaysFromNowString, getDaysLeft, getTodayDateString } from "@/utils/dashboardUtils";


// Tipos enriquecidos con datos relacionados
export interface VaccinationWithDaysLeft extends Vaccination {
  daysLeft: number;
  patientData?: Patient;
  ownerData?: Owner;
}

export interface DewormingWithDaysLeft extends Deworming {
  daysLeft: number;
  patientData?: Patient;
  ownerData?: Owner;
}

export interface ChartDataItem {
  name: string;
  value: number;
}

export interface RevenueChartItem {
  day: string;
  USD: number;
  Bs: number;
  totalUSD: number;
}

// Tipo extendido con total en USD
export interface RevenueAmounts extends CurrencyAmounts {
  totalUSD: number;
  bsInUSD: number;
}

// Re-exportar para uso en componentes
export type { CurrencyAmounts };

/**
 * Calcula ingresos por moneda de un array de facturas
 * Incluye el total en USD (USD + Bs convertido)
 */
function calculateRevenue(invoices: Invoice[]): RevenueAmounts {
  let totalUSD = 0;
  let totalBs = 0;
  let bsInUSD = 0;

  invoices.forEach((inv) => {
    const paidUSD = inv.amountPaidUSD || 0;
    const paidBs = inv.amountPaidBs || 0;
    const exchangeRate = inv.exchangeRate || 1;

    totalUSD += paidUSD;
    totalBs += paidBs;

    if (paidBs > 0 && exchangeRate > 0) {
      bsInUSD += paidBs / exchangeRate;
    }
  });

  return {
    USD: totalUSD,
    Bs: totalBs,
    bsInUSD,
    totalUSD: totalUSD + bsInUSD,
  };
}

/**
 * Calcula deuda pendiente por moneda
 */
function calculatePendingDebt(invoices: Invoice[]): CurrencyAmounts {
  return invoices
    .filter((inv) => inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial")
    .reduce(
      (acc, inv) => {
        const remainingTotal = inv.total - (inv.amountPaid || 0);

        if (inv.currency === "USD") {
          return {
            USD: acc.USD + remainingTotal,
            Bs: acc.Bs,
          };
        } else {
          return {
            USD: acc.USD,
            Bs: acc.Bs + remainingTotal,
          };
        }
      },
      { ...EMPTY_CURRENCY }
    );
}

/**
 * Helper para extraer ID de una referencia (puede ser string o objeto con _id)
 */
function extractId(ref: string | { _id: string } | undefined | null): string | undefined {
  if (!ref) return undefined;
  if (typeof ref === "string") return ref;
  return ref._id;
}

export function useDashboardData() {
  // ========== QUERIES ==========
  const appointmentsQuery = useQuery<Appointment[]>({
    queryKey: ["dashboard", "appointments"],
    queryFn: getAllAppointments,
    ...QUERY_CONFIG,
  });

  const groomingQuery = useQuery<GroomingService[]>({
    queryKey: ["dashboard", "grooming"],
    queryFn: getAllGroomingServices,
    ...QUERY_CONFIG,
  });

  const consultationsQuery = useQuery<Consultation[]>({
    queryKey: ["dashboard", "consultations"],
    queryFn: getAllConsultations,
    ...QUERY_CONFIG,
  });

  const vaccinationsQuery = useQuery<Vaccination[]>({
    queryKey: ["dashboard", "vaccinations"],
    queryFn: getAllVaccinations,
    ...QUERY_CONFIG,
  });

  const dewormingsQuery = useQuery<Deworming[]>({
    queryKey: ["dashboard", "dewormings"],
    queryFn: getAllDewormings,
    ...QUERY_CONFIG,
  });

  const invoicesQuery = useQuery({
    queryKey: ["dashboard", "invoices"],
    queryFn: () => getInvoices({ limit: 10000 }),
    ...QUERY_CONFIG,
  });

  const patientsQuery = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: getPatients,
    ...QUERY_CONFIG_EXTENDED,
  });

  const ownersQuery = useQuery<Owner[]>({
    queryKey: ["owners"],
    queryFn: getOwners,
    ...QUERY_CONFIG_EXTENDED,
  });

  // Extraer datos
  const appointments = appointmentsQuery.data ?? [];
  const groomingServices = groomingQuery.data ?? [];
  const consultations = consultationsQuery.data ?? [];
  const vaccinations = vaccinationsQuery.data ?? [];
  const dewormings = dewormingsQuery.data ?? [];
  const invoices = (invoicesQuery.data?.invoices ?? []) as Invoice[];
  const patients = patientsQuery.data ?? [];
  const owners = ownersQuery.data ?? [];

  // Loading states
  const isFirstLoad =
    appointmentsQuery.isLoading &&
    groomingQuery.isLoading &&
    consultationsQuery.isLoading &&
    vaccinationsQuery.isLoading &&
    dewormingsQuery.isLoading &&
    invoicesQuery.isLoading &&
    patientsQuery.isLoading &&
    ownersQuery.isLoading;

  // Fecha de hoy en formato YYYY-MM-DD
  const todayStr = useMemo(() => getTodayDateString(), []);

  // ========== MÉTRICAS DE HOY ==========
  const todayAppointments = useMemo(
    () => appointments.filter((apt) => getDatePart(apt.date) === todayStr),
    [appointments, todayStr]
  );

  const todayGrooming = useMemo(
    () => groomingServices.filter((svc) => getDatePart(svc.date) === todayStr),
    [groomingServices, todayStr]
  );

  const todayConsultations = useMemo(
    () => consultations.filter((c) => getDatePart(c.consultationDate) === todayStr),
    [consultations, todayStr]
  );

  // ========== INGRESOS (Multi-moneda con total) ==========
  const todayInvoices = useMemo(
    () => invoices.filter((inv) => getDatePart(inv.date) === todayStr),
    [invoices, todayStr]
  );

  const todayRevenue = useMemo(() => calculateRevenue(todayInvoices), [todayInvoices]);

  const weekInvoices = useMemo(() => {
    const weekAgo = getDaysAgoString(7);
    return invoices.filter((inv) => getDatePart(inv.date) >= weekAgo);
  }, [invoices]);

  const weekRevenue = useMemo(() => calculateRevenue(weekInvoices), [weekInvoices]);

  const monthInvoices = useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    return invoices.filter((inv) => getDatePart(inv.date) >= firstDayOfMonth);
  }, [invoices]);

  const monthRevenue = useMemo(() => calculateRevenue(monthInvoices), [monthInvoices]);

  // ========== DEUDAS (Multi-moneda) ==========
  const pendingDebt = useMemo(() => calculatePendingDebt(invoices), [invoices]);

  const pendingInvoicesCount = useMemo(
    () =>
      invoices.filter(
        (inv) => inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial"
      ).length,
    [invoices]
  );

  // ========== FACTURAS PENDIENTES (para el modal) ==========
  const pendingInvoices = useMemo(
    () =>
      invoices
        .filter(
          (inv) => inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial"
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [invoices]
  );

  // ========== MAPAS PARA BÚSQUEDA RÁPIDA ==========
  const patientsMap = useMemo(() => {
    const map = new Map<string, Patient>();
    patients.forEach((p) => map.set(p._id, p));
    return map;
  }, [patients]);

  const ownersMap = useMemo(() => {
    const map = new Map<string, Owner>();
    owners.forEach((o) => map.set(o._id, o));
    return map;
  }, [owners]);

  // ========== ALERTAS (próximos 7 días) - ENRIQUECIDAS ==========
  const upcomingVaccinations = useMemo((): VaccinationWithDaysLeft[] => {
    const nextWeek = getDaysFromNowString(7);

    return vaccinations
      .filter((v) => {
        if (!v.nextVaccinationDate) return false;
        const nextDate = getDatePart(v.nextVaccinationDate);
        return nextDate >= todayStr && nextDate <= nextWeek;
      })
      .map((v) => {
        // Buscar el paciente asociado
        const patientId = extractId(v.patientId);
        const patientData = patientId ? patientsMap.get(patientId) : undefined;

        // Buscar el dueño del paciente
        const ownerId = patientData ? extractId(patientData.owner) : undefined;
        const ownerData = ownerId ? ownersMap.get(ownerId) : undefined;

        return {
          ...v,
          daysLeft: getDaysLeft(v.nextVaccinationDate!),
          patientData,
          ownerData,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 10); // Aumentado a 10 para mostrar más alertas
  }, [vaccinations, patientsMap, ownersMap, todayStr]);

  const upcomingDewormings = useMemo((): DewormingWithDaysLeft[] => {
    const nextWeek = getDaysFromNowString(7);

    return dewormings
      .filter((d) => {
        if (!d.nextApplicationDate) return false;
        const nextDate = getDatePart(d.nextApplicationDate);
        return nextDate >= todayStr && nextDate <= nextWeek;
      })
      .map((d) => {
        // Buscar el paciente asociado
        const patientId = extractId(d.patientId);
        const patientData = patientId ? patientsMap.get(patientId) : undefined;

        // Buscar el dueño del paciente
        const ownerId = patientData ? extractId(patientData.owner) : undefined;
        const ownerData = ownerId ? ownersMap.get(ownerId) : undefined;

        return {
          ...d,
          daysLeft: getDaysLeft(d.nextApplicationDate!),
          patientData,
          ownerData,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 10); // Aumentado a 10 para mostrar más alertas
  }, [dewormings, patientsMap, ownersMap, todayStr]);

  // ========== DATOS PARA GRÁFICOS ==========
  const revenueChartData = useMemo((): RevenueChartItem[] => {
    const data: RevenueChartItem[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const dayInvoices = invoices.filter((inv) => getDatePart(inv.date) === dateStr);
      const dayRevenue = calculateRevenue(dayInvoices);

      data.push({
        day: formatShortDay(date),
        USD: dayRevenue.USD,
        Bs: dayRevenue.Bs,
        totalUSD: dayRevenue.totalUSD,
      });
    }
    return data;
  }, [invoices]);

  const servicesChartData = useMemo(() => {
    return [
      { name: "Consultas", value: consultations.length },
      { name: "Peluquería", value: groomingServices.length },
      { name: "Vacunas", value: vaccinations.length },
      { name: "Desparasitación", value: dewormings.length },
      { name: "Citas", value: appointments.length },
    ]
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [consultations, groomingServices, vaccinations, dewormings, appointments]);

  const speciesChartData = useMemo(() => {
    const speciesCount: Record<string, number> = {};
    patients.forEach((p) => {
      const species = p.species || "Otro";
      speciesCount[species] = (speciesCount[species] || 0) + 1;
    });

    return Object.entries(speciesCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [patients]);

  return {
    // Loading
    isFirstLoad,

    // Datos crudos
    patients,
    owners,

    // Métricas de hoy
    todayAppointments,
    todayGrooming,
    todayConsultations,
    todayRevenue,

    // Ingresos
    weekRevenue,
    monthRevenue,

    // Deudas
    pendingDebt,
    pendingInvoicesCount,
    pendingInvoices,

    // Alertas (ahora con datos enriquecidos)
    upcomingVaccinations,
    upcomingDewormings,

    // Datos de gráficos
    revenueChartData,
    servicesChartData,
    speciesChartData,
  };
}