import { useState } from 'react';
import { X, FileSpreadsheet, FileText, Download } from 'lucide-react';
import type { OwnerWithStats } from '@/types/owner';

type ExportFormat = 'csv' | 'excel';

type OwnerExportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  owners: OwnerWithStats[];
  selectedIds: Set<string>;
};

export default function OwnerExportModal({
  isOpen,
  onClose,
  owners,
  selectedIds,
}: OwnerExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [exportType, setExportType] = useState<'all' | 'selected'>('all');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const getExportData = (): OwnerWithStats[] => {
    if (exportType === 'selected' && selectedIds.size > 0) {
      return owners.filter((o) => selectedIds.has(o._id));
    }
    return owners;
  };

  const getExportCount = (): number => {
    if (exportType === 'selected' && selectedIds.size > 0) {
      return selectedIds.size;
    }
    return owners.length;
  };

  const formatDate = (date: string | null): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es');
  };

  const exportToCSV = (data: OwnerWithStats[]) => {
    const headers = [
      'Nombre',
      'Teléfono',
      'Email',
      'Cédula',
      'Dirección',
      'Mascotas',
      'Última Visita',
      'Deuda',
      'Facturas Pendientes',
    ];

    const rows = data.map((owner) => [
      owner.name,
      owner.contact,
      owner.email || '',
      owner.nationalId || '',
      owner.address || '',
      owner.petsCount.toString(),
      formatDate(owner.lastVisit),
      owner.totalDebt.toFixed(2),
      owner.pendingInvoices.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `propietarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const dataToExport = getExportData();
      
      // Simular delay para UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (format === 'csv' || format === 'excel') {
        exportToCSV(dataToExport);
      }

      onClose();
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-dark-100 rounded-xl shadow-xl w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Exportar Propietarios
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-dark-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Qué exportar */}
          <div>
            <label className="label">¿Qué exportar?</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-50 transition-colors">
                <input
                  type="radio"
                  name="exportType"
                  value="all"
                  checked={exportType === 'all'}
                  onChange={() => setExportType('all')}
                  className="w-4 h-4 text-biovet-500 focus:ring-biovet-500 border-slate-300 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Todos los resultados ({owners.length})
                </span>
              </label>

              {selectedIds.size > 0 && (
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-50 transition-colors">
                  <input
                    type="radio"
                    name="exportType"
                    value="selected"
                    checked={exportType === 'selected'}
                    onChange={() => setExportType('selected')}
                    className="w-4 h-4 text-biovet-500 focus:ring-biovet-500 border-slate-300 dark:border-slate-600"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Solo seleccionados ({selectedIds.size})
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Formato */}
          <div>
            <label className="label">Formato</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors
                  ${format === 'csv'
                    ? 'border-biovet-500 bg-biovet-50 dark:bg-biovet-950'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }
                `}
              >
                <FileText
                  size={28}
                  className={format === 'csv' ? 'text-biovet-500' : 'text-slate-400'}
                />
                <span
                  className={`text-sm font-medium ${
                    format === 'csv'
                      ? 'text-biovet-600 dark:text-biovet-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  CSV
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors
                  ${format === 'excel'
                    ? 'border-biovet-500 bg-biovet-50 dark:bg-biovet-950'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }
                `}
              >
                <FileSpreadsheet
                  size={28}
                  className={format === 'excel' ? 'text-biovet-500' : 'text-slate-400'}
                />
                <span
                  className={`text-sm font-medium ${
                    format === 'excel'
                      ? 'text-biovet-600 dark:text-biovet-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Excel
                </span>
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Ambos formatos se exportan como CSV compatible con Excel
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-200 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || getExportCount() === 0}
            className="btn-primary"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download size={18} />
                Exportar ({getExportCount()})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}