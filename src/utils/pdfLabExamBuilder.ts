// src/utils/pdfLabExamBuilder.ts
import jsPDF from "jspdf";
import type { VeterinaryClinic } from "@/types/veterinaryClinic";
import type { UserProfile } from "@/types/auth";

// ═══════════════════════════════════════════════════════════
// TIPOS INTERNOS
// ═══════════════════════════════════════════════════════════
export interface PDFColors {
  primary: { r: number; g: number; b: number };
  dark: { r: number; g: number; b: number };
  gray: { r: number; g: number; b: number };
  lightBg: { r: number; g: number; b: number };
  white: { r: number; g: number; b: number };
  tableBorder: { r: number; g: number; b: number };
  labelBg: { r: number; g: number; b: number };
}

export interface PatientData {
  name: string;
  species: string;
  breed?: string;
  owner: { name?: string };
}

type ExtendedJsPDF = jsPDF & {
  splitTextToSize: (text: string, maxWidth: number) => string[];
  GState: (options: { opacity: number }) => any;
  setGState: (gState: any) => void;
};

// ═══════════════════════════════════════════════════════════
// COLORES ESTÁNDAR
// ═══════════════════════════════════════════════════════════
export const LAB_PDF_COLORS: PDFColors = {
  primary: { r: 10, g: 126, b: 164 },
  dark: { r: 30, g: 41, b: 59 },
  gray: { r: 100, g: 116, b: 139 },
  lightBg: { r: 224, g: 244, b: 248 },
  white: { r: 255, g: 255, b: 255 },
  tableBorder: { r: 226, g: 232, b: 240 },
  labelBg: { r: 248, g: 250, b: 252 },
};

// ═══════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════
export function extractSocialUsername(url: string, platform: string): string {
  try {
    const cleanUrl = url.replace(/\/+$/, "");
    const parts = cleanUrl.split("/");
    const username = parts[parts.length - 1];
    if (username && username.length > 0 && !username.includes(".")) {
      return `@${username}`;
    }
    return platform;
  } catch {
    return platform;
  }
}

export function getVetCredentials(vetProfile?: UserProfile | null): string[] {
  const credenciales: string[] = [];
  if (vetProfile?.msds) credenciales.push(`MSDS: ${vetProfile.msds}`);
  if (vetProfile?.runsai) credenciales.push(`RUNSAI: ${vetProfile.runsai}`);
  if (vetProfile?.somevepa) credenciales.push(`SOMEVEPA: ${vetProfile.somevepa}`);
  return credenciales;
}

export function getVetName(vetProfile?: UserProfile | null): string {
  return vetProfile
    ? `Dr(a). ${vetProfile.name} ${vetProfile.lastName}`
    : "Médico Veterinario";
}

// ═══════════════════════════════════════════════════════════
// MARCA DE AGUA
// ═══════════════════════════════════════════════════════════
export function drawWatermark(
  doc: jsPDF,
  clinicLogoBase64: string,
  width: number,
  height: number
): void {
  if (clinicLogoBase64 && clinicLogoBase64.startsWith("data:image")) {
    try {
      const extDoc = doc as ExtendedJsPDF;
      const gState = extDoc.GState({ opacity: 0.06 });
      extDoc.setGState(gState);

      const watermarkSize = 120;
      const watermarkX = (width - watermarkSize) / 2;
      const watermarkY = (height - watermarkSize) / 2;

      doc.addImage(
        clinicLogoBase64,
        "PNG",
        watermarkX,
        watermarkY,
        watermarkSize,
        watermarkSize
      );

      const resetState = extDoc.GState({ opacity: 1 });
      extDoc.setGState(resetState);
    } catch (e) {
      console.warn("No se pudo agregar marca de agua", e);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// HEADER CON LOGO
// ═══════════════════════════════════════════════════════════
export function drawClinicHeader(
  doc: jsPDF,
  clinic: VeterinaryClinic | null | undefined,
  clinicLogoBase64: string,
  colors: PDFColors,
  pageWidth: number,
  marginLeft: number,
  marginRight: number,
  startY: number
): number {
  let y = startY;

  if (clinicLogoBase64 && clinicLogoBase64.startsWith("data:image")) {
    try {
      doc.addImage(clinicLogoBase64, "PNG", marginLeft, y, 25, 25);

      const headerStartX = marginLeft + 30;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
      doc.text(clinic?.name || "Clínica Veterinaria", headerStartX, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);

      let infoY = y + 13;

      if (clinic?.phone || clinic?.whatsapp) {
        doc.text(
          `Tel: ${clinic?.phone || ""} ${clinic?.whatsapp ? `| WhatsApp: ${clinic.whatsapp}` : ""}`,
          headerStartX,
          infoY
        );
        infoY += 4;
      }

      if (clinic?.email) {
        doc.text(clinic.email, headerStartX, infoY);
        infoY += 4;
      }

      if (clinic?.address) {
        const addressLines = (doc as ExtendedJsPDF).splitTextToSize(
          clinic.address,
          pageWidth - headerStartX - marginRight
        );
        doc.text(addressLines[0], headerStartX, infoY);
      }

      y += 30;
    } catch (e) {
      console.warn("No se pudo agregar logo", e);
      // Fallback sin logo
      if (clinic?.name) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
        doc.text(clinic.name, pageWidth / 2, y + 5, { align: "center" });
        y += 10;
      }
    }
  } else {
    // Header sin logo
    if (clinic?.name) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
      doc.text(clinic.name, pageWidth / 2, y + 5, { align: "center" });
      y += 10;
    }
  }

  return y;
}

// ═══════════════════════════════════════════════════════════
// TÍTULO
// ═══════════════════════════════════════════════════════════
export function drawTitle(
  doc: jsPDF,
  title: string,
  subtitle: string,
  colors: PDFColors,
  pageWidth: number,
  startY: number
): number {
  let y = startY;

  doc.setFontSize(18);
  doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, y, { align: "center" });
  y += 6;

  doc.setFontSize(10);
  doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);
  doc.setFont("helvetica", "normal");
  doc.text(subtitle, pageWidth / 2, y, { align: "center" });
  y += 10;

  return y;
}

