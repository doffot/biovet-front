// src/components/medical-orders/MedicalOrderForm.tsx

import {  useCallback } from "react";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { 
  MEDICAL_ORDER_OPTIONS, 
  ORDER_CATEGORY_LABELS, 
  type MedicalOrderFormData 
} from "@/types/medicalOrder";
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useWatch, type Control } from "react-hook-form";

interface MedicalOrderFormProps {
  register: UseFormRegister<MedicalOrderFormData>;
  watch: UseFormWatch<MedicalOrderFormData>;
  setValue: UseFormSetValue<MedicalOrderFormData>;
  errors: FieldErrors<MedicalOrderFormData>;
  control: Control<MedicalOrderFormData>;
}

export default function MedicalOrderForm({ register, watch, setValue, control }: MedicalOrderFormProps) {
  
  // useWatch se suscribe a TODOS los cambios del form y causa re-render
  const formValues = useWatch({ control });

  const handleToggleExam = useCallback((category: keyof MedicalOrderFormData, exam: string) => {
    const currentValues = watch(category);
    const currentExams = Array.isArray(currentValues) ? [...currentValues] : [];
    
    const isSelected = currentExams.includes(exam);
    const nextExams = isSelected
      ? currentExams.filter(item => item !== exam)
      : [...currentExams, exam];

    setValue(category, nextExams as any, { 
      shouldValidate: true, 
      shouldDirty: true,
      shouldTouch: true 
    });
  }, [watch, setValue]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(MEDICAL_ORDER_OPTIONS) as Array<keyof typeof MEDICAL_ORDER_OPTIONS>).map((category) => (
          <div 
            key={category} 
            className="bg-white dark:bg-dark-100 border border-surface-200 dark:border-dark-50 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="bg-slate-50 dark:bg-dark-200 px-4 py-3 border-b border-surface-200 dark:border-dark-50 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <h3 className="font-bold text-sm text-slate-700 dark:text-white uppercase tracking-wider">
                {ORDER_CATEGORY_LABELS[category] || category}
              </h3>
            </div>

            <div className="p-4 grid grid-cols-1 gap-2">
              {MEDICAL_ORDER_OPTIONS[category].map((exam) => {
                const values = formValues[category];
                const isChecked = Array.isArray(values) && values.includes(exam);

                return (
                  <div
                    key={exam}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleToggleExam(category, exam)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleToggleExam(category, exam);
                      }
                    }}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer select-none
                      ${isChecked 
                        ? "bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-800" 
                        : "bg-surface-50 border-transparent hover:border-surface-300 dark:bg-dark-200/50"}
                    `}
                  >
                    <div className={`
                      w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors
                      ${isChecked ? "bg-cyan-600 border-cyan-600" : "bg-white dark:bg-dark-300 border-slate-300 dark:border-dark-50"}
                    `}>
                      {isChecked && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    
                    <span className={`text-sm font-medium ${isChecked ? "text-cyan-700 dark:text-cyan-300" : "text-slate-600 dark:text-slate-400"}`}>
                      {exam}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Campos de texto */}
        <div className="md:col-span-2 space-y-4 pt-4">
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="font-bold text-sm text-amber-700 dark:text-amber-500 uppercase">Otros Exámenes / Especiales</h3>
            </div>
            <textarea
              className="w-full bg-white dark:bg-dark-200 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none min-h-[100px]"
              placeholder="Ej: Biopsias o estudios no listados..."
              {...register("specialExams")}
            />
          </div>

          <div className="bg-surface-100 dark:bg-dark-300 rounded-2xl p-4 border border-surface-200 dark:border-dark-100">
            <div className="flex items-center gap-2 mb-3">
              <Info size={18} className="text-slate-400" />
              <h3 className="font-bold text-sm text-slate-500 uppercase font-heading">Observaciones</h3>
            </div>
            <textarea
              className="w-full bg-white dark:bg-dark-200 border border-surface-200 dark:border-dark-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
              placeholder="Notas adicionales..."
              {...register("observations")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}