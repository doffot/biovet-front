import {
  Calendar,
  User,
  CheckCircle,
  Edit,
  Eye,
  AlertCircle,
  Scissors,
  Bath,
  Sparkles,
  PawPrint,
} from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import EditGroomingServiceModal from "./EditGroomingServiceModal";

type PatientIdType =
  | string
  | {
      _id: string;
      name?: string;
      species?: string;
      breed?: string;
    };

interface ServiceTableProps {
  filteredServices: any[];
  getPatientName: (patientId: PatientIdType) => string;
  getPatientSpecies: (patientId: PatientIdType) => string;
  getPatientBreed: (patientId: PatientIdType) => string;
  formatDate: (dateString: string) => string;
  getServiceIcon: (serviceType: string) => string;
  getPaymentStatusBadge: (status: string) => string;
  getPaymentStatusIcon: (status: string) => React.JSX.Element;
  formatCurrency: (
    amount: number,
    currency: string,
    exchangeRate?: number
  ) => string;
}

// ✅ Iconos Lucide en vez de emojis
const SERVICE_ICONS: Record<string, React.ReactNode> = {
  Corte: (
    <Scissors className="w-3.5 h-3.5 text-biovet-500 dark:text-biovet-400" />
  ),
  Baño: (
    <Bath className="w-3.5 h-3.5 text-biovet-add dark:text-biovet-400" />
  ),
  "Corte y Baño": (
    <Sparkles className="w-3.5 h-3.5 text-biovet-600 dark:text-biovet-300" />
  ),
};

const getServiceLucideIcon = (serviceType: string): React.ReactNode => {
  return (
    SERVICE_ICONS[serviceType] || (
      <PawPrint className="w-3.5 h-3.5 text-surface-500 dark:text-slate-400" />
    )
  );
};

