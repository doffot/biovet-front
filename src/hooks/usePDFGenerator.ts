// src/hooks/usePDFGenerator.ts
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/api/AuthAPI";
import { getMyClinic } from "@/api/veterinaryClinicAPI";
import { toast } from "@/components/Toast";
import jsPDF from "jspdf";

// Tipos
interface PatientInfo {
  name: string;
  ownerName: string;
  fullSpecies: string;
}

interface PDFColors {
  primary: { r: number; g: number; b: number };
  black: { r: number; g: number; b: number };
  gray: { r: number; g: number; b: number };
  danger: { r: number; g: number; b: number };
}

interface PDFConfig {
  title: string;
  primaryColor?: { r: number; g: number; b: number };
  filename: string;
}

export function usePDFGenerator() {
  const [signatureBase64, setSignatureBase64] = useState<string>("");
  const [clinicLogoBase64, setClinicLogoBase64] = useState<string>("");

  // Queries
  const { data: vetProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const { data: clinic, isLoading: isLoadingClinic } = useQuery({
    queryKey: ["my-clinic"],
    queryFn: getMyClinic,
  });

  // Cargar firma del veterinario
  useEffect(() => {
    const loadSignature = async () => {
      if (!vetProfile?.signature) return;
      try {
        const response = await fetch(vetProfile.signature);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => setSignatureBase64(reader.result as string);
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error cargando firma:", error);
      }
    };
    if (vetProfile?.signature) loadSignature();
  }, [vetProfile?.signature]);

  // Cargar logo de la clínica
  useEffect(() => {
    const loadClinicLogo = async () => {
      if (!clinic?.logo) return;
      try {
        const response = await fetch(clinic.logo);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => setClinicLogoBase64(reader.result as string);
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error cargando logo clínica:", error);
      }
    };
    if (clinic?.logo) loadClinicLogo();
  }, [clinic?.logo]);

  // ══════════════════════════════════════════
  // FUNCIONES AUXILIARES
  // ══════════════════════════════════════════

  const extractSocialUsername = (url: string, platform: string): string => {
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
  };

  const getVetCredentials = useCallback((): string[] => {
    const credenciales: string[] = [];
    if (vetProfile?.msds) credenciales.push(`MSDS: ${vetProfile.msds}`);
    if (vetProfile?.runsai) credenciales.push(`RUNSAI: ${vetProfile.runsai}`);
    if (vetProfile?.somevepa) credenciales.push(`SOMEVEPA: ${vetProfile.somevepa}`);
    return credenciales;
  }, [vetProfile]);

  const getVetName = useCallback((): string => {
    return vetProfile
      ? `Dr(a). ${vetProfile.name} ${vetProfile.lastName}`
      : "Médico Veterinario";
  }, [vetProfile]);

  // ══════════════════════════════════════════
  // DIBUJAR MARCA DE AGUA
  // ══════════════════════════════════════════
  const drawWatermark = useCallback((doc: any, width: number, height: number) => {
    if (clinicLogoBase64 && clinicLogoBase64.startsWith("data:image")) {
      try {
        const gState = doc.GState({ opacity: 0.08 });
        doc.setGState(gState);

        const watermarkSize = 80;
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

        doc.setGState(doc.GState({ opacity: 1 }));
      } catch (e) {
        console.warn("No se pudo agregar marca de agua", e);
      }
    }
  }, [clinicLogoBase64]);

  // ══════════════════════════════════════════
  // DIBUJAR HEADER CON LOGO
  // ══════════════════════════════════════════
  const drawHeader = useCallback((
    doc: any,
    width: number,
    margin: number,
    startY: number,
    colors: PDFColors
  ): number => {
    let y = startY;

    if (clinicLogoBase64 && clinicLogoBase64.startsWith("data:image")) {
      try {
        doc.addImage(clinicLogoBase64, "PNG", margin, y, 22, 22);

        const headerStartX = margin + 26;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
        doc.text(clinic?.name || "Clínica Veterinaria", headerStartX, y + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);

        let infoY = y + 10;

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
          const addressLines = doc.splitTextToSize(
            clinic.address,
            width - headerStartX - margin
          );
          doc.text(addressLines[0], headerStartX, infoY);
        }

        y += 26;
      } catch (e) {
        console.warn("No se pudo agregar logo de clínica", e);
        y = drawHeaderWithoutLogo(doc, width, y, colors);
      }
    } else {
      y = drawHeaderWithoutLogo(doc, width, y, colors);
    }

    return y;
  }, [clinicLogoBase64, clinic]);

  // ══════════════════════════════════════════
  // DIBUJAR HEADER SIN LOGO
  // ══════════════════════════════════════════
  const drawHeaderWithoutLogo = useCallback((
    doc: any,
    width: number,
    y: number,
    colors: PDFColors
  ): number => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.text(clinic?.name || "Clínica Veterinaria", width / 2, y, {
      align: "center",
    });
    y += 5;

    if (clinic?.phone || clinic?.whatsapp) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);
      doc.text(`Tel: ${clinic?.phone || clinic?.whatsapp}`, width / 2, y, {
        align: "center",
      });
      y += 4;
    }

    if (clinic?.address) {
      doc.setFontSize(7);
      doc.text(clinic.address, width / 2, y, { align: "center" });
      y += 4;
    }

    return y;
  }, [clinic]);

  // ══════════════════════════════════════════
  // DIBUJAR TÍTULO Y DATOS DEL VET
  // ══════════════════════════════════════════
  const drawTitleAndVetInfo = useCallback((
    doc: any,
    width: number,
    y: number,
    title: string,
    colors: PDFColors
  ): number => {
    // Título
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.text(title, width / 2, y, { align: "center" });
    y += 6;

    // Nombre del veterinario
    doc.setFontSize(9);
    doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);
    doc.text(getVetName(), width / 2, y, { align: "center" });
    y += 4;

    // Credenciales línea 1: CMVZ y CI
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);
    const vetLine1 = `CMVZ: ${vetProfile?.cmv || "N/A"} | C.I: V-${vetProfile?.ci || "N/A"}`;
    doc.text(vetLine1, width / 2, y, { align: "center" });
    y += 3;

    // Credenciales línea 2: MSDS, RUNSAI, SOMEVEPA
    const credenciales = getVetCredentials();
    if (credenciales.length > 0) {
      doc.text(credenciales.join(" | "), width / 2, y, { align: "center" });
      y += 5;
    } else {
      y += 2;
    }

    return y;
  }, [vetProfile, getVetName, getVetCredentials]);

  // ══════════════════════════════════════════
  // DIBUJAR INFO DEL PACIENTE
  // ══════════════════════════════════════════
  const drawPatientInfo = useCallback((
    doc: any,
    width: number,
    margin: number,
    y: number,
    patient: PatientInfo,
    date: string,
    colors: PDFColors
  ): number => {
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, width - margin, y);
    y += 5;

    // Info paciente
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);

    doc.text(`Paciente: ${patient.name}`, margin, y);
    doc.text(`Fecha: ${date}`, width - margin, y, { align: "right" });
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.text(`Especie: ${patient.fullSpecies}`, margin, y);
    y += 5;
    doc.text(`Propietario: ${patient.ownerName}`, margin, y);
    y += 8;

    return y;
  }, []);

  // ══════════════════════════════════════════
  // DIBUJAR FIRMA
  // ══════════════════════════════════════════
  const drawSignature = useCallback((
    doc: any,
    width: number,
    y: number,
    colors: PDFColors
  ): number => {
    // Firma digital
    if (signatureBase64 && signatureBase64.startsWith("data:image")) {
      try {
        doc.addImage(signatureBase64, "PNG", width / 2 - 20, y, 40, 15);
        y += 15;
      } catch (e) {
        console.warn("No se pudo agregar la firma al PDF", e);
      }
    } else {
      y += 10;
    }

    // Línea de firma
    doc.line(width / 2 - 30, y, width / 2 + 30, y);
    y += 5;

    // Nombre del veterinario
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);
    doc.text(getVetName(), width / 2, y, { align: "center" });
    y += 4;

    // Credenciales
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(colors.gray.r, colors.gray.g, colors.gray.b);
    doc.text(`CMVZ: ${vetProfile?.cmv || "N/A"} | C.I: V-${vetProfile?.ci || "N/A"}`, width / 2, y, { align: "center" });
    y += 3;

    const credenciales = getVetCredentials();
    if (credenciales.length > 0) {
      doc.setFontSize(6);
      doc.text(credenciales.join(" | "), width / 2, y, { align: "center" });
      y += 4;
    }

    doc.setFontSize(8);
    doc.text("Médico Veterinario", width / 2, y, { align: "center" });

    return y;
  }, [signatureBase64, vetProfile, getVetName, getVetCredentials]);

  // ══════════════════════════════════════════
  // DIBUJAR FOOTER (REDES SOCIALES)
  // ══════════════════════════════════════════
  const drawFooter = useCallback((
    doc: any,
    width: number,
    y: number,
    colors: PDFColors
  ): void => {
    if (clinic?.whatsapp || clinic?.socialMedia?.length) {
      y += 6;
      doc.setFontSize(6);
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
        doc.text(socialText.join(" | "), width / 2, y, { align: "center" });
      }
    }
  }, [clinic, extractSocialUsername]);

  // ══════════════════════════════════════════
  // CREAR DOCUMENTO BASE
  // ══════════════════════════════════════════
  const createBaseDocument = useCallback((config: PDFConfig): {
    doc: any;
    width: number;
    height: number;
    margin: number;
    colors: PDFColors;
    startY: number;
  } => {
    const doc: any = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5",
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const margin = 10;

    const colors: PDFColors = {
      primary: config.primaryColor || { r: 10, g: 126, b: 164 },
      black: { r: 0, g: 0, b: 0 },
      gray: { r: 100, g: 100, b: 100 },
      danger: { r: 220, g: 38, b: 38 },
    };

    // Dibujar marca de agua
    drawWatermark(doc, width, height);

    // Dibujar header
    let y = drawHeader(doc, width, margin, 12, colors);

    // Dibujar título y datos del vet
    y = drawTitleAndVetInfo(doc, width, y, config.title, colors);

    return { doc, width, height, margin, colors, startY: y };
  }, [drawWatermark, drawHeader, drawTitleAndVetInfo]);

  // ══════════════════════════════════════════
  // GENERAR PDF GENÉRICO
  // ══════════════════════════════════════════
  const generatePDF = useCallback((
    config: PDFConfig,
    patient: PatientInfo,
    date: string,
    renderContent: (
      doc: any,
      y: number,
      width: number,
      margin: number,
      colors: PDFColors,
      addPage: () => number
    ) => number
  ): void => {
    try {
      const { doc, width, height, margin, colors, startY } = createBaseDocument(config);

      // Dibujar info del paciente
      let y = drawPatientInfo(doc, width, margin, startY, patient, date, colors);

      // Función para agregar nueva página con marca de agua
      const addPage = (): number => {
        doc.addPage();
        drawWatermark(doc, width, height);
        return 20;
      };

      // Renderizar contenido específico
      y = renderContent(doc, y, width, margin, colors, addPage);

      // Verificar si necesita nueva página para la firma
      if (y > 150) {
        y = addPage();
        y = 40;
      } else {
        y = Math.max(y, 145);
      }

      // Dibujar firma
      y = drawSignature(doc, width, y, colors);

      // Dibujar footer
      drawFooter(doc, width, y, colors);

      // Guardar
      doc.save(config.filename);
      toast.success("PDF Generado", "Documento descargado exitosamente.");
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error("Error", "No se pudo generar el PDF.");
    }
  }, [createBaseDocument, drawPatientInfo, drawWatermark, drawSignature, drawFooter]);

  // ══════════════════════════════════════════
  // ESTADO DE CARGA
  // ══════════════════════════════════════════
  const isReady = !isLoadingProfile && !isLoadingClinic;

  return {
    generatePDF,
    isReady,
    vetProfile,
    clinic,
    signatureBase64,
    clinicLogoBase64,
    drawWatermark,
    // Exponer funciones auxiliares por si se necesitan
    getVetName,
    getVetCredentials,
    extractSocialUsername,
  };
}