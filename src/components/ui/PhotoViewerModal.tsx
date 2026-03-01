// src/components/patients/PhotoViewerModal.tsx

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Camera, Trash2, Loader2 } from "lucide-react";
import { updatePatient } from "@/api/patientAPI";
import { toast } from "@/components/Toast";
import type { Patient } from "@/types/patient";

interface PhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  triggerRect: DOMRect | null;
}

export default function PhotoViewerModal({ 
  isOpen, 
  onClose, 
  patient,
  triggerRect 
}: PhotoViewerModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Animación de entrada/salida
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setPreviewImage(patient.photo || null);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setPhoto(null);
        setPreviewImage(null);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, patient.photo]);

  // Mutación para actualizar foto
  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);
      return updatePatient({ formData, patientId: patient._id });
    },
    onSuccess: () => {
      toast.success("¡Foto actualizada!");
      queryClient.invalidateQueries({ queryKey: ["patient", patient._id] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setPhoto(null);
    },
    onError: (error: Error) => toast.error("Error", error.message),
  });

  // Mutación para eliminar foto
  const deleteMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("photo", ""); // Enviar vacío para eliminar
      return updatePatient({ formData, patientId: patient._id });
    },
    onSuccess: () => {
      toast.success("Foto eliminada");
      queryClient.invalidateQueries({ queryKey: ["patient", patient._id] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      onClose();
    },
    onError: (error: Error) => toast.error("Error", error.message),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Error", "La imagen no puede superar 5MB");
        return;
      }
      setPhoto(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    if (photo) {
      uploadMutation.mutate(photo);
    }
  };

  const handleClose = () => {
    if (uploadMutation.isPending || deleteMutation.isPending) return;
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isVisible) return null;

  const isLoading = uploadMutation.isPending || deleteMutation.isPending;
  const currentImage = previewImage || patient.photo;
  const hasNewPhoto = !!photo;

  // Estilos de la imagen según estado de animación
  const getImageContainerStyles = (): React.CSSProperties => {
    if (!isAnimating && triggerRect) {
      // Estado inicial: posición y tamaño del trigger
      return {
        position: 'fixed',
        top: triggerRect.top,
        left: triggerRect.left,
        width: triggerRect.width,
        height: triggerRect.height,
        borderRadius: '1rem',
        transform: 'none',
        transition: 'all 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
      };
    }
    // Estado final: centrado y grande
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      width: 'min(85vw, 400px)',
      height: 'min(85vw, 400px)',
      borderRadius: '2rem',
      transform: 'translate(-50%, -50%)',
      transition: 'all 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
    };
  };

  return (
    <div 
      className={`
        fixed inset-0 z-100 
        transition-all duration-400 ease-out
        ${isAnimating ? 'bg-black/90 backdrop-blur-md' : 'bg-transparent'}
      `}
      onClick={handleBackdropClick}
    >
      {/* Imagen principal con transición de zoom */}
      <div
        className="overflow-hidden shadow-2xl"
        style={getImageContainerStyles()}
      >
        {currentImage ? (
          <img 
            src={currentImage} 
            alt={patient.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-biovet-400 to-biovet-600 flex items-center justify-center">
            <span className="text-white text-7xl font-bold opacity-60">
              {patient.name[0]?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Overlay de carga */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        )}

        {/* Indicador de nueva foto */}
        {hasNewPhoto && !isLoading && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-biovet-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Nueva foto
          </div>
        )}
      </div>

      {/* Header - Nombre del paciente */}
      <div 
        className={`
          fixed top-6 left-6
          transition-all duration-300 delay-100
          ${isAnimating ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
        `}
      >
        <h2 className="text-white text-2xl font-bold drop-shadow-lg">
          {patient.name}
        </h2>
        <p className="text-white/60 text-sm font-medium">
          {patient.breed} • {patient.species}
        </p>
      </div>

      {/* Botón cerrar */}
      <button
        onClick={handleClose}
        disabled={isLoading}
        className={`
          fixed top-6 right-6 
          w-12 h-12 rounded-full 
          bg-white/10 backdrop-blur-sm 
          text-white hover:bg-white/20 
          flex items-center justify-center
          transition-all duration-300 delay-150
          disabled:opacity-50
          ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
        `}
      >
        <X size={24} />
      </button>

      {/* Controles inferiores */}
      <div 
        className={`
          fixed bottom-8 left-1/2 -translate-x-1/2
          flex items-center gap-3
          transition-all duration-300 delay-200
          ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        {/* Botón cambiar foto */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3.5 bg-white text-slate-700 rounded-2xl font-bold shadow-xl hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
        >
          <Camera size={20} />
          <span>Cambiar foto</span>
        </button>

        {/* Botón guardar (solo si hay nueva foto) */}
        {hasNewPhoto && (
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3.5 bg-biovet-500 text-white rounded-2xl font-bold shadow-xl hover:bg-biovet-600 active:scale-95 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <SaveIcon size={18} />
            )}
            <span>Guardar</span>
          </button>
        )}

        {/* Botón eliminar (solo si hay foto actual y no es nueva) */}
        {patient.photo && !hasNewPhoto && (
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={isLoading}
            className="flex items-center justify-center w-14 h-14 bg-danger-500 text-white rounded-2xl shadow-xl hover:bg-danger-600 active:scale-95 transition-all disabled:opacity-50"
          >
            <Trash2 size={22} />
          </button>
        )}
      </div>

      {/* Input oculto para seleccionar archivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

function SaveIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  );
}