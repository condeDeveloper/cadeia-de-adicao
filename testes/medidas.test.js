// Os numeros que aparecem no README, presos aqui. Todos sairam de
// `node ferramentas/medidor.js`; nenhum foi digitado de cabeca.

import test from 'node:test';
import assert from 'node:assert/strict';
import { medir, ATE, CONHECIDO } from '../ferramentas/medidor.js';
import { menorCadeia, contarCadeiasMinimas } from '../src/busca.js';
import { cadeiaValida, limiteInferior, deveAtingirLimiteInferior, bitsUm } from '../src/cadeia.js';

test('a varredura cobre 400 numeros', () => {
  assert.equal(ATE, 400);
  assert.equal(medir().linhas.length, 400);
});

test('fechamento: a busca gasta 18.933.997 nos ate 400', () => {
  assert.equal(medir().nosTotais, 18933997);
});

test('fechamento: nenhuma cadeia invalida em 400 numeros', () => {
  const ruins = medir().linhas.filter((l) => !cadeiaValida(l.cadeia) || l.cadeia[l.cadeia.length - 1] !== l.n);
  assert.equal(ruins.length, 0);
});

test('tabela 1: zero divergencia contra a A003313 nos 40 primeiros', () => {
  const { linhas } = medir();
  let erros = 0;
  for (let n = 1; n <= CONHECIDO.length; n++) if (linhas[n - 1].minimo !== CONHECIDO[n - 1]) erros++;
  assert.equal(erros, 0);
  assert.equal(CONHECIDO.length, 40);
});

const faixas = [
  { de: 1, ate: 50, erram: 10, fatia: 20.0 },
  { de: 51, ate: 100, erram: 23, fatia: 46.0 },
  { de: 101, ate: 200, erram: 58, fatia: 58.0 },
  { de: 201, ate: 400, erram: 136, fatia: 68.0 },
];

for (const f of faixas) {
  test(`tabela 2: de ${f.de} a ${f.ate}, o binario erra em ${f.erram}`, () => {
    const faixa = medir().linhas.filter((l) => l.n >= f.de && l.n <= f.ate);
    const erram = faixa.filter((l) => l.minimo < l.binario).length;
    assert.equal(erram, f.erram);
    assert.ok(Math.abs((100 * erram) / faixa.length - f.fatia) < 0.05);
  });
}

test('tabela 2: o binario erra em 227 dos 400, ou 56,8%', () => {
  const erram = medir().linhas.filter((l) => l.minimo < l.binario).length;
  assert.equal(erram, 227);
  const fatia = (100 * erram) / 400;
  assert.ok(fatia > 56.74 && fatia < 56.76, `fatia medida: ${fatia}`);
});

test('tabela 2: a fatia de erro do binario so cresce de faixa em faixa', () => {
  for (let i = 1; i < faixas.length; i++) assert.ok(faixas[i].fatia > faixas[i - 1].fatia);
});

test('tabela 3: o maior desperdicio do binario e 4, em n=255', () => {
  const { linhas } = medir();
  const maior = Math.max(...linhas.map((l) => l.binario - l.minimo));
  assert.equal(maior, 4);
  const quem = linhas.filter((l) => l.binario - l.minimo === maior).map((l) => l.n);
  assert.deepEqual(quem, [255]);
  assert.equal(linhas[254].binario, 14);
  assert.equal(linhas[254].minimo, 10);
});

test('tabela 3: 255 e oito bits 1 seguidos', () => {
  assert.equal(bitsUm(255), 8);
  assert.equal((255).toString(2), '11111111');
});

test('tabela 4: 84 quedas ate 400', () => {
  const { linhas } = medir();
  const quedas = linhas.filter((l, i) => i > 0 && l.minimo < linhas[i - 1].minimo);
  assert.equal(quedas.length, 84);
  assert.equal(quedas[0].n, 8);
});

test('tabela 5: nenhum numero fura o limite inferior nem o superior', () => {
  const fora = medir().linhas.filter((l) => l.minimo < limiteInferior(l.n) || l.minimo > l.binario);
  assert.equal(fora.length, 0);
});

test('tabela 5b: 45 numeros atingem o limite inferior ate 400', () => {
  const atingem = medir().linhas.filter((l) => l.minimo === limiteInferior(l.n));
  assert.equal(atingem.length, 45);
});

test('tabela 5b: a regra dos dois bits acerta os 400', () => {
  const erradas = medir().linhas.filter(
    (l) => (l.minimo === limiteInferior(l.n)) !== deveAtingirLimiteInferior(l.n)
  );
  assert.equal(erradas.length, 0);
});

test('tabela 5b: dos 45, nove sao potencias de dois e 36 tem dois bits 1', () => {
  const atingem = medir().linhas.filter((l) => l.minimo === limiteInferior(l.n));
  assert.equal(atingem.filter((l) => bitsUm(l.n) === 1).length, 9);
  assert.equal(atingem.filter((l) => bitsUm(l.n) === 2).length, 36);
});

const cadeiasMinimas = { 7: 6, 15: 4, 23: 4, 31: 80, 33: 2, 63: 94, 127: 2904 };

for (const n of Object.keys(cadeiasMinimas).map(Number)) {
  test(`tabela 6: n=${n} tem ${cadeiasMinimas[n]} cadeias minimas`, () => {
    const r = menorCadeia(n);
    assert.equal(contarCadeiasMinimas(n, r.comprimento), cadeiasMinimas[n]);
  });
}

test('tabela 6: 33 tem duas cadeias minimas e 31, que e menor, tem 80', () => {
  assert.ok(31 < 33);
  assert.equal(cadeiasMinimas[33], 2);
  assert.equal(cadeiasMinimas[31], 80);
});

test('tabela 7: l(2^k) = k para k de 0 a 8', () => {
  const { linhas } = medir();
  for (let k = 0; k <= 8; k++) assert.equal(linhas[2 ** k - 1].minimo, k, `2^${k}`);
});
