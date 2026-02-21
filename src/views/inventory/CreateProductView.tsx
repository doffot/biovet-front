// src/views/inventory/CreateProductView.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  Layers,
  Settings,
} from "lucide-react";
import { createProduct } from "../../api/productAPI";
import { initializeInventory } from "../../api/inventoryAPI";
import { toast } from "../../components/Toast";
import type { ProductFormData } from "../../types/product";
import { CATEGORY_OPTIONS } from "../../utils/productHelpers";

export default function CreateProductView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "medicamento",
    salePrice: 0,
    salePricePerDose: 0,
    costPrice: 0,
    unit: "Frasco",
    doseUnit: "ml",
    dosesPerUnit: 1,
    divisible: false,
    active: true,
    stockUnits: 0,
    stockDoses: 0,
    minStock: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: createProductMutation, isPending } = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const product = await createProduct(data);
      // Inicializar inventario si hay stock inicial
      if (
        product._id &&
        ((data.stockUnits && data.stockUnits > 0) ||
          (data.stockDoses && data.stockDoses > 0))
      ) {
        await initializeInventory({
          productId: product._id,
          stockUnits: data.stockUnits || 0,
          stockDoses: data.stockDoses || 0,
        });
      }
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto creado", "Se registró correctamente");
      navigate("/inventory/products");
    },
    onError: (error: Error) => {
      toast.error("Error", error.message);
    },
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!formData.salePrice || formData.salePrice <= 0)
      newErrors.salePrice = "El precio debe ser mayor a 0";
    if (!formData.unit.trim()) newErrors.unit = "La unidad es obligatoria";
    if (!formData.doseUnit.trim())
      newErrors.doseUnit = "La unidad de dosis es obligatoria";
    if (!formData.dosesPerUnit || formData.dosesPerUnit < 1)
      newErrors.dosesPerUnit = "Mínimo 1 dosis por unidad";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createProductMutation(formData);
  };

  const updateField = <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

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
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white leading-tight">
                Nuevo Producto
              </h1>
              <p className="text-[13px] text-biovet-500 font-medium">
                Registrar producto en inventario
              </p>
            </div>
          </div>
        </div>
        <div className="border border-biovet-200/50 dark:border-biovet-800/30" />
      </div>

      {/* FORMULARIO SCROLLEABLE */}
      <div className="flex-1 overflow-auto custom-scrollbar px-4 sm:px-8 pb-24 lg:pb-8">
        <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
          {/* ===== INFORMACIÓN BÁSICA ===== */}
          <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700 flex items-center gap-2">
              <Package className="w-4 h-4 text-biovet-500" />
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Información Básica
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {/* Nombre */}
              <div>
                <label className="label">
                  Nombre <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Ej: Ivermectina 1%"
                  className={`input ${errors.name ? "input-error" : ""}`}
                />
                {errors.name && (
                  <p className="error-text">{errors.name}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="label">Descripción</label>
                <input
                  type="text"
                  value={formData.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Descripción breve del producto"
                  className="input"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="label">
                  Categoría <span className="text-danger-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    updateField(
                      "category",
                      e.target.value as ProductFormData["category"]
                    )
                  }
                  className="input"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Divisible */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateField("divisible", !formData.divisible)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    formData.divisible
                      ? "bg-biovet-500"
                      : "bg-surface-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ${
                      formData.divisible ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Producto divisible
                  </p>
                  <p className="text-xs text-surface-500 dark:text-slate-400">
                    Se puede vender por dosis o fracción
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== PRECIOS ===== */}
          <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-success-500" />
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Precios
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Precio venta */}
              <div>
                <label className="label">
                  Precio Venta ($) <span className="text-danger-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.salePrice || ""}
                  onChange={(e) =>
                    updateField("salePrice", parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className={`input ${errors.salePrice ? "input-error" : ""}`}
                />
                {errors.salePrice && (
                  <p className="error-text">{errors.salePrice}</p>
                )}
              </div>

              {/* Precio por dosis */}
              {formData.divisible && (
                <div>
                  <label className="label">Precio por Dosis ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.salePricePerDose || ""}
                    onChange={(e) =>
                      updateField(
                        "salePricePerDose",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0.00"
                    className="input"
                  />
                </div>
              )}

              {/* Costo */}
              <div>
                <label className="label">Costo ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice || ""}
                  onChange={(e) =>
                    updateField("costPrice", parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* ===== UNIDADES ===== */}
          <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-biovet-500" />
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Unidades y Dosis
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Unidad */}
              <div>
                <label className="label">
                  Unidad <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => updateField("unit", e.target.value)}
                  placeholder="Ej: Frasco, Caja, Bolsa"
                  className={`input ${errors.unit ? "input-error" : ""}`}
                />
                {errors.unit && (
                  <p className="error-text">{errors.unit}</p>
                )}
              </div>

              {/* Unidad de dosis */}
              <div>
                <label className="label">
                  Unidad de Dosis <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.doseUnit}
                  onChange={(e) => updateField("doseUnit", e.target.value)}
                  placeholder="Ej: ml, mg, tableta"
                  className={`input ${errors.doseUnit ? "input-error" : ""}`}
                />
                {errors.doseUnit && (
                  <p className="error-text">{errors.doseUnit}</p>
                )}
              </div>

              {/* Dosis por unidad */}
              <div>
                <label className="label">
                  Dosis por Unidad <span className="text-danger-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.dosesPerUnit || ""}
                  onChange={(e) =>
                    updateField("dosesPerUnit", parseInt(e.target.value) || 1)
                  }
                  placeholder="1"
                  className={`input ${errors.dosesPerUnit ? "input-error" : ""}`}
                />
                {errors.dosesPerUnit && (
                  <p className="error-text">{errors.dosesPerUnit}</p>
                )}
              </div>
            </div>
          </div>

          {/* ===== STOCK INICIAL ===== */}
          <div className="bg-white dark:bg-dark-100 rounded-xl border border-surface-300 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-surface-50 dark:bg-dark-200 border-b border-surface-300 dark:border-slate-700 flex items-center gap-2">
              <Settings className="w-4 h-4 text-surface-500 dark:text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Stock Inicial
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Stock unidades */}
              <div>
                <label className="label">
                  Stock ({formData.unit || "Unidades"})
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stockUnits || ""}
                  onChange={(e) =>
                    updateField("stockUnits", parseInt(e.target.value) || 0)
                  }
                  placeholder="0"
                  className="input"
                />
              </div>

              {/* Stock dosis */}
              {formData.divisible && (
                <div>
                  <label className="label">
                    Dosis sueltas ({formData.doseUnit || "Dosis"})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockDoses || ""}
                    onChange={(e) =>
                      updateField("stockDoses", parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="input"
                  />
                </div>
              )}

              {/* Stock mínimo */}
              <div>
                <label className="label">Stock Mínimo (alerta)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.minStock || ""}
                  onChange={(e) =>
                    updateField("minStock", parseInt(e.target.value) || 0)
                  }
                  placeholder="0"
                  className="input"
                />
                <p className="helper-text">
                  Se mostrará alerta cuando el stock sea menor
                </p>
              </div>
            </div>
          </div>

          {/* ===== BOTONES ===== */}
          <div className="flex items-center justify-end gap-3 pt-2 pb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Crear Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}