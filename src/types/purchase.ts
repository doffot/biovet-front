// src/types/purchase.ts
import { z } from "zod";

// =============== PURCHASE ITEM ===============
export const purchaseItemSchema = z.object({
  _id: z.string(),
  product: z.string(),
  productName: z.string(),
  quantity: z.number(),
  unitCost: z.number(),
  totalCost: z.number(),
});

export type PurchaseItem = z.infer<typeof purchaseItemSchema>;

// =============== PURCHASE ===============
export const purchaseSchema = z.object({
  _id: z.string(),
  provider: z.string().optional(),
  totalAmount: z.number(),
  paymentMethod: z.string(),
  status: z.enum(["completada", "pendiente", "cancelada"]),
  items: z.array(purchaseItemSchema),
  notes: z.string().optional(),
  veterinarian: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Purchase = z.infer<typeof purchaseSchema>;

// =============== FORM DATA ===============
export type PurchaseItemFormData = {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
};

export type PurchaseFormData = {
  provider?: string;
  paymentMethod: string;
  items: PurchaseItemFormData[];
  notes?: string;
};

// =============== RESPONSES ===============
export type CreatePurchaseResponse = {
  msg: string;
  purchase: Purchase;
};

export type GetPurchasesResponse = {
  purchases: Purchase[];
};

export type GetPurchaseResponse = {
  purchase: Purchase;
};