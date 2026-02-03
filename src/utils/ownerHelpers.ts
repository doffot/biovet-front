// src/utils/ownerHelpers.ts
import { 
  Scissors, FlaskConical, Syringe, ShoppingBag, ClipboardList, FileText,
  CheckCircle2, Clock, AlertTriangle, XCircle
} from 'lucide-react';
import type { ElementType } from 'react';

// ==================== DATE HELPERS ====================
export const calculateAge = (birthDate: string): string => {
  const birth = new Date(birthDate);
  const today = new Date();
  const years = today.getFullYear() - birth.getFullYear();
  const months = today.getMonth() - birth.getMonth();
  
  if (years === 0) return months <= 0 ? '< 1 mes' : `${months} meses`;
  if (months < 0) return `${years - 1} años`;
  return `${years} años`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeDate = (date: string): string => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
  return formatDate(date);
};

// ==================== CURRENCY HELPERS ====================
export const formatCurrency = (amount: number, currency: 'USD' | 'Bs' = 'USD'): string => {
  if (currency === 'Bs') {
    return `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`;
  }
  return `$${amount.toFixed(2)}`;
};

// ==================== SERVICE CONFIG ====================
export interface ServiceConfig {
  icon: ElementType;
  color: string;
  bgColor: string;
  label: string;
}

export const getServiceConfig = (type: string): ServiceConfig => {
  const configs: Record<string, ServiceConfig> = {
    grooming: { 
      icon: Scissors, 
      color: 'text-pink-500', 
      bgColor: 'bg-pink-50 dark:bg-pink-950/30', 
      label: 'Peluquería' 
    },
    labExam: { 
      icon: FlaskConical, 
      color: 'text-purple-500', 
      bgColor: 'bg-purple-50 dark:bg-purple-950/30', 
      label: 'Laboratorio' 
    },
    consulta: { 
      icon: ClipboardList, 
      color: 'text-biovet-500', 
      bgColor: 'bg-biovet-50 dark:bg-biovet-950/30', 
      label: 'Consulta' 
    },
    vacuna: { 
      icon: Syringe, 
      color: 'text-green-500', 
      bgColor: 'bg-green-50 dark:bg-green-950/30', 
      label: 'Vacunación' 
    },
    producto: { 
      icon: ShoppingBag, 
      color: 'text-amber-500', 
      bgColor: 'bg-amber-50 dark:bg-amber-950/30', 
      label: 'Producto' 
    },
  };
  return configs[type] || { 
    icon: FileText, 
    color: 'text-slate-500', 
    bgColor: 'bg-slate-50 dark:bg-slate-800', 
    label: 'Servicio' 
  };
};

// ==================== STATUS CONFIG ====================
export interface StatusConfig {
  icon: ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const getStatusConfig = (status: string): StatusConfig => {
  const configs: Record<string, StatusConfig> = {
    'Pagado': { 
      icon: CheckCircle2, 
      color: 'text-emerald-500', 
      bgColor: 'bg-emerald-500/10', 
      borderColor: 'border-emerald-500/20' 
    },
    'Parcial': { 
      icon: Clock, 
      color: 'text-amber-500', 
      bgColor: 'bg-amber-500/10', 
      borderColor: 'border-amber-500/20' 
    },
    'Pendiente': { 
      icon: AlertTriangle, 
      color: 'text-red-500', 
      bgColor: 'bg-red-500/10', 
      borderColor: 'border-red-500/20' 
    },
    'Cancelado': { 
      icon: XCircle, 
      color: 'text-slate-400', 
      bgColor: 'bg-slate-500/10', 
      borderColor: 'border-slate-500/20' 
    },
  };
  return configs[status] || configs['Pendiente'];
};

// ==================== TYPES ====================
export interface TimelineItem {
  id: string;
  type: string;
  description: string;
  date: string;
  amount: number;
  status: string;
  patientName?: string;
  currency: 'USD' | 'Bs';
  isPending: boolean;
}

export interface DebtInfo {
  totalDebt: number;
  pendingCount: number;
}

export interface PaymentData {
  paymentMethodId?: string;
  reference?: string;
  addAmountPaidUSD: number;
  addAmountPaidBs: number;
  exchangeRate: number;
  isPartial: boolean;
  creditAmountUsed?: number;
}

export type TabType = 'general' | 'mascotas' | 'transacciones' | 'documentos' | 'notas' | 'citas';

export const TABS: { id: TabType; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'mascotas', label: 'Mascotas' },
  { id: 'transacciones', label: 'Transacciones' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'notas', label: 'Notas' },
  { id: 'citas', label: 'Citas' },
];