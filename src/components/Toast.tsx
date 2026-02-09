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

// Componente individual de Toast
const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast: toastData, onRemove }) => {
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

  const getToastConfig = () => {
    switch (toastData.type) {
      case 'success':
        return {
          icon: CheckCircle,
          // Light mode
          lightBg: 'bg-success-50',
          lightBorder: 'border-success-200',
          lightIconBg: 'bg-success-500',
          lightTitle: 'text-success-700',
          lightMessage: 'text-success-600',
          // Dark mode
          darkBg: 'dark:bg-success-950',
          darkBorder: 'dark:border-success-800',
          darkIconBg: 'dark:bg-success-600',
          darkTitle: 'dark:text-success-400',
          darkMessage: 'dark:text-success-300',
        };
      case 'error':
        return {
          icon: AlertCircle,
          lightBg: 'bg-danger-50',
          lightBorder: 'border-danger-200',
          lightIconBg: 'bg-danger-500',
          lightTitle: 'text-danger-700',
          lightMessage: 'text-danger-600',
          darkBg: 'dark:bg-danger-950',
          darkBorder: 'dark:border-danger-800',
          darkIconBg: 'dark:bg-danger-600',
          darkTitle: 'dark:text-danger-400',
          darkMessage: 'dark:text-danger-300',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          lightBg: 'bg-warning-50',
          lightBorder: 'border-warning-200',
          lightIconBg: 'bg-warning-500',
          lightTitle: 'text-warning-700',
          lightMessage: 'text-warning-600',
          darkBg: 'dark:bg-warning-950',
          darkBorder: 'dark:border-warning-800',
          darkIconBg: 'dark:bg-warning-600',
          darkTitle: 'dark:text-warning-400',
          darkMessage: 'dark:text-warning-300',
        };
      case 'info':
      default:
        return {
          icon: Info,
          lightBg: 'bg-biovet-50',
          lightBorder: 'border-biovet-200',
          lightIconBg: 'bg-biovet-500',
          lightTitle: 'text-biovet-700',
          lightMessage: 'text-biovet-600',
          darkBg: 'dark:bg-biovet-950',
          darkBorder: 'dark:border-biovet-800',
          darkIconBg: 'dark:bg-biovet-600',
          darkTitle: 'dark:text-biovet-400',
          darkMessage: 'dark:text-biovet-300',
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out mb-3
        ${isVisible && !isRemoving 
          ? 'opacity-100 scale-100 translate-x-0' 
          : 'opacity-0 scale-95 translate-x-4'
        }
        ${isRemoving ? 'opacity-0 scale-95 translate-x-4' : ''}
      `}
    >
      <div 
        className={`
          rounded-xl shadow-lg max-w-sm min-w-[320px] relative overflow-hidden
          border backdrop-blur-sm
          ${config.lightBg} ${config.darkBg}
          ${config.lightBorder} ${config.darkBorder}
        `}
      >        
        <div className="flex items-start gap-3 p-4">
          {/* Icono */}
          <div 
            className={`
              shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
              text-white shadow-sm
              ${config.lightIconBg} ${config.darkIconBg}
            `}
          >
            <IconComponent size={18} />
          </div>
          
          {/* Contenido */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h4 
              className={`
                font-semibold text-sm leading-5
                ${config.lightTitle} ${config.darkTitle}
              `}
            >
              {toastData.title}
            </h4>
            {toastData.message && (
              <p 
                className={`
                  text-xs leading-5 mt-0.5 opacity-90
                  ${config.lightMessage} ${config.darkMessage}
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
              shrink-0 p-1.5 rounded-lg transition-colors
              text-slate-400 hover:text-slate-600 hover:bg-slate-200/50
              dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-700/50
            "
            aria-label="Cerrar notificación"
          >
            <X size={16} />
          </button>
        </div>

        {/* Barra de progreso (si no es persistente) */}
        {!toastData.persistent && toastData.duration !== 0 && (
          <div className="h-1 w-full bg-black/5 dark:bg-white/5">
            <div 
              className={`
                h-full origin-left
                ${config.lightIconBg} ${config.darkIconBg}
              `}
              style={{
                animation: `shrink ${toastData.duration || 5000}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Contenedor de toasts
const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-1000 pointer-events-none">
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
    const id = Math.random().toString(36).substr(2, 9);
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