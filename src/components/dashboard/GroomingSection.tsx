import { useState, useMemo } from "react";
import {
  Scissors,
  ChevronRight,
  User,
  Phone,
  Clock,
  Sparkles,
  X,
  Calendar,
  DollarSign,
  FileText,
  PawPrint,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOwners } from "../../api/OwnerAPI";
import { getPatients } from "../../api/patientAPI";
import type { Owner } from "../../types/owner";
import type { Patient } from "../../types/patient";
import type { GroomingService } from "@/types/grooming";
import { formatTime } from "@/utils/dashboardUtils";

interface GroomingSectionProps {
  groomingServices: GroomingService[];
}

export function GroomingSection({ groomingServices }: GroomingSectionProps) {
  const navigate = useNavigate();
  const isEmpty = groomingServices.length === 0;

  const [selectedService, setSelectedService] =
    useState<GroomingService | null>(null);
  const [selectedServiceInfo, setSelectedServiceInfo] = useState<{
    patientName: string;
    patientPhoto: string | null;
    ownerName: string;
    ownerContact: string;
  } | null>(null);

  const { data: owners = [] } = useQuery<Owner[]>({
    queryKey: ["owners"],
    queryFn: getOwners,
    staleTime: 1000 * 60 * 5,
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: getPatients,
    staleTime: 1000 * 60 * 5,
  });

  const ownersMap = useMemo(() => {
    const map = new Map<string, Owner>();
    (owners as Owner[]).forEach((owner: Owner) => {
      map.set(owner._id, owner);
    });
    return map;
  }, [owners]);

  const patientsMap = useMemo(() => {
    const map = new Map<string, Patient>();
    (patients as Patient[]).forEach((patient: Patient) => {
      map.set(patient._id, patient);
    });
    return map;
  }, [patients]);

  const getServiceInfo = (service: GroomingService) => {
    let patientId = "";
    let patientName = "Paciente";
    let patientPhoto: string | null = null;
    let ownerName = "Sin dueño";
    let ownerContact = "";

    if (typeof service.patientId === "string") {
      patientId = service.patientId;
      const patient = patientsMap.get(patientId);
      if (patient) {
        patientName = patient.name;
        patientPhoto = patient.photo || null;
        if (typeof patient.owner === "string") {
          const owner = ownersMap.get(patient.owner);
          if (owner) {
            ownerName = owner.name;
            ownerContact = owner.contact || "";
          }
        } else if (typeof patient.owner === "object" && patient.owner) {
          ownerName = patient.owner.name;
          const owner = ownersMap.get(patient.owner._id);
          if (owner) {
            ownerContact = owner.contact || "";
          }
        }
      }
    } else if (typeof service.patientId === "object" && service.patientId) {
      patientId = service.patientId._id || "";
      patientName = service.patientId.name || "Paciente";
      // Buscar foto del paciente en el mapa
      const patient = patientsMap.get(patientId);
      patientPhoto = patient?.photo || null;

      if (service.patientId.owner) {
        if (typeof service.patientId.owner === "string") {
          const owner = ownersMap.get(service.patientId.owner);
          if (owner) {
            ownerName = owner.name;
            ownerContact = owner.contact || "";
          }
        } else if (typeof service.patientId.owner === "object") {
          ownerName = service.patientId.owner.name || "Sin dueño";
          const ownerId = service.patientId.owner._id;
          if (ownerId) {
            const owner = ownersMap.get(ownerId);
            if (owner) {
              ownerContact = owner.contact || "";
            }
          }
        }
      }
    }

    return { patientId, patientName, patientPhoto, ownerName, ownerContact };
  };

  const handleServiceClick = (service: GroomingService) => {
    const info = getServiceInfo(service);
    setSelectedService(service);
    setSelectedServiceInfo(info);
  };

  return (
    <>
      <div
        className="bg-white/40 dark:bg-dark-100/40 
                      backdrop-blur-sm rounded-2xl 
                      border border-surface-300 dark:border-slate-700 
                      overflow-hidden shadow-sm"
      >
        {/* Header */}
        <div
          className="px-4 py-3 
                        bg-biovet-50/50 dark:bg-biovet-950/30 
                        border-b border-surface-300 dark:border-slate-700 
                        flex items-center justify-between"
        >
          <h2 className="font-semibold text-surface-800 dark:text-white flex items-center gap-2">
            <div
              className="p-1.5 
                            bg-biovet-50 dark:bg-biovet-950 
                            rounded-lg 
                            border border-biovet-200 dark:border-biovet-800"
            >
              <Scissors className="w-4 h-4 text-biovet-add dark:text-biovet-400" />
            </div>
            Peluquería de Hoy
          </h2>

          <div className="flex items-center gap-2">
            <span className="badge badge-biovet">
              {groomingServices.length}{" "}
              {groomingServices.length === 1 ? "servicio" : "servicios"}
            </span>

            <Link
              to="/grooming-services"
              className="text-xs text-biovet-add dark:text-biovet-400 
                         hover:text-biovet-600 dark:hover:text-biovet-300 
                         font-medium flex items-center gap-0.5 
                         transition-colors group"
            >
              Ver todos
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {isEmpty ? (
            <div className="text-center py-12">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div
                  className="absolute inset-0 
                                bg-biovet-100 dark:bg-biovet-950 
                                rounded-full animate-pulse blur-xl"
                ></div>
                <div
                  className="relative w-16 h-16 
                                bg-biovet-50 dark:bg-biovet-950 
                                rounded-full flex items-center justify-center 
                                border border-biovet-200 dark:border-biovet-800"
                >
                  <Scissors className="w-8 h-8 text-biovet-400 dark:text-biovet-600" />
                </div>
              </div>
              <p className="text-surface-800 dark:text-slate-200 text-sm font-medium">
                Sin servicios programados
              </p>
              <p className="text-surface-500 dark:text-slate-400 text-xs mt-1">
                No hay servicios de peluquería para hoy
              </p>

              <Link
                to="/grooming-services"
                className="inline-flex items-center gap-2 mt-4 
                           px-4 py-2 
                           bg-biovet-50 dark:bg-biovet-950 
                           hover:bg-biovet-100 dark:hover:bg-biovet-900 
                           text-biovet-600 dark:text-biovet-400 
                           rounded-lg text-sm font-medium 
                           transition-colors 
                           border border-biovet-200 dark:border-biovet-800"
              >
                <Sparkles className="w-4 h-4" />
                Programar servicio
              </Link>
            </div>
          ) : (
            <div className="space-y-2 max-h-85 overflow-y-auto pr-1 custom-scrollbar">
              {groomingServices.slice(0, 3).map((service) => {
                const serviceInfo = getServiceInfo(service);
                return (
                  <div
                    key={service._id}
                    onClick={() => handleServiceClick(service)}
                    className="cursor-pointer"
                  >
                    <GroomingItem
                      time={formatTime(service.date)}
                      patientName={serviceInfo.patientName}
                      patientPhoto={serviceInfo.patientPhoto}
                      ownerName={serviceInfo.ownerName}
                      ownerContact={serviceInfo.ownerContact}
                      service={service.service}
                      specifications={service.specifications}
                    />
                  </div>
                );
              })}

              {groomingServices.length > 3 && (
                <>
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-surface-300 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span
                        className="bg-white dark:bg-dark-100 
                                      px-3 py-1 
                                      text-surface-500 dark:text-slate-400 
                                      rounded-full 
                                      border border-surface-300 dark:border-slate-700 
                                      shadow-sm"
                      >
                        +{groomingServices.length - 3} más
                      </span>
                    </div>
                  </div>

                  {groomingServices.slice(3).map((service) => {
                    const serviceInfo = getServiceInfo(service);
                    return (
                      <div
                        key={service._id}
                        onClick={() => handleServiceClick(service)}
                        className="cursor-pointer"
                      >
                        <GroomingItem
                          time={formatTime(service.date)}
                          patientName={serviceInfo.patientName}
                          patientPhoto={serviceInfo.patientPhoto}
                          ownerName={serviceInfo.ownerName}
                          ownerContact={serviceInfo.ownerContact}
                          service={service.service}
                          specifications={service.specifications}
                        />
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalle */}
      {selectedService && selectedServiceInfo && (
        <GroomingModal
          isOpen={!!selectedService}
          onClose={() => {
            setSelectedService(null);
            setSelectedServiceInfo(null);
          }}
          service={selectedService}
          serviceInfo={selectedServiceInfo}
          onNavigate={() => {
            const info = getServiceInfo(selectedService);
            if (info.patientId) {
              navigate(
                `/patients/${info.patientId}/grooming-services/${selectedService._id}`
              );
            }
          }}
        />
      )}
    </>
  );
}

// ==========================================
// GroomingItem - CON FOTO
// ==========================================
function GroomingItem({
  time,
  patientName,
  patientPhoto,
  ownerName,
  ownerContact,
  service,
  specifications,
}: {
  time: string;
  patientName: string;
  patientPhoto: string | null;
  ownerName: string;
  ownerContact: string;
  service: string;
  specifications: string;
}) {
  const formatContact = (contact: string) => {
    if (!contact) return "";
    if (contact.length > 11) return `...${contact.slice(-8)}`;
    return contact;
  };

  return (
    <div
      className="flex items-center gap-3 p-3 
                    bg-white/60 dark:bg-dark-100/60 
                    backdrop-blur-sm rounded-xl 
                    border border-biovet-200 dark:border-biovet-800 
                    hover:border-biovet-300 dark:hover:border-biovet-700 
                    hover:shadow-sm hover:shadow-biovet-500/10 
                    transition-all duration-300 
                    group"
    >
      {/* ✅ Foto del paciente o icono fallback */}
      <div className="relative shrink-0">
        {patientPhoto ? (
          <img
            src={patientPhoto}
            alt={patientName}
            className="w-11 h-11 rounded-xl object-cover 
                       border-2 border-biovet-200 dark:border-biovet-800 
                       group-hover:border-biovet-300 dark:group-hover:border-biovet-700 
                       transition-colors"
          />
        ) : (
          <div
            className="w-11 h-11 
                          bg-biovet-50 dark:bg-biovet-950 
                          rounded-xl flex items-center justify-center 
                          border border-biovet-200 dark:border-biovet-800"
          >
            <PawPrint className="w-5 h-5 text-biovet-add dark:text-biovet-400" />
          </div>
        )}

        {/* Badge decorativo */}
        <div
          className="absolute -bottom-1 -right-1 
                        w-5 h-5 
                        bg-biovet-100 dark:bg-biovet-900 
                        rounded-full flex items-center justify-center 
                        border border-white dark:border-dark-100 
                        shadow-sm"
        >
          <Scissors className="w-3 h-3 text-biovet-add dark:text-biovet-400" />
        </div>
      </div>

      {/* Información */}
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-surface-800 dark:text-white text-sm truncate 
                       group-hover:text-biovet-500 dark:group-hover:text-biovet-400 
                       transition-colors"
        >
          {patientName}
        </p>

        <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-slate-400 mt-0.5">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3 shrink-0" />
            <span className="truncate">{ownerName}</span>
          </div>
          {ownerContact && (
            <>
              <span className="text-surface-400 dark:text-slate-600">•</span>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 shrink-0" />
                <span className="text-[10px]">
                  {formatContact(ownerContact)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Servicio y especificaciones */}
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className="text-xs px-2 py-0.5 
                          bg-biovet-50 dark:bg-biovet-950 
                          text-biovet-600 dark:text-biovet-400 
                          rounded-full font-medium 
                          border border-biovet-200 dark:border-biovet-800"
          >
            {service}
          </span>
          {specifications && (
            <span className="text-xs text-surface-500 dark:text-slate-400 truncate italic">
              "{specifications}"
            </span>
          )}
        </div>
      </div>

      {/* Hora */}
      <div
        className="flex items-center gap-1.5 
                      text-xs font-semibold 
                      text-biovet-600 dark:text-biovet-400 
                      bg-surface-50 dark:bg-dark-200 
                      px-3 py-2 rounded-lg 
                      border border-surface-300 dark:border-slate-700 
                      shrink-0 shadow-sm"
      >
        <Clock className="w-3.5 h-3.5" />
        <span>{time}</span>
      </div>
    </div>
  );
}

// ==========================================
// GroomingModal - CON FOTO
// ==========================================
interface GroomingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: GroomingService;
  serviceInfo: {
    patientName: string;
    patientPhoto: string | null;
    ownerName: string;
    ownerContact: string;
  };
  onNavigate: () => void;
}

function GroomingModal({
  isOpen,
  onClose,
  service,
  serviceInfo,
}: GroomingModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="bg-white dark:bg-dark-100 
                      rounded-2xl shadow-xl w-full max-w-md 
                      overflow-hidden 
                      border border-surface-300 dark:border-slate-700"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 
                        border-b border-surface-300 dark:border-slate-700 
                        bg-linear-to-r from-biovet-50 dark:from-biovet-950 to-white dark:to-dark-100"
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 
                            bg-biovet-50 dark:bg-biovet-950 
                            rounded-xl 
                            border border-biovet-200 dark:border-biovet-800"
            >
              <Scissors className="w-5 h-5 text-biovet-add dark:text-biovet-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-surface-800 dark:text-white">
                Detalle de Servicio
              </h3>
              <p className="text-sm text-surface-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(service.date)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg 
                       hover:bg-surface-100 dark:hover:bg-dark-200 
                       text-surface-500 dark:text-slate-400 
                       hover:text-surface-800 dark:hover:text-white 
                       transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* ✅ Paciente con foto */}
          <div
            className="bg-surface-50 dark:bg-dark-200 
                          rounded-lg p-3 
                          border border-surface-300 dark:border-slate-700"
          >
            <h4 className="text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              Paciente
            </h4>
            <div className="flex items-center gap-3">
              {/* Foto o fallback */}
              {serviceInfo.patientPhoto ? (
                <img
                  src={serviceInfo.patientPhoto}
                  alt={serviceInfo.patientName}
                  className="w-14 h-14 rounded-xl object-cover 
                             border-2 border-biovet-200 dark:border-biovet-800"
                />
              ) : (
                <div
                  className="w-14 h-14 
                                bg-biovet-50 dark:bg-biovet-950 
                                rounded-xl flex items-center justify-center 
                                border border-biovet-200 dark:border-biovet-800"
                >
                  <PawPrint className="w-7 h-7 text-biovet-400 dark:text-biovet-600" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-surface-800 dark:text-white text-sm">
                  {serviceInfo.patientName}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-slate-400 mt-1">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{serviceInfo.ownerName}</span>
                </div>
                {serviceInfo.ownerContact && (
                  <div className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-slate-400 mt-0.5">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{serviceInfo.ownerContact}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Servicio */}
          <div
            className="bg-surface-50 dark:bg-dark-200 
                          rounded-lg p-3 
                          border border-surface-300 dark:border-slate-700"
          >
            <h4 className="text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Servicio
            </h4>
            <div className="flex items-center gap-2">
              <span className="badge badge-biovet">{service.service}</span>
            </div>
            {service.specifications && (
              <div className="mt-2">
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="w-4 h-4 text-surface-500 dark:text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-surface-700 dark:text-slate-300 italic">
                    "{service.specifications}"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Costo */}
          <div
            className="bg-biovet-50 dark:bg-biovet-950 
                          rounded-lg p-3 
                          border border-biovet-200 dark:border-biovet-800"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wide">
                Costo
              </span>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-biovet-500 dark:text-biovet-400" />
                <span className="text-xl font-bold text-biovet-600 dark:text-biovet-400">
                  {service.cost ? `$${service.cost.toFixed(2)}` : "$0.00"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-3 p-4 
                        border-t border-surface-300 dark:border-slate-700 
                        bg-surface-50 dark:bg-dark-200"
        >
          <button onClick={onClose} className="btn-secondary flex-1">
            Cerrar
          </button>
         
        </div>
      </div>
    </div>
  );
}