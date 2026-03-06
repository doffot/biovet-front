import { AxiosError } from "axios";
import api from "../lib/axios";
import { 
  labExamSchema, 
  hematologySchema,
  cytologySchema,
  skinScrapingSchema,
  trichogramSchema,
  quickTestSchema,
  urinalysisSchema,
  type LabExam, 
  type LabExamFormData
} from "@/types/labExam";

// Helper de errores
const handleErrors = (error: unknown) => {
  if (error instanceof AxiosError && error.response) {
    throw new Error(error.response.data.msg || "Ocurrió un error inesperado.");
  }
  throw new Error("Error de red o desconocido.");
};

// Validación dinámica según examType
const validateLabExam = (data: any): LabExam => {
  const examType = data.examType || "hematology";
  let result;
  
  switch (examType) {
    case "hematology": result = hematologySchema.safeParse(data); break;
    case "cytology": result = cytologySchema.safeParse(data); break;
    case "skin_scraping": result = skinScrapingSchema.safeParse(data); break;
    case "trichogram": result = trichogramSchema.safeParse(data); break;
    case "quick_test": result = quickTestSchema.safeParse(data); break;
    case "urinalysis": result = urinalysisSchema.safeParse(data); break;
    default: result = labExamSchema.safeParse(data);
  }

  if (!result.success) {
    console.error(`Error validando ${examType}:`, result.error.format());
    throw new Error(`Datos de ${examType} inválidos del servidor.`);
  }

  return result.data;
};

// --- MÉTODOS API ---

export async function createLabExam(formData: LabExamFormData): Promise<LabExam> {
  try {
    const { data } = await api.post(`/lab-exams`, formData);
    return validateLabExam(data);
  } catch (error) {
    handleErrors(error);
    return Promise.reject(error);
  }
}

export async function getAllLabExams(): Promise<LabExam[]> {
  try {
    const { data } = await api.get(`/lab-exams`);
    return data.map((exam: any) => validateLabExam(exam));
  } catch (error) {
    handleErrors(error);
    return Promise.reject(error);
  }
}

export async function getLabExamById(id: string): Promise<LabExam> {
  try {
    const { data } = await api.get(`/lab-exams/${id}`);
    return validateLabExam(data);
  } catch (error) {
    handleErrors(error);
    return Promise.reject(error);
  }
}

export async function getLabExamsByPatient(patientId: string): Promise<LabExam[]> {
  try {
    const { data } = await api.get(`/lab-exams/patient/${patientId}`);
    return data.map((exam: any) => validateLabExam(exam));
  } catch (error) {
    handleErrors(error);
    return Promise.reject(error);
  }
}

export async function updateLabExam(id: string, formData: Partial<LabExamFormData>): Promise<LabExam> {
  try {
    const { data } = await api.put(`/lab-exams/${id}`, formData);
    const examData = data.labExam || data;
    return validateLabExam(examData);
  } catch (error) {
    handleErrors(error);
    return Promise.reject(error);
  }
}

export async function deleteLabExam(id: string): Promise<void> {
  try {
    await api.delete(`/lab-exams/${id}`);
  } catch (error) {
    handleErrors(error);
    return Promise.reject(error);
  }
}

export async function searchPatients(query: string) {
  const { data } = await api.get(`/patients/search?q=${query}`);
  return data;
}