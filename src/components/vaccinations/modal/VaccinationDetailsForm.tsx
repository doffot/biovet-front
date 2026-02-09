import { FlaskConical, Hash, Calendar, FileText } from "lucide-react";
import type { VaccinationFormValues } from "./formSchema";
import type { UseFormRegister } from "react-hook-form";

interface Props {
  register: UseFormRegister<VaccinationFormValues>;
}

export function VaccinationDetailsForm({ register }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Detalles Adicionales</h3>
      <div>
        <label className="label text-xs sm:text-sm"><FlaskConical className="w-3.5 h-3.5 inline mr-1.5" />Laboratorio</label>
        <input type="text" {...register("laboratory")} placeholder="Laboratorio" className="input text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="label text-xs sm:text-sm"><Hash className="w-3.5 h-3.5 inline mr-1.5" />Nº de Lote</label>
          <input type="text" {...register("batchNumber")} placeholder="Opcional" className="input text-sm" />
        </div>
        <div>
          <label className="label text-xs sm:text-sm"><Calendar className="w-3.5 h-3.5 inline mr-1.5" />Vencimiento</label>
          <input type="date" {...register("expirationDate")} className="input text-sm" />
        </div>
      </div>
      <div>
        <label className="label text-xs sm:text-sm"><FileText className="w-3.5 h-3.5 inline mr-1.5" />Observaciones</label>
        <textarea {...register("observations")} placeholder="Notas..." rows={3} className="input text-sm resize-none" />
      </div>
    </div>
  );
}