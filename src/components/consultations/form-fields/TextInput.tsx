interface TextInputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: "text" | "date" | "number";
  error?: string;
}

export default function TextInput({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  type = "text",
  error 
}: TextInputProps) {
  return (
    <div className="w-full">
      <label className="label">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input ${error ? "border-red-500" : ""}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}