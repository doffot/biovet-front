interface TextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
}

export default function TextArea({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  rows = 3,
  error 
}: TextAreaProps) {
  return (
    <div className="w-full">
      <label className="label">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`input resize-none min-h-25 ${error ? "border-red-500" : ""}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}