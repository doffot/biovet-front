import { Building2, UserCheck } from "lucide-react";
import type { VaccinationFormValues } from "./formSchema";
import type { UseFormSetValue } from "react-hook-form";

interface Props {
  source: "internal" | "external";
  setValue: UseFormSetValue<VaccinationFormValues>;
}

export function VaccinationSourceSelector({ source, setValue }: Props) {
  const isInternal = source === "internal";

  const handleSourceChange = (newSource: "internal" | "external") => {
    setValue("source", newSource);
    
    if (newSource === "external") {
      setValue("productId", "");
      setValue("cost", 0);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 mb-5 sm:mb-6">
      <button
        type="button"
        onClick={() => handleSourceChange("internal")}
        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all ${isInternal ? "bg-biovet-500 text-white shadow-lg shadow-biovet-500/25" : "bg-surface-100 dark:bg-dark-100 text-slate-600 dark:text-slate-400 hover:bg-surface-200 dark:hover:bg-dark-50"}`}
      >
        <Building2 className="w-4 h-4" /><span>Aplicada aquí</span>
      </button>
      <button
        type="button"
        onClick={() => handleSourceChange("external")}
        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all ${!isInternal ? "bg-slate-700 text-white shadow-lg shadow-slate-700/25 dark:bg-slate-600" : "bg-surface-100 dark:bg-dark-100 text-slate-600 dark:text-slate-400 hover:bg-surface-200 dark:hover:bg-dark-50"}`}
      >
        <UserCheck className="w-4 h-4" /><span>Vacuna externa</span>
      </button>
    </div>
  );
}