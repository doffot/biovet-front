// src/components/ui/DropdownMenu.tsx
import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";

interface DropdownMenuItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  disabled?: boolean;
  onClick: () => void;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  trigger: React.ReactNode;
  align?: "left" | "right";
  side?: "top" | "bottom";
  sideOffset?: number;
}

export function DropdownMenu({ 
  trigger, 
  items, 
  align = "right", 
  side = "bottom", 
  sideOffset = 8 
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isReady, setIsReady] = useState(false); // 👈 Para evitar el "flash"
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 280;
      
      // Calculamos el LEFT
      let left = align === "right" ? rect.right - menuWidth : rect.left;
      if (left < 8) left = 8;
      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8;
      }

      let top = 0;
      if (side === "top") {
        const currentMenuHeight = menuRef.current?.offsetHeight || (items.length * 56 + 60);
        top = rect.top - currentMenuHeight - sideOffset;
      } else {
        top = rect.bottom + sideOffset;
      }

      setPosition({ top, left });
      setIsReady(true); // Ya está posicionado, podemos mostrarlo
    } else {
      setIsReady(false);
    }
  }, [isOpen, align, side, sideOffset, items.length]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="inline-block">
        {trigger}
      </div>

      {isOpen &&
        createPortal(
          <>
            <div className="fixed inset-0 z-60" onClick={() => setIsOpen(false)} />

            <div
              ref={menuRef}
              style={{ 
                top: `${position.top}px`, 
                left: `${position.left}px`,
                visibility: isReady ? "visible" : "hidden", 
                opacity: isReady ? 1 : 0
              }}
              className="fixed z-70 w-70 bg-white dark:bg-dark-200 rounded-xl shadow-xl border border-surface-200 dark:border-dark-100 overflow-hidden transition-opacity duration-150"
            >
              <div className="px-4 py-3 border-b border-surface-200 dark:border-dark-100 bg-surface-50 dark:bg-dark-300">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tipo de Examen
                </p>
              </div>

              <div className="p-2 max-h-87.5 overflow-y-auto custom-scrollbar">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!item.disabled) {
                          item.onClick();
                          setIsOpen(false);
                        }
                      }}
                      disabled={item.disabled}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                        item.disabled
                          ? "opacity-50 cursor-not-allowed grayscale"
                          : "hover:bg-surface-100 dark:hover:bg-dark-100 cursor-pointer active:scale-[0.98]"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-white text-sm">
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.disabled && (
                        <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-100 dark:bg-dark-100 px-2 py-0.5 rounded-full">
                          Pronto
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}