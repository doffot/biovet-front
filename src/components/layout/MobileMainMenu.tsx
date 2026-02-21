import { Users, X } from "lucide-react";
import {
  Calendar,
  ShoppingBag,
  Package,
  FileText,
  BarChart3,
  Settings,
  FlaskConical,
  Scissors,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface MobileMainMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMainMenu({ isOpen, onClose }: MobileMainMenuProps) {
  const menuSections = [
    {
      title: "Servicios Operativos",
      items: [
        { to: "/appointments", label: "Citas", icon: Calendar },
        { to: "/lab", label: "Laboratorio", icon: FlaskConical },
        { to: "/grooming", label: "Peluquería", icon: Scissors },
      ],
    },
    {
      title: "Ventas",
      items: [{ to: "/sales", label: "Registrar venta", icon: ShoppingBag }],
    },
    {
      title: "Inventario",
      items: [
        { to: "/inventory/products", label: "Productos", icon: Package },
        { to: "/inventory/stock", label: "Stock actual", icon: Package },
        { to: "/inventory/movements", label: "Movimientos", icon: Package },
        { to: "/inventory/low-stock", label: "Stock bajo", icon: Package },
      ],
    },
    {
      title: "Compras",
      items: [
        { to: "/purchases/new", label: "Registrar compra", icon: ShoppingBag },
        {
          to: "/purchases/history",
          label: "Historial de compras",
          icon: FileText,
        },
      ],
    },
    {
      items: [{ to: "/reports", label: "Reportes", icon: BarChart3 }],
    },
    {
      title: "Configuraciones",
      items: [
        { to: "/settings/staff", label: "Staff", icon: Users },
        {
          to: "/settings/payment-methods",
          label: "Métodos de Pago",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className={`
          fixed inset-0 z-60 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />

      {/* Drawer lateral */}
      <div
        className={`
          fixed inset-y-0 right-0 z-70 w-[85%] max-w-[320px]
          bg-white dark:bg-dark-200 shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header del drawer */}
        <div className="relative h-16 bg-biovet-600 flex items-center justify-between px-6 text-white">
          <h2 className="text-lg font-bold">Menú</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto py-4">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-4">
              {section.title && (
                <div className="px-6 py-2">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}

              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={itemIndex}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) => `
                        flex items-center gap-4 px-6 py-3 text-sm font-medium transition-all
                        ${
                          isActive
                            ? "text-biovet-600 bg-biovet-50 dark:bg-biovet-900/20 dark:text-biovet-400"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-100"
                        }
                      `}
                    >
                      <Icon
                        size={20}
                        className={
                          // Use the NavLink's isActive state to style the icon
                          // Since we can't access isActive here, style icon based on parent NavLink's isActive
                          // We'll use the same color for all icons, or you can move the logic to the NavLink's className
                          "text-slate-400"
                        }
                      />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-surface-50 dark:bg-dark-300">
          <p className="text-[10px] text-slate-400 text-center font-mono">
            Clínica Veterinaria
          </p>
        </div>
      </div>
    </>
  );
}
