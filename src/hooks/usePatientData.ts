import { useQuery } from "@tanstack/react-query";
import { getPatientById } from "@/api/patientAPI";

export function usePatientData(patientId: string | undefined | null) {
  const { data: patient, isLoading, isError } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId && typeof patientId === "string", // Solo ejecuta si hay ID válido
    staleTime: 1000 * 60 * 5, // 5 minutos de caché (los datos del paciente no cambian seguido)
  });

  // Lógica segura para obtener el nombre del dueño
  // El dueño puede venir como ID (string) o como Objeto poblado
  const ownerName = 
    patient?.owner && typeof patient.owner === 'object' && 'name' in patient.owner
      ? patient.owner.name 
      : "Sin propietario asignado";

  const ownerId = 
    patient?.owner && typeof patient.owner === 'object' && '_id' in patient.owner
      ? patient.owner._id 
      : (typeof patient?.owner === 'string' ? patient?.owner : undefined);

  return {
    patient,
    ownerName,
    ownerId,
    isLoading,
    isError,
    // Helpers extra para PDF o Vistas
    fullSpecies: patient ? `${patient.species} ${patient.breed ? `(${patient.breed})` : ''}` : "",
  };
}