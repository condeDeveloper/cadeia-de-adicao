#!/usr/bin/env node
// O medidor: roda as varreduras e imprime as tabelas que vao para o README.
// Nenhum numero do README e digitado a mao; todos saem daqui.

import { menorCadeia, tabelaDeMinimos, contarCadeiasMinimas } from '../src/busca.js';
import { cadeiaValida, limiteInferior, deveAtingirLimiteInferior, bitsUm } from '../src/cadeia.js';

const br = (x) => x.toLocaleString('pt-BR');

export const ATE = 400;

let guardado = null;
export function medir() {
  if (!guardado) guardado = tabelaDeMinimos(ATE);
  return guardado;
}

/**
 * A sequencia A003313 da OEIS, os comprimentos minimos conhecidos de 1 a 40.
 * E o juiz externo: estes numeros nao sairam deste programa.
 */
export const CONHECIDO = [
  0, 1, 2, 2, 3, 3, 4, 3, 4, 4, 5, 4, 5, 5, 5, 4, 5, 5, 6, 5,
  6, 6, 6, 5, 6, 6, 6, 6, 7, 6, 7, 5, 6, 6, 7, 6, 7, 7, 7, 6,
];

function imprimir() {
  const { linhas, nosTotais } = medir();

  console.log('\n== Tabela 1: a busca contra a sequencia conhecida (A003313) ==');
  console.log('  n | a busca acha | a OEIS diz | batem?');
  let errosContraOEIS = 0;
  for (let n = 1; n <= CONHECIDO.length; n++) {
    const l = linhas[n - 1];
    const bate = l.minimo === CONHECIDO[n - 1];
    if (!bate) errosContraOEIS++;
    if (n <= 20 || !bate) {
      console.log(`  ${String(n).padStart(2)} | ${String(l.minimo).padStart(12)} | ${String(CONHECIDO[n - 1]).padStart(10)} | ${bate ? 'sim' : 'NAO'}`);
    }
  }
  console.log(`  ... conferidos os 40 primeiros: ${errosContraOEIS} divergencias`);
  if (errosContraOEIS > 0) process.exit(1);

  console.log('\n== Tabela 2: o metodo binario e otimo? ==');
  console.log('  faixa | numeros | binario e otimo | binario gasta mais | fatia que erra');
  for (const [de, ate] of [[1, 50], [51, 100], [101, 200], [201, 400], [1, ATE]]) {
    const faixa = linhas.filter((l) => l.n >= de && l.n <= ate);
    const erram = faixa.filter((l) => l.minimo < l.binario).length;
    console.log(
      `  ${String(de + '-' + ate).padStart(7)} | ${String(faixa.length).padStart(7)} | ${String(faixa.length - erram).padStart(15)} | ${String(erram).padStart(18)} | ${((100 * erram) / faixa.length).toFixed(1)}%`
    );
  }

  console.log('\n== Tabela 3: onde o binario mais desperdica ==');
  console.log('  n | binario | otimo | desperdicio | n em binario');
  const ordenado = linhas.slice().sort((a, b) => (b.binario - b.minimo) - (a.binario - a.minimo) || a.n - b.n);
  for (const l of ordenado.slice(0, 8)) {
    console.log(
      `  ${String(l.n).padStart(3)} | ${String(l.binario).padStart(7)} | ${String(l.minimo).padStart(5)} | ${String(l.binario - l.minimo).padStart(11)} | ${l.n.toString(2)}`
    );
  }

  console.log('\n== Tabela 4: o minimo cresce sempre? ==');
  const quedas = linhas.filter((l, i) => i > 0 && l.minimo < linhas[i - 1].minimo);
  console.log(`  quedas de l(n) para l(n+1) ate ${ATE}: ${quedas.length}`);
  console.log('  as cinco primeiras:');
  for (const q of quedas.slice(0, 5)) {
    console.log(`    l(${q.n}) = ${q.minimo}, mas l(${q.n - 1}) = ${linhas[q.n - 2].minimo}`);
  }

  console.log('\n== Tabela 5: os limites seguram? ==');
  console.log('  O inferior e ceil(log2 n); o superior e o metodo binario.');
  console.log('  n | inferior | minimo | binario | inferior atingido?');
  for (const n of [1, 2, 3, 7, 8, 15, 16, 31, 32, 33, 63, 64, 127, 128, 255, 256]) {
    const l = linhas[n - 1];
    if (!l) continue;
    console.log(
      `  ${String(n).padStart(3)} | ${String(limiteInferior(n)).padStart(8)} | ${String(l.minimo).padStart(6)} | ${String(l.binario).padStart(7)} | ${limiteInferior(n) === l.minimo ? 'sim' : 'nao'}`
    );
  }
  const foraDoLimite = linhas.filter((l) => l.minimo < limiteInferior(l.n) || l.minimo > l.binario);
  console.log(`  numeros que furam algum dos dois limites: ${foraDoLimite.length}`);
  if (foraDoLimite.length > 0) process.exit(1);

  console.log('\n== Tabela 5b: quem atinge o limite inferior ==');
  console.log('  A previsao: atinge exatamente quem tem no maximo dois bits 1.');
  const atingem = linhas.filter((l) => l.minimo === limiteInferior(l.n));
  const previstos = linhas.filter((l) => deveAtingirLimiteInferior(l.n));
  const erraramPrevisao = linhas.filter(
    (l) => (l.minimo === limiteInferior(l.n)) !== deveAtingirLimiteInferior(l.n)
  );
  console.log(`  atingem de fato .............. ${atingem.length}`);
  console.log(`  previstos pela regra dos bits  ${previstos.length}`);
  console.log(`  previsao errada em ........... ${erraramPrevisao.length} numeros`);
  console.log(`  destes, potencias de dois .... ${atingem.filter((l) => bitsUm(l.n) === 1).length}`);
  console.log(`  com exatamente dois bits 1 ... ${atingem.filter((l) => bitsUm(l.n) === 2).length}`);
  if (erraramPrevisao.length > 0) {
    console.error('A REGRA DOS BITS FALHOU EM: ' + erraramPrevisao.slice(0, 10).map((l) => l.n).join(', '));
    process.exit(1);
  }

  console.log('\n== Tabela 6: quantas cadeias minimas existem ==');
  console.log('  n | minimo | cadeias minimas | uma delas');
  for (const n of [7, 15, 23, 31, 33, 63, 127]) {
    const r = menorCadeia(n);
    const q = contarCadeiasMinimas(n, r.comprimento);
    console.log(
      `  ${String(n).padStart(3)} | ${String(r.comprimento).padStart(6)} | ${br(q).padStart(15)} | ${r.cadeia.join(' ')}`
    );
  }

  console.log('\n== Tabela 7: as potencias de dois ==');
  console.log('  Dobrar sempre e otimo? l(2^k) tem de ser exatamente k.');
  for (let k = 0; k <= 8; k++) {
    const n = 2 ** k;
    if (n > ATE) break;
    const l = linhas[n - 1];
    console.log(`  2^${k} = ${String(n).padStart(3)} | minimo ${l.minimo} | esperado ${k} | ${l.minimo === k ? 'sim' : 'NAO'}`);
    if (l.minimo !== k) process.exit(1);
  }

  console.log('\n== Fechamento ==');
  const invalidas = linhas.filter((l) => !cadeiaValida(l.cadeia) || l.cadeia[l.cadeia.length - 1] !== l.n);
  console.log(`  numeros varridos ................. ${br(ATE)}`);
  console.log(`  nos gastos pela busca ............ ${br(nosTotais)}`);
  console.log(`  divergencias contra a OEIS ....... ${errosContraOEIS}`);
  console.log(`  cadeias invalidas devolvidas ..... ${invalidas.length}`);
  console.log(`  numeros em que o binario erra .... ${br(linhas.filter((l) => l.minimo < l.binario).length)}`);
  console.log('');
  if (invalidas.length > 0) process.exit(1);

}

if (process.argv[1]?.endsWith('medidor.js')) imprimir();
