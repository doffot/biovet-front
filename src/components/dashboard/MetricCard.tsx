import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  iconBgColor?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bgColor,
  iconBgColor = "bg-vet-light",
}: MetricCardProps) {
  return (
    <div 
      className={`
        ${bgColor} 
        rounded-xl p-4 
        shadow-soft border border-border
        hover:shadow-card
        transition-all duration-300 
        animate-scale-in 
        group
      `}
    >
      <div className="flex items-center justify-between">
        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-vet-muted uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className={`text-2xl font-bold ${color}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-vet-muted mt-1 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-vet-muted/50"></span>
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Icono */}
        <div 
          className={`
            ${iconBgColor} 
            p-3 rounded-xl 
            group-hover:scale-110 
            transition-all duration-300
            shadow-soft border border-border
          `}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}