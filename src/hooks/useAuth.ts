// src/hooks/useAuth.ts
import { useQuery } from "@tanstack/react-query";
import { getUser } from "../api/AuthAPI";
import type { User } from "@/types/auth";

export const useAuth = () => {
  const { data, isError, isLoading } = useQuery<User>({
    queryKey: ['user'],
    queryFn: getUser,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const patientLimit = 50;
  
  // Lógica de expiración de tiempo
  const now = new Date();
  const expirationDate = data?.trialEndedAt ? new Date(data.trialEndedAt) : null;
  const isTimeExpired = expirationDate ? now > expirationDate : false;

  const plan = {
    currentPatients: data?.patientCount ?? 0,
    type: data?.planType ?? 'trial',
    isTrial: data?.planType === 'trial',
    limit: patientLimit,
    expirationDate,
    isTimeExpired,
    
    // El plan está bloqueado si: es trial Y (llegó al límite de pacientes O se acabó el tiempo)
    get isBlocked() {
      if (!this.isTrial) return false;
      return this.currentPatients >= this.limit || this.isTimeExpired;
    },

    // Mensaje específico del error
    get blockReason() {
      if (!this.isTrial) return "";
      if (this.isTimeExpired) return "Tu periodo de prueba ha expirado.";
      if (this.currentPatients >= this.limit) return "Has alcanzado el límite de 50 pacientes.";
      return "";
    }
  };

  return { data, isError, isLoading, plan };
};