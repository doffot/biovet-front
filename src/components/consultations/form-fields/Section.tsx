interface SectionProps {
  title?: string;
  children: React.ReactNode;
  hasError?: boolean;
}

export default function Section({ title, children, hasError }: SectionProps) {
  return (
    <section 
      className={`bg-white dark:bg-dark-100 p-5 rounded-xl border shadow-sm mb-6 ${
        hasError 
          ? "border-red-300 dark:border-red-800" 
          : "border-surface-200 dark:border-slate-800"
      }`}
    >
      {title && (
        <h3 className="text-sm font-bold text-biovet-600 dark:text-biovet-400 mb-4 uppercase tracking-wider font-heading flex items-center gap-2">
          <span className={`w-1 h-4 rounded-full ${hasError ? "bg-red-500" : "bg-biovet-500"}`}></span>
          {title}
        </h3>
      )}
      <div className="grid grid-cols-1 gap-4">
        {children}
      </div>
    </section>
  );
}