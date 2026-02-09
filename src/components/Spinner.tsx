interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  className?: string;
  fullScreen?: boolean;
}

export default function Spinner({
  size = "md",
  color = "text-biovet-500",
  className = "",
  fullScreen = false,
}: SpinnerProps) {
  // Mapeo de tamaños
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-[5px]",
  };

  const spinnerContent = (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div
        className={`
          ${sizes[size]} 
          ${color} 
          animate-spin 
          rounded-full 
          border-current 
          border-t-transparent
        `}
        role="status"
        aria-label="loading"
      />
      {size === "xl" && (
        <span className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
          Cargando BioVet...
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-999 flex items-center justify-center bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
}
