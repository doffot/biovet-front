// src/views/dashboard/utils/dashboardUtils.ts

import type { CurrencyAmounts } from "../constants/dashboardConstants";

//  Obtiene la fecha de hoy en formato YYYY-MM-DD (local)
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

//  Extrae la parte de fecha (YYYY-MM-DD) de una fecha
export const getDatePart = (date: Date | string): string => {
  if (typeof date === "string") {
    if (date.includes("T")) {
      return date.split("T")[0];
    }
    return date;
  }
  return date.toISOString().split("T")[0];
};

//  Compara si dos fechas son el mismo día (ignorando timezone)
export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  return getDatePart(date1) === getDatePart(date2);
};

//  Verifica si una fecha es hoy
export const isToday = (date: Date | string): boolean => {
  return getDatePart(date) === getTodayDateString();
};

//  Obtiene una fecha N días atrás en formato YYYY-MM-DD
export const getDaysAgoString = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

//  Obtiene una fecha N días en el futuro en formato YYYY-MM-DD
export const getDaysFromNowString = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

//  Calcula días restantes desde hoy hasta una fecha
export const getDaysLeft = (targetDate: Date | string): number => {
  const today = getTodayDateString();
  const target = getDatePart(targetDate);

  const todayDate = new Date(today + "T00:00:00");
  const targetDateObj = new Date(target + "T00:00:00");

  return Math.ceil((targetDateObj.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
};

//  Formatea hora de una fecha (ej: "14:30")
export const formatTime = (date: Date | string): string => {
  return new Date(date).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

//  Formatea fecha larga (ej: "lunes, 15 de enero de 2025")
export const formatLongDate = (date: Date): string => {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

//  Formatea día corto (ej: "lun", "mar")
export const formatShortDay = (date: Date): string => {
  return date.toLocaleDateString("es-ES", { weekday: "short" });
};

//  Formatea fecha corta (ej: "15 ene" o "15 de enero")
export const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
};

//  Formatea fecha numérica (ej: "15/01/2025")
export const formatNumericDate = (date: Date): string => {
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

//  Formatea moneda USD
export const formatUSD = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

//  Formatea moneda Bolívares
export const formatBs = (amount: number): string => {
  return `Bs ${amount.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

//  Formatea moneda con símbolo
export const formatCurrency = (amount: number, currency: "USD" | "Bs" = "USD"): string => {
  if (currency === "Bs") {
    return formatBs(amount);
  }
  return formatUSD(amount);
};

//  Formatea ambas monedas
export const formatDualCurrency = (amounts: CurrencyAmounts): string => {
  return `${formatUSD(amounts.USD)} | ${formatBs(amounts.Bs)}`;
};