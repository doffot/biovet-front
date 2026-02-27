// src/views/inventory/EditProductView.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Loader2, 
  Package,
  Tag,
  CreditCard,
  Scissors,
  Save,
  AlertTriangle,
  Info
} from "lucide-react";
import { getProductById, updateProduct } from "@/api/productAPI";
import { toast } from "@/components/Toast";
import Spinner from "@/components/Spinner";
import type { Product, ProductFormData } from "@/types/product";

const categoryOptions = [
  { value: "vacuna", label: "Vacuna" },
  { value: "desparasitante", label: "Desparasitante" },
  { value: "medicamento", label: "Medicamento" },
  { value: "alimento", label: "Alimento" },
  { value: "accesorio", label: "Accesorio" },
  { value: "otro", label: "Otro" },
];

export default function EditProductView() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "medicamento",
    salePrice: 0,
    salePricePerDose: undefined,
    costPrice: undefined,
    unit: "",
    doseUnit: "dosis",
    dosesPerUnit: 1,
    divisible: false,
    stockUnits: undefined,
    stockDoses: undefined,
    minStock: undefined,
    active: true,
  });

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId!),
    enabled: !!productId,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        category: product.category,
        salePrice: product.salePrice,
        salePricePerDose: product.salePricePerDose,
        costPrice: product.costPrice,
        unit: product.unit,
        doseUnit: product.doseUnit,
        dosesPerUnit: product.dosesPerUnit,
        divisible: product.divisible ?? false,
        stockUnits: product.stockUnits,
        stockDoses: product.stockDoses,
        minStock: product.minStock,
        active: product.active ?? true,
      });
    }
  }, [product]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ProductFormData) => updateProduct(productId!, data),
    onSuccess: () => {
      toast.success("Producto actualizado", "Los cambios se guardaron correctamente");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      navigate("/inventory/products");
    },
    onError: (error: Error) => {
      toast.error("Error al actualizar", error.message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));

      if (name === "divisible" && !checked) {
        setFormData((prev) => ({
          ...prev,
          divisible: false,
          stockDoses: undefined,
          salePricePerDose: undefined,
        }));
      }
    } else if (
      ["salePrice", "salePricePerDose", "costPrice", "dosesPerUnit", "stockUnits", "stockDoses", "minStock"].includes(name)
    ) {
      const numValue = value === "" ? undefined : parseFloat(value);
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Campo requerido", "El nombre es obligatorio");
      return;
    }
    if (!formData.unit.trim()) {
      toast.error("Campo requerido", "La unidad física es obligatoria");
      return;
    }
    if (formData.salePrice === undefined || formData.salePrice < 0) {
      toast.error("Campo requerido", "El precio de venta debe ser positivo");
      return;
    }
    if (formData.divisible && !formData.salePricePerDose) {
      toast.error("Campo requerido", "El precio por dosis es obligatorio para productos divisibles");
      return;
    }

    mutate(formData);
  };

  const isValid =
    formData.name.trim() !== "" &&
    formData.unit.trim() !== "" &&
    formData.salePrice !== undefined &&
    (!formData.divisible || (formData.divisible && formData.salePricePerDose !== undefined));

  if (isLoading) return <Spinner fullScreen size="xl" />;

  if (!product) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-100 dark:bg-dark-300 min-h-screen p-4">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 bg-surface-100 dark:bg-dark-200 rounded-full flex items-center justify-center border border-surface-200 dark:border-slate-700">
            <Package className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            Producto no encontrado
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            El producto no existe o fue eliminado
          </p>
          <button onClick={() => navigate("/inventory/products")} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-dark-300">
      {/* Header Compacto Sticky */}
      <div className="sticky top-0 z-20 bg-white dark:bg-dark-200 border-b border-surface-200 dark:border-slate-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 dark:hover:text-slate-300 dark:hover:bg-dark-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">
                Editar Producto
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {product.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="hidden sm:flex btn-secondary py-2 px-3 text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || isPending}
              className="btn-primary py-2 px-4 text-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Guardar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content - pb-24 para espacio del bottom tabs en mobile */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 pb-24 lg:pb-4 space-y-4">
        
        {/* ═══════════════════════════════════════
            INFORMACIÓN BÁSICA
            ═══════════════════════════════════════ */}
        <section className="bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-slate-700 p-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-biovet-500" />
            Información Básica
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nombre */}
            <div className="sm:col-span-2">
              <label className="label">Nombre <span className="text-danger-500">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Bravecto 20kg"
                maxLength={100}
                className="input"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="label">Categoría</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Unidad física */}
            <div>
              <label className="label">Unidad física <span className="text-danger-500">*</span></label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="Ej: tableta, frasco"
                maxLength={30}
                className="input"
              />
            </div>

            {/* Descripción */}
            <div className="sm:col-span-2">
              <label className="label">Descripción</label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Detalles adicionales..."
                maxLength={200}
                rows={2}
                className="input resize-none"
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            PRODUCTO DIVISIBLE
            ═══════════════════════════════════════ */}
        <section className="bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-biovet-500" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Producto Divisible
              </span>
            </div>
            
            {/* Switch */}
            <button
              type="button"
              onClick={() => {
                const newValue = !formData.divisible;
                setFormData(prev => ({
                  ...prev,
                  divisible: newValue,
                  ...(newValue ? {} : { stockDoses: undefined, salePricePerDose: undefined })
                }));
              }}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                formData.divisible ? "bg-biovet-500" : "bg-surface-300 dark:bg-slate-600"
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                formData.divisible ? "translate-x-5" : ""
              }`} />
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {formData.divisible 
              ? "Se puede vender por partes (ej: Bravecto en 9 partes)" 
              : "Solo se vende como unidad completa"
            }
          </p>

          {formData.divisible && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-surface-200 dark:border-slate-700">
              <div>
                <label className="label text-xs">Unidad de fracción</label>
                <input
                  type="text"
                  name="doseUnit"
                  value={formData.doseUnit}
                  onChange={handleChange}
                  placeholder="Ej: parte, ml"
                  maxLength={10}
                  className="input py-2 text-sm"
                />
              </div>
              <div>
                <label className="label text-xs">Fracciones por unidad</label>
                <input
                  type="number"
                  name="dosesPerUnit"
                  value={formData.dosesPerUnit ?? ""}
                  onChange={handleChange}
                  min="1"
                  step="0.1"
                  className="input py-2 text-sm"
                />
              </div>
              <div>
                <label className="label text-xs">
                  Precio por fracción <span className="text-danger-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    name="salePricePerDose"
                    value={formData.salePricePerDose ?? ""}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="input py-2 text-sm pl-7"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════
            PRECIOS
            ═══════════════════════════════════════ */}
        <section className="bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-slate-700 p-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-success-500" />
            Precios
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Precio venta <span className="text-danger-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  name="salePrice"
                  value={formData.salePrice ?? ""}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="input pl-7"
                />
              </div>
            </div>
            <div>
              <label className="label">Costo compra</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice ?? ""}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="input pl-7"
                />
              </div>
            </div>
          </div>

          {/* Preview inline si es divisible */}
          {formData.divisible && formData.dosesPerUnit && formData.salePrice !== undefined && formData.salePricePerDose !== undefined && (
            <div className="mt-3 p-3 bg-success-50 dark:bg-success-950/30 border border-success-200 dark:border-success-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-success-600 dark:text-success-400 mt-0.5 shrink-0" />
                <div className="text-xs text-success-700 dark:text-success-300 space-y-1">
                  <p>
                    <span className="font-medium">Unidad completa:</span> ${formData.salePrice.toFixed(2)}
                  </p>
                  <p>
                    <span className="font-medium">Por {formData.doseUnit}:</span> ${formData.salePricePerDose.toFixed(2)}
                  </p>
                  {formData.dosesPerUnit * formData.salePricePerDose > formData.salePrice && (
                    <p className="text-success-600 dark:text-success-400">
                      Ganancia extra vendiendo fraccionado: +${((formData.dosesPerUnit * formData.salePricePerDose) - formData.salePrice).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════
            STOCK
            ═══════════════════════════════════════ */}
        <section className="bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-slate-700 p-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-biovet-500" />
            Stock
          </h2>
          
          <div className={`grid gap-3 ${formData.divisible ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <div>
              <label className="label text-xs">Unidades completas</label>
              <input
                type="number"
                name="stockUnits"
                value={formData.stockUnits ?? ""}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="input py-2 text-sm"
              />
            </div>

            {formData.divisible && (
              <div>
                <label className="label text-xs">{formData.doseUnit || "Fracciones"} sueltas</label>
                <input
                  type="number"
                  name="stockDoses"
                  value={formData.stockDoses ?? ""}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  placeholder="0"
                  className="input py-2 text-sm"
                />
              </div>
            )}

            <div>
              <label className="label text-xs flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-warning-500" />
                Mínimo
              </label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock ?? ""}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="input py-2 text-sm"
              />
            </div>
          </div>

          {/* Stock total si es divisible */}
          {formData.divisible && formData.dosesPerUnit && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Stock total: <span className="font-medium text-slate-700 dark:text-slate-300">
                {((formData.stockUnits || 0) * formData.dosesPerUnit) + (formData.stockDoses || 0)} {formData.doseUnit || "fracciones"}
              </span>
            </p>
          )}
        </section>

        {/* ═══════════════════════════════════════
            ESTADO ACTIVO
            ═══════════════════════════════════════ */}
        <section className="bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Producto activo
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Los productos inactivos no aparecen en ventas
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                formData.active ? "bg-success-500" : "bg-surface-300 dark:bg-slate-600"
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                formData.active ? "translate-x-5" : ""
              }`} />
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}