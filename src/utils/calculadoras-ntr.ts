/**
 * Motor matemático puro das 10 Calculadoras de Engenharia NTR Escola de Motores.
 * Fórmulas 100% fiéis às especificações extraídas do Calconic.
 */

export interface EnginePreset {
  id: string;
  label: string;
  subtitle: string;
  valves: 2 | 4;
  boreMm: number;
  strokeMm: number;
  rodLengthMm: number;
  volumeMl: number;
  maxRpm: number;
  sedeAdmMm: number;
  sedeEscMm: number;
}

export const ENGINE_PRESETS: EnginePreset[] = [
  {
    id: "titan-150",
    label: "Titan 150 Original",
    subtitle: "57,3 × 57,8 mm",
    valves: 2,
    boreMm: 57.3,
    strokeMm: 57.8,
    rodLengthMm: 103.5,
    volumeMl: 17.5,
    maxRpm: 9500,
    sedeAdmMm: 25.0,
    sedeEscMm: 21.0,
  },
  {
    id: "titan-160",
    label: "Titan 160",
    subtitle: "57,3 × 63,1 mm",
    valves: 2,
    boreMm: 57.3,
    strokeMm: 63.1,
    rodLengthMm: 103.5,
    volumeMl: 19.1,
    maxRpm: 10000,
    sedeAdmMm: 26.0,
    sedeEscMm: 22.0,
  },
  {
    id: "kit-190-4mm",
    label: "Kit 190 4mm",
    subtitle: "64,5 × 61,8 mm",
    valves: 2,
    boreMm: 64.5,
    strokeMm: 61.8,
    rodLengthMm: 103.5,
    volumeMl: 16.8,
    maxRpm: 11200,
    sedeAdmMm: 28.0,
    sedeEscMm: 24.0,
  },
  {
    id: "cb-300r",
    label: "CB 300R",
    subtitle: "79,0 × 61,2 mm",
    valves: 4,
    boreMm: 79.0,
    strokeMm: 61.2,
    rodLengthMm: 106.5,
    volumeMl: 37.5,
    maxRpm: 9800,
    sedeAdmMm: 25.5,
    sedeEscMm: 21.5,
  },
  {
    id: "crf-230f",
    label: "CRF 230F",
    subtitle: "65,5 × 66,2 mm",
    valves: 2,
    boreMm: 65.5,
    strokeMm: 66.2,
    rodLengthMm: 106.0,
    volumeMl: 27.8,
    maxRpm: 9500,
    sedeAdmMm: 28.5,
    sedeEscMm: 24.5,
  },
];

function isFinitePositive(n: number): boolean {
  return Number.isFinite(n) && n > 0;
}

function isFiniteNonNegative(n: number): boolean {
  return Number.isFinite(n) && n >= 0;
}

/**
 * Formata número no padrão pt-BR (vírgula decimal e ponto de milhar) idêntico ao Calconic.
 */
export function formatPtBR(value: number | null | undefined, decimals: number): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  const factor = Math.pow(10, decimals);
  const rounded = Math.round((value + Number.EPSILON) * factor) / factor;
  const safeValue = Object.is(rounded, -0) ? 0 : rounded;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safeValue);
}

/**
 * 1. Cálculo de Cilindrada (5bc78917cd1547001b53339b)
 * Expressão Calconic: ((#1*#1)*#2*3.1416)/4000
 */
export function calcCilindrada(boreMm: number, strokeMm: number): number | null {
  if (!isFiniteNonNegative(boreMm) || !isFiniteNonNegative(strokeMm)) return null;
  return (boreMm * boreMm * strokeMm * 3.1416) / 4000;
}

/**
 * 2. Cálculo de Taxa de Compressão Estática (666cf45d982fb4002a0feca4)
 * Expressão Calconic: (#1+#2)/#2
 */
export function calcTaxaCompressao(cc: number, volumeMl: number): number | null {
  if (!isFiniteNonNegative(cc) || !isFinitePositive(volumeMl)) return null;
  return (cc + volumeMl) / volumeMl;
}

/**
 * 3. Cálculo de Volume da Câmara (5bc94204cabfa1001b0ba006)
 * Expressão Calconic: #2/(#1-1)
 */
export function calcVolumeCamara(cc: number, taxaEstatica: number): number | null {
  if (!isFiniteNonNegative(cc) || !Number.isFinite(taxaEstatica) || taxaEstatica <= 1) return null;
  return cc / (taxaEstatica - 1);
}

/**
 * 4. Cálculo de Relação R/L (6669ef81982fb4002afc595d)
 * Expressão Calconic: ((#1/2)/#2)
 */
