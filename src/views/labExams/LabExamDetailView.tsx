import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLabExamById } from "../../api/labExamAPI";
import { useState } from "react";
import {
  ArrowLeft,
  Printer,
  AlertCircle,
  Check,
  FlaskConical,
  Pencil,
  User,
  BadgeDollarSign,
} from "lucide-react";
import ShareResultsModal from "@/components/labexam/ShareResultsModal";

export default function LabExamDetailView() {
  const { id, labExamId, patientId } = useParams<{ 
    id?: string; 
    labExamId?: string; 
    patientId?: string 
  }>();
  const examId = id || labExamId;
  const [showShareModal, setShowShareModal] = useState(false);

  const { data: exam, isLoading, isError } = useQuery({
    queryKey: ["labExam", examId],
    queryFn: () => getLabExamById(examId!),
    enabled: !!examId,
  });

  // Rangos normales
  const normalValues = {
    canino: {
      hematocrit: [37, 55] as const,
      whiteBloodCells: [6000, 17000] as const,
      totalProtein: [5.4, 7.8] as const,
      platelets: [200000, 500000] as const,
      segmentedNeutrophils: [60, 77] as const,
      bandNeutrophils: [0, 3] as const,
      lymphocytes: [12, 30] as const,
      monocytes: [3, 10] as const,
      eosinophils: [2, 10] as const,
      basophils: [0, 0] as const,
    },
    felino: {
      hematocrit: [30, 45] as const,
      whiteBloodCells: [5000, 19500] as const,
      totalProtein: [5.7, 8.9] as const,
      platelets: [300000, 800000] as const,
      segmentedNeutrophils: [35, 75] as const,
      bandNeutrophils: [0, 3] as const,
      lymphocytes: [20, 55] as const,
      monocytes: [1, 4] as const,
      eosinophils: [2, 12] as const,
      basophils: [0, 0] as const,
    },
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const isOutOfRange = (value: number, range: readonly [number, number]) =>
    value < range[0] || value > range[1];

  const calculateAbsolute = (percentage: number, wbc: number) =>
    ((percentage / 100) * wbc).toFixed(0);

  const backUrl = patientId ? `/patients/${patientId}/lab-exams` : "/lab-exams";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vet-light flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-vet-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !exam) {
    return (
      <div className="min-h-screen bg-vet-light flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-10 h-10 text-vet-muted" />
        <p className="text-sm text-vet-muted">Examen no encontrado</p>
        <Link to={backUrl} className="text-sm text-vet-accent hover:underline">
          Volver
        </Link>
      </div>
    );
  }

  const speciesKey = exam.species.toLowerCase() === "felino" ? "felino" : "canino";
  const ranges = normalValues[speciesKey];
  const isReferredPatient = !exam.patientId;
  
  // Cálculo de finanzas
  const totalPaid = (exam.cost ?? 0) - (exam.discount ?? 0);

  const hemogramParams = [
    { label: "Hematocrito", value: exam.hematocrit, unit: "%", range: ranges.hematocrit },
    { label: "Leucocitos", value: exam.whiteBloodCells, unit: "/µL", range: ranges.whiteBloodCells },
    { label: "Proteínas", value: exam.totalProtein, unit: "g/dL", range: ranges.totalProtein },
    { label: "Plaquetas", value: exam.platelets, unit: "/µL", range: ranges.platelets },
  ];

  const differentialParams = [
    { key: "segmentedNeutrophils", label: "Seg. Neutrófilos", value: exam.differentialCount.segmentedNeutrophils || 0 },
    { key: "bandNeutrophils", label: "Banda Neutrófilos", value: exam.differentialCount.bandNeutrophils || 0 },
    { key: "lymphocytes", label: "Linfocitos", value: exam.differentialCount.lymphocytes || 0 },
    { key: "monocytes", label: "Monocitos", value: exam.differentialCount.monocytes || 0 },
    { key: "eosinophils", label: "Eosinófilos", value: exam.differentialCount.eosinophils || 0 },
    { key: "basophils", label: "Basófilos", value: exam.differentialCount.basophils || 0 },
  ];

  const outOfRangeCount = hemogramParams.filter((p) => isOutOfRange(p.value, p.range)).length;

  return (
    <div className="min-h-screen bg-vet-light transition-colors duration-300">
      <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={backUrl} className="p-1.5 -ml-1.5 hover:bg-hover rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-vet-muted" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-vet-text">Hemograma</h1>
                {isReferredPatient && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 text-amber-600 text-[10px] font-medium rounded border border-amber-500/20">
                    <User className="w-2.5 h-2.5" />
                    Referido
                  </span>
                )}
                {(exam?.discount ?? 0)> 0 && (
                  <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded border border-emerald-500/20">
                    CON DESCUENTO
                  </span>
                )}
              </div>
              <p className="text-xs text-vet-muted">{formatDate(exam.date)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isReferredPatient && (
              <Link
                to={`/lab-exams/${examId}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-vet-text border border-border text-sm font-medium rounded-lg hover:bg-hover transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editar</span>
              </Link>
            )}
            
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-vet-primary text-white text-sm font-medium rounded-lg hover:bg-vet-secondary transition-colors shadow-soft"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Paciente y Finanzas */}
        <section className="flex items-center justify-between p-4 bg-card rounded-xl border border-border shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-vet-light rounded-full flex items-center justify-center border border-border">
              <FlaskConical className="w-4 h-4 text-vet-muted" />
            </div>
            <div>
              <p className="text-sm font-semibold text-vet-text">{exam.patientName}</p>
              <p className="text-xs text-vet-muted">
                {exam.species} {exam.breed && `• ${exam.breed}`} {exam.sex && `• ${exam.sex}`}
              </p>
            </div>
          </div>
          
          <div className="text-right flex flex-col items-end">
            {(exam?.discount ?? 0)> 0 && (
              <p className="text-[10px] font-medium text-red-400 line-through">
                Base: ${exam.cost.toFixed(2)}
              </p>
            )}
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-medium text-vet-muted uppercase tracking-wider">Total Pagado</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                ${totalPaid.toFixed(2)}
              </p>
            </div>
            {(exam?.discount ?? 0) > 0 && (
              <span className="mt-1 px-1.5 py-0.5 bg-red-500/10 text-red-600 text-[10px] font-bold rounded">
                Ahorro: -${exam.discount?.toFixed(2)}
              </span>
            )}
          </div>
        </section>

        {/* Resumen rápido */}
        <section className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Normales</span>
            </div>
            <p className="text-2xl font-bold text-emerald-500 mt-1">
              {4 - outOfRangeCount}
            </p>
          </div>
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-medium text-red-600 dark:text-red-400">Alterados</span>
            </div>
            <p className="text-2xl font-bold text-red-500 mt-1">
              {outOfRangeCount}
            </p>
          </div>
        </section>

        {/* Hemograma */}
        <section>
          <h2 className="text-xs font-medium text-vet-muted uppercase tracking-wide mb-3">
            Hemograma
          </h2>
          <div className="space-y-2">
            {hemogramParams.map((param) => {
              const isOut = isOutOfRange(param.value, param.range);
              return (
                <div
                  key={param.label}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    isOut ? "bg-red-500/5 border-red-500/20 shadow-[0_0_15px_-3px_rgba(239,68,68,0.1)]" : "bg-card border-border"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-vet-text">{param.label}</p>
                    <p className="text-xs text-vet-muted">
                      Ref: {param.range[0]} - {param.range[1]} {param.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isOut ? "text-red-500" : "text-vet-text"}`}>
                      {param.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-vet-muted">{param.unit}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Fórmula Leucocitaria */}
        <section>
          <h2 className="text-xs font-medium text-vet-muted uppercase tracking-wide mb-3">
            Fórmula Leucocitaria
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-vet-light/50">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-vet-muted">Tipo</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-vet-muted">%</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-vet-muted">Abs.</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-vet-muted">Ref.</th>
                </tr>
              </thead>
              <tbody>
                {differentialParams.map((cell) => {
                  const range = ranges[cell.key as keyof typeof ranges];
                  const isOut = isOutOfRange(cell.value, range);
                  return (
                    <tr
                      key={cell.key}
                      className={`border-b border-border last:border-0 ${
                        isOut ? "bg-red-500/5" : "hover:bg-hover"
                      }`}
                    >
                      <td className="px-4 py-2.5 text-vet-text">{cell.label}</td>
                      <td className={`px-4 py-2.5 text-right font-semibold ${isOut ? "text-red-500" : "text-vet-text"}`}>
                        {cell.value}
                      </td>
                      <td className="px-4 py-2.5 text-right text-vet-muted">
                        {calculateAbsolute(cell.value, exam.whiteBloodCells)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-vet-muted text-xs">
                        {range[0]}-{range[1]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-vet-muted mt-2 text-right">
            Total contado: {exam.totalCells}%
          </p>
        </section>

        {/* Observaciones generalesgit */}
        {(exam.hemotropico || exam.observacion) && (
          <section>
            <h2 className="text-xs font-medium text-vet-muted uppercase tracking-wide mb-3">
              Observaciones
            </h2>
            <div className="space-y-2">
              {exam.hemotropico && (
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-xs font-medium text-blue-500 mb-1">Hemotrópicos</p>
                  <p className="text-sm text-vet-text">{exam.hemotropico}</p>
                </div>
              )}
              {exam.observacion && (
                <div className="p-3 bg-card rounded-xl border border-border">
                  <p className="text-xs font-medium text-vet-muted mb-1">General</p>
                  <p className="text-sm text-vet-text">{exam.observacion}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Info adicional y Resumen Financiero Final */}
        <section className="pt-4 border-t border-border space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {exam.treatingVet && (
              <div>
                <p className="text-xs text-vet-muted">Veterinario</p>
                <p className="text-vet-text font-medium">{exam.treatingVet}</p>
              </div>
            )}
            {exam.ownerName && (
              <div>
                <p className="text-xs text-vet-muted">Propietario</p>
                <p className="text-vet-text font-medium">{exam.ownerName}</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-vet-light/30 rounded-lg flex justify-between items-center border border-dashed border-border">
            <div className="flex items-center gap-2">
              <BadgeDollarSign className="w-4 h-4 text-vet-muted" />
              <span className="text-xs text-vet-muted font-medium uppercase tracking-wider">Recibo de examen</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-vet-muted">
                Subtotal: ${exam.cost.toFixed(2)} 
                {(exam?.discount ?? 0)> 0 && <span className="text-red-500 ml-1">(-${exam.discount?.toFixed(2)})</span>}
              </p>
              <p className="text-sm font-bold text-vet-text">Cobro Total: ${totalPaid.toFixed(2)}</p>
            </div>
          </div>
        </section>
      </main>

      {showShareModal && (
        <ShareResultsModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          examData={exam}
          patientData={{
            name: exam.patientName,
            species: exam.species,
            owner: { name: exam.ownerName || "—", contact: exam.ownerPhone || "—" },
            mainVet: exam.treatingVet || "—",
            refVet: "—",
          }}
        />
      )}
    </div>
  );
}