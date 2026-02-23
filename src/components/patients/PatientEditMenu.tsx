import { X, Edit3, Camera, PawPrint } from "lucide-react";
import type { Patient } from "@/types/patient";

interface PatientEditMenuProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onEditClick: () => void;
  onPhotoClick: () => void;
}

export function PatientEditMenu({
  isOpen,
  onClose,
  patient,
  onEditClick,
  onPhotoClick,
}: PatientEditMenuProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-999 bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 left-0 z-1000 w-[80%] max-w-75 bg-white dark:bg-dark-200 shadow-2xl transform transition-transform duration-300 ease-out lg:hidden flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Cabecera Visual */}
        <div className="relative h-48 bg-slate-900 p-6 flex flex-col justify-end text-white overflow-hidden shrink-0">
           <PawPrint className="absolute -top-4 -right-4 w-32 h-32 text-white/5 rotate-12" />
           
           <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <X size={20} />
          </button>

          <div className="w-20 h-20 rounded-2xl border-2 border-white/20 overflow-hidden mb-4 shadow-2xl z-10">
            {patient.photo ? (
              <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-800 font-bold text-3xl">
                {patient.name[0]}
              </div>
            )}
          </div>
          
          <div className="z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-biovet-400 mb-1">Gestionar Paciente</p>
            <h2 className="text-2xl font-black leading-tight tracking-tight">{patient.name}</h2>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-3">
          <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Opciones de ficha</p>
          
          <button
            onClick={() => {
              onEditClick();
              onClose();
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-biovet-50 dark:bg-biovet-500/10 text-biovet-600 dark:text-biovet-400 border border-biovet-100 dark:border-biovet-500/20 active:scale-[0.98] transition-all"
          >
            <div className="p-2 bg-white dark:bg-dark-200 rounded-lg shadow-sm">
                <Edit3 size={20} />
            </div>
            <div className="text-left">
                <span className="block text-sm font-bold uppercase tracking-tight">Editar Información</span>
                <span className="block text-[10px] opacity-70">Cambiar nombre, raza, peso...</span>
            </div>
          </button>

          <button
            onClick={() => {
              onPhotoClick();
              onClose();
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-white/10 active:scale-[0.98] transition-all"
          >
            <div className="p-2 bg-white dark:bg-dark-200 rounded-lg shadow-sm">
                <Camera size={20} />
            </div>
            <div className="text-left">
                <span className="block text-sm font-bold uppercase tracking-tight">Actualizar Foto</span>
                <span className="block text-[10px] opacity-70">Subir nueva imagen de perfil</span>
            </div>
          </button>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-dark-300">
           <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
             <span>PACIENTE ID</span>
             <span className="font-bold">{patient._id.slice(-12).toUpperCase()}</span>
           </div>
        </div>
      </div>
    </>
  );
}