export function calcRL(strokeMm: number, rodLengthMm: number): number | null {
  if (!isFiniteNonNegative(strokeMm) || !isFinitePositive(rodLengthMm)) return null;
  return strokeMm / 2 / rodLengthMm;
}

/**
 * 5. Cálculo de VMP — Velocidade Média do Pistão (6669f336982fb4002afc790a)
 * Expressão Calconic: (#2*#1)/30000
 */
export function calcVMP(strokeMm: number, rpm: number): number | null {
  if (!isFiniteNonNegative(strokeMm) || !isFiniteNonNegative(rpm)) return null;
  return (rpm * strokeMm) / 30000;
}

/**
 * 6. Cálculo de Carburador / TBI (5bc94423cabfa1001b0ba007)
 * Carburador: sqrt((#2/1000)*#1)*(65/100)
 * TBI: (#3*10/100)+#3
 */
export function calcCarburadorTBI(
  cc: number,
  rpm: number,
): { carburador: number; tbi: number } | null {
  if (!isFiniteNonNegative(cc) || !isFiniteNonNegative(rpm)) return null;
  const carburador = Math.sqrt(Math.max(0, (cc / 1000) * rpm)) * (65 / 100);
  const tbi = (carburador * 10) / 100 + carburador;
  return { carburador, tbi };
}

/**
 * 7. Cálculo de Aumento de Válvulas — Cabeçote 2V (5ea6d2384d75890029d21e52)
 * pctCC = ((cc * 100) / 150) - 100
 * ate270: pctValvula = (pctCC * 5) / 35
 * acima271: pctValvula = (pctCC * 10) / 35
 * adm = (30 * (pctValvula / 100)) + 30
 * esc = (26 * (pctValvula / 100)) + 26
 */
export function calcValvulas2V(
  cc: number,
  faixa: "ate270" | "acima271",
): { adm: number; esc: number; pctCC: number; pctValvula: number } | null {
  if (!isFiniteNonNegative(cc)) return null;
  const pctCC = (cc * 100) / 150 - 100;
  const pctValvula = faixa === "ate270" ? (pctCC * 5) / 35 : (pctCC * 10) / 35;
  const adm = 30 * (pctValvula / 100) + 30;
  const esc = 26 * (pctValvula / 100) + 26;
  return { adm, esc, pctCC, pctValvula };
}

/**
 * 8. Cálculo de Aumento de Válvulas — Cabeçote 4V (6669f72b982fb4002afc9aef)
 * pctCC = ((cc * 100) / 250) - 100
 * pctValvula = (pctCC * 7) / 35
 * adm = (28 * (pctValvula / 100)) + 28
 * esc = (23.5 * (pctValvula / 100)) + 23.5
 */
export function calcValvulas4V(
  cc: number,
): { adm: number; esc: number; pctCC: number; pctValvula: number } | null {
  if (!isFiniteNonNegative(cc)) return null;
  const pctCC = (cc * 100) / 250 - 100;
  const pctValvula = (pctCC * 7) / 35;
  const adm = 28 * (pctValvula / 100) + 28;
  const esc = 23.5 * (pctValvula / 100) + 23.5;
  return { adm, esc, pctCC, pctValvula };
}

/**
 * 9. Cálculo de Dutos — Cabeçote 2 Válvulas (666d9c3a982fb4002a12cb30)
 * dutoAdm = sedeAdmMm * (948 / 1000)
 * dutoEsc = sedeEscMm * (1095 / 1000)
 */
export function calcDutos2V(
  sedeAdmMm: number,
  sedeEscMm: number,
): { dutoAdm: number; dutoEsc: number } | null {
  if (!isFiniteNonNegative(sedeAdmMm) || !isFiniteNonNegative(sedeEscMm)) return null;
  return {
    dutoAdm: sedeAdmMm * (948 / 1000),
    dutoEsc: sedeEscMm * (1095 / 1000),
  };
}

/**
 * 10. Cálculo de Dutos — Cabeçote 4 Válvulas (666d9f5a982fb4002a12e0ba)
 * dutoAdm = sedeAdmMm * (1342 / 1000)
 * dutoEsc = sedeEscMm * (1549 / 1000)
 */
export function calcDutos4V(
  sedeAdmMm: number,
  sedeEscMm: number,
): { dutoAdm: number; dutoEsc: number } | null {
  if (!isFiniteNonNegative(sedeAdmMm) || !isFiniteNonNegative(sedeEscMm)) return null;
  return {
    dutoAdm: sedeAdmMm * (1342 / 1000),
    dutoEsc: sedeEscMm * (1549 / 1000),
  };
}
