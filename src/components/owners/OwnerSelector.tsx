// src/components/owners/OwnerSelector.tsx

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search, User, X, ChevronDown, UserPlus } from "lucide-react";
import type { Owner } from "../../types/owner";
import { getOwners } from "../../api/OwnerAPI";

interface OwnerSelectorProps {
  selectedOwner: { id: string; name: string; phone?: string } | null;
  onSelectOwner: (
    owner: { id: string; name: string; phone?: string } | null
  ) => void;
  required?: boolean;
  error?: string;
}

export function OwnerSelector({
  selectedOwner,
  onSelectOwner,
  required = false,
  error,
}: OwnerSelectorProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: owners = [], isLoading } = useQuery<Owner[]>({
    queryKey: ["owners"],
    queryFn: getOwners,
  });

  const filteredOwners = useMemo(() => {
    if (!searchTerm.trim()) return owners;

    const search = searchTerm.toLowerCase();
    return owners.filter(
      (owner: Owner) =>
        owner.name.toLowerCase().includes(search) ||
        owner.contact?.toLowerCase().includes(search) ||
        owner.nationalId?.toLowerCase().includes(search)
    );
  }, [owners, searchTerm]);

  const handleSelectOwner = (owner: Owner) => {
    onSelectOwner({
      id: owner._id,
      name: owner.name,
      phone: owner.contact,
    });
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClearSelection = () => {
    onSelectOwner(null);
    setSearchTerm("");
  };

  const handleCreateOwner = () => {
    navigate("/owners/create");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".owner-selector-container")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="owner-selector-container relative">
      {/* Label */}
      <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
        Cliente{" "}
        {required && <span className="text-danger-500">*</span>}
      </label>

      {/* ========================================
          OWNER SELECCIONADO
          ======================================== */}
      {selectedOwner ? (
        <div className="bg-white dark:bg-dark-100 border border-surface-300 dark:border-slate-700 rounded-lg p-2 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1 bg-biovet-500/10 rounded">
              <User className="w-3 h-3 text-biovet-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                {selectedOwner.name}
              </p>
              {selectedOwner.phone && (
                <p className="text-[10px] text-surface-500 dark:text-slate-400 truncate">
                  {selectedOwner.phone}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearSelection}
            className="p-1 text-surface-500 dark:text-slate-400 hover:text-danger-500 hover:bg-danger-500/10 rounded transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        /* ========================================
           SELECTOR / DROPDOWN TRIGGER
           ======================================== */
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-2.5 py-2 bg-white dark:bg-dark-100 border rounded-lg text-left flex items-center justify-between transition-colors text-xs cursor-pointer ${
              error
                ? "border-danger-500 focus:ring-2 focus:ring-danger-500/20"
                : "border-surface-300 dark:border-slate-700 hover:border-biovet-500 focus:outline-none focus:ring-2 focus:ring-biovet-500/20"
            }`}
          >
            <span
              className={
                error
                  ? "text-danger-500"
                  : "text-surface-500 dark:text-slate-400"
              }
            >
              {error || "Seleccionar cliente..."}
            </span>
            <ChevronDown
              className={`w-3 h-3 text-surface-500 dark:text-slate-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* ========================================
              DROPDOWN
              ======================================== */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-100 border border-surface-300 dark:border-slate-700 rounded-lg shadow-lg max-h-80 overflow-hidden">
              {/* Search & Create */}
              <div className="p-2 border-b border-surface-300 dark:border-slate-700 space-y-1.5">
                {/* Input búsqueda */}
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-surface-500 dark:text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 bg-surface-100 dark:bg-dark-200 border border-surface-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 placeholder:text-surface-500 dark:placeholder:text-slate-400 rounded text-xs focus:outline-none focus:ring-1 focus:ring-biovet-500/20 focus:border-biovet-500 transition-all"
                    autoFocus
                  />
                </div>

                {/* Botón Crear Nuevo Cliente */}
                <button
                  type="button"
                  onClick={handleCreateOwner}
                  className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-biovet-500 hover:bg-biovet-700 text-white rounded text-xs font-medium transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  Crear Nuevo Cliente
                </button>
              </div>

              {/* ========================================
                  LISTA DE OWNERS
                  ======================================== */}
              <div className="max-h-56 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  /* Loading */
                  <div className="p-3 text-center">
                    <div className="w-5 h-5 mx-auto border-2 border-biovet-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-surface-500 dark:text-slate-400 mt-1">
                      Cargando...
                    </p>
                  </div>
                ) : filteredOwners.length > 0 ? (
                  /* Lista */
                  <div className="divide-y divide-surface-300 dark:divide-slate-700">
                    {filteredOwners.map((owner: Owner) => (
                      <button
                        key={owner._id}
                        type="button"
                        onClick={() => handleSelectOwner(owner)}
                        className="w-full p-2 text-left hover:bg-surface-200 dark:hover:bg-dark-50 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <div className="p-1 bg-biovet-500/10 rounded shrink-0">
                          <User className="w-3 h-3 text-biovet-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                            {owner.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-surface-500 dark:text-slate-400 mt-0.5">
                            <span className="truncate">{owner.contact}</span>
                            {owner.nationalId && (
                              <>
                                <span>•</span>
                                <span>{owner.nationalId}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Empty state */
                  <div className="p-4 text-center">
                    <div className="w-8 h-8 mx-auto bg-surface-100 dark:bg-dark-200 border border-surface-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-2">
                      <User className="w-4 h-4 text-surface-500 dark:text-slate-400" />
                    </div>
                    <p className="text-xs text-surface-500 dark:text-slate-400 mb-2">
                      {searchTerm
                        ? "No se encontraron clientes"
                        : "No hay clientes registrados"}
                    </p>
                    <button
                      type="button"
                      onClick={handleCreateOwner}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-biovet-500/10 text-biovet-500 dark:text-biovet-300 hover:bg-biovet-500 hover:text-white rounded text-xs font-medium transition-colors border border-biovet-500/20 cursor-pointer"
                    >
                      <UserPlus className="w-3 h-3" />
                      Crear Primer Cliente
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && !selectedOwner && (
        <p className="mt-1 text-[10px] text-danger-500">{error}</p>
      )}
    </div>
  );
}