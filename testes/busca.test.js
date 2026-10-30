import test from 'node:test';
import assert from 'node:assert/strict';
import { menorCadeia, contarCadeiasMinimas } from '../src/busca.js';
import {
  cadeiaValida, comprimentoBinario, limiteInferior, deveAtingirLimiteInferior, bitsUm,
} from '../src/cadeia.js';
import { CONHECIDO } from '../ferramentas/medidor.js';

test('a cadeia de 1 nao tem soma nenhuma', () => {
  const r = menorCadeia(1);
  assert.deepEqual(r.cadeia, [1]);
  assert.equal(r.comprimento, 0);
});

test('a busca devolve cadeia valida que termina em n, ate 200', () => {
  for (let n = 1; n <= 200; n++) {
    const r = menorCadeia(n);
    assert.equal(cadeiaValida(r.cadeia), true, `n=${n}: ${r.cadeia}`);
    assert.equal(r.cadeia[r.cadeia.length - 1], n, `n=${n}`);
    assert.equal(r.cadeia.length - 1, r.comprimento, `n=${n}`);
  }
});

test('a busca bate com a sequencia A003313 nos 40 primeiros', () => {
  for (let n = 1; n <= CONHECIDO.length; n++) {
    assert.equal(menorCadeia(n).comprimento, CONHECIDO[n - 1], `n=${n}`);
  }
});

test('a cadeia achada nunca e mais longa que a binaria', () => {
  for (let n = 1; n <= 200; n++) {
    assert.ok(menorCadeia(n).comprimento <= comprimentoBinario(n), `n=${n}`);
  }
});

test('a cadeia achada nunca e mais curta que o limite inferior', () => {
  for (let n = 1; n <= 200; n++) {
    assert.ok(menorCadeia(n).comprimento >= limiteInferior(n), `n=${n}`);
  }
});

test('a previsao dos dois bits acerta quem atinge o limite, ate 200', () => {
  for (let n = 1; n <= 200; n++) {
    const atingiu = menorCadeia(n).comprimento === limiteInferior(n);
    assert.equal(atingiu, deveAtingirLimiteInferior(n), `n=${n}`);
  }
});

test('o primeiro n em que o metodo binario nao e otimo e 15', () => {
  for (let n = 1; n < 15; n++) {
    assert.equal(menorCadeia(n).comprimento, comprimentoBinario(n), `n=${n} deveria empatar`);
  }
  assert.equal(menorCadeia(15).comprimento, 5);
  assert.equal(comprimentoBinario(15), 6);
});

test('l(2^k) e exatamente k', () => {
  for (let k = 0; k <= 8; k++) assert.equal(menorCadeia(2 ** k).comprimento, k, `2^${k}`);
});

test('o minimo NAO e monotono: l(8) e menor que l(7)', () => {
  assert.equal(menorCadeia(7).comprimento, 4);
  assert.equal(menorCadeia(8).comprimento, 3);
});

test('existem 84 quedas ate 400', () => {
  let quedas = 0;
  let anterior = menorCadeia(1).comprimento;
  for (let n = 2; n <= 400; n++) {
    const atual = menorCadeia(n).comprimento;
    if (atual < anterior) quedas++;
    anterior = atual;
  }
  assert.equal(quedas, 84);
});

test('as quedas sao de um, dois ou tres degraus, e nunca mais', () => {
  const porDegrau = {};
  let anterior = menorCadeia(1).comprimento;
  for (let n = 2; n <= 400; n++) {
    const atual = menorCadeia(n).comprimento;
    if (atual < anterior) {
      const degrau = anterior - atual;
      porDegrau[degrau] = (porDegrau[degrau] || 0) + 1;
    }
    anterior = atual;
  }
  assert.deepEqual(porDegrau, { 1: 66, 2: 15, 3: 3 });
});

test('a maior queda e de 127 para 128, de 10 somas para 7', () => {
  assert.equal(menorCadeia(127).comprimento, 10);
  assert.equal(menorCadeia(128).comprimento, 7);
});

test('toda queda de dois degraus ou mais perde pelo menos dois bits 1', () => {
  // sair de um numero cheio de bits 1 para um mais redondo derruba varias somas;
  // os limiares aqui sao medidos, nao supostos: ha 18 quedas grandes ate 400,
  // nenhuma com mais de 4 bits no destino e nenhuma ganhando bits
  let anterior = menorCadeia(1).comprimento;
  let grandes = 0;
  for (let n = 2; n <= 400; n++) {
    const atual = menorCadeia(n).comprimento;
    if (anterior - atual >= 2) {
      grandes++;
      assert.ok(bitsUm(n) < bitsUm(n - 1), `l(${n}) caiu mas ${n} nao tem menos bits que ${n - 1}`);
      assert.ok(bitsUm(n - 1) - bitsUm(n) >= 2, `${n - 1} -> ${n} perdeu so um bit`);
      assert.ok(bitsUm(n) <= 4, `${n} tem ${bitsUm(n)} bits 1`);
    }
    anterior = atual;
  }
  assert.equal(grandes, 18);
});

test('o minimo sobe no maximo um degrau de cada vez', () => {
  let anterior = menorCadeia(1).comprimento;
  for (let n = 2; n <= 200; n++) {
    const atual = menorCadeia(n).comprimento;
    assert.ok(atual - anterior <= 1, `l(${n})=${atual} pulou de l(${n - 1})=${anterior}`);
    anterior = atual;
  }
});

test('contarCadeiasMinimas acha pelo menos uma para todo n ate 120', () => {
  for (let n = 1; n <= 120; n++) {
    const r = menorCadeia(n);
    assert.ok(contarCadeiasMinimas(n, r.comprimento) >= 1, `n=${n}`);
  }
});

test('nao existe cadeia mais curta que a minima', () => {
  for (let n = 2; n <= 100; n++) {
    const r = menorCadeia(n);
    assert.equal(contarCadeiasMinimas(n, r.comprimento - 1), 0, `n=${n}`);
  }
});

test('33 tem apenas duas cadeias minimas, e 31 tem 80', () => {
  assert.equal(contarCadeiasMinimas(33, menorCadeia(33).comprimento), 2);
  assert.equal(contarCadeiasMinimas(31, menorCadeia(31).comprimento), 80);
});

test('a busca gasta mais nos conforme n cresce', () => {
  const pequeno = menorCadeia(31).nos;
  const grande = menorCadeia(255).nos;
  assert.ok(grande > pequeno, `255 gastou ${grande}, 31 gastou ${pequeno}`);
});
