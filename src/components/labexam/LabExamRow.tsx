// src/views/labExams/components/LabExamRow.tsx

import { Link } from "react-router-dom";
import { PawPrint, Calendar, Eye, Trash2 } from "lucide-react";
import { formatExamDate, getHematocritLabel, getHematocritStatus } from "@/utils/labExamHelpers";


interface LabExamRowProps {
  exam: {
    _id?: string;
    patientName: string;
    breed?: string;
    species: string;
    date: string;
    hematocrit: number;
    whiteBloodCells: number;
  };
  onDelete: () => void;
}

export function LabExamRow({ exam, onDelete }: LabExamRowProps) {
  const hematocritStatus = getHematocritStatus(exam.hematocrit, exam.species);
  const isAltered = hematocritStatus !== "normal";

  return (
    <tr
      className={`group hover:bg-surface-50/70 dark:hover:bg-dark-200/30 transition-colors ${
        isAltered ? "bg-danger-50/30 dark:bg-danger-950/10" : ""
      }`}
    >
      {/* Paciente */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-biovet-500/10 flex items-center justify-center shrink-0">
            <PawPrint className="w-3.5 h-3.5 text-biovet-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
              {exam.patientName}
            </p>
            <p className="text-[11px] text-surface-500 dark:text-slate-400 truncate">
              {exam.breed || "Sin raza"}
            </p>
          </div>
        </div>
      </td>

      {/* Especie */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="badge badge-biovet capitalize">{exam.species}</span>
      </td>

      {/* Fecha */}
      <td className="px-4 py-3 hidden md:table-cell">
        <div className="flex items-center gap-1.5 text-sm text-surface-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatExamDate(exam.date)}</span>
        </div>
      </td>

      {/* Hematocrito */}
      <td className="px-4 py-3 text-center">
        <div className="flex flex-col items-center">
          <span
            className={`text-base font-bold ${
              isAltered
                ? "text-danger-500 dark:text-danger-400"
                : "text-biovet-500 dark:text-biovet-400"
            }`}
          >
            {exam.hematocrit}%
          </span>
          {isAltered && (
            <span className="text-[10px] text-danger-500 dark:text-danger-400 font-medium">
              {getHematocritLabel(hematocritStatus)}
            </span>
          )}
        </div>
      </td>

      {/* Leucocitos */}
      <td className="px-4 py-3 text-center hidden lg:table-cell">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {exam.whiteBloodCells}
          <span className="text-surface-500 dark:text-slate-400 text-xs ml-1">
            x10³/μL
          </span>
        </span>
      </td>

      {/* Acciones */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <Link
            to={`/lab/${exam._id}/edit`}
            className="p-1.5 rounded-lg text-surface-400 dark:text-slate-500 hover:bg-surface-100 dark:hover:bg-dark-50 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-danger-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950 transition-all cursor-pointer"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}