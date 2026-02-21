// src/views/purchases/CreatePurchaseView.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  ShoppingCart,
  Receipt,
  Tag,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { getActiveProducts } from "@/api/productAPI";
import { toast } from "@/components/Toast";
import type { PurchaseFormData, PurchaseItemFormData } from "@/types/purchase";
import { createPurchase } from "@/api/purchaseAPI";

const initialItem: PurchaseItemFormData = {
  productId: "",
  productName: "",
  quantity: 1,
  unitCost: 0,
};

const paymentMethods = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "otro", label: "Otro" },
];

export default function CreatePurchaseView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<PurchaseFormData>({
    provider: "",
    paymentMethod: "efectivo",
    items: [initialItem],
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: products = [] } = useQuery({
    queryKey: ["products", "active"],
    queryFn: getActiveProducts,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      toast.success("Compra registrada correctamente");
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      navigate("/purchases/history");
    },
    onError: (error: Error) => {
      toast.error("Error", error.message);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof PurchaseItemFormData,
    value: string | number
  ) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "productId" && typeof value === "string") {
      const product = products.find((p) => p._id === value);
      newItems[index] = {
        ...newItems[index],
        productId: value,
        productName: product?.name || "",
      };
    }

    setFormData((prev) => ({ ...prev, items: newItems }));

    const key = `items[${index}].${field}`;
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { ...initialItem }],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) {
      toast.error("Debe mantener al menos un producto");
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (total, item) => total + item.quantity * item.unitCost,
      0
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "El método de pago es obligatorio";
    }

    formData.items.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`items[${index}].productId`] = "Seleccione un producto";
      }
      if (item.quantity <= 0) {
        newErrors[`items[${index}].quantity`] =
          "La cantidad debe ser mayor a 0";
      }
      if (item.unitCost < 0) {
        newErrors[`items[${index}].unitCost`] =
          "El costo no puede ser negativo";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Complete los campos obligatorios correctamente");
      return;
    }

    const validItems = formData.items.filter((item) => item.productId);
    if (validItems.length === 0) {
      toast.error("Debe agregar al menos un producto");
      return;
    }

    mutate({ ...formData, items: validItems });
  };

  const isValid =
    formData.items.some((item) => item.productId) && !!formData.paymentMethod;
  const totalAmount = calculateTotal();

  return (
    <div className="flex flex-col h-full bg-surface-100 dark:bg-dark-300">
      {/* HEADER FIJO */}
      <div className="shrink-0 px-4 sm:px-8 pt-4 sm:pt-6 pb-4 sm:pb-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-surface-400 hover:text-surface-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-biovet-500 shadow-sm">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white leading-tight">
                  Nueva Compra
                </h1>
                <p className="text-[13px] text-biovet-500 font-medium">
                  Registra una compra de productos para tu inventario
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="border border-biovet-200/50 dark:border-biovet-800/30" />
      </div>

      {/* FORMULARIO SCROLLEABLE */}
      <div className="flex-1 overflow-auto custom-scrollbar px-4 sm:px-8 pb-24 lg:pb-8">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* PROVEEDOR + MÉTODO PAGO */}
          <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700 flex items-center gap-2">
              <Tag className="w-4 h-4 text-biovet-500" />
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Información de la compra
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Proveedor */}
              <div>
                <label className="label">
                  Proveedor <span className="text-xs text-surface-500">(opcional)</span>
                </label>
                <input
                  type="text"
                  name="provider"
                  value={formData.provider || ""}
                  onChange={handleInputChange}
                  placeholder="Nombre del proveedor"
                  maxLength={100}
                  className="input"
                />
              </div>

              {/* Método de pago */}
              <div>
                <label className="label">
                  <span className="inline-flex items-center gap-1">
                    Método de pago <span className="text-danger-500">*</span>
                  </span>
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className={`input ${
                    errors.paymentMethod ? "input-error" : ""
                  }`}
                >
                  {paymentMethods.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                {errors.paymentMethod && (
                  <p className="error-text">{errors.paymentMethod}</p>
                )}
              </div>
            </div>
          </div>

          {/* NOTAS */}
          <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-surface-500 dark:text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Notas (opcional)
              </h2>
            </div>
            <div className="p-4">
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                placeholder="Detalles adicionales sobre la compra..."
                maxLength={200}
                rows={2}
                className="input min-h-18 resize-none"
              />
            </div>
          </div>

          {/* PRODUCTOS */}
          <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-biovet-500" />
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Productos de la compra
                </h2>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-biovet-500 bg-biovet-50 dark:bg-biovet-950 border border-biovet-200 dark:border-biovet-800 rounded-lg hover:bg-biovet-100 dark:hover:bg-biovet-900 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar producto
              </button>
            </div>

            <div className="divide-y divide-surface-200 dark:divide-slate-700/50">
              {formData.items.map((item, index) => (
                <div key={index} className="p-4">
                  {/* Desktop layout */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    {/* Producto */}
                    <div className="col-span-5">
                      <label className="label mb-1.5">Producto</label>
                      <select
                        value={item.productId}
                        onChange={(e) =>
                          handleItemChange(index, "productId", e.target.value)
                        }
                        className={`input ${
                          errors[`items[${index}].productId`]
                            ? "input-error"
                            : ""
                        }`}
                      >
                        <option value="">-- Selecciona un producto --</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      {errors[`items[${index}].productId`] && (
                        <p className="error-text">
                          {errors[`items[${index}].productId`]}
                        </p>
                      )}
                    </div>

                    {/* Cantidad */}
                    <div className="col-span-2">
                      <label className="label mb-1.5">Cantidad</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className={`input text-center ${
                          errors[`items[${index}].quantity`]
                            ? "input-error"
                            : ""
                        }`}
                      />
                      {errors[`items[${index}].quantity`] && (
                        <p className="error-text">
                          {errors[`items[${index}].quantity`]}
                        </p>
                      )}
                    </div>

                    {/* Costo unitario */}
                    <div className="col-span-2">
                      <label className="label mb-1.5">Costo unitario ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitCost || ""}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "unitCost",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className={`input text-center ${
                          errors[`items[${index}].unitCost`]
                            ? "input-error"
                            : ""
                        }`}
                      />
                      {errors[`items[${index}].unitCost`] && (
                        <p className="error-text">
                          {errors[`items[${index}].unitCost`]}
                        </p>
                      )}
                    </div>

                    {/* Total */}
                    <div className="col-span-2">
                      <label className="label mb-1.5">Total</label>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        ${(item.quantity * item.unitCost).toFixed(2)}
                      </p>
                    </div>

                    {/* Eliminar */}
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="btn-icon-delete"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile layout */}
                  <div className="md:hidden space-y-3">
                    <div>
                      <label className="label mb-1.5">Producto</label>
                      <select
                        value={item.productId}
                        onChange={(e) =>
                          handleItemChange(index, "productId", e.target.value)
                        }
                        className={`input ${
                          errors[`items[${index}].productId`]
                            ? "input-error"
                            : ""
                        }`}
                      >
                        <option value="">-- Selecciona un producto --</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      {errors[`items[${index}].productId`] && (
                        <p className="error-text">
                          {errors[`items[${index}].productId`]}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label mb-1.5">Cantidad</label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity || ""}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className={`input ${
                            errors[`items[${index}].quantity`]
                              ? "input-error"
                              : ""
                          }`}
                        />
                      </div>
                      <div>
                        <label className="label mb-1.5">Costo unitario ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitCost || ""}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "unitCost",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className={`input ${
                            errors[`items[${index}].unitCost`]
                              ? "input-error"
                              : ""
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-surface-200 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Total: ${(item.quantity * item.unitCost).toFixed(2)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="btn-icon-delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RESUMEN Y BOTONES */}
          <div className="flex flex-col gap-4 pb-4">
            <div className="bg-biovet-50 dark:bg-biovet-950 border border-biovet-200 dark:border-biovet-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-biovet-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-biovet-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Resumen de la compra
                  </p>
                  <p className="text-xs text-surface-500 dark:text-slate-400">
                    Esta compra aumentará el stock de los productos seleccionados
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-surface-500 dark:text-slate-400">
                  Total
                </p>
                <p className="text-2xl font-bold text-biovet-600 dark:text-biovet-400">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isValid || isPending}
                className="btn-primary"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Registrar Compra
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}