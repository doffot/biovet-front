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