// src/components/grooming/ServiceMobileCards.tsx
import { Calendar, Edit, Eye, CreditCard, AlertCircle } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface ServiceMobileCardsProps {
  filteredServices: any[];
  getPatientName: (patientId: any) => string;
  getPatientSpecies: (patientId: any) => string;
  getPatientBreed: (patientId: any) => string;
  formatDate: (dateString: string) => string;
  getServiceIcon: (serviceType: string) => string;
  getPaymentStatusBadge: (status: string) => string;
  getPaymentStatusIcon: (status: string) => React.JSX.Element;
  formatCurrency: (amount: number, currency: string, exchangeRate?: number) => string;
}

export default function ServiceMobileCards({
  filteredServices,
  getPatientName,
  getPatientSpecies,
  getPatientBreed,
  formatDate,
  getServiceIcon,
  getPaymentStatusBadge,
  getPaymentStatusIcon,
  formatCurrency
}: ServiceMobileCardsProps) {
  
  const getPatientId = (patientId: any): string => {
    if (!patientId) return '';
    if (typeof patientId === 'string') return patientId;
    return patientId._id || '';
  };

  return (
    <div className="lg:hidden grid gap-4">
      {filteredServices.map((service) => {
        const paymentInfo = service.paymentInfo || {};
        const serviceCost = Number(service.cost) || 0;
        const patientId = getPatientId(service.patientId);
        
        const isPaid = paymentInfo.paymentStatus === 'Pagado';
        const isPartial = paymentInfo.paymentStatus === 'Parcial';
        const isPending = paymentInfo.paymentStatus === 'Pendiente';
        
        return (
          <div key={service._id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-card">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-vet-muted mb-2">
                  <Calendar className="w-4 h-4 text-vet-muted" />
                  <span>{formatDate(service.date)}</span>
                </div>
                <p className="text-lg font-semibold text-vet-text">
                  {getPatientName(service.patientId)}
                </p>
                <p className="text-sm text-vet-muted">
                  {getPatientSpecies(service.patientId)}
                  {getPatientBreed(service.patientId) && ` • ${getPatientBreed(service.patientId)}`}
                </p>
              </div>
              
              {/* Monto del servicio */}
              <div className="text-right">
                <span className="text-lg font-bold text-vet-text">
                  ${serviceCost.toFixed(2)}
                </span>
                {paymentInfo.currency && paymentInfo.currency !== 'USD' && (
                  <p className="text-xs text-vet-muted mt-1">
                    {formatCurrency(serviceCost, paymentInfo.currency, paymentInfo.exchangeRate)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-slate-700">
              {/* Tipo de servicio y estado de pago */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getServiceIcon(service.service)}</span>
                  <span className="font-medium text-vet-text">{service.service}</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(paymentInfo.paymentStatus || 'Sin facturar')}`}>
                  {getPaymentStatusIcon(paymentInfo.paymentStatus || 'Sin facturar')}
                  {paymentInfo.paymentStatus || 'Sin facturar'}
                </span>
              </div>

              {/* Información de pago */}
              <div className="bg-slate-900 rounded-lg p-3 space-y-2">
                {isPaid ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-vet-muted">Estado:</span>
                      <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        Pagado completo
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-vet-muted">Monto pagado:</span>
                      <span className="text-sm text-vet-text">
                        {formatCurrency(paymentInfo.amountPaid || 0, paymentInfo.currency || 'USD')}
                      </span>
                    </div>
                    {paymentInfo.paymentReference && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-vet-muted">Referencia:</span>
                        <span className="text-sm text-vet-text font-mono">
                          {paymentInfo.paymentReference}
                        </span>
                      </div>
                    )}
                  </>
                ) : isPartial ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-vet-muted">Pagado:</span>
                      <span className="text-sm font-semibold text-blue-400">
                        {formatCurrency(paymentInfo.amountPaid || 0, paymentInfo.currency || 'USD')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-vet-muted">Pendiente:</span>
                      <span className="text-sm font-semibold text-amber-400">
                        ${(serviceCost - (paymentInfo.amountPaid || 0)).toFixed(2)}
                      </span>
                    </div>
                    {/* Barra de progreso */}
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${((paymentInfo.amountPaid || 0) / serviceCost) * 100}%` }}
                      />
                    </div>
                  </>
                ) : isPending ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-vet-muted">Estado:</span>
                    <span className="text-sm font-semibold text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Por cobrar: ${serviceCost.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-vet-muted">Estado:</span>
                    <span className="text-sm text-vet-muted flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Sin facturar
                    </span>
                  </div>
                )}
              </div>

              {/* Especificaciones y observaciones */}
              {(service.specifications || service.observations) && (
                <div className="space-y-1">
                  {service.specifications && (
                    <p className="text-sm text-vet-text">
                      <span className="font-medium">Especificaciones:</span> {service.specifications}
                    </p>
                  )}
                  {service.observations && (
                    <p className="text-sm text-vet-muted">
                      <span className="font-medium">Observaciones:</span> {service.observations}
                    </p>
                  )}
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Link
                  to={`/patients/${patientId}/grooming-services/${service._id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-vet-text text-xs font-medium transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="w-3 h-3" />
                  Ver
                </Link>
                <Link
                  to={`/patients/${patientId}/grooming-services/${service._id}/edit`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-vet-primary/20 hover:bg-vet-primary/30 text-vet-primary text-xs font-medium transition-colors"
                  title="Editar servicio"
                >
                  <Edit className="w-3 h-3" />
                  Editar
                </Link>
                
                {/* Botón de pago si está pendiente */}
                {(isPending || isPartial) && (
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/40 text-red-400 text-xs font-medium transition-colors"
                    title="Pendiente de pago"
                  >
                    <CreditCard className="w-3 h-3" />
                    Cobrar
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}