export default function ServiceTable({
  filteredServices,
  getPatientName,
  getPatientSpecies,
  getPatientBreed,
  formatDate,
  getPaymentStatusBadge,
  getPaymentStatusIcon,
  formatCurrency,
}: ServiceTableProps) {
  const [editingService, setEditingService] = useState<any>(null);

  const getPatientId = (patientId: PatientIdType): string => {
    if (typeof patientId === "string") {
      return patientId;
    } else {
      return patientId._id;
    }
  };

  return (
    <>
      <div
        className="hidden lg:block 
                      bg-white dark:bg-dark-100 
                      rounded-xl 
                      border border-surface-300 dark:border-slate-700 
                      shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div
          className="px-4 py-3 
                        bg-surface-50/50 dark:bg-dark-200/50 
                        border-b border-surface-300 dark:border-slate-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-surface-800 dark:text-white">
                Servicios
              </h3>
              <span className="badge badge-biovet">
                {filteredServices.length}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-surface-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                <span>Pagado</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                <span>Parcial</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-surface-400 dark:bg-slate-500 rounded-full"></div>
                <span>Pendiente</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead
              className="bg-surface-50 dark:bg-dark-200 
                            text-xs 
                            border-b border-surface-300 dark:border-slate-700"
            >
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Fecha
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-4 py-3 text-left font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="px-4 py-3 text-left font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                  Pago
                </th>
                <th className="px-4 py-3 text-right font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                  Montos
                </th>
                <th className="px-4 py-3 text-center font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-slate-700/50">
              {filteredServices.map((service) => {
                const patientId = service.patientId as PatientIdType;
                const paymentInfo = service.paymentInfo || {};
                const serviceCost = Number(service.cost) || 0;

                return (
                  <tr
                    key={service._id}
                    className="hover:bg-surface-50 dark:hover:bg-dark-200/50 transition-colors duration-150"
                  >
                    {/* Fecha */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-medium text-surface-800 dark:text-slate-200">
                        {formatDate(service.date)}
                      </span>
                    </td>

                    {/* Paciente */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 
                                        bg-linear-to-br from-biovet-500 to-biovet-600 
                                        dark:from-biovet-600 dark:to-biovet-700 
                                        rounded-lg flex items-center justify-center 
                                        border border-biovet-400/30 dark:border-biovet-700/30 
                                        shadow-sm"
                        >
                          <User className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <p className="text-xs font-medium text-surface-800 dark:text-white truncate max-w-25">
                            {getPatientName(patientId)}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-surface-500 dark:text-slate-400">
                            <span className="truncate max-w-20">
                              {getPatientSpecies(patientId)}
                            </span>
                            {getPatientBreed(patientId) && (
                              <>
                                <span>•</span>
                                <span className="truncate m20">
                                  {getPatientBreed(patientId)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Servicio */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 
                                        bg-biovet-50 dark:bg-biovet-950 
                                        border border-biovet-200 dark:border-biovet-800 
                                        rounded-md flex items-center justify-center"
                        >
                          {getServiceLucideIcon(service.service)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-surface-800 dark:text-white truncate max-w-32">
                            {service.service}
                          </span>
                          {service.specifications && (
                            <p className="text-[10px] text-surface-500 dark:text-slate-400 mt-0.5 truncate max-w-35">
                              {service.specifications}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Estado del Pago */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 ${getPaymentStatusBadge(paymentInfo.paymentStatus || "Sin facturar")}`}
                        >
                          {getPaymentStatusIcon(
                            paymentInfo.paymentStatus || "Sin facturar"
                          )}
                          {paymentInfo.paymentStatus || "Sin facturar"}
                        </span>
                        {paymentInfo.amountPaid > 0 && (
                          <div className="flex items-center gap-1 text-[10px]">
                            <CheckCircle className="w-2.5 h-2.5 text-success-500 dark:text-success-400" />
                            <span className="text-surface-500 dark:text-slate-400">
                              {formatCurrency(
                                paymentInfo.amountPaid,
                                paymentInfo.currency || "USD"
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Montos */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-bold text-biovet-500 dark:text-biovet-400">
                          ${serviceCost.toFixed(2)}
                        </span>

                        {paymentInfo.paymentStatus === "Pendiente" ? (
                          <span className="text-[10px] font-medium text-warning-500 dark:text-warning-400">
                            Por cobrar
                          </span>
                        ) : paymentInfo.paymentStatus === "Parcial" ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[10px] font-medium text-biovet-add dark:text-biovet-400">
                              Pendiente: $
                              {(serviceCost - paymentInfo.amountPaid).toFixed(2)}
                            </span>
                            <div
                              className="w-16 h-1 
                                            bg-surface-200 dark:bg-dark-200 
                                            rounded-full overflow-hidden 
                                            border border-surface-300 dark:border-slate-700"
                            >
                              <div
                                className="h-full bg-biovet-500 rounded-full transition-all duration-300"
                                style={{
                                  width: `${(paymentInfo.amountPaid / serviceCost) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : paymentInfo.paymentStatus === "Pagado" ? (
                          <div className="flex items-center gap-1 text-[10px] text-success-500 dark:text-success-400">
                            <CheckCircle className="w-2.5 h-2.5" />
                            <span>Completado</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] text-surface-500 dark:text-slate-400">
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>Sin facturar</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/patients/${getPatientId(patientId)}/grooming/${service._id}`}
                          className="btn-icon-edit w-8 h-8"
                          title="Ver detalles"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        
                        <button
                          onClick={() => setEditingService(service)}
                          className="inline-flex items-center justify-center 
                                     w-8 h-8 rounded-md 
                                     bg-biovet-50 dark:bg-biovet-950 
                                     border border-biovet-200 dark:border-biovet-800 
                                     text-biovet-500 dark:text-biovet-400 
                                     hover:bg-biovet-100 dark:hover:bg-biovet-900 
                                     transition-colors cursor-pointer"
                          title="Editar servicio"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Estado vacío */}
          {filteredServices.length === 0 && (
            <div className="text-center py-8">
              <div
                className="w-16 h-16 
                              bg-surface-100 dark:bg-dark-200 
                              border border-surface-300 dark:border-slate-700 
                              rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <Scissors className="w-6 h-6 text-surface-500 dark:text-slate-500" />
              </div>
              <h4 className="text-sm font-medium text-surface-800 dark:text-white mb-1">
                No se encontraron servicios
              </h4>
              <p className="text-xs text-surface-500 dark:text-slate-400 max-w-xs mx-auto">
                No hay servicios que coincidan con los criterios actuales.
              </p>
            </div>
          )}
        </div>
      </div>

      
      {editingService && (
        <EditGroomingServiceModal
          isOpen={!!editingService}
          onClose={() => setEditingService(null)}
          service={editingService}
        />
      )}
    </>
  );
}