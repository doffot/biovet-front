import { useMemo } from "react";
import type { Vaccination } from "@/types/vaccination";

interface VaccineAlert {
  name: string;
  daysLeft: number;
  isExpired: boolean;
}

const PROTOCOLS = {
  canino: [
    { id: 'polivalente', label: 'Quintuple o Sextuple', options: ['Séxtuple', 'Quíntuple', 'Triple Canina'] },
    { id: 'rabia', label: 'Antirrábica', options: ['Antirrábica'] },
    { id: 'tos', label: 'Tos de Perrera', options: ['Tos de Perrera'] }
  ],
  felino: [
    { id: 'triple', label: 'Triple Felina', options: ['Triple Felina', 'Quíntuple Felina'] },
    { id: 'rabia', label: 'Antirrábica', options: ['Antirrábica'] }
  ]
};

export function usePatientHealth(vaccinations: Vaccination[], species?: string) {
  return useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizamos para comparar solo fechas

    if (!vaccinations || vaccinations.length === 0) {
      return {
        status: "Sin registros",
        colorClass: "text-slate-500 bg-slate-100",
        applied: [],
        missing: [],
        alerts: [] as VaccineAlert[]
      };
    }

    const isDog = species?.toLowerCase().includes("can") || species?.toLowerCase().includes("perro");
    const activeProtocol = isDog ? PROTOCOLS.canino : PROTOCOLS.felino;

    const applied: string[] = [];
    const missing: string[] = [];
    const alerts: VaccineAlert[] = [];

    activeProtocol.forEach(p => {
      const record = vaccinations.find(v => p.options.includes(v.vaccineType));
      
      if (record) {
        applied.push(p.label);
        
        if (record.nextVaccinationDate) {
          const nextDate = new Date(record.nextVaccinationDate);
          nextDate.setHours(0, 0, 0, 0);
          
          const diffTime = nextDate.getTime() - hoy.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Si ya venció o faltan 15 días o menos para vencer
          if (diffDays <= 15) {
            alerts.push({
              name: p.label,
              daysLeft: diffDays,
              isExpired: diffDays < 0
            });
          }
        }
      } else {
        missing.push(p.label);
      }
    });

    // Lógica de semáforo de estado general
    let status = "Al día";
    let colorClass = "text-success-700 bg-success-100";

    const hasExpired = alerts.some(a => a.isExpired);
    const hasSoon = alerts.some(a => !a.isExpired);

    if (missing.length > 0) {
      status = "Incompleto";
      colorClass = "text-warning-700 bg-warning-100";
    }
    if (hasSoon) {
      status = "Refuerzo pronto";
      colorClass = "text-warning-700 bg-warning-100";
    }
    if (hasExpired) {
      status = "Vencido";
      colorClass = "text-danger-700 bg-danger-100";
    }

    return { status, colorClass, applied, missing, alerts };
  }, [vaccinations, species]);
}