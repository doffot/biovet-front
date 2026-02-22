import { 
  LayoutDashboard, 
  Users, 
  Cat, 
  CalendarDays, 
  FlaskRound, 
  Scissors, 
  ShoppingCart, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  CreditCard, 
  UserCog,
  PlusCircle,
  History,
  List,
  Building2,
  type LucideIcon 
} from "lucide-react";

// --- DEFINICIÓN DE TIPOS ---
export interface SubMenuItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export interface MenuItem {
  label: string;
  icon: LucideIcon;
  to?: string;          
  submenu?: SubMenuItem[];
}

export interface MenuSection {
  groupLabel: string;
  items: MenuItem[];
}

// --- DATOS DEL MENÚ ---
export const menuItems: MenuSection[] = [
  // SECCIÓN 1: ACCESOS DIRECTOS
  {
    groupLabel: "Accesos Directos",
    items: [
      { to: "/", label: "Inicio", icon: LayoutDashboard },
      { to: "/owners", label: "Dueños", icon: Users },
      { to: "/patients", label: "Mascotas", icon: Cat },
    ]
  },
  
  // SECCIÓN 2: SERVICIOS OPERATIVOS
  {
    groupLabel: "Servicios Operativos",
    items: [
      { to: "/appointments", label: "Citas", icon: CalendarDays },
      { to: "/lab", label: "Laboratorio", icon: FlaskRound },
      { to: "/grooming", label: "Peluquería", icon: Scissors },
    ]
  },

  // SECCIÓN 3: GESTIÓN COMERCIAL
  {
    groupLabel: "Gestión Comercial",
    items: [
      { 
        label: "Ventas", 
        icon: ShoppingCart,
        to: "/sales", 
        submenu: [
          { to: "/sales/new", label: "Registrar venta", icon: PlusCircle },
          { to: "/sales/history", label: "Historial", icon: History },
        ]
      },
      { 
        label: "Inventario", 
        icon: Package,
        to: "/inventory",
        submenu: [
          { to: "/inventory/products", label: "Productos", icon: List },
          { to: "/inventory/stock", label: "Stock actual", icon: Package },
        ]
      },
      { 
        label: "Compras", 
        icon: ShoppingBag,
        to: "/purchases",
        submenu: [
          { to: "/purchases/new", label: "Registrar compra", icon: PlusCircle },
          { to: "/purchases/history", label: "Historial", icon: History },
        ]
      },
    ]
  },

  // SECCIÓN 4: ADMINISTRACIÓN
  {
    groupLabel: "Administración",
    items: [
      { 
        label: "Reportes", 
        icon: BarChart3,
        to: "/reports",
        submenu: [
          { to: "/reports/grooming", label: "Peluquería", icon: Scissors },
          { to: "/reports/invoices", label: "Facturación", icon: CreditCard },
        ]
      },
      { 
        label: "Configuraciones", 
        icon: Settings,
        to: "/settings",
        submenu: [
          { to: "/settings/clinic", label: "Mi Clínica", icon: Building2 },
          { to: "/settings/staff", label: "Staff", icon: UserCog },
          { to: "/settings/payment-methods", label: "Métodos de Pago", icon: CreditCard },
        ]
      },
    ]
  }
];