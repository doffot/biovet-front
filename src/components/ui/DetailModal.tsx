// src/components/ui/DetailModal.tsx

import { useState, useEffect, useRef, type ReactNode } from "react";
import { X, Loader2 } from "lucide-react";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  headerColor?: "biovet" | "rose" | "purple" | "blue" | "indigo" | "emerald" | "amber" | "pink" | "orange" | "cyan";
  isLoading?: boolean;
  footer?: ReactNode;
  triggerRect?: DOMRect | null;
}

const colorVariants = {
  biovet: {
    bg: "bg-biovet-50 dark:bg-biovet-950/20",
    iconBg: "bg-biovet-100 dark:bg-biovet-900/30",
    iconText: "text-biovet-600 dark:text-biovet-400",
    border: "border-biovet-200 dark:border-biovet-800",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/20",
    iconBg: "bg-rose-100 dark:bg-rose-900/30",
    iconText: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/20",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconText: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconText: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    iconText: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconText: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconText: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-950/20",
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    iconText: "text-pink-600 dark:text-pink-400",
    border: "border-pink-200 dark:border-pink-800",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/20",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconText: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-950/20",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
    iconText: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-200 dark:border-cyan-800",
  },
};

export default function DetailModal({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  icon,
  headerColor = "biovet",
  isLoading = false,
  footer,
  triggerRect,
}: DetailModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Guardamos el triggerRect inicial para usarlo en la animación de cierre
  const savedTriggerRect = useRef<DOMRect | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Guardar la posición del trigger al abrir
      savedTriggerRect.current = triggerRect || null;
      setIsVisible(true);
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      // Al cerrar: primero animar, luego ocultar
      setIsAnimating(false);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        savedTriggerRect.current = null;
      }, 400); // Debe coincidir con la duración de la transición
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, triggerRect]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isVisible) return null;

  const colors = colorVariants[headerColor];
  
  // Usamos el triggerRect guardado para ambas animaciones (abrir y cerrar)
  const currentTriggerRect = savedTriggerRect.current;

  // Estilos del modal según estado de animación
  const getModalStyles = (): React.CSSProperties => {
    if (!isAnimating && currentTriggerRect) {
      // Estado colapsado: posición del trigger (tanto al abrir como al cerrar)
      const centerX = currentTriggerRect.left + currentTriggerRect.width / 2;
      const centerY = currentTriggerRect.top + currentTriggerRect.height / 2;
      
      return {
        position: "fixed",
        top: centerY,
        left: centerX,
        transform: "translate(-50%, -50%) scale(0.15)",
        opacity: 0,
        width: "min(90vw, 32rem)",
        maxHeight: "85vh",
      };
    }
    
    // Estado expandido: centrado
    return {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%) scale(1)",
      opacity: 1,
      width: "min(90vw, 32rem)",
      maxHeight: "85vh",
    };
  };

  return (
    <div
      className={`
        fixed inset-0 z-100
        transition-all duration-400 ease-out
        ${isAnimating ? "bg-black/70 backdrop-blur-sm" : "bg-transparent"}
      `}
      onClick={handleBackdropClick}
    >
      {/* Loading global */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      {/* Modal con efecto zoom bidireccional */}
      <div
        className={`
          bg-white dark:bg-dark-200 
          rounded-3xl shadow-2xl overflow-hidden
          border border-surface-200 dark:border-dark-100
          flex flex-col
          ${isLoading ? "pointer-events-none opacity-50" : ""}
        `}
        style={{
          ...getModalStyles(),
          transition: "all 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || icon) && (
          <div className={`${colors.bg} px-6 py-5 border-b ${colors.border} shrink-0`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {icon && (
                  <div className={`
                    w-12 h-12 rounded-2xl ${colors.iconBg} 
                    flex items-center justify-center ${colors.iconText} 
                    border ${colors.border} shadow-sm
                  `}>
                    {icon}
                  </div>
                )}
                <div>
                  {title && (
                    <h2 className="text-xl font-black font-heading text-slate-800 dark:text-white leading-tight tracking-tight">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-2 -mr-2 -mt-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50"
              >
                <X size={22} />
              </button>
            </div>
          </div>
        )}

        {/* Content - Scrolleable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 p-4 bg-surface-50 dark:bg-dark-300 border-t border-surface-200 dark:border-dark-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}