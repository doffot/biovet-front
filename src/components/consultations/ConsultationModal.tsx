import { X, Calendar, Thermometer, Heart, Wind, Scale } from "lucide-react";
import type { Consultation } from "../../types/consultation";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: Consultation;
}

export default function ConsultationModal({
  isOpen,
  onClose,
  consultation,
}: ConsultationModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="mb-4">
      <h4 className="text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wide mb-2">
        {title}
      </h4>
      <div
        className="bg-surface-50 dark:bg-dark-200 
                      rounded-lg p-3 space-y-2 
                      border border-surface-300 dark:border-slate-700"
      >
        {children}
      </div>
    </div>
  );

  const Field = ({
    label,
    value,
  }: {
    label: string;
    value?: string | number | boolean | null;
  }) => {
    if (value === undefined || value === null || value === "") return null;
    const displayValue =
      typeof value === "boolean" ? (value ? "Sí" : "No") : value;
    return (
      <div className="flex justify-between text-sm">
        <span className="text-surface-500 dark:text-slate-400">{label}</span>
        <span className="text-surface-800 dark:text-white font-medium text-right max-w-[60%]">
          {displayValue}
        </span>
      </div>
    );
  };

  const TextField = ({
    label,
    value,
  }: {
    label: string;
    value?: string;
  }) => {
    if (!value) return null;
    return (
      <div className="text-sm">
        <span className="text-surface-500 dark:text-slate-400 block mb-1">
          {label}
        </span>
        <p
          className="text-surface-800 dark:text-slate-200 
                        bg-white dark:bg-dark-100 
                        p-2 rounded 
                        border border-surface-300 dark:border-slate-700"
        >
          {value}
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="bg-white dark:bg-dark-100 
                      rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] 
                      overflow-hidden 
                      border border-surface-300 dark:border-slate-700"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 
                        border-b border-surface-300 dark:border-slate-700 
                        bg-glinear-to-r from-biovet-50 dark:from-biovet-950 to-white dark:to-dark-100"
        >
          <div>
            <h3 className="text-lg font-bold text-surface-800 dark:text-white">
              Detalle de Consulta
            </h3>
            <p className="text-sm text-surface-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(consultation.consultationDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg 
                       hover:bg-surface-100 dark:hover:bg-dark-200 
                       text-surface-500 dark:text-slate-400 
                       hover:text-surface-800 dark:hover:text-white 
                       transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
          {/* Signos vitales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div
              className="bg-danger-50 dark:bg-danger-950 
                            rounded-xl p-3 text-center 
                            border border-danger-200 dark:border-danger-800"
            >
              <Thermometer className="w-5 h-5 text-danger-500 dark:text-danger-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-surface-800 dark:text-white">
                {consultation.temperature ?? "-"}°C
              </p>
              <p className="text-xs text-surface-500 dark:text-slate-400">
                Temperatura
              </p>
            </div>

            <div
              className="bg-biovet-50 dark:bg-biovet-950 
                            rounded-xl p-3 text-center 
                            border border-biovet-200 dark:border-biovet-800"
            >
              <Heart className="w-5 h-5 text-biovet-add dark:text-biovet-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-surface-800 dark:text-white">
                {consultation.heartRate ?? "-"} lpm
              </p>
              <p className="text-xs text-surface-500 dark:text-slate-400">
                Frec. Cardíaca
              </p>
            </div>

            <div
              className="bg-biovet-50 dark:bg-biovet-950 
                            rounded-xl p-3 text-center 
                            border border-biovet-200 dark:border-biovet-800"
            >
              <Wind className="w-5 h-5 text-biovet-500 dark:text-biovet-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-surface-800 dark:text-white">
                {consultation.respiratoryRate ?? "-"} rpm
              </p>
              <p className="text-xs text-surface-500 dark:text-slate-400">
                Frec. Respiratoria
              </p>
            </div>

            <div
              className="bg-success-50 dark:bg-success-950 
                            rounded-xl p-3 text-center 
                            border border-success-200 dark:border-success-800"
            >
              <Scale className="w-5 h-5 text-success-500 dark:text-success-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-surface-800 dark:text-white">
                {consultation.weight ?? "-"} kg
              </p>
              <p className="text-xs text-surface-500 dark:text-slate-400">
                Peso
              </p>
            </div>
          </div>

          {/* Motivo de consulta */}
          <Section title="Motivo de consulta">
            <TextField label="Motivo" value={consultation.reasonForVisit} />
            <Field label="Inicio síntomas" value={consultation.symptomOnset} />
            <Field label="Evolución" value={consultation.symptomEvolution} />
          </Section>

          {/* Diagnóstico */}
          <Section title="Diagnóstico">
            <TextField
              label="Diagnóstico presuntivo"
              value={consultation.presumptiveDiagnosis}
            />
            <TextField
              label="Diagnóstico definitivo"
              value={consultation.definitiveDiagnosis}
            />
            <TextField
              label="Exámenes solicitados"
              value={consultation.requestedTests}
            />
          </Section>

          {/* Tratamiento */}
          {consultation.treatmentPlan && (
            <Section title="Plan de tratamiento">
              <div
                className="bg-success-50 dark:bg-success-950 
                              border border-success-200 dark:border-success-800 
                              rounded-lg p-3"
              >
                <p className="text-sm text-surface-800 dark:text-slate-200 whitespace-pre-wrap">
                  {consultation.treatmentPlan}
                </p>
              </div>
            </Section>
          )}

          {/* Medicamentos actuales */}
          {(consultation.currentTreatment || consultation.medications) && (
            <Section title="Medicación previa">
              <Field
                label="Tratamiento actual"
                value={consultation.currentTreatment}
              />
              <Field label="Medicamentos" value={consultation.medications} />
            </Section>
          )}

          {/* Estado general */}
          <Section title="Estado general">
            <Field label="Apetito" value={consultation.appetite} />
            <Field label="Esterilizado" value={consultation.isNeutered} />
            <Field label="Fiebre" value={consultation.feverSigns} />
            <Field
              label="Letargo/Debilidad"
              value={consultation.lethargyOrWeakness}
            />
            <Field
              label="Dificultad respiratoria"
              value={consultation.breathingDifficulty}
            />
            <Field
              label="Picazón/Lamido excesivo"
              value={consultation.itchingOrExcessiveLicking}
            />
          </Section>

          {/* Otros parámetros */}
          {(consultation.lymphNodes || consultation.capillaryRefillTime) && (
            <Section title="Otros parámetros">
              <Field
                label="Ganglios linfáticos"
                value={consultation.lymphNodes}
              />
              <Field label="TRC" value={consultation.capillaryRefillTime} />
            </Section>
          )}

          {/* Sistemas */}
          {(consultation.integumentarySystem ||
            consultation.cardiovascularSystem ||
            consultation.respiratorySystem ||
            consultation.nervousSystem ||
            consultation.musculoskeletalSystem ||
            consultation.gastrointestinalSystem ||
            consultation.ocularSystem) && (
            <Section title="Evaluación por sistemas">
              <TextField
                label="Tegumentario"
                value={consultation.integumentarySystem}
              />
              <TextField
                label="Cardiovascular"
                value={consultation.cardiovascularSystem}
              />
              <TextField
                label="Respiratorio"
                value={consultation.respiratorySystem}
              />
              <TextField label="Nervioso" value={consultation.nervousSystem} />
              <TextField
                label="Musculoesquelético"
                value={consultation.musculoskeletalSystem}
              />
              <TextField
                label="Gastrointestinal"
                value={consultation.gastrointestinalSystem}
              />
              <TextField label="Ocular" value={consultation.ocularSystem} />
            </Section>
          )}

          {/* Digestivo/Urinario */}
          {(consultation.vomiting ||
            consultation.bowelMovementFrequency ||
            consultation.stoolConsistency ||
            consultation.normalUrination) && (
            <Section title="Sistema digestivo y urinario">
              <Field label="Vómitos" value={consultation.vomiting} />
              <Field
                label="Frecuencia deposiciones"
                value={consultation.bowelMovementFrequency}
              />
              <Field
                label="Consistencia heces"
                value={consultation.stoolConsistency}
              />
              <Field
                label="Sangre/parásitos en heces"
                value={consultation.bloodOrParasitesInStool}
              />
              <Field
                label="Micción normal"
                value={consultation.normalUrination}
              />
              <Field
                label="Frecuencia/cantidad orina"
                value={consultation.urineFrequencyAndAmount}
              />
              <Field label="Color orina" value={consultation.urineColor} />
              <Field
                label="Dolor al orinar"
                value={consultation.painOrDifficultyUrinating}
              />
            </Section>
          )}

          {/* Respiratorio */}
          {(consultation.cough || consultation.sneezing) && (
            <Section title="Sistema respiratorio (síntomas)">
              <Field label="Tos" value={consultation.cough} />
              <Field label="Estornudos" value={consultation.sneezing} />
            </Section>
          )}

          {/* Piel y pelaje */}
          {(consultation.hairLossOrSkinLesions ||
            consultation.eyeDischarge ||
            consultation.earIssues) && (
            <Section title="Piel, ojos y oídos">
              <Field
                label="Caída pelo/lesiones"
                value={consultation.hairLossOrSkinLesions}
              />
              <Field
                label="Secreción ocular"
                value={consultation.eyeDischarge}
              />
              <Field label="Problemas oídos" value={consultation.earIssues} />
            </Section>
          )}

          {/* Historial */}
          {(consultation.previousIllnesses ||
            consultation.previousSurgeries ||
            consultation.adverseReactions) && (
            <Section title="Historial médico">
              <TextField
                label="Enfermedades previas"
                value={consultation.previousIllnesses}
              />
              <TextField
                label="Cirugías anteriores"
                value={consultation.previousSurgeries}
              />
              <TextField
                label="Reacciones adversas"
                value={consultation.adverseReactions}
              />
            </Section>
          )}

          {/* Observaciones */}
          {consultation.lastHeatOrBirth && (
            <Section title="Observaciones">
              <TextField
                label="Observaciones generales"
                value={consultation.lastHeatOrBirth}
              />
            </Section>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between p-4 
                        border-t border-surface-300 dark:border-slate-700 
                        bg-surface-50 dark:bg-dark-200"
        >
          <div>
            <p className="text-xs text-surface-500 dark:text-slate-400">
              Costo de consulta
            </p>
            <p className="text-xl font-bold text-surface-800 dark:text-white">
              $
              {consultation.cost != null
                ? consultation.cost
                : "0.00"}
            </p>
          </div>
          <button onClick={onClose} className="btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}