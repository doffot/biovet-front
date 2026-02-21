// src/views/labExams/components/LabExamTable.tsx

import { LabExamRow } from "./LabExamRow";

const HEADERS = [
  { label: "Paciente", align: "text-left" },
  { label: "Especie", align: "text-left", hidden: "hidden sm:table-cell" },
  { label: "Fecha", align: "text-left", hidden: "hidden md:table-cell" },
  { label: "Hematocrito", align: "text-center" },
  { label: "Leucocitos", align: "text-center", hidden: "hidden lg:table-cell" },
  { label: "Acciones", align: "text-center" },
];

interface LabExamTableProps {
  exams: {
    _id?: string;
    patientName: string;
    breed?: string;
    species: string;
    date: string;
    hematocrit: number;
    whiteBloodCells: number;
  }[];
  onDelete: (exam: { _id: string; patientName: string }) => void;
}

export function LabExamTable({ exams, onDelete }: LabExamTableProps) {
  return (
    <div className="hidden lg:block flex-1 overflow-auto custom-scrollbar relative">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700 z-10">
          <tr>
            {HEADERS.map((h) => (
              <th
                key={h.label}
                className={`px-4 py-3 text-[11px] font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider ${h.align} ${h.hidden || ""}`}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200 dark:divide-slate-700/50">
          {exams.map((exam) => (
            <LabExamRow
              key={exam._id}
              exam={exam}
              onDelete={() => {
                if (exam._id) {
                  onDelete({ _id: exam._id, patientName: exam.patientName });
                }
              }}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}