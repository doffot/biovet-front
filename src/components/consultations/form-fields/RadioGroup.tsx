interface RadioGroupProps {
  label: string;
  name: string;
  value: boolean | null | undefined;
  onChange: (value: boolean) => void;
  error?: string;
}

export default function RadioGroup({ label, value, onChange, error }: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="label">{label}</label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all
            ${value === true 
              ? "bg-biovet-500 text-white border border-biovet-600 shadow-sm" 
              : error
                ? "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-red-500 hover:bg-surface-100"
                : "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-surface-200 dark:border-slate-700 hover:bg-surface-100"
            }`}
        >
          Sí
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all
            ${value === false 
              ? "bg-biovet-500 text-white border border-biovet-600 shadow-sm" 
              : error
                ? "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-red-500 hover:bg-surface-100"
                : "bg-surface-50 dark:bg-dark-200 text-slate-500 border border-surface-200 dark:border-slate-700 hover:bg-surface-100"
            }`}
        >
          No
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}