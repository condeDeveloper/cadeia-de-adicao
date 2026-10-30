import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cadeiaValida, comprimento, cadeiaBinaria, comprimentoBinario,
  limiteInferior, bitsUm, deveAtingirLimiteInferior,
} from '../src/cadeia.js';

test('a cadeia de um termo so e valida', () => {
  assert.equal(cadeiaValida([1]), true);
  assert.equal(comprimento([1]), 0);
});

test('a cadeia classica de 13 e valida', () => {
  assert.equal(cadeiaValida([1, 2, 4, 8, 12, 13]), true);
  assert.equal(comprimento([1, 2, 4, 8, 12, 13]), 5);
});

test('cadeia que nao comeca em 1 e invalida', () => {
  assert.equal(cadeiaValida([2, 4, 8]), false);
});

test('cadeia com termo que nao e soma de dois anteriores e invalida', () => {
  assert.equal(cadeiaValida([1, 2, 4, 9]), false);
});

test('somar um termo com ele mesmo vale', () => {
  assert.equal(cadeiaValida([1, 2, 4, 8, 16]), true);
});

test('a cadeia vazia e invalida', () => {
  assert.equal(cadeiaValida([]), false);
});

test('a cadeia binaria e valida para todo n ate 300', () => {
  for (let n = 1; n <= 300; n++) {
    const c = cadeiaBinaria(n);
    assert.equal(cadeiaValida(c), true, `n=${n}: ${c}`);
    assert.equal(c[c.length - 1], n, `n=${n}`);
  }
});

test('o comprimento da cadeia binaria bate com a formula, ate 500', () => {
  for (let n = 1; n <= 500; n++) {
    assert.equal(comprimento(cadeiaBinaria(n)), comprimentoBinario(n), `n=${n}`);
  }
});

test('a formula do binario e floor(log2 n) + bits 1 - 1', () => {
  for (let n = 1; n <= 500; n++) {
    const esperado = Math.floor(Math.log2(n)) + bitsUm(n) - 1;
    assert.equal(comprimentoBinario(n), esperado, `n=${n}`);
  }
});

test('para potencia de dois o binario gasta exatamente o expoente', () => {
  for (let k = 0; k <= 12; k++) assert.equal(comprimentoBinario(2 ** k), k, `2^${k}`);
});

test('para 2^k - 1 o binario gasta 2k - 2', () => {
  for (let k = 2; k <= 10; k++) {
    assert.equal(comprimentoBinario(2 ** k - 1), 2 * k - 2, `2^${k}-1`);
  }
});

test('bitsUm conta os bits 1', () => {
  assert.equal(bitsUm(0), 0);
  assert.equal(bitsUm(1), 1);
  assert.equal(bitsUm(255), 8);
  assert.equal(bitsUm(256), 1);
  assert.equal(bitsUm(100), 3);
});

test('o limite inferior e ceil(log2 n)', () => {
  assert.equal(limiteInferior(1), 0);
  assert.equal(limiteInferior(2), 1);
  assert.equal(limiteInferior(3), 2);
  assert.equal(limiteInferior(4), 2);
  assert.equal(limiteInferior(5), 3);
  assert.equal(limiteInferior(256), 8);
  assert.equal(limiteInferior(257), 9);
});

test('o limite inferior nunca passa do binario', () => {
  for (let n = 1; n <= 500; n++) {
    assert.ok(limiteInferior(n) <= comprimentoBinario(n), `n=${n}`);
  }
});

test('a previsao do limite inferior e so a contagem de bits', () => {
  for (let n = 1; n <= 500; n++) {
    assert.equal(deveAtingirLimiteInferior(n), bitsUm(n) <= 2, `n=${n}`);
  }
});

test('todo numero com um ou dois bits 1 e previsto', () => {
  for (const n of [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 16, 33, 64, 96, 128, 256, 384]) {
    assert.equal(deveAtingirLimiteInferior(n), true, `n=${n}`);
  }
});

test('numero com tres bits ou mais nao e previsto', () => {
  for (const n of [7, 11, 13, 14, 15, 21, 31, 63, 127, 255]) {
    assert.equal(deveAtingirLimiteInferior(n), false, `n=${n}`);
  }
});
