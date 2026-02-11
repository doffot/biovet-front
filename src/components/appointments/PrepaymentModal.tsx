import { useState } from "react";
import { DollarSign, X, CreditCard, Banknote } from "lucide-react";

type PrepaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  onSkip: () => void;
  appointmentType: string;
  isLoading?: boolean;
};

export default function PrepaymentModal({
  isOpen,
  onClose,
  onConfirm,
  onSkip,
  appointmentType,
  isLoading = false,
}: PrepaymentModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string>("");

  if (!isOpen) return null;

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;

    setAmount(sanitized);
    setError("");
  };

  const handleConfirm = () => {
    const numericAmount = parseFloat(amount);

    if (!amount || isNaN(numericAmount)) {
      setError("Ingresa un monto válido");
      return;
    }

    if (numericAmount <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }

    if (numericAmount > 10000) {
      setError("El monto máximo es $10,000");
      return;
    }

    onConfirm(numericAmount);
  };

  const quickAmounts = [10, 20, 50, 100];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-dark-200 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in border border-surface-200 dark:border-dark-100">

        {/* Header */}
        <div className="bg-linear-to-r from-biovet-500 to-biovet-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg font-heading">
                  ¿Desea realizar un anticipo?
                </h3>
                <p className="text-white/80 text-sm">
                  Cita de {appointmentType}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">

          {/* Info */}
          <div className="bg-biovet-50 dark:bg-biovet-950/20 border border-biovet-100 dark:border-biovet-900/30 rounded-xl p-4">
            <div className="flex gap-3">
              <Banknote className="w-5 h-5 text-biovet-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1 text-biovet-700 dark:text-biovet-300">Anticipo opcional</p>
                <p className="text-biovet-600/80 dark:text-biovet-400/70 leading-relaxed">
                  El monto se agregará como crédito a la cuenta del propietario
                  y se aplicará automáticamente al momento de facturar.
                </p>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="label">
              Monto del anticipo (USD)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="w-5 h-5 text-surface-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className={`input pl-10 text-lg font-semibold ${error ? "input-error" : ""}`}
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="error-text">{error}</p>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <p className="text-sm text-surface-500 dark:text-slate-400 mb-2">Montos rápidos:</p>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => {
                    setAmount(quickAmount.toString());
                    setError("");
                  }}
                  className={`
                    py-2 px-3 rounded-lg text-sm font-semibold transition-all border
                    ${amount === quickAmount.toString()
                      ? "bg-biovet-500 text-white border-biovet-600 shadow-sm"
                      : "bg-surface-50 dark:bg-dark-300 text-slate-700 dark:text-slate-300 border-surface-200 dark:border-dark-100 hover:bg-biovet-50 dark:hover:bg-biovet-950/30 hover:text-biovet-600 dark:hover:text-biovet-400"
                    }
                  `}
                  disabled={isLoading}
                >
                  ${quickAmount}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-surface-200 dark:border-dark-100 bg-surface-50 dark:bg-dark-300 p-4 flex gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="btn-secondary flex-1 justify-center"
            disabled={isLoading}
          >
            Sin anticipo
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="btn-primary flex-1 justify-center"
            disabled={isLoading || !amount}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                Confirmar anticipo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}