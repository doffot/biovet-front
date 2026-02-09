import type { VaccinationFormData } from "@/types/vaccination";

// Extendemos tu tipo original (VaccinationFormData) 
// para agregar el campo visual "customVaccineName" que usa el formulario
export type VaccinationFormValues = VaccinationFormData & {
  customVaccineName?: string;
};