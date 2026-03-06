/**
 * Formatea números con separador de miles para locale español
 * @param num - Número a formatear
 * @returns String formateado o "-" si es undefined/null
 */
export const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return "-";
  return num.toLocaleString("es-CL");
};

/**
 * Formatea valores genéricos (string/number) manejando casos undefined
 * @param val - Valor a formatear
 * @returns String formateado o "-" si está vacío
 */
export const formatValue = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null || val === "") return "-";
  return String(val);
};

/**
 * Formatea decimales con precisión específica
 * @param num - Número a formatear
 * @param decimals - Cantidad de decimales (default: 1)
 * @returns String formateado o "-" si es undefined/null
 */
export const formatDecimal = (
  num: number | undefined | null,
  decimals: number = 1
): string => {
  if (num === undefined || num === null) return "-";
  return num.toFixed(decimals);
};

/**
 * Formatea porcentajes
 * @param num - Número a formatear como porcentaje
 * @returns String con símbolo % o "-"
 */
export const formatPercentage = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return "-";
  return `${num}%`;
};