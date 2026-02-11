import { AxiosError } from "axios";
import api from "../lib/axios";
import { recipeSchema, recipesListSchema, type Recipe, type RecipeFormData } from "../types/recipe";

// Crear receta
export async function createRecipe(patientId: string, formData: RecipeFormData): Promise<Recipe> {
  try {
    const { data } = await api.post(`/recipes/${patientId}`, formData);
    const response = recipeSchema.safeParse(data.recipe);
    if (response.success) {
      return response.data;
    }
    throw new Error("Datos de receta inválidos");
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear la receta");
    }
    throw new Error("Error de red o desconocido");
  }
}

// Obtener recetas por paciente
export async function getRecipesByPatient(patientId: string): Promise<Recipe[]> {
  try {
    const { data } = await api.get(`/recipes/patient/${patientId}`);
    const response = recipesListSchema.safeParse(data.recipes);
    if (response.success) {
      return response.data;
    }
    throw new Error("Datos de recetas inválidos");
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener recetas");
    }
    throw new Error("Error de red o desconocido");
  }
}

// Obtener receta por ID
export async function getRecipeById(id: string): Promise<Recipe> {
  try {
    const { data } = await api.get(`/recipes/${id}`);
    const response = recipeSchema.safeParse(data.recipe);
    console.log(response);
    if (response.success) {
      return response.data;
    }
    throw new Error("Datos de receta inválidos");
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener receta");
    }
    throw new Error("Error de red o desconocido");
  }
}

// Actualizar receta
export async function updateRecipe(id: string, formData: Partial<RecipeFormData>): Promise<Recipe> {
  try {
    const { data } = await api.put(`/recipes/${id}`, formData);
    const response = recipeSchema.safeParse(data.recipe);
    if (response.success) {
      return response.data;
    }
    throw new Error("Datos de receta inválidos");
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al actualizar receta");
    }
    throw new Error("Error de red o desconocido");
  }
}

// Eliminar receta
export async function deleteRecipe(id: string): Promise<{ msg: string }> {
  try {
    const { data } = await api.delete(`/recipes/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al eliminar receta");
    }
    throw new Error("Error de red o desconocido");
  }
}