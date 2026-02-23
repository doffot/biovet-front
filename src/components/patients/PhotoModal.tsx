import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X, Camera, Image as ImageIcon } from "lucide-react";
import { updatePatient } from "@/api/patientAPI";
import { toast } from "@/components/Toast";
import type { Patient } from "@/types/patient";

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export default function PhotoModal({ isOpen, onClose, patient }: PhotoModalProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(patient.photo || null);
  const queryClient = useQueryClient();

  // Sincronizar preview si la foto del paciente cambia externamente
  useEffect(() => {
    setPreviewImage(patient.photo || null);
  }, [patient.photo]);

  const { mutate: updatePatientPhoto, isPending: isUpdatingPhoto } = useMutation({
    mutationFn: (dataToUpdate: FormData) =>
      updatePatient({ formData: dataToUpdate, patientId: patient._id }),
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar la foto");
    },
    onSuccess: () => {
      toast.success("¡Foto actualizada!", "La imagen del paciente se ha guardado.");
      queryClient.invalidateQueries({ queryKey: ["patient", patient._id] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setPhoto(null);
      onClose();
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSavePhoto = () => {
    if (!photo) return;
    const data = new FormData();
    data.append("photo", photo);
    updatePatientPhoto(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-200 w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-biovet-500" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
              Foto del Paciente
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido / Preview */}
        <div className="p-6">
          <div className="relative group aspect-square rounded-4xl overflow-hidden bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-slate-700 transition-all hover:border-biovet-500/50">
            {previewImage ? (
              <>
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white hover:bg-white/30 transition-all">
                    <Upload size={24} />
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>
              </>
            ) : (
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                <div className="p-4 bg-biovet-500/10 rounded-2xl text-biovet-500 mb-3">
                    <ImageIcon size={32} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Subir Imagen
                </span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            )}
          </div>

          {photo && (
            <div className="mt-4 flex items-center justify-center gap-2 animate-bounce">
              <div className="w-1.5 h-1.5 bg-biovet-500 rounded-full" />
              <p className="text-[10px] font-black uppercase tracking-widest text-biovet-600">
                Nueva foto lista
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSavePhoto}
            disabled={isUpdatingPhoto || !photo}
            className="flex items-center gap-2 px-6 py-2.5 bg-biovet-500 hover:bg-biovet-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-biovet-500/20 transition-all"
          >
            {isUpdatingPhoto ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <SaveIcon size={14} /> 
            )}
            {isUpdatingPhoto ? "Guardando" : "Guardar Foto"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SaveIcon({ size }: { size: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
}