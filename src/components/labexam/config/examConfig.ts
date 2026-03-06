import {
  FlaskConical,
  Microscope,
  Droplets,
  Beaker,
  Scissors,
  TestTube,
} from "lucide-react";

export const EXAM_TYPE_CONFIG: Record<
  string,
  {
    name: string;
    icon: typeof FlaskConical;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
  }
> = {
  hematology: {
    name: "Hemograma",
    icon: FlaskConical,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  cytology: {
    name: "Citología",
    icon: Microscope,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    textColor: "text-purple-600 dark:text-purple-400",
  },
  urinalysis: {
    name: "Uroanálisis",
    icon: Droplets,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  test: {
    name: "Test Rápido",
    icon: Beaker,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    textColor: "text-cyan-600 dark:text-cyan-400",
  },
  skin_scraping: {
    name: "Raspado Cutáneo",
    icon: Scissors,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  trichogram: {
    name: "Tricograma",
    icon: TestTube,
    color: "text-teal-500",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    borderColor: "border-teal-200 dark:border-teal-800",
    textColor: "text-teal-600 dark:text-teal-400",
  },
};

export const DEFAULT_CONFIG = {
  name: "Examen",
  icon: FlaskConical,
  color: "text-slate-500",
  bgColor: "bg-slate-50 dark:bg-slate-950/30",
  borderColor: "border-slate-200 dark:border-slate-800",
  textColor: "text-slate-600 dark:text-slate-400",
};

export type ExamConfig = typeof DEFAULT_CONFIG;

export const getExamConfig = (examType?: string): ExamConfig => {
  return EXAM_TYPE_CONFIG[examType || "hematology"] || DEFAULT_CONFIG;
};

export const hasPDFSupport = (examType?: string): boolean => {
  const type = examType || "hematology";
  return ["hematology", "cytology", "urinalysis", "test", "skin_scraping", "trichogram"].includes(type);
};