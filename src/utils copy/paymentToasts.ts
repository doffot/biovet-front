// src/utils/paymentToasts.ts
import { toast } from "../components/Toast";

interface PaymentToastData {
  amountPaid: number;
  currency: "USD" | "Bs";
  isPartial: boolean;
  creditUsed?: number;
  invoiceCount?: number;
  invoiceDescription?: string;
}

export const showPaymentToast = ({
  amountPaid,
  currency,
  isPartial,
  creditUsed = 0,
  invoiceCount,
  invoiceDescription,
}: PaymentToastData) => {
  const formatAmount = (amount: number, curr: "USD" | "Bs") => {
    return curr === "Bs" ? `${amount.toFixed(2)} Bs` : `$${amount.toFixed(2)}`;
  };

  // Determinar el título
  let title = "";
  if (invoiceCount && invoiceCount > 1) {
    title = "Pago múltiple procesado";
  } else if (isPartial) {
    title = "Abono registrado";
  } else {
    title = "Pago completado";
  }

  // Construir el mensaje
  let message = "";

  // Monto pagado
  if (amountPaid > 0) {
    message = `${formatAmount(amountPaid, currency)} aplicados`;
  }

  // Si usó crédito adicional
  if (creditUsed > 0) {
    if (message) {
      message += ` + $${creditUsed.toFixed(2)} de crédito`;
    } else {
      message = `$${creditUsed.toFixed(2)} de crédito aplicados`;
    }
  }

  // Agregar destino
  if (invoiceCount && invoiceCount > 1) {
    message += ` a ${invoiceCount} factura${invoiceCount > 1 ? "s" : ""}`;
  } else if (invoiceDescription) {
    message += ` • ${invoiceDescription}`;
  }

  toast.success(title, message, { duration: 5000 });
};

export const showPaymentErrorToast = (error: string) => {
  toast.error("Error al procesar pago", error, { duration: 6000 });
};