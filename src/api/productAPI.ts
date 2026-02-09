// src/api/productAPI.ts
import { AxiosError } from "axios";
import api from "@/lib/axios";
import {
  productSchema,
  productsListSchema,
  type Product,
  type ProductFormData,
} from "@/types/product";
import type { ProductWithInventory } from "@/types/inventory";

// ==================== TIPOS DE RESPUESTA ====================

type CreateProductResponse = { msg: string; product: Product };
type GetProductsResponse = { products: Product[] };
type GetProductResponse = { product: Product };
type GetProductsWithInventoryResponse = { products: ProductWithInventory[] };

// ==================== CRUD BÁSICO ====================

export async function createProduct(data: ProductFormData): Promise<Product> {
  try {
    const { data: response } = await api.post<CreateProductResponse>("/products", data);
    const parsed = productSchema.safeParse(response.product);
    if (!parsed.success) throw new Error("Datos del producto inválidos");
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear producto");
    }
    throw new Error("Error de red");
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const { data } = await api.get<GetProductsResponse>("/products");
    const parsed = productsListSchema.safeParse(data.products);
    if (!parsed.success) throw new Error("Datos de productos inválidos");
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener productos");
    }
    throw new Error("Error de red");
  }
}

export async function getActiveProducts(): Promise<Product[]> {
  try {
    const { data } = await api.get<GetProductsResponse>("/products/active");
    const parsed = productsListSchema.safeParse(data.products);
    if (!parsed.success) throw new Error("Datos de productos activos inválidos");
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener productos activos");
    }
    throw new Error("Error de red");
  }
}

// Nueva función para obtener productos con inventario
export async function getProductsWithInventory(): Promise<ProductWithInventory[]> {
  try {
    const { data } = await api.get<GetProductsWithInventoryResponse>("/products/with-inventory");
    // No hacemos validación con Zod aquí porque el tipo es extendido
    return data.products;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener productos con inventario");
    }
    throw new Error("Error de red");
  }
}

export async function getProductById(id: string): Promise<Product> {
  try {
    const { data } = await api.get<GetProductResponse>(`/products/${id}`);
    const parsed = productSchema.safeParse(data.product);
    if (!parsed.success) throw new Error("Datos del producto inválidos");
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener producto");
    }
    throw new Error("Error de red");
  }
}

export async function updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
  try {
    const { data: response } = await api.put<{ msg: string; product: Product }>(
      `/products/${id}`,
      data
    );
    const parsed = productSchema.safeParse(response.product);
    if (!parsed.success) throw new Error("Datos del producto inválidos");
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al actualizar producto");
    }
    throw new Error("Error de red");
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await api.delete(`/products/${id}`);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al eliminar producto");
    }
    throw new Error("Error de red");
  }
}