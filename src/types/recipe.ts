import { z } from "zod";

// Schema para cada medicamento
const MedicationSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  presentation: z.string().min(1, "La presentación es obligatoria"),
  source: z
    .union([z.literal("veterinario"), z.literal("farmacia")])
    .refine((val) => ["veterinario", "farmacia"].includes(val), {
      message: "Debe ser 'veterinario' o 'farmacia'",
    }),
  instructions: z.string().min(1, "El modo de uso es obligatorio"),
  quantity: z.string().optional(),
});

// Schema flexible para campos que pueden venir poblados (Objeto) o sin poblar (ID string)
const PopulatedFieldSchema = z.union([
  z.string(),
  z.object({
    _id: z.string(),
    name: z.string().optional(),
    lastName: z.string().optional(),
    // Agrega más campos si el populate trae más datos (e.g. especie, raza)
    species: z.string().optional(),
    breed: z.string().optional(),
  })
]).nullable().optional();

// Schema principal de la Receta
export const recipeSchema = z.object({
  _id: z.string(),
  
  // Estos campos ahora aceptan String (ID) u Objeto (Populated)
  patientId: PopulatedFieldSchema,
  veterinarianId: PopulatedFieldSchema,
  
  consultationId: z.string().optional().nullable(),
  issueDate: z.string(),
  medications: z.array(MedicationSchema).min(1, "Debe incluir al menos un medicamento"),
  notes: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const recipesListSchema = z.array(recipeSchema);

// Tipos derivados
export type Medication = z.infer<typeof MedicationSchema>;
export type Recipe = z.infer<typeof recipeSchema>;

// Tipo para el formulario (lo que enviamos al crear/editar)
export type MedicationFormData = {
  name: string;
  presentation: string;
  source: "veterinario" | "farmacia";
  instructions: string;
  quantity?: string;
};

export type RecipeFormData = {
  issueDate: string;
  consultationId?: string;
  medications: MedicationFormData[];
  notes?: string;
};