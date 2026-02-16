import { useState, useMemo } from "react";
import { Stethoscope, ChevronRight, FileText, Eye, User, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPatients } from "../../api/patientAPI";
import type { Consultation } from "../../types/consultation";
import type { Patient } from "../../types/patient";
import ConsultationModal from "../consultations/ConsultationModal";
import { formatTime } from "@/utils/dashboardUtils";

interface ConsultationsSectionProps {
  consultations: Consultation[];
}

export function ConsultationsSection({ consultations }: ConsultationsSectionProps) {
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const isEmpty = consultations.length === 0;

  // Obtener información de pacientes
  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients,
    staleTime: 1000 * 60 * 5,
  });

  // Crear mapa de pacientes para búsqueda rápida
  const patientsMap = useMemo(() => {
    const map = new Map<string, Patient>();
    patients.forEach(patient => {
      map.set(patient._id, patient);
    });
    return map;
  }, [patients]);

  // Función para obtener info del paciente
  const getPatientInfo = (patientId: string) => {
    const patient = patientsMap.get(patientId);
    if (!patient) {
      return { 
        name: "Paciente", 
        owner: "Sin información",
        species: "Desconocido"
      };
    }
    
    const ownerName = typeof patient.owner === "object" 
      ? patient.owner.name 
      : "Sin dueño";
    
    return {
      name: patient.name,
      owner: ownerName,
      species: patient.species || "Sin especificar",
      photo: patient.photo
    };
  };

  return (
    <>
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border overflow-hidden animate-fade-in-up shadow-card">
        {/* Header */}
        <div className="px-4 py-3 bg-emerald-500/5 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-vet-text flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Stethoscope className="w-4 h-4 text-emerald-500" />
            </div>
            Consultas de Hoy
          </h2>
          
          <div className="flex items-center gap-2">
            {/* Badge contador */}
            <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full font-semibold border border-emerald-500/20">
              {consultations.length} {consultations.length === 1 ? 'consulta' : 'consultas'}
            </span>
            
            {/* Link "Ver todas" */}
            <Link
              to="/consultations"
              className="text-xs text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium flex items-center gap-0.5 transition-colors group"
            >
              Ver todas
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {isEmpty ? (
            /* Estado vacío */
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/5 rounded-full flex items-center justify-center animate-gentle-pulse border border-emerald-500/20">
                <Stethoscope className="w-8 h-8 text-emerald-500/50" />
              </div>
              <p className="text-vet-text text-sm font-medium">Sin consultas programadas</p>
              <p className="text-vet-muted text-xs mt-1">No hay consultas para hoy</p>
              
              {/* Botón CTA */}
              <Link
                to="/consultations"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium transition-colors border border-emerald-500/20"
              >
                <Stethoscope className="w-4 h-4" />
                Registrar consulta
              </Link>
            </div>
          ) : (
            /* Lista de consultas */
            <div className="space-y-2 max-h-85 overflow-y-auto pr-1 custom-scrollbar">
              {/* Primeras 3 consultas */}
              {consultations.slice(0, 3).map((consultation) => {
                const patientInfo = getPatientInfo(consultation.patientId);
                return (
                  <ConsultationItem
                    key={consultation._id}
                    consultation={consultation}
                    patientInfo={patientInfo}
                    onClick={() => setSelectedConsultation(consultation)}
                  />
                );
              })}
              
              {/* Separador si hay más de 3 */}
              {consultations.length > 3 && (
                <>
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-3 py-1 text-vet-muted rounded-full border border-border shadow-sm">
                        +{consultations.length - 3} más
                      </span>
                    </div>
                  </div>
                  
                  {/* Resto de consultas */}
                  {consultations.slice(3).map((consultation) => {
                    const patientInfo = getPatientInfo(consultation.patientId);
                    return (
                      <ConsultationItem
                        key={consultation._id}
                        consultation={consultation}
                        patientInfo={patientInfo}
                        onClick={() => setSelectedConsultation(consultation)}
                      />
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalle */}
      {selectedConsultation && (
        <ConsultationModal
          isOpen={!!selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
          consultation={selectedConsultation}
        />
      )}
    </>
  );
}

// Componente interno mejorado
interface ConsultationItemProps {
  consultation: Consultation;
  patientInfo: {
    name: string;
    owner: string;
    species: string;
    photo?: string | null;
  };
  onClick: () => void;
}

function ConsultationItem({ consultation, patientInfo, onClick }: ConsultationItemProps) {
  return (
    <div 
      className="flex items-center gap-3 p-3 bg-card/60 backdrop-blur-sm rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-soft hover:shadow-emerald-500/10 transition-all duration-300 group animate-fadeIn cursor-pointer"
      onClick={onClick}
    >
      {/* Foto o icono del paciente */}
      <div className="relative shrink-0">
        {patientInfo.photo ? (
          <img
            src={patientInfo.photo}
            alt={patientInfo.name}
            className="w-11 h-11 rounded-xl object-cover border-2 border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors"
          />
        ) : (
          <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <FileText className="w-5 h-5 text-emerald-500" />
          </div>
        )}
        
        {/* Badge de tipo */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center border border-card shadow-sm">
          <Stethoscope className="w-3 h-3 text-emerald-500" />
        </div>
      </div>
      
      {/* Información */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-semibold text-vet-text text-sm truncate">
            {patientInfo.name}
          </p>
          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-medium border border-emerald-500/20">
            {patientInfo.species}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-vet-muted mb-1">
          <User className="w-3 h-3 shrink-0" />
          <span className="truncate">{patientInfo.owner}</span>
        </div>
        
        <p className="text-xs text-emerald-500 truncate italic">
          "{consultation.presumptiveDiagnosis}"
        </p>
      </div>
      
      {/* Precio y hora */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        {/* Precio */}
        <div className="px-2.5 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            ${consultation.cost ? consultation.cost : "0.00"}
          </p>
        </div>
        
        {/* Hora */}
        <div className="flex items-center gap-1 text-xs text-vet-muted">
          <Clock className="w-3 h-3" />
          <span>{formatTime(consultation.consultationDate)}</span>
        </div>
        
        {/* Botón ver detalle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors opacity-0 group-hover:opacity-100 border border-emerald-500/20"
          title="Ver detalle"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}