// src/components/ui/TimelineLayout.tsx

import { ArrowLeft, PlusCircle, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from "react";

// Variantes de color por sección
const VARIANTS = {
  consultas: {
    header: "bg-purple-50 dark:bg-purple-950/20",
    iconBg: "bg-purple-50 dark:bg-purple-950/30",
    iconText: "text-purple-600 dark:text-purple-400",
    button: "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20",
    buttonMobile: "bg-purple-500 shadow-purple-600/40",
    divider: "border-purple-200 dark:border-purple-800/50",
  },
  tratamientos: {
    header: "bg-blue-50 dark:bg-blue-950/20",
    iconBg: "bg-blue-50 dark:bg-blue-950/30",
    iconText: "text-blue-600 dark:text-blue-400",
    button: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20",
    buttonMobile: "bg-blue-500 shadow-blue-600/40",
    divider: "border-blue-200 dark:border-blue-800/50",
  },
  servicios: {
    header: "bg-indigo-50 dark:bg-indigo-950/20",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/30",
    iconText: "text-indigo-600 dark:text-indigo-400",
    button: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20",
    buttonMobile: "bg-indigo-500 shadow-indigo-600/40",
    divider: "border-indigo-200 dark:border-indigo-800/50",
  },
  recetas: {
    header: "bg-rose-50 dark:bg-rose-950/20",
    iconBg: "bg-rose-50 dark:bg-rose-950/30",
    iconText: "text-rose-600 dark:text-rose-400",
    button: "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20",
    buttonMobile: "bg-rose-500 shadow-rose-600/40",
    divider: "border-rose-200 dark:border-rose-800/50",
  },
  vacunas: {
    header: "bg-biovet-50 dark:bg-biovet-950/20",
    iconBg: "bg-biovet-50 dark:bg-biovet-950/30",
    iconText: "text-biovet-600 dark:text-biovet-400",
    button: "bg-biovet-600 hover:bg-biovet-700 shadow-biovet-500/20",
    buttonMobile: "bg-biovet-500 shadow-biovet-600/40",
    divider: "border-biovet-200 dark:border-biovet-800/50",
  },
  antiparasitarios: {
    header: "bg-amber-50 dark:bg-amber-950/20",
    iconBg: "bg-amber-50 dark:bg-amber-950/30",
    iconText: "text-amber-600 dark:text-amber-400",
    button: "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20",
    buttonMobile: "bg-amber-500 shadow-amber-600/40",
    divider: "border-amber-200 dark:border-amber-800/50",
  },
  examenes: {
    header: "bg-emerald-50 dark:bg-emerald-950/20",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconText: "text-emerald-600 dark:text-emerald-400",
    button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20",
    buttonMobile: "bg-emerald-500 shadow-emerald-600/40",
    divider: "border-emerald-200 dark:border-emerald-800/50",
  },
  estudios: {
    header: "bg-cyan-50 dark:bg-cyan-950/20",
    iconBg: "bg-cyan-50 dark:bg-cyan-950/30",
    iconText: "text-cyan-600 dark:text-cyan-400",
    button: "bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/20",
    buttonMobile: "bg-cyan-500 shadow-cyan-600/40",
    divider: "border-cyan-200 dark:border-cyan-800/50",
  },
  estetica: {
    header: "bg-pink-50 dark:bg-pink-950/20",
    iconBg: "bg-pink-50 dark:bg-pink-950/30",
    iconText: "text-pink-600 dark:text-pink-400",
    button: "bg-pink-600 hover:bg-pink-700 shadow-pink-500/20",
    buttonMobile: "bg-pink-500 shadow-pink-600/40",
    divider: "border-pink-200 dark:border-pink-800/50",
  },
  citas: {
    header: "bg-orange-50 dark:bg-orange-950/20",
    iconBg: "bg-orange-50 dark:bg-orange-950/30",
    iconText: "text-orange-600 dark:text-orange-400",
    button: "bg-orange-600 hover:bg-orange-700 shadow-orange-500/20",
    buttonMobile: "bg-orange-500 shadow-orange-600/40",
    divider: "border-orange-200 dark:border-orange-800/50",
  },
} as const;

type Variant = keyof typeof VARIANTS;

interface Props {
  title: string;
  subtitle: string;
  headerIcon: LucideIcon;
  count: number;
  countLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
  variant?: Variant;
}

export default function TimeLineLayout({
  title,
  subtitle,
  headerIcon: Icon,
  count,
  countLabel,
  onAdd,
  children,
  variant = "vacunas",
}: Props) {
  const navigate = useNavigate();
  const colors = VARIANTS[variant];

  // Convertir children a array para poder agregar divisores
  const childrenArray = React.Children.toArray(children);

  return (
    <div className="flex flex-col h-full bg-surface-50 dark:bg-dark-300 relative">
      {/* HEADER DESKTOP */}
      <div
        className={`hidden lg:flex flex-none items-center justify-between px-8 py-6 ${colors.header} border-b border-surface-200 dark:border-dark-100`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 ${colors.iconBg} rounded-2xl flex items-center justify-center ${colors.iconText}`}
          >
            <Icon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
              {title}
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wider">
              {subtitle}
            </p>
          </div>
        </div>
        <button
          onClick={onAdd}
          className={`${colors.button} text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all`}
        >
          <PlusCircle size={20} strokeWidth={2.5} />
          Agregar
        </button>
      </div>

      {/* CONTENIDO SCROLLABLE */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-48 lg:pb-10">
        <div className="max-w-3xl mx-auto p-6 lg:p-10">
          <div className="relative">
            {/* Línea vertical del timeline */}
            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800" />
            
            {/* Items con divisores */}
            <div className="space-y-0">
              {childrenArray.map((child, index) => {
                const isLast = index === childrenArray.length - 1;
                
                // Si es el estado vacío (un solo elemento que no es un array de items)
                if (childrenArray.length === 1) {
                  return <div key={index}>{child}</div>;
                }

                return (
                  <div key={index}>
                    {/* Item */}
                    <div className="pb-6">{child}</div>
                    
                    {/* Divisor horizontal punteado */}
                    {!isLast && (
                      <div className="ml-8 mb-6">
                        <div 
                          className={`border-t-2 border-dashed ${colors.divider}`}
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BAR MOBILE */}
      <div className="lg:hidden fixed bottom-20 left-4 right-4 z-40">
        <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md border border-white/10 p-4 rounded-4xl shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">
                {title}
              </p>
              <p className="text-white font-bold leading-none">
                {count} {countLabel}
              </p>
            </div>
          </div>
          <button
            onClick={onAdd}
            className={`${colors.buttonMobile} text-white px-5 py-3 rounded-lg font-black text-xs flex items-center gap-2 active:scale-90 transition-transform shadow-lg`}
          >
            <PlusCircle size={18} strokeWidth={3} />
            AGREGAR
          </button>
        </div>
      </div>
    </div>
  );
}