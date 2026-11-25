import { describe, it, expect } from "vitest";
import {
  ENGINE_PRESETS,
  calcCarburadorTBI,
  calcCilindrada,
  calcDutos2V,
  calcDutos4V,
  calcRL,
  calcTaxaCompressao,
  calcVMP,
  calcValvulas2V,
  calcValvulas4V,
  calcVolumeCamara,
  formatPtBR,
} from "../src/utils/calculadoras-ntr";

describe("calculadoras NTR: precisão e validação", () => {
  it("formata números em pt-BR", () => {
    expect(formatPtBR(149.0623, 2)).toBe("149,06");
    expect(formatPtBR(1234.5, 1)).toBe("1.234,5");
    expect(formatPtBR(null, 2)).toBe("—");
    expect(formatPtBR(Number.NaN, 2)).toBe("—");
  });

  it("1. calcula cilindrada corretamente", () => {
    const cc150 = calcCilindrada(57.3, 57.8);
    expect(cc150).not.toBeNull();
    expect(cc150 ?? 0).toBeCloseTo((57.3 * 57.3 * 57.8 * 3.1416) / 4000, 6);
    expect(formatPtBR(cc150, 2)).toBe("149,05");
    expect(calcCilindrada(0, 57.8)).toBe(0);
    expect(calcCilindrada(-1, 57.8)).toBeNull();
  });

  it("2. calcula taxa de compressão", () => {
    const taxa = calcTaxaCompressao(149.05, 17.5);
    expect(taxa).not.toBeNull();
    expect(taxa ?? 0).toBeCloseTo((149.05 + 17.5) / 17.5, 6);
    expect(formatPtBR(taxa, 2)).toBe("9,52");
    expect(calcTaxaCompressao(150, 0)).toBeNull();
    expect(calcTaxaCompressao(150, -5)).toBeNull();
  });

  it("3. calcula volume da câmara", () => {
    const vol = calcVolumeCamara(150, 11);
    expect(vol).toBeCloseTo(15, 6);
    expect(formatPtBR(vol, 2)).toBe("15,00");
    expect(calcVolumeCamara(150, 1)).toBeNull();
    expect(calcVolumeCamara(150, 0.8)).toBeNull();
  });

  it("4. calcula relação R/L", () => {
    const rl = calcRL(57.8, 103.5);
    expect(rl).toBeCloseTo(57.8 / 2 / 103.5, 6);
    expect(formatPtBR(rl, 2)).toBe("0,28");
    expect(calcRL(57.8, 0)).toBeNull();
  });

  it("5. calcula VMP", () => {
    const vmp = calcVMP(57.8, 10000);
    expect(vmp).toBeCloseTo((10000 * 57.8) / 30000, 6);
    expect(formatPtBR(vmp, 2)).toBe("19,27");
    expect(calcVMP(57.8, 0)).toBe(0);
  });

  it("6. calcula carburador / TBI", () => {
    const carb = calcCarburadorTBI(190, 10500);
    expect(carb).not.toBeNull();
    const expCarb = Math.sqrt((190 / 1000) * 10500) * 0.65;
    expect(carb?.carburador ?? 0).toBeCloseTo(expCarb, 6);
    expect(carb?.tbi ?? 0).toBeCloseTo(expCarb * 1.1, 6);
    expect(formatPtBR(carb?.carburador ?? null, 1)).toBe("29,0");
    expect(formatPtBR(carb?.tbi ?? null, 1)).toBe("31,9");
    expect(calcCarburadorTBI(0, 10000)).toEqual({ carburador: 0, tbi: 0 });
  });

  it("7. calcula aumento de válvulas 2V", () => {
    const v2Base = calcValvulas2V(150, "ate270");
    expect(v2Base?.adm ?? 0).toBeCloseTo(30, 6);
    expect(v2Base?.esc ?? 0).toBeCloseTo(26, 6);

    const v2_270 = calcValvulas2V(270, "ate270");
    expect(v2_270?.pctCC ?? 0).toBeCloseTo(80, 6);
    expect(v2_270?.pctValvula ?? 0).toBeCloseTo((80 * 5) / 35, 6);
    expect(v2_270?.adm ?? 0).toBeCloseTo(30 * ((v2_270?.pctValvula ?? 0) / 100) + 30, 6);
    expect(v2_270?.esc ?? 0).toBeCloseTo(26 * ((v2_270?.pctValvula ?? 0) / 100) + 26, 6);

    const v2_300 = calcValvulas2V(300, "acima271");
    expect(v2_300?.pctCC ?? 0).toBeCloseTo(100, 6);
    expect(v2_300?.pctValvula ?? 0).toBeCloseTo((100 * 10) / 35, 6);
    expect(v2_300?.adm ?? 0).toBeCloseTo(30 * ((v2_300?.pctValvula ?? 0) / 100) + 30, 6);
    expect(v2_300?.esc ?? 0).toBeCloseTo(26 * ((v2_300?.pctValvula ?? 0) / 100) + 26, 6);
  });

  it("8. calcula aumento de válvulas 4V", () => {
    const v4Base = calcValvulas4V(250);
    expect(v4Base?.adm ?? 0).toBeCloseTo(28, 6);
    expect(v4Base?.esc ?? 0).toBeCloseTo(23.5, 6);

    const v4_300 = calcValvulas4V(300);
    expect(v4_300?.pctCC ?? 0).toBeCloseTo(20, 6);
    expect(v4_300?.pctValvula ?? 0).toBeCloseTo(4, 6);
    expect(v4_300?.adm ?? 0).toBeCloseTo(29.12, 6);
    expect(v4_300?.esc ?? 0).toBeCloseTo(24.44, 6);
  });

  it("9. calcula dutos 2V", () => {
    const d2 = calcDutos2V(25, 21);
    expect(d2?.dutoAdm ?? 0).toBeCloseTo(25 * 0.948, 6);
    expect(d2?.dutoEsc ?? 0).toBeCloseTo(21 * 1.095, 6);
    expect(formatPtBR(d2?.dutoAdm ?? null, 2)).toBe("23,70");
    expect(formatPtBR(d2?.dutoEsc ?? null, 2)).toBe("23,00");
  });

  it("10. calcula dutos 4V", () => {
    const d4 = calcDutos4V(22, 19);
    expect(d4?.dutoAdm ?? 0).toBeCloseTo(22 * 1.342, 6);
    expect(d4?.dutoEsc ?? 0).toBeCloseTo(19 * 1.549, 6);
  });

  it("presets têm cilindrada válida acima de 100cc", () => {
    expect(ENGINE_PRESETS).toHaveLength(5);
    for (const p of ENGINE_PRESETS) {
      expect(calcCilindrada(p.boreMm, p.strokeMm) ?? 0).toBeGreaterThan(100);
    }
  });
});
