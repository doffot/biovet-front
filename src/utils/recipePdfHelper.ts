// src/utils/recipePdfHelper.ts
import type { Recipe } from "@/types/recipe";
import type { jsPDF } from "jspdf";

type PDFColors = {
  black: { r: number; g: number; b: number };
  primary: { r: number; g: number; b: number };
};

/**
 * Renderiza el contenido de una receta médica en un documento PDF
 * Reutilizable desde cualquier vista que necesite generar PDFs de recetas
 */
export function renderRecipePDFContent(
  doc: jsPDF,
  recipe: Recipe,
  startY: number,
  width: number,
  margin: number,
  colors: PDFColors,
  addPage: () => number
): number {
  let y = startY;

  // ══════════════════════════════════════════
  // ENCABEZADO Rx
  // ══════════════════════════════════════════
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);
  doc.text("Rx.", margin, y);
  y += 10;

  // ══════════════════════════════════════════
  // MEDICAMENTOS
  // ══════════════════════════════════════════
  recipe.medications.forEach((med, index) => {
    // Verificar si necesitamos nueva página
    if (y > 170) {
      y = addPage();
    }

    // ─────────────────────────────────────────
    // Nombre + Presentación + Origen (en una línea)
    // ─────────────────────────────────────────
    const sourceLabel = med.source === "veterinario" ? "USO VETERINARIO" : "FARMACIA";
    
    // Parte en negrita: número, nombre y presentación
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);
    const titlePart = `${index + 1}. ${med.name} (${med.presentation})`;
    doc.text(titlePart, margin + 5, y);
    
    // Calcular posición X para el origen
    const titleWidth = doc.getTextWidth(titlePart);
    
    // Parte en gris e itálica: origen
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120); // Gris
    doc.text(` - ${sourceLabel}`, margin + 5 + titleWidth, y);
    
    y += 6;

    // ─────────────────────────────────────────
    // Cantidad (si existe)
    // ─────────────────────────────────────────
    if (med.quantity) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Cantidad: ${med.quantity}`, margin + 5, y);
      y += 5;
    }

    // ─────────────────────────────────────────
    // Indicaciones
    // ─────────────────────────────────────────
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const instructions = doc.splitTextToSize(
      `Indicaciones: ${med.instructions}`,
      width - margin * 2 - 10
    );
    doc.text(instructions, margin + 5, y);
    y += instructions.length * 5 + 8;
  });

  // ══════════════════════════════════════════
  // NOTAS / OBSERVACIONES
  // ══════════════════════════════════════════
  if (recipe.notes) {
    if (y > 170) {
      y = addPage();
    }

    y += 5;

    // Fondo para las notas
    doc.setFillColor(255, 251, 235); // amber-50
    doc.setDrawColor(251, 191, 36); // amber-400
    const notesText = doc.splitTextToSize(recipe.notes, width - margin * 2 - 10);
    const notesHeight = notesText.length * 5 + 12;
    doc.roundedRect(margin, y - 2, width - margin * 2, notesHeight, 2, 2, "FD");

    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text("Observaciones:", margin + 5, y + 4);

    // Contenido
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(notesText, margin + 5, y + 10);

    y += notesHeight + 5;
  }

  return y;
}