// src/constants/skinScraping.ts
import { User, Scissors, FileText } from "lucide-react";
import type { SkinScrapingTabConfig } from "@/types/labExam/skinScraping";

export const SKIN_SCRAPING_TABS: SkinScrapingTabConfig[] = [
  { id: "patient", label: "Paciente", icon: User },
  { id: "exam", label: "Examen", icon: Scissors },
  { id: "results", label: "Resultados", icon: FileText },
];

export const SCRAPING_TYPE_OPTIONS = [
  { value: "superficial", label: "Superficial", description: "Capas externas de la piel" },
  { value: "profunda", label: "Profunda", description: "Capas más profundas, hasta sangrado capilar" },
] as const;

export const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};