import assert from "node:assert/strict";
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
} from "../src/utils/calculadoras-ntr.ts";

function approxEqual(actual, expected, eps = 1e-6) {
  assert.ok(actual !== null, `Esperado número ~${expected}, recebido null`);
  assert.ok(
    Math.abs(actual - expected) <= eps,
    `Esperado ~${expected}, recebido ${actual} (diff ${Math.abs(actual - expected)})`,
  );
}

// Formatação pt-BR
assert.equal(formatPtBR(149.0623, 2), "149,06");
assert.equal(formatPtBR(1234.5, 1), "1.234,5");
assert.equal(formatPtBR(null, 2), "—");
assert.equal(formatPtBR(Number.NaN, 2), "—");

// 1. Cilindrada
const cc150 = calcCilindrada(57.3, 57.8);
approxEqual(cc150, (57.3 * 57.3 * 57.8 * 3.1416) / 4000);
assert.equal(formatPtBR(cc150, 2), "149,05");
assert.equal(calcCilindrada(0, 57.8), 0);
assert.equal(calcCilindrada(-1, 57.8), null);

// 2. Taxa de Compressão
const taxa = calcTaxaCompressao(149.05, 17.5);
approxEqual(taxa, (149.05 + 17.5) / 17.5);
assert.equal(formatPtBR(taxa, 2), "9,52");
assert.equal(calcTaxaCompressao(150, 0), null);
assert.equal(calcTaxaCompressao(150, -5), null);

// 3. Volume da Câmara
const vol = calcVolumeCamara(150, 11);
approxEqual(vol, 15);
assert.equal(formatPtBR(vol, 2), "15,00");
assert.equal(calcVolumeCamara(150, 1), null);
assert.equal(calcVolumeCamara(150, 0.8), null);

// 4. Relação R/L
const rl = calcRL(57.8, 103.5);
approxEqual(rl, 57.8 / 2 / 103.5);
assert.equal(formatPtBR(rl, 2), "0,28");
assert.equal(calcRL(57.8, 0), null);

// 5. VMP
const vmp = calcVMP(57.8, 10000);
approxEqual(vmp, (10000 * 57.8) / 30000);
assert.equal(formatPtBR(vmp, 2), "19,27");
assert.equal(calcVMP(57.8, 0), 0);

// 6. Carburador / TBI
const carb = calcCarburadorTBI(190, 10500);
assert.ok(carb);
const expCarb = Math.sqrt((190 / 1000) * 10500) * 0.65;
approxEqual(carb.carburador, expCarb);
approxEqual(carb.tbi, expCarb * 1.1);
assert.equal(formatPtBR(carb.carburador, 1), "29,0");
assert.equal(formatPtBR(carb.tbi, 1), "31,9");
assert.deepEqual(calcCarburadorTBI(0, 10000), { carburador: 0, tbi: 0 });

// 7. Aumento de Válvulas 2V
const v2Base = calcValvulas2V(150, "ate270");
assert.ok(v2Base);
approxEqual(v2Base.adm, 30);
approxEqual(v2Base.esc, 26);

const v2_270 = calcValvulas2V(270, "ate270");
assert.ok(v2_270);
approxEqual(v2_270.pctCC, 80);
approxEqual(v2_270.pctValvula, (80 * 5) / 35);
approxEqual(v2_270.adm, 30 * (v2_270.pctValvula / 100) + 30);
approxEqual(v2_270.esc, 26 * (v2_270.pctValvula / 100) + 26);

const v2_300 = calcValvulas2V(300, "acima271");
assert.ok(v2_300);
approxEqual(v2_300.pctCC, 100);
approxEqual(v2_300.pctValvula, (100 * 10) / 35);
approxEqual(v2_300.adm, 30 * (v2_300.pctValvula / 100) + 30);
approxEqual(v2_300.esc, 26 * (v2_300.pctValvula / 100) + 26);

// 8. Aumento de Válvulas 4V
const v4Base = calcValvulas4V(250);
assert.ok(v4Base);
approxEqual(v4Base.adm, 28);
approxEqual(v4Base.esc, 23.5);

const v4_300 = calcValvulas4V(300);
assert.ok(v4_300);
approxEqual(v4_300.pctCC, 20);
approxEqual(v4_300.pctValvula, 4);
approxEqual(v4_300.adm, 29.12);
approxEqual(v4_300.esc, 24.44);

// 9. Dutos 2V
const d2 = calcDutos2V(25, 21);
assert.ok(d2);
approxEqual(d2.dutoAdm, 25 * 0.948);
approxEqual(d2.dutoEsc, 21 * 1.095);
assert.equal(formatPtBR(d2.dutoAdm, 2), "23,70");
assert.equal(formatPtBR(d2.dutoEsc, 2), "23,00");

// 10. Dutos 4V
const d4 = calcDutos4V(22, 19);
assert.ok(d4);
approxEqual(d4.dutoAdm, 22 * 1.342);
approxEqual(d4.dutoEsc, 19 * 1.549);

// Presets sanity (apenas CB 300R é 4V; todas as outras são 2V)
assert.equal(ENGINE_PRESETS.length, 5);
const presets4v = ENGINE_PRESETS.filter((p) => p.valves === 4);
const presets2v = ENGINE_PRESETS.filter((p) => p.valves === 2);
assert.equal(presets4v.length, 1);
assert.equal(presets4v[0].id, "cb-300r");
assert.equal(presets2v.length, 4);
for (const p of ENGINE_PRESETS) {
  assert.ok((calcCilindrada(p.boreMm, p.strokeMm) ?? 0) > 100);
}

console.log("✓ Todos os testes das 10 Calculadoras NTR passaram com 100% de precisão.");
