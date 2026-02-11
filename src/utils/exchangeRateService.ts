// src/services/exchangeRateService.ts

// Configuración del tipo de cambio
interface ExchangeRateConfig {
  manualRate: number | null;
  useManual: boolean;
  cachedAutoRate: number | null;
  lastFetch: number | null;
}

const config: ExchangeRateConfig = {
  manualRate: null,
  useManual: false,
  cachedAutoRate: null,
  lastFetch: null,
};

const CACHE_DURATION = 3600000; // 1 hora
const DEFAULT_RATE = 36.50; // Valor de emergencia

/**
 *  Obtener tasa del BCV desde dolarapi.com
 */
async function fetchBCVRate(): Promise<number> {
  const response = await fetch("https://ve.dolarapi.com/v1/dolares/oficial");
  if (!response.ok) {
    throw new Error("Error al obtener tasa BCV");
  }
  const data = await response.json();
  return data.promedio;
}

/**
 * Establecer tipo de cambio manual
 */
export function setManualExchangeRate(rate: number): void {
  if (rate <= 0) {
    throw new Error("El tipo de cambio debe ser mayor a 0");
  }
  config.manualRate = parseFloat(rate.toFixed(2));
  config.useManual = true;
  
  // Guardar en localStorage
  localStorage.setItem('exchangeRate', JSON.stringify({
    rate: config.manualRate,
    manual: true,
    updatedAt: Date.now(),
  }));
}

/**
 * Activar modo automático
 */
export function setAutoExchangeRate(): void {
  config.useManual = false;
  localStorage.setItem('exchangeRate', JSON.stringify({
    manual: false,
    updatedAt: Date.now(),
  }));
}

/**
 * Obtener tipo de cambio actual
 */
export async function getExchangeRate(): Promise<number> {
  // Modo manual
  if (config.useManual && config.manualRate) {
    return config.manualRate;
  }
  
  // Modo automático con caché
  const now = Date.now();
  
  if (config.cachedAutoRate && config.lastFetch && (now - config.lastFetch) < CACHE_DURATION) {
    return config.cachedAutoRate;
  }
  
  try {
    const rate = await fetchBCVRate();
    config.cachedAutoRate = parseFloat(rate.toFixed(2));
    config.lastFetch = now;
    return config.cachedAutoRate;
  } catch (error) {
    console.error("❌ Error al obtener tipo de cambio:", error);
    
    // Fallback 1: Usar caché antiguo
    if (config.cachedAutoRate) {
      console.warn("⚠️ Usando tipo de cambio en caché");
      return config.cachedAutoRate;
    }
    
    // Fallback 2: Valor por defecto
    console.warn(`⚠️ Usando tipo de cambio por defecto: ${DEFAULT_RATE}`);
    return DEFAULT_RATE;
  }
}

/**
 * Obtener modo actual
 */
export function getExchangeRateMode(): 'manual' | 'auto' {
  return config.useManual ? 'manual' : 'auto';
}

/**
 * Obtener valor manual configurado
 */
export function getCurrentManualRate(): number | null {
  return config.manualRate;
}

/**
 * Convertir USD a BS
 */
export async function convertUSDtoBS(usd: number): Promise<number> {
  const rate = await getExchangeRate();
  return parseFloat((usd * rate).toFixed(2));
}

/**
 * Convertir BS a USD
 */
export async function convertBStoUSD(bs: number): Promise<number> {
  const rate = await getExchangeRate();
  return parseFloat((bs / rate).toFixed(2));
}

/**
 * Inicializar desde localStorage
 */
export function initExchangeRate(): void {
  try {
    const saved = localStorage.getItem('exchangeRate');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.manual && data.rate) {
        config.manualRate = data.rate;
        config.useManual = true;
      }
    }
  } catch (error) {
    console.error("Error al cargar configuración:", error);
  }
}

// Inicializar automáticamente
initExchangeRate();

export { fetchBCVRate as getBCVRate };