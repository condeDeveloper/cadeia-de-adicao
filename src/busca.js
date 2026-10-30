// A busca pela MENOR cadeia. Nao usa tabela nenhuma: o valor conhecido so entra
// depois, na hora de conferir.
//
// Aprofundamento iterativo: tenta com 1 soma, com 2, com 3, e para na primeira
// profundidade que resolve. Assim a primeira resposta achada ja e a minima.

import { comprimentoBinario, limiteInferior } from './cadeia.js';

/**
 * @returns {{cadeia: number[], comprimento: number, nos: number}}
 */
export function menorCadeia(n, opcoes = {}) {
  if (n === 1) return { cadeia: [1], comprimento: 0, nos: 0 };
  const teto = opcoes.teto ?? comprimentoBinario(n);
  let nos = 0;

  for (let limite = limiteInferior(n); limite <= teto; limite++) {
    const atual = [1];
    const achou = (profundidade) => {
      nos++;
      const maior = atual[atual.length - 1];
      if (maior === n) return true;
      const faltam = limite - profundidade;
      if (faltam === 0) return false;
      // poda: dobrando a cada passo, o maximo alcancavel e maior * 2^faltam
      if (maior * 2 ** faltam < n) return false;

      // tentar as somas em ordem decrescente faz a cadeia crescer rapido,
      // e e o que encontra a resposta antes
      for (let i = atual.length - 1; i >= 0; i--) {
        for (let j = i; j >= 0; j--) {
          const soma = atual[i] + atual[j];
          if (soma <= maior || soma > n) continue;
          atual.push(soma);
          if (achou(profundidade + 1)) return true;
          atual.pop();
        }
      }
      return false;
    };

    if (achou(0)) return { cadeia: atual.slice(), comprimento: limite, nos };
  }
  // o metodo binario sempre resolve, entao isto nao deve acontecer
  return { cadeia: [], comprimento: -1, nos };
}

/** Os comprimentos minimos de 1 ate `ate`, achados um por um. */
export function tabelaDeMinimos(ate) {
  const saida = [];
  let nosTotais = 0;
  for (let n = 1; n <= ate; n++) {
    const r = menorCadeia(n);
    nosTotais += r.nos;
    saida.push({ n, minimo: r.comprimento, binario: comprimentoBinario(n), nos: r.nos, cadeia: r.cadeia });
  }
  return { linhas: saida, nosTotais };
}

/**
 * Conta TODAS as cadeias minimas de n, em vez de parar na primeira. Serve para
 * perguntar quantas solucoes otimas existem, que a tabela de comprimentos esconde.
 */
export function contarCadeiasMinimas(n, minimo) {
  if (n === 1) return 1;
  let total = 0;
  const atual = [1];
  const anda = (profundidade) => {
    const maior = atual[atual.length - 1];
    if (maior === n) {
      if (profundidade === minimo) total++;
      return;
    }
    const faltam = minimo - profundidade;
    if (faltam === 0) return;
    if (maior * 2 ** faltam < n) return;
    for (let i = atual.length - 1; i >= 0; i--) {
      for (let j = i; j >= 0; j--) {
        const soma = atual[i] + atual[j];
        if (soma <= maior || soma > n) continue;
        atual.push(soma);
        anda(profundidade + 1);
        atual.pop();
      }
    }
  };
  anda(0);
  return total;
}
