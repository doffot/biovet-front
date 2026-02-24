import { User, Phone, PawPrint } from "lucide-react";

interface InvoiceClientInfoProps {
  ownerName: string;
  ownerPhone: string;
  patientName: string;
}

export function InvoiceClientInfo({ 
  ownerName, 
  ownerPhone, 
  patientName 
}: InvoiceClientInfoProps) {
  return (
    <div className="bg-white dark:bg-dark-100 border border-surface-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Sección Cliente */}
        <div className="space-y-3">
          <p className="label mb-0 text-[10px] uppercase tracking-[0.15em] opacity-60">
            Información del Cliente
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-biovet-50 dark:bg-biovet-950/30 text-biovet-500">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-heading font-bold text-slate-800 dark:text-white">
                {ownerName || "—"}
              </span>
            </div>

            {ownerPhone && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-100 dark:bg-dark-200 text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {ownerPhone}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sección Mascota */}
        <div className="space-y-3">
          <p className="label mb-0 text-[10px] uppercase tracking-[0.15em] opacity-60">
            Paciente
          </p>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-success-50 dark:bg-success-950/30 text-success-500">
              <PawPrint className="w-4 h-4" />
            </div>
            <span className="text-sm font-heading font-bold text-slate-800 dark:text-white">
              {patientName || "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}