// src/constants/trichogram.ts
import { User, TestTube, FileText } from "lucide-react";
import type { TrichogramTabConfig } from "@/types/labExam/trichogram";

export const TRICHOGRAM_TABS: TrichogramTabConfig[] = [
  { id: "patient", label: "Paciente", icon: User },
  { id: "exam", label: "Examen", icon: TestTube },
  { id: "results", label: "Resultados", icon: FileText },
];

export const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};