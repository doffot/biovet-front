// src/utils/labExamHelpers.ts

export function formatExamDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export type HematocritStatus = "low" | "high" | "normal";

export function getHematocritStatus(
  value: number,
  species: string
): HematocritStatus {
  const ranges = {
    canino: [37, 55],
    felino: [30, 45],
  };
  const range =
    species.toLowerCase() === "felino" ? ranges.felino : ranges.canino;
  if (value < range[0]) return "low";
  if (value > range[1]) return "high";
  return "normal";
}

export function getHematocritLabel(status: HematocritStatus): string {
  switch (status) {
    case "low":
      return "↓ Bajo";
    case "high":
      return "↑ Alto";
    default:
      return "";
  }
}