// ═══════════════════════════════════════════════════════════
// INFO PACIENTE
// ═══════════════════════════════════════════════════════════
export function drawPatientInfo(
  doc: jsPDF,
  patient: PatientData,
  examDate: string,
  vetName: string,
  colors: PDFColors,
  contentWidth: number,
  marginLeft: number,
  startY: number
): number {
  let y = startY;

  const infoHeight = 22;
  doc.setFillColor(colors.lightBg.r, colors.lightBg.g, colors.lightBg.b);
  doc.rect(marginLeft, y, contentWidth, infoHeight, "F");

  doc.setFontSize(9);
  doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);

  const col1 = marginLeft + 5;
  const col2 = marginLeft + contentWidth / 3 + 5;
  const col3 = marginLeft + (contentWidth / 3) * 2 + 5;
  const row1 = y + 7;
  const row2 = y + 15;

  // Fila 1
  doc.setFont("helvetica", "bold");
  doc.text("Fecha: ", col1, row1);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(examDate).toLocaleDateString("es-ES"), col1 + 14, row1);

  doc.setFont("helvetica", "bold");
  doc.text("Paciente: ", col2, row1);
  doc.setFont("helvetica", "normal");
  doc.text(patient.name, col2 + 20, row1);

  doc.setFont("helvetica", "bold");
  doc.text("Especie: ", col3, row1);
  doc.setFont("helvetica", "normal");
  doc.text(patient.species, col3 + 18, row1);

  // Fila 2
  doc.setFont("helvetica", "bold");
  doc.text("Raza: ", col1, row2);
  doc.setFont("helvetica", "normal");
  doc.text(patient.breed || "—", col1 + 13, row2);

  doc.setFont("helvetica", "bold");
  doc.text("Propietario: ", col2, row2);
  doc.setFont("helvetica", "normal");
  doc.text(patient.owner.name || "—", col2 + 25, row2);

  doc.setFont("helvetica", "bold");
  doc.text("Médico: ", col3, row2);
  doc.setFont("helvetica", "normal");
  doc.text(vetName, col3 + 16, row2);

  y += infoHeight + 10;

  return y;
}

// ═══════════════════════════════════════════════════════════
// FIRMA
// ═══════════════════════════════════════════════════════════
export function drawSignatureFooter(
  doc: jsPDF,
  vetProfile: UserProfile | null | undefined,
  signatureBase64: string,
  colors: PDFColors,
  pageWidth: number,
  startY: number
): number {
  let y = startY;

  y += 20;

  // Firma digital
  if (signatureBase64 && signatureBase64.startsWith("data:image")) {
    try {
      doc.addImage(signatureBase64, "PNG", pageWidth / 2 - 25, y, 50, 20);
      y += 22;
    } catch (e) {
      console.warn("No se pudo agregar firma:", e);
      y += 5;
    }
  } else {
    y += 10;
  }

  // Línea separadora
  doc.setDrawColor(colors.tableBorder.r, colors.tableBorder.g, colors.tableBorder.b);
  doc.line(pageWidth / 2 - 40, y, pageWidth / 2 + 40, y);
  y += 6;

  // Nombre del doctor
  doc.setFontSize(12);
  doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.setFont("helvetica", "bold");
  doc.text(getVetName(vetProfile), pageWidth / 2, y, { align: "center" });
  y += 5;

  // CI y CMVZ
  doc.setFontSize(9);
  doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);
  doc.setFont("helvetica", "normal");
  doc.text(
    `C.I: V-${vetProfile?.ci || "—"} | CMVZ: ${vetProfile?.cmv || "—"}`,
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 5;

  // Credenciales adicionales
  const credenciales = getVetCredentials(vetProfile);
  if (credenciales.length > 0) {
    doc.setFontSize(8);
    doc.text(credenciales.join(" | "), pageWidth / 2, y, { align: "center" });
    y += 5;
  }

  // Estado
  doc.setFontSize(8);
  doc.text(`${vetProfile?.estado || "—"}, Venezuela`, pageWidth / 2, y, {
    align: "center",
  });
  y += 4;

  doc.text("Médico Veterinario", pageWidth / 2, y, { align: "center" });

  return y;
}

// ═══════════════════════════════════════════════════════════
// FOOTER CON REDES SOCIALES
// ═══════════════════════════════════════════════════════════
export function drawSocialFooter(
  doc: jsPDF,
  clinic: VeterinaryClinic | null | undefined,
  colors: PDFColors,
  pageWidth: number,
  startY: number
): void {
  if (clinic?.whatsapp || clinic?.socialMedia?.length) {
    let y = startY + 8;
    doc.setFontSize(7);
    doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);

    const socialText: string[] = [];

    if (clinic?.whatsapp) {
      socialText.push(`WhatsApp: ${clinic.whatsapp}`);
    }

    if (clinic?.socialMedia?.length) {
      clinic.socialMedia.slice(0, 2).forEach((s) => {
        const username = extractSocialUsername(s.url, s.platform);
        socialText.push(`${s.platform}: ${username}`);
      });
    }

    if (socialText.length > 0) {
      doc.text(socialText.join(" | "), pageWidth / 2, y, { align: "center" });
    }
  }
}