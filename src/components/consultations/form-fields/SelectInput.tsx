interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  error?: string;
}

export default function SelectInput({
  label,
  name,
  value,
  onChange,
  options,
  error,
}: SelectInputProps) {
  return (
    <div className="w-full">
      <label className="label">{label}</label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`input appearance-none cursor-pointer pr-10 ${
            error ? "border-red-500" : ""
          }`}
        >
          <option value="" className="text-slate-400">
            Seleccionar...
          </option>
          {options.map((opt) => (
            <option 
              key={opt.value} 
              value={opt.value}
              className="dark:bg-dark-100 text-slate-700 dark:text-slate-200"
            >
              {opt.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}