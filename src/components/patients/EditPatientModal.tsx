import { useState} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePatient } from "@/api/patientAPI";
import { toast } from "@/components/Toast";
import { X, Save, PawPrint } from "lucide-react";
import type { Patient } from "@/types/patient";

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export function EditPatientModal({ isOpen, onClose, patient }: EditPatientModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: patient.name,
    birthDate: patient.birthDate.split("T")[0],
    species: patient.species,
    sex: patient.sex,
    breed: patient.breed || "",
    weight: patient.weight || 0,
    color: patient.color || "",
    identification: patient.identification || "",
    observations: patient.observations || "",
  });

  const { mutate: updatePatientData, isPending } = useMutation({
    mutationFn: (dataToUpdate: FormData) =>
      updatePatient({ formData: dataToUpdate, patientId: patient._id }),
    onError: (error: Error) => toast.error(error.message),
    onSuccess: () => {
      toast.success(`"${formData.name}" actualizado/a`);
      queryClient.invalidateQueries({ queryKey: ["patient", patient._id] });
      onClose();
    },
  });

  const handleSave = () => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, String(value));
    });
    updatePatientData(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-200 w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header Modal */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-biovet-500/10 rounded-xl">
              <PawPrint className="text-biovet-500" size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editar Mascota</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
              <div className="relative">
                <input 
                  className="w-full pl-4 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-biovet-500/20 focus:border-biovet-500 outline-none transition-all dark:text-white"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Nacimiento</label>
              <input 
                type="date"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-2xl dark:text-white outline-none"
                value={formData.birthDate}
                onChange={e => setFormData({...formData, birthDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Sexo</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-2xl dark:text-white outline-none appearance-none"
                value={formData.sex}
                onChange={e => setFormData({...formData, sex: e.target.value as any})}
              >
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Peso (kg)</label>
              <input 
                type="number"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-2xl dark:text-white outline-none"
                value={formData.weight}
                onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Raza</label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-2xl dark:text-white outline-none"
                value={formData.breed}
                onChange={e => setFormData({...formData, breed: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-8 py-6 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-8 py-2.5 bg-biovet-500 hover:bg-biovet-600 text-white rounded-xl font-bold shadow-lg shadow-biovet-500/30 transition-all disabled:opacity-50"
          >
            {isPending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}