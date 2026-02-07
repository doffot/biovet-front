import { useMemo } from "react";
import type { Deworming } from "@/types/deworming";

interface DewormingAlert {
  name: string;
  daysLeft: number;
  isExpired: boolean;
  productName?: string;
}

// Frecuencia recomendada: Cada 90 días (3 meses)
const INTERNAL_FREQ = 90;

export function useDewormingHealth(dewormings: Deworming[]) {
  return useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 1. Caso: Sin registros
    if (!dewormings || dewormings.length === 0) {
      return {
        status: "Sin registros",
        colorClass: "text-slate-500 bg-slate-100",
        isOverdue: true,
        alert: null,
        lastDate: null,
        nextDate: null,
        productName: null,
      };
    }

    // 2. Obtener la aplicación interna más reciente
    const lastInternal = [...dewormings]
      .filter(d => d.dewormingType === 'Interna' || d.dewormingType === 'Ambas')
      .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime())[0];

    if (!lastInternal) {
      return {
        status: "Sin registros",
        colorClass: "text-slate-500 bg-slate-100",
        isOverdue: true,
        alert: null,
        lastDate: null,
        nextDate: null,
        productName: null,
      };
    }

    // 3. Calcular fechas
    const appDate = new Date(lastInternal.applicationDate);
    let nextDate: Date;

    if (lastInternal.nextApplicationDate) {
      nextDate = new Date(lastInternal.nextApplicationDate);
    } else {
      nextDate = new Date(appDate);
      nextDate.setDate(nextDate.getDate() + INTERNAL_FREQ);
    }
    nextDate.setHours(0, 0, 0, 0);

    const diffTime = nextDate.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 4. Determinar Alerta y Estado
    const isExpired = diffDays < 0;
    const isSoon = diffDays <= 15 && diffDays >= 0;

    const alert: DewormingAlert = {
      name: 'Desparasitación Interna',
      daysLeft: diffDays,
      isExpired: isExpired,
      productName: lastInternal.productName
    };

    let status = "Al día";
    let colorClass = "text-success-700 bg-success-100";

    if (isExpired) {
      status = "Vencido";
      colorClass = "text-danger-700 bg-danger-100";
    } else if (isSoon) {
      status = "Próxima aplicación";
      colorClass = "text-warning-700 bg-warning-100";
    }

    return {
      status,
      colorClass,
      isOverdue: isExpired,
      alert,
      lastDate: lastInternal.applicationDate,
      nextDate,
      productName: lastInternal.productName,
    };
  }, [dewormings]);
}