// src/components/labexam/batch/BatchPatientList.tsx
import { useState } from "react";
import { X, Plus, User, Search } from "lucide-react";
import type { BatchExam } from "@/types/batch";
import type { LabExamFormData } from "@/types/labExam";
import { searchPatients } from "@/api/labExamAPI";

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Por esto
const defaultFormData = (): LabExamFormData => ({
  vetId: "",        // ← agrega esto, el backend lo sobreescribe con el token
  patientName: "",
  species: "canino",
  breed: "",
  sex: "",
  age: "",
  weight: undefined,
  cost: 0,
  discount: 0,
  date: getLocalDateString(),
  examType: "hematology",
  hematocrit: 0,
  whiteBloodCells: 0,
  totalProtein: 0,
  platelets: 0,
  hemotropico: "",
  observacion: "",
  treatingVet: "",
  ownerName: "",
  ownerPhone: "",
  patientId: undefined,
  differentialCount: {
    segmentedNeutrophils: 0,
    bandNeutrophils: 0,
    lymphocytes: 0,
    monocytes: 0,
    basophils: 0,
    reticulocytes: 0,
    eosinophils: 0,
    nrbc: 0,
  },
  totalCells: 0,
});

interface Props {
  exams: BatchExam[];
  onAddExam: (exam: BatchExam) => void;
  onRemoveExam: (tempId: string) => void;
}

// ── Buscador de paciente interno ──────────────────────────
const PatientSearchRow = ({
  onAdd,
}: {
  onAdd: (exam: BatchExam) => void;
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showExternal, setShowExternal] = useState(false);

  // Formulario paciente externo
  const [externalName, setExternalName] = useState("");
  const [externalOwner, setExternalOwner] = useState("");
  const [externalPhone, setExternalPhone] = useState("");
  const [externalSpecies, setExternalSpecies] = useState("canino");

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const data = await searchPatients(value);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = (patient: any) => {
    const exam: BatchExam = {
      tempId: crypto.randomUUID(),
      formData: {
        ...defaultFormData(),
        patientId: patient._id,
        patientName: patient.name,
        species: patient.species || "canino",
        breed: patient.breed || "",
        sex: patient.sex || "",
        age: patient.age || "",
        weight: patient.weight,
        ownerName: patient.owner?.name || "",
        ownerPhone: patient.owner?.phone || "",
      },
      differentialCount: {
        segmentedNeutrophils: 0,
        bandNeutrophils: 0,
        lymphocytes: 0,
        monocytes: 0,
        basophils: 0,
        reticulocytes: 0,
        eosinophils: 0,
        nrbc: 0,
      },
      totalCells: 0,
      status: "pending",
    };
    onAdd(exam);
    setQuery("");
    setResults([]);
  };

  const handleAddExternal = () => {
    if (!externalName.trim() || !externalOwner.trim()) return;
    const exam: BatchExam = {
      tempId: crypto.randomUUID(),
      formData: {
        ...defaultFormData(),
        patientName: externalName.trim(),
        species: externalSpecies,
        ownerName: externalOwner.trim(),
        ownerPhone: externalPhone.trim(),
      },
      differentialCount: {
        segmentedNeutrophils: 0,
        bandNeutrophils: 0,
        lymphocytes: 0,
        monocytes: 0,
        basophils: 0,
        reticulocytes: 0,
        eosinophils: 0,
        nrbc: 0,
      },
      totalCells: 0,
      status: "pending",
    };
    onAdd(exam);
    setExternalName("");
    setExternalOwner("");
    setExternalPhone("");
    setShowExternal(false);
  };

  return (
    <div className="space-y-3">
      {/* Toggle interno / externo */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowExternal(false)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            !showExternal
              ? "bg-biovet-600 text-white"
              : "bg-surface-100 dark:bg-dark-300 text-slate-600 dark:text-slate-400"
          }`}
        >
          Paciente interno
        </button>
        <button
          type="button"
          onClick={() => setShowExternal(true)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            showExternal
              ? "bg-biovet-600 text-white"
              : "bg-surface-100 dark:bg-dark-300 text-slate-600 dark:text-slate-400"
          }`}
        >
          Paciente externo
        </button>
      </div>

      {/* Búsqueda interno */}
      {!showExternal && (
        <div className="relative">
          <div className="flex items-center gap-2 border border-surface-200 dark:border-dark-100 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar paciente por nombre..."
              className="flex-1 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200"
            />
            {isSearching && (
              <span className="text-xs text-slate-400">Buscando...</span>
            )}
          </div>

          {/* Resultados */}
          {results.length > 0 && (
            <ul className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-dark-200 border border-surface-200 dark:border-dark-100 rounded-lg shadow-lg overflow-hidden">
              {results.map((patient) => (
                <li key={patient._id}>
                  <button
                    type="button"
                    onClick={() => handleSelectPatient(patient)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-50 dark:hover:bg-dark-300 transition-colors text-left"
                  >
                    <User className="w-4 h-4 text-biovet-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {patient.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {patient.species} • {patient.breed || "Sin raza"} •{" "}
                        {patient.owner?.name || "Sin dueño"}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Formulario externo */}
      {showExternal && (
        <div className="space-y-2 p-3 bg-surface-50 dark:bg-dark-300 rounded-lg border border-surface-200 dark:border-dark-100">
          <input
            type="text"
            value={externalName}
            onChange={(e) => setExternalName(e.target.value)}
            placeholder="Nombre del paciente *"
            className="w-full border border-surface-200 dark:border-dark-100 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 outline-none"
          />
          <select
            value={externalSpecies}
            onChange={(e) => setExternalSpecies(e.target.value)}
            className="w-full border border-surface-200 dark:border-dark-100 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 outline-none"
          >
            <option value="canino">Canino</option>
            <option value="felino">Felino</option>
          </select>
          <input
            type="text"
            value={externalOwner}
            onChange={(e) => setExternalOwner(e.target.value)}
            placeholder="Nombre del dueño *"
            className="w-full border border-surface-200 dark:border-dark-100 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 outline-none"
          />
          <input
            type="text"
            value={externalPhone}
            onChange={(e) => setExternalPhone(e.target.value)}
            placeholder="Teléfono (opcional)"
            className="w-full border border-surface-200 dark:border-dark-100 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 outline-none"
          />
          <button
            type="button"
            onClick={handleAddExternal}
            disabled={!externalName.trim() || !externalOwner.trim()}
            className="w-full py-2 bg-biovet-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-biovet-700 transition-colors"
          >
            Agregar paciente externo
          </button>
        </div>
      )}
    </div>
  );
};

// ── Componente principal ───────────────────────────────────
export const BatchPatientList = ({ exams, onAddExam, onRemoveExam }: Props) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">
          Pacientes del lote
        </h2>
        <p className="text-sm text-slate-400">
          Agrega todos los pacientes antes de continuar
        </p>
      </div>

      {/* Lista de pacientes agregados */}
      {exams.length > 0 && (
        <ul className="space-y-2">
          {exams.map((exam, index) => (
            <li
              key={exam.tempId}
              className="flex items-center justify-between px-4 py-3 bg-surface-50 dark:bg-dark-300 rounded-xl border border-surface-200 dark:border-dark-100"
            >
              <div className="flex items-center gap-3">
                {/* Número */}
                <span className="w-6 h-6 rounded-full bg-biovet-100 dark:bg-biovet-900/30 text-biovet-600 dark:text-biovet-400 text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {exam.formData.patientName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {exam.formData.species}
                    {exam.formData.breed ? ` • ${exam.formData.breed}` : ""}
                    {exam.formData.patientId ? (
                      <span className="ml-1 text-emerald-500">• Interno</span>
                    ) : (
                      <span className="ml-1 text-amber-500">• Externo</span>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemoveExam(exam.tempId)}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Buscador para agregar */}
      <div className="border-2 border-dashed border-surface-300 dark:border-dark-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Plus className="w-4 h-4 text-biovet-500" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Agregar paciente
          </span>
        </div>
        <PatientSearchRow onAdd={onAddExam} />
      </div>

      {/* Validación mínima */}
      {exams.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-2">
          Agrega al menos un paciente para continuar
        </p>
      )}
    </div>
  );
};