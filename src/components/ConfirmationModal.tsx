// src/components/ui/ConfirmationModal.tsx
import { X, AlertTriangle, AlertCircle, Info, CheckCircle, type LucideIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";

type ModalVariant = "danger" | "warning" | "info" | "success";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmIcon?: LucideIcon;
  variant?: ModalVariant;
  isLoading?: boolean;
  loadingText?: string;
}

const variantStyles: Record<
  ModalVariant,
  {
    iconBg: string;
    iconColor: string;
    buttonClass: string;
    Icon: LucideIcon;
  }
> = {
  danger: {
    iconBg: "bg-danger-100 dark:bg-danger-950",
    iconColor: "text-danger-600 dark:text-danger-400",
    buttonClass: "btn-danger",
    Icon: AlertTriangle,
  },
  warning: {
    iconBg: "bg-warning-100 dark:bg-warning-950",
    iconColor: "text-warning-600 dark:text-warning-400",
    buttonClass: "bg-warning-500 hover:bg-warning-600 text-white",
    Icon: AlertCircle,
  },
  info: {
    iconBg: "bg-biovet-100 dark:bg-biovet-950",
    iconColor: "text-biovet-600 dark:text-biovet-400",
    buttonClass: "btn-primary",
    Icon: Info,
  },
  success: {
    iconBg: "bg-success-100 dark:bg-success-950",
    iconColor: "text-success-600 dark:text-success-400",
    buttonClass: "bg-success-500 hover:bg-success-600 text-white",
    Icon: CheckCircle,
  },
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmIcon: ConfirmIcon,
  variant = "info",
  isLoading = false,
  loadingText = "Procesando...",
}: ConfirmationModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading, onClose]);

  if (!isAnimating && !isOpen) return null;

  const styles = variantStyles[variant];
  const VariantIcon = styles.Icon;

  const modalContent = (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-black/40 backdrop-blur-sm
          transition-opacity duration-200
          ${isVisible ? "opacity-100" : "opacity-0"}
        `}
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={`
          relative w-full max-w-sm
          transition-all duration-200 ease-out
          ${isVisible 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 translate-y-4"
          }
        `}
      >
        <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-xl overflow-hidden border border-surface-200 dark:border-slate-800">
          {/* Header con botón cerrar */}
          <div className="flex justify-end p-3 pb-0">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="
                p-1.5 rounded-lg transition-colors
                text-slate-400 hover:text-slate-600 hover:bg-surface-100
                dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-dark-100
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contenido centrado */}
          <div className="px-6 pb-6 text-center">
            {/* Icono */}
            <div
              className={`
                w-14 h-14 mx-auto mb-4 rounded-xl
                flex items-center justify-center
                ${styles.iconBg}
              `}
            >
              <VariantIcon className={`w-7 h-7 ${styles.iconColor}`} />
            </div>

            {/* Título */}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 font-heading">
              {title}
            </h3>

            {/* Mensaje */}
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {typeof message === "string" ? <p>{message}</p> : message}
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>

              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`
                  flex-1 inline-flex items-center justify-center gap-2
                  px-5 py-2.5 text-sm font-semibold rounded-lg
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  active:scale-[0.98]
                  ${styles.buttonClass}
                `}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{loadingText}</span>
                  </>
                ) : (
                  <>
                    {ConfirmIcon && <ConfirmIcon className="w-4 h-4" />}
                    <span>{confirmText}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}