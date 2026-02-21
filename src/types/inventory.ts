// src/types/inventory.ts
import { z } from "zod";
import { productSchema } from "./product";
import type { Product } from "./product";

// =============== PRODUCT WITH INVENTORY ===============
export interface ProductWithInventory extends Product {
  inventory?: {
    stockUnits: number;
    stockDoses: number;
  };
}

// =============== INVENTORY ===============
export const inventorySchema = z.object({
  _id: z.string(),
  product: productSchema,
  veterinarian: z.string(),
  stockUnits: z.number(),
  stockDoses: z.number(),
  lastMovement: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Inventory = z.infer<typeof inventorySchema>;

// =============== CONSUME STOCK ===============
export type ConsumeStockData = {
  quantity: number;
  isFullUnit?: boolean;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
};

export type ConsumeStockResponse = {
  msg: string;
  inventory: Inventory;
  movement: {
    id: string;
    consumed: string;
  };
};

// =============== INITIALIZE INVENTORY ===============
export type InitializeInventoryData = {
  productId: string;
  stockUnits?: number;
  stockDoses?: number;
};

export type InitializeInventoryResponse = {
  msg: string;
  inventory: Inventory;
};

// =============== MOVEMENT TYPES ===============
export type MovementType = "entrada" | "salida" | "ajuste";

export type MovementReason =
  | "compra"
  | "venta"
  | "uso_clinico"
  | "devolucion"
  | "vencimiento"
  | "perdida"
  | "ajuste_manual"
  | "stock_inicial";

export type MovementReferenceType =
  | "Deworming"
  | "Vaccination"
  | "Consultation"
  | "Sale"
  | "Treatment"
  | "VeterinaryService";

// =============== MOVEMENT ===============
export type MovementProduct = {
  _id: string;
  name: string;
  unit: string;
  doseUnit: string;
};

export type MovementCreatedBy = {
  _id: string;
  name: string;
  lastName: string;
};

export type Movement = {
  _id: string;
  product: MovementProduct;
  type: MovementType;
  reason: MovementReason;
  quantityUnits: number;
  quantityDoses: number;
  stockAfterUnits: number;
  stockAfterDoses: number;
  referenceType?: MovementReferenceType;
  referenceId?: string;
  notes?: string;
  createdBy?: MovementCreatedBy;
  createdAt: string;
};

// =============== MOVEMENT FILTERS ===============
export type MovementFilters = {
  productId?: string;
  type?: MovementType;
  reason?: MovementReason;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

// =============== MOVEMENTS RESPONSE ===============
export type MovementsResponse = {
  movements: Movement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};