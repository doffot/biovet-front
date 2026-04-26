// src/views/labExams/CreateLabExamView.tsx
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FlaskConical,
  Microscope,
  Scissors,
  TestTube,
  Droplets,
  X,
  ChevronRight,
  Beaker,
} from "lucide-react";

const EXAM_TYPES = [
  {
    id: "hematology",
    name: "Hematología",
    description: "Hemograma completo con diferencial",
    icon: FlaskConical,
    color: "bg-red-500",
    available: true,
  },
  {
    id: "cytology",
    name: "Citología",
    description: "Tipo de muestra, coloración y resultados",
    icon: Microscope,
    color: "bg-purple-500",
    available: true,
  },
  {
    id: "skin_scraping", // ✅ Corregido para coincidir con el tipo del backend
    name: "Raspado Cutáneo",
    description: "Superficial o profundo",
    icon: Scissors,
    color: "bg-amber-500",
    available: true,
  },
  {
    id: "trichogram",
    name: "Tricograma",
    description: "Análisis de pelo",
    icon: TestTube,
    color: "bg-emerald-500",
    available: true,
  },
  {
    id: "test",
    name: "Test Rápido",
    description: "Nombre del test y resultado",
    icon: Beaker,
    color: "bg-cyan-500",
    available: true,
  },
  {
    id: "urinalysis",
    name: "Uroanálisis",
    description: "Examen completo de orina",
    icon: Droplets,
    color: "bg-blue-500",
    available: true,
  },
];

export default function CreateLabExamView() {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams(); // ✅ NUEVO: Leer query params
  const [isClosing, setIsClosing] = useState(false);

  // Detectar si viene desde paciente o desde lab principal
  const isFromPatient = location.pathname.includes("/patients/");
  
  const typeFromUrl = searchParams.get("type");

  useEffect(() => {
    if (typeFromUrl) {
      const validType = EXAM_TYPES.find(e => e.id === typeFromUrl && e.available);
      if (validType) {
        // Redirigir inmediatamente sin mostrar la pantalla de selección
        if (isFromPatient && patientId) {
          navigate(`/patients/${patientId}/exams/create/${typeFromUrl}`, { replace: true });
        } else {
          navigate(`/lab/create/${typeFromUrl}`, { replace: true });
        }
      }
    }
  }, [typeFromUrl, isFromPatient, patientId, navigate]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => navigate(-1), 300);
  };

  const handleSelectExam = (examId: string) => {
    if (isFromPatient && patientId) {
      navigate(`/patients/${patientId}/exams/create/${examId}`);
    } else {
      navigate(`/lab/create/${examId}`);
    }
  };

  //  Si viene con tipo válido, no mostrar nada (se redirige)
  if (typeFromUrl && EXAM_TYPES.find(e => e.id === typeFromUrl && e.available)) {
    return null; // O un spinner si quieres
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`fixed inset-0 z-50 bg-white dark:bg-dark-200 flex flex-col transform transition-transform duration-300 ease-out ${
          isClosing ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Header */}
        <header className="shrink-0 bg-linear-to-r from-biovet-600 to-biovet-700 text-white px-4 sm:px-6 py-4 sm:py-5">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={handleClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold font-heading">
                  Nuevo Examen de Laboratorio
                </h1>
                <p className="text-biovet-100 text-xs sm:text-sm mt-0.5">
                  Selecciona el tipo de examen a realizar
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto bg-surface-50 dark:bg-dark-300">
          <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EXAM_TYPES.map((exam) => {
                const Icon = exam.icon;

                return (
                  <button
                    key={exam.id}
                    onClick={() => exam.available && handleSelectExam(exam.id)}
                    disabled={!exam.available}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                      exam.available
                        ? "bg-white dark:bg-dark-200 border-surface-200 dark:border-dark-100 hover:border-biovet-500 hover:shadow-lg hover:shadow-biovet-500/10 cursor-pointer"
                        : "bg-surface-100 dark:bg-dark-300 border-surface-200 dark:border-dark-100 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {!exam.available && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-dark-100 px-2 py-1 rounded-full">
                        Próximamente
                      </span>
                    )}

                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${exam.color} flex items-center justify-center shrink-0`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                          {exam.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {exam.description}
                        </p>
                      </div>

                      {exam.available && (
                        <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}