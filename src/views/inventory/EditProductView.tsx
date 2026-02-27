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
  Beaker,
  Scissors,
  Save,
  X,
  AlertTriangle
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
      [
        "salePrice",
        "salePricePerDose",
        "costPrice",
        "dosesPerUnit",
        "stockUnits",
        "stockDoses",
        "minStock",
      ].includes(name)
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
    if (!formData.doseUnit.trim()) {
      toast.error("Campo requerido", "La unidad de dosis es obligatoria");
      return;
    }
    if (formData.salePrice === undefined || formData.salePrice < 0) {
      toast.error("Campo requerido", "El precio de venta debe ser positivo");
      return;
    }
    if (formData.dosesPerUnit === undefined || formData.dosesPerUnit <= 0) {
      toast.error("Campo requerido", "Las dosis por unidad deben ser positivas");
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
    formData.doseUnit.trim() !== "" &&
    formData.salePrice !== undefined &&
    formData.dosesPerUnit !== undefined &&
    (!formData.divisible || (formData.divisible && formData.salePricePerDose !== undefined));

  // Loading state
  if (isLoading) {
    return <Spinner fullScreen size="xl" />;
  }

  // Not found state
  if (!product) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-100 dark:bg-dark-300 min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-surface-100 dark:bg-dark-200 rounded-full flex items-center justify-center border border-surface-300 dark:border-slate-700">
            <Package className="w-8 h-8 text-surface-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 font-heading">
            Producto no encontrado
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            El producto que buscas no existe o fue eliminado
          </p>
          <button
            onClick={() => navigate("/inventory/products")}
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-100 dark:bg-dark-300">
      {/* Header */}
      <div className="shrink-0 px-4 sm:px-8 pt-4 sm:pt-6 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white dark:bg-dark-200 border border-surface-200 dark:border-slate-700 hover:bg-surface-50 dark:hover:bg-dark-100 text-slate-500 dark:text-slate-400 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-linear-to-br from-biovet-500 to-biovet-600 rounded-xl flex items-center justify-center shadow-lg shadow-biovet-500/20">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                Editar Producto
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {product.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content - Scrolleable */}
      <div className="flex-1 overflow-auto px-4 sm:px-8 pb-8">
        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nombre */}
                <div>
                  <label className="label flex items-center gap-2">
                    <Tag className="w-4 h-4 text-biovet-500" />
                    Nombre del producto <span className="text-danger-500">*</span>
                  </label>
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
                  <label className="label flex items-center gap-2">
                    <Package className="w-4 h-4 text-biovet-500" />
                    Categoría <span className="text-danger-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Divisible toggle */}
                <div className="md:col-span-2">
                  <div className="p-4 bg-surface-50 dark:bg-dark-100 rounded-xl border border-surface-200 dark:border-slate-700">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="divisible"
                        checked={formData.divisible}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          formData.divisible
                            ? "bg-biovet-500"
                            : "bg-surface-300 dark:bg-slate-600"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            formData.divisible ? "translate-x-5" : ""
                          }`}
                        />
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <Scissors className="w-4 h-4 text-biovet-500" />
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            Producto divisible
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {formData.divisible
                            ? "Se puede vender por partes (ej: Bravecto en 9 partes)"
                            : "Solo se vende como unidad completa"}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Unidad física */}
                <div>
                  <label className="label flex items-center gap-2">
                    <Package className="w-4 h-4 text-biovet-500" />
                    Unidad física <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    placeholder="Ej: tableta, frasco, sobre"
                    maxLength={30}
                    className="input"
                  />
                  <p className="helper-text">Cómo viene el producto</p>
                </div>

                {/* Unidad de dosis */}
                <div>
                  <label className="label flex items-center gap-2">
                    <Beaker className="w-4 h-4 text-biovet-500" />
                    Unidad de fracción <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="doseUnit"
                    value={formData.doseUnit}
                    onChange={handleChange}
                    placeholder={formData.divisible ? "Ej: parte, ml" : "Ej: dosis"}
                    maxLength={10}
                    className="input"
                  />
                  <p className="helper-text">
                    {formData.divisible ? "Cómo se fracciona" : "Cómo se aplica/vende"}
                  </p>
                </div>

                {/* Dosis por unidad */}
                <div>
                  <label className="label flex items-center gap-2">
                    <Beaker className="w-4 h-4 text-biovet-500" />
                    {formData.divisible ? "Fracciones por unidad" : "Dosis por unidad"}{" "}
                    <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="dosesPerUnit"
                    value={formData.dosesPerUnit ?? ""}
                    onChange={handleChange}
                    min="1"
                    step="0.1"
                    placeholder="1"
                    className="input"
                  />
                  <p className="helper-text">
                    {formData.divisible
                      ? "Ej: 9 partes por tableta, 20 ml por frasco"
                      : "Normalmente 1"}
                  </p>
                </div>

                {/* Costo de compra */}
                <div>
                  <label className="label flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    Costo de compra (opcional)
                  </label>
                  <input
                    type="number"
                    name="costPrice"
                    value={formData.costPrice ?? ""}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="input"
                  />
                  <p className="helper-text">Lo que te costó</p>
                </div>

                {/* Precio de venta */}
                <div>
                  <label className="label flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-success-500" />
                    Precio venta (unidad) <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice ?? ""}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="input"
                  />
                  <p className="helper-text">
                    Precio de la {formData.unit || "unidad"} completa
                  </p>
                </div>

                {/* Precio por dosis (solo si es divisible) */}
                {formData.divisible && (
                  <div>
                    <label className="label flex items-center gap-2">
                      <Beaker className="w-4 h-4 text-success-500" />
                      Precio por {formData.doseUnit || "fracción"}{" "}
                      <span className="text-danger-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="salePricePerDose"
                      value={formData.salePricePerDose ?? ""}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="input"
                    />
                    <p className="helper-text">
                      Precio por cada {formData.doseUnit || "fracción"}
                    </p>
                  </div>
                )}

                {/* Sección de Stock */}
                <div className="md:col-span-2">
                  <div className="border-t border-surface-200 dark:border-slate-700 pt-6 mt-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4 text-biovet-500" />
                      Stock actual
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Stock unidades */}
                      <div>
                        <label className="label">Unidades completas</label>
                        <input
                          type="number"
                          name="stockUnits"
                          value={formData.stockUnits ?? ""}
                          onChange={handleChange}
                          min="0"
                          placeholder="0"
                          className="input"
                        />
                        <p className="helper-text">
                          {formData.unit ? `${formData.unit}(s) cerradas` : "Unidades cerradas"}
                        </p>
                      </div>

                      {/* Stock dosis (solo si divisible) */}
                      {formData.divisible && (
                        <div>
                          <label className="label">
                            {formData.doseUnit || "Fracciones"} sueltas
                          </label>
                          <input
                            type="number"
                            name="stockDoses"
                            value={formData.stockDoses ?? ""}
                            onChange={handleChange}
                            min="0"
                            step="0.1"
                            placeholder="0"
                            className="input"
                          />
                          <p className="helper-text">De unidad ya abierta</p>
                        </div>
                      )}

                      {/* Stock mínimo */}
                      <div>
                        <label className="label flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-warning-500" />
                          Stock mínimo (alerta)
                        </label>
                        <input
                          type="number"
                          name="minStock"
                          value={formData.minStock ?? ""}
                          onChange={handleChange}
                          min="0"
                          placeholder="0"
                          className="input"
                        />
                        <p className="helper-text">Aviso cuando queden pocas</p>
                      </div>
                    </div>

                    {/* Stock total si es divisible */}
                    {formData.divisible && formData.dosesPerUnit && (
                      <div className="mt-4 p-3 bg-biovet-50 dark:bg-biovet-950 rounded-xl border border-biovet-200 dark:border-biovet-800">
                        <p className="text-xs text-biovet-700 dark:text-biovet-300">
                          <span className="font-semibold">Stock total:</span>{" "}
                          {(formData.stockUnits || 0) * formData.dosesPerUnit +
                            (formData.stockDoses || 0)}{" "}
                          {formData.doseUnit || "fracciones"}
                          <span className="text-biovet-500 dark:text-biovet-400 ml-1">
                            ({formData.stockUnits || 0} {formData.unit || "unidades"} ×{" "}
                            {formData.dosesPerUnit} + {formData.stockDoses || 0} sueltas)
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label className="label flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-400" />
                    Descripción (opcional)
                  </label>
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

                {/* Activo */}
                <div className="md:col-span-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        formData.active
                          ? "bg-success-500"
                          : "bg-surface-300 dark:bg-slate-600"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          formData.active ? "translate-x-5" : ""
                        }`}
                      />
                    </div>
                    <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Producto activo
                    </span>
                  </label>
                </div>

                {/* Preview del producto (si divisible) */}
                {formData.divisible &&
                  formData.dosesPerUnit &&
                  formData.salePrice !== undefined &&
                  formData.salePricePerDose !== undefined && (
                    <div className="md:col-span-2">
                      <div className="p-4 bg-success-50 dark:bg-success-950 border border-success-200 dark:border-success-800 rounded-xl">
                        <h4 className="text-sm font-semibold text-success-700 dark:text-success-300 mb-3 flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Vista previa de precios
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-success-600 dark:text-success-400">
                              1 {formData.unit || "unidad"} completa:
                            </span>
                            <span className="font-bold text-success-700 dark:text-success-300">
                              ${formData.salePrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-success-600 dark:text-success-400">
                              1 {formData.doseUnit || "fracción"}:
                            </span>
                            <span className="font-bold text-success-700 dark:text-success-300">
                              ${formData.salePricePerDose.toFixed(2)}
                            </span>
                          </div>
                          <div className="col-span-2 pt-2 border-t border-success-200 dark:border-success-800">
                            <p className="text-xs text-success-600 dark:text-success-400">
                              Si vendes las {formData.dosesPerUnit}{" "}
                              {formData.doseUnit || "fracciones"} por separado:{" "}
                              <span className="font-bold text-success-700 dark:text-success-300">
                                ${(formData.dosesPerUnit * formData.salePricePerDose).toFixed(2)}
                              </span>
                              {formData.dosesPerUnit * formData.salePricePerDose >
                                formData.salePrice && (
                                <span className="ml-2 text-success-500 bg-success-100 dark:bg-success-900 px-1.5 py-0.5 rounded">
                                  +$
                                  {(
                                    formData.dosesPerUnit * formData.salePricePerDose -
                                    formData.salePrice
                                  ).toFixed(2)}{" "}
                                  extra
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-surface-50 dark:bg-dark-100 border-t border-surface-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="text-danger-500">*</span> Campos obligatorios
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-secondary"
                >
                  <X className="w-4 h-4" />
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
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}