import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";

interface ReportHeaderProps {
  periodLabel: string;
  isFetching: boolean;
  onRefetch: () => void;
}

export function ReportHeader({
  periodLabel,
  isFetching,
  onRefetch,
}: ReportHeaderProps) {
  return (
    <header className="bg-card border-b border-border shadow-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-1.5 -ml-1.5 text-vet-muted hover:text-vet-text transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base font-semibold text-vet-text">
                Reporte de Facturación
              </h1>
              <p className="text-xs text-vet-muted">{periodLabel}</p>
            </div>
          </div>

          <button
            onClick={onRefetch}
            disabled={isFetching}
            className="p-2 text-vet-muted hover:text-vet-text hover:bg-hover rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
}