// src/views/labExams/components/LabExamListHeader.tsx

import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Plus, 
  FlaskConical, 
  Microscope, 
  Droplets, 
  Beaker, 
  Scissors, 
  TestTube 
} from "lucide-react";
import { DropdownMenu } from "@/components/ui/DropdownMenu";

interface LabExamListHeaderProps {
  totalCount: string;
  onBack: () => void;
}

export function LabExamListHeader({ totalCount, onBack }: LabExamListHeaderProps) {
  const navigate = useNavigate();

  const examTypeItems = [
    {
      id: "hematology",
      label: "Hemograma",
      description: "Análisis sanguíneo completo",
      icon: FlaskConical,
      color: "bg-emerald-500",
      onClick: () => navigate("/lab/create?type=hematology"),
    },
    {
      id: "cytology",
      label: "Citología",
      description: "Estudio celular de muestras",
      icon: Microscope,
      color: "bg-purple-500",
      onClick: () => navigate("/lab/create?type=cytology"),
    },
    {
      id: "urinalysis",
      label: "Uroanálisis",
      description: "Análisis completo de orina",
      icon: Droplets,
      color: "bg-blue-500",
      onClick: () => navigate("/lab/create?type=urinalysis"),
    },
    {
      id: "test",
      label: "Test Rápido",
      description: "Pruebas diagnósticas rápidas",
      icon: Beaker,
      color: "bg-cyan-500",
      onClick: () => navigate("/lab/create?type=test"),
    },
    {
      id: "skin_scraping",
      label: "Raspado Cutáneo",
      description: "Análisis dermatológico",
      icon: Scissors,
      color: "bg-amber-500",
      onClick: () => navigate("/lab/create?type=skin_scraping"),
    },
    {
      id: "trichogram",
      label: "Tricograma",
      description: "Estudio del pelo",
      icon: TestTube,
      color: "bg-teal-500",
      onClick: () => navigate("/lab/create?type=trichogram"),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="text-surface-400 hover:text-surface-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white leading-tight">
              Exámenes de Laboratorio
            </h1>
            <p className="text-[13px] text-biovet-500 font-medium">
              {totalCount}
            </p>
          </div>
        </div>

        <DropdownMenu
          items={examTypeItems}
          align="right"
          side="bottom"
          trigger={
            <button className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-biovet-500 hover:bg-biovet-600 text-white rounded-lg font-bold text-[13px] transition-all shadow-sm cursor-pointer active:scale-[0.98]">
              <div className="p-0.5 border-2 border-white rounded-full">
                <Plus size={12} strokeWidth={3} />
              </div>
              <span className="hidden sm:inline">Nuevo Examen</span>
            </button>
          }
        />
      </div>

      <div className="border border-biovet-200/50 dark:border-biovet-800/30" />
    </>
  );
}