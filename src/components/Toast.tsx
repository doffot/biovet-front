// src/components/ui/Toast.tsx
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Tipos TypeScript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

// Context para manejar los toasts
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook personalizado para usar toasts
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// API simplificada para usar toasts
export const toast = {
  success: (title: string, message?: string, options?: { duration?: number; persistent?: boolean }) => {
    const event = new CustomEvent('add-toast', {
      detail: { type: 'success', title, message, ...options }
    });
    window.dispatchEvent(event);
  },

  error: (title: string, message?: string, options?: { duration?: number; persistent?: boolean }) => {
    const event = new CustomEvent('add-toast', {
      detail: { type: 'error', title, message, ...options }
    });
    window.dispatchEvent(event);
  },

  info: (title: string, message?: string, options?: { duration?: number; persistent?: boolean }) => {
    const event = new CustomEvent('add-toast', {
      detail: { type: 'info', title, message, ...options }
    });
    window.dispatchEvent(event);
  },

  warning: (title: string, message?: string, options?: { duration?: number; persistent?: boolean }) => {
    const event = new CustomEvent('add-toast', {
      detail: { type: 'warning', title, message, ...options }
    });
    window.dispatchEvent(event);
  }
};

// Configuración de estilos por tipo
const toastConfig = {
  success: {
    icon: CheckCircle,
    containerClass: 'bg-white dark:bg-dark-200 border-success-200 dark:border-success-800',
    iconContainerClass: 'bg-success-100 dark:bg-success-900/50',
    iconClass: 'text-success-600 dark:text-success-400',
    titleClass: 'text-success-700 dark:text-success-300',
    messageClass: 'text-success-600/80 dark:text-success-400/80',
  },
  error: {
    icon: AlertCircle,
    containerClass: 'bg-white dark:bg-dark-200 border-danger-200 dark:border-danger-800',
    iconContainerClass: 'bg-danger-100 dark:bg-danger-900/50',
    iconClass: 'text-danger-600 dark:text-danger-400',
    titleClass: 'text-danger-700 dark:text-danger-300',
    messageClass: 'text-danger-600/80 dark:text-danger-400/80',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-white dark:bg-dark-200 border-warning-200 dark:border-warning-800',
    iconContainerClass: 'bg-warning-100 dark:bg-warning-900/50',
    iconClass: 'text-warning-600 dark:text-warning-400',
    titleClass: 'text-warning-700 dark:text-warning-300',
    messageClass: 'text-warning-600/80 dark:text-warning-400/80',
  },
  info: {
    icon: Info,
    containerClass: 'bg-white dark:bg-dark-200 border-biovet-200 dark:border-biovet-800',
    iconContainerClass: 'bg-biovet-100 dark:bg-biovet-900/50',
    iconClass: 'text-biovet-600 dark:text-biovet-400',
    titleClass: 'text-biovet-700 dark:text-biovet-300',
    messageClass: 'text-biovet-600/80 dark:text-biovet-400/80',
  },
};

// Componente individual de Toast
const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ 
  toast: toastData, 
  onRemove 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toastData.persistent && toastData.duration !== 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toastData.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toastData.duration, toastData.persistent]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(toastData.id);
    }, 300);
  };

  const config = toastConfig[toastData.type];
  const IconComponent = config.icon;

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out mb-3
        ${isVisible && !isRemoving 
          ? 'opacity-100 scale-100 translate-x-0' 
          : 'opacity-0 scale-95 translate-x-8'
        }
      `}
    >
      <div 
        className={`
          flex items-start gap-3 p-4
          rounded-xl border shadow-lg
          backdrop-blur-sm
          min-w-[320px] max-w-sm
          ${config.containerClass}
        `}
      >
        {/* Icono */}
        <div 
          className={`
            shrink-0 w-10 h-10 rounded-xl
            flex items-center justify-center
            ${config.iconContainerClass}
          `}
        >
          <IconComponent className={`w-5 h-5 ${config.iconClass}`} />
        </div>
        
        {/* Contenido */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h4 
            className={`
              font-semibold text-sm leading-5 font-heading
              ${config.titleClass}
            `}
          >
            {toastData.title}
          </h4>
          {toastData.message && (
            <p 
              className={`
                text-xs leading-5 mt-1
                ${config.messageClass}
              `}
            >
              {toastData.message}
            </p>
          )}
        </div>
        
        {/* Botón cerrar */}
        <button
          onClick={handleRemove}
          className="
            shrink-0 p-1.5 -mt-1 -mr-1 rounded-lg 
            transition-colors
            text-slate-400 hover:text-slate-600 
            hover:bg-surface-100
            dark:text-slate-500 dark:hover:text-slate-300 
            dark:hover:bg-dark-100
          "
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Contenedor de toasts
const ToastContainer: React.FC<{ 
  toasts: Toast[]; 
  onRemove: (id: string) => void 
}> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-10000 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-end">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
};

// Provider de toasts
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 11);
    const newToast: Toast = { id, ...toastData };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Escuchar eventos globales de toast
  useEffect(() => {
    const handleAddToast = (event: CustomEvent) => {
      addToast(event.detail);
    };

    window.addEventListener('add-toast', handleAddToast as EventListener);
    
    return () => {
      window.removeEventListener('add-toast', handleAddToast as EventListener);
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};