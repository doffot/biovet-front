// src/constants/quickTest.ts
import { User, FlaskConical, FileText } from "lucide-react";
import type { TabConfig } from "@/types/labExam/quickTest";

export const QUICK_TEST_TABS: TabConfig[] = [
  { id: "patient", label: "Paciente", icon: User },
  { id: "exam", label: "Examen", icon: FlaskConical },
  { id: "results", label: "Resultados", icon: FileText },
];

export const RESULT_OPTIONS = ["Positivo", "Negativo", "Indeterminado"];

export const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};