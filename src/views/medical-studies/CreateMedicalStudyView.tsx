import { useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  UploadCloud, X, FileText, Save, AlertCircle, ScanLine, Loader2 
} from "lucide-react";
import { createMedicalStudy } from "@/api/medicalStudyAPI";
import { toast } from "@/components/Toast";
import type { Patient } from "@/types/patient";

const STUDY_TYPES = [
  "Radiografía",
  "Ecografía",
  "Hemograma externo",
  "Química sanguínea",
  "Otro",
];

export default function CreateMedicalStudyView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  // OBTENER ID DEL PACIENTE DEL LAYOUT
  const patient = useOutletContext<Patient>();
  const patientId = patient?._id;

  const [formData, setFormData] = useState({
    professional: "",
    studyType: "",
    customStudyType: "",
    presumptiveDiagnosis: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => navigate(-1), 300);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      // Validación extra
      if (!patientId) throw new Error("No se encontró el ID del paciente.");
      return createMedicalStudy(patientId, data);
    },
    onSuccess: () => {
      toast.success("Estudio Registrado", "El archivo PDF ha sido guardado correctamente.");
      queryClient.invalidateQueries({ queryKey: ["medicalStudies", patientId] });
      handleClose();
    },
    onError: (error: any) => {
      console.error(error);
      toast.error("Error", error.message || "No se pudo guardar el estudio.");
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (file: File) => {
    if (file.type !== "application/pdf") {
      toast.warning("Formato Inválido", "Solo se permiten archivos PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) { 
      toast.warning("Archivo Muy Grande", "El tamaño máximo es 10MB.");
      return;
    }
    setPdfFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const isFormValid = () => {
    const studyType = formData.studyType === "Otro" ? formData.customStudyType : formData.studyType;
    return !!(
      pdfFile &&
      formData.professional &&
      formData.studyType &&
      studyType &&
      formData.date
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast.warning("Campos Incompletos", "Por favor completa todos los campos obligatorios.");
      return;
    }

    const studyType = formData.studyType === "Otro" ? formData.customStudyType : formData.studyType;

    const data = new FormData();
    // Campos de texto primero
    data.append("professional", formData.professional);
    data.append("studyType", studyType);
    data.append("date", formData.date);
    if (formData.presumptiveDiagnosis) data.append("presumptiveDiagnosis", formData.presumptiveDiagnosis);
    if (formData.notes) data.append("notes", formData.notes);
    
    // Archivo al final
    data.append("pdfFile", pdfFile!);

    mutate(data);
  };

  if (!patientId) return null; // O un loader si prefieres

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`} onClick={handleClose} />

      <div className={`fixed inset-0 z-50 bg-white dark:bg-dark-200 flex flex-col transform transition-transform duration-300 ease-out ${isClosing ? "translate-x-full" : "translate-x-0"}`}>
        
        {/* HEADER */}
        <header className="shrink-0 bg-linear-to-r from-indigo-500 to-indigo-600 text-white px-4 sm:px-6 py-4 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handleClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold font-heading flex items-center gap-2">
                  <ScanLine className="w-5 h-5" /> Nuevo Estudio
                </h1>
                <p className="text-indigo-100 text-xs font-medium">Paciente: {patient.name}</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto bg-surface-50 dark:bg-dark-300 p-4 sm:p-6 pb-40 sm:pb-32">
          <div className="max-w-4xl mx-auto">
            <form id="study-form" onSubmit={handleSubmit}>
              <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-dark-100 space-y-6">
                
                {/* 1. UPLOAD ZONE */}
                <div>
                  <label className="label block mb-2">Archivo PDF <span className="text-danger-500">*</span></label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        dragActive ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10" : 
                        pdfFile ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10" : 
                        "border-surface-300 dark:border-dark-50 hover:border-indigo-400"
                    }`}
                  >
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      accept=".pdf" 
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} 
                      className="hidden" 
                    />

                    {pdfFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-700 dark:text-white truncate max-w-50">{pdfFile.name}</p>
                          <p className="text-xs text-slate-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); setPdfFile(null); }} 
                          className="p-1.5 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Arrastra un PDF o haz clic</span>
                        <span className="text-xs text-slate-400 mt-1">Máximo 10MB</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. DATOS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="label">Tipo de Estudio <span className="text-danger-500">*</span></label>
                    <select 
                      name="studyType" 
                      value={formData.studyType} 
                      onChange={handleInputChange} 
                      className="input"
                    >
                      <option value="">Seleccionar...</option>
                      {STUDY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="label">Fecha <span className="text-danger-500">*</span></label>
                    <input 
                      type="date" 
                      name="date" 
                      value={formData.date} 
                      onChange={handleInputChange} 
                      max={new Date().toISOString().split("T")[0]} 
                      className="input" 
                    />
                  </div>

                  <div>
                    <label className="label">Profesional / Centro <span className="text-danger-500">*</span></label>
                    <input 
                      type="text" 
                      name="professional" 
                      value={formData.professional} 
                      onChange={handleInputChange} 
                      placeholder="Ej: Centro de Imágenes" 
                      className="input" 
                    />
                  </div>
                </div>

                {formData.studyType === "Otro" && (
                  <div>
                    <label className="label">Especificar Tipo <span className="text-danger-500">*</span></label>
                    <input 
                      type="text" 
                      name="customStudyType" 
                      value={formData.customStudyType} 
                      onChange={handleInputChange} 
                      placeholder="Ej: Tomografía" 
                      className="input" 
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Diagnóstico Presuntivo</label>
                    <textarea 
                      name="presumptiveDiagnosis" 
                      value={formData.presumptiveDiagnosis} 
                      onChange={handleInputChange} 
                      rows={3} 
                      className="input resize-none py-2" 
                      placeholder="Opcional..." 
                    />
                  </div>
                  <div>
                    <label className="label">Notas Adicionales</label>
                    <textarea 
                      name="notes" 
                      value={formData.notes} 
                      onChange={handleInputChange} 
                      rows={3} 
                      className="input resize-none py-2" 
                      placeholder="Opcional..." 
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Verifica que el PDF sea legible y contenga toda la información necesaria.
                  </p>
                </div>

              </div>
            </form>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="shrink-0 fixed bottom-0 left-0 right-0 sm:relative bg-white dark:bg-dark-200 border-t border-surface-200 dark:border-dark-100 px-6 py-4 z-10 mb-16 sm:mb-0">
          <div className="max-w-4xl mx-auto flex justify-end gap-3">
            <button 
              type="button" 
              onClick={handleClose} 
              className="btn-secondary px-6"
              disabled={isPending}
            >
              Cancelar
            </button>
            <button 
              form="study-form" 
              type="submit" 
              disabled={!isFormValid() || isPending} 
              className="btn-primary bg-indigo-500 hover:bg-indigo-600 border-indigo-600 px-8 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Estudio
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}