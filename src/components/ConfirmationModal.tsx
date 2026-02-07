// src/components/ui/ConfirmationModal.tsx
import {
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  type LucideIcon,
} from "lucide-react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type ModalVariant = "danger" | "warning" | "info";

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
    borderAccent: string;
    Icon: LucideIcon;
  }
> = {
  danger: {
    iconBg: "bg-danger-50 dark:bg-danger-950",
    iconColor: "text-danger-500",
    buttonClass: "bg-danger-500 hover:bg-danger-600 border-danger-600",
    borderAccent: "bg-danger-500",
    Icon: AlertTriangle,
  },
  warning: {
    iconBg: "bg-warning-50 dark:bg-warning-950",
    iconColor: "text-warning-500",
    buttonClass: "bg-warning-500 hover:bg-warning-600 border-warning-600",
    borderAccent: "bg-warning-500",
    Icon: AlertCircle,
  },
  info: {
    iconBg: "bg-biovet-50 dark:bg-biovet-950",
    iconColor: "text-biovet-500",
    buttonClass: "bg-biovet-500 hover:bg-biovet-600 border-biovet-600",
    borderAccent: "bg-biovet-500",
    Icon: Info,
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
  if (!isOpen) return null;

  const styles = variantStyles[variant];
  const VariantIcon = styles.Icon;

  const modalContent = (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Barra superior decorativa */}
        <div className={`h-1 ${styles.borderAccent}`} />

        {/* Contenido */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center shrink-0`}
              >
                <VariantIcon className={`w-5 h-5 ${styles.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                {title}
              </h3>
            </div>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-surface-100 dark:hover:bg-dark-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensaje */}
          <div className="mb-6 pl-13">
            {typeof message === "string" ? (
              <p className="text-slate-600 dark:text-slate-300">{message}</p>
            ) : (
              message
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`
                inline-flex items-center justify-center gap-2
                px-5 py-2.5 text-sm font-semibold text-white
                rounded-lg shadow-sm border
                transition-all duration-200 cursor-pointer
                active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
                ${styles.buttonClass}
              `}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {loadingText}
                </>
              ) : (
                <>
                  {ConfirmIcon && <ConfirmIcon className="w-4 h-4" />}
                  {confirmText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
