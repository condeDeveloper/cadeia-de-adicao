// Uma cadeia de adicao para n e uma lista que comeca em 1, termina em n, e em que
// cada termo e a soma de dois termos anteriores (podendo ser o mesmo duas vezes).
//
//   1, 2, 4, 8, 12, 13     e uma cadeia para 13, de comprimento 5
//
// O comprimento e o numero de SOMAS, isto e, o tamanho da lista menos um. Achar a
// menor cadeia e o problema: ele decide quantas multiplicacoes custa calcular
// x elevado a n.

/** Confere que a lista e mesmo uma cadeia de adicao valida para o ultimo termo. */
export function cadeiaValida(cadeia) {
  if (cadeia.length === 0 || cadeia[0] !== 1) return false;
  for (let i = 1; i < cadeia.length; i++) {
    let achou = false;
    for (let j = 0; j < i && !achou; j++) {
      for (let k = j; k < i && !achou; k++) {
        if (cadeia[j] + cadeia[k] === cadeia[i]) achou = true;
      }
    }
    if (!achou) return false;
  }
  return true;
}

/** O comprimento de uma cadeia: o numero de somas. */
export function comprimento(cadeia) {
  return cadeia.length - 1;
}

/**
 * O metodo binario (ou "quadrado e multiplica"): dobre sempre, e some 1 onde o
 * bit mandar. Custa floor(log2 n) dobras mais (bits 1 de n) menos 1 somas. E um
 * LIMITE SUPERIOR honesto, nao o otimo.
 */
export function cadeiaBinaria(n) {
  if (n < 1) return [];
  const bits = n.toString(2);
  const cadeia = [1];
  let atual = 1;
  for (let i = 1; i < bits.length; i++) {
    atual *= 2;
    cadeia.push(atual);
    if (bits[i] === '1') {
      atual += 1;
      cadeia.push(atual);
    }
  }
  return cadeia;
}

/** O comprimento da cadeia binaria, pela formula, sem montar a cadeia. */
export function comprimentoBinario(n) {
  if (n < 1) return 0;
  const bits = n.toString(2);
  let uns = 0;
  for (const c of bits) if (c === '1') uns++;
  return bits.length - 1 + uns - 1;
}

/**
 * O limite inferior obvio: cada soma no maximo dobra o maior valor, entao com r
 * somas nao se passa de 2^r. Logo l(n) >= ceil(log2 n).
 */
export function limiteInferior(n) {
  return Math.ceil(Math.log2(n));
}

/** Quantos bits 1 tem n. Aparece em quase toda conta deste projeto. */
export function bitsUm(n) {
  let conta = 0;
  for (let x = n; x > 0; x >>= 1) conta += x & 1;
  return conta;
}

/**
 * PREVISAO, nao medida: l(n) atinge o limite inferior ceil(log2 n) exatamente
 * quando n tem no maximo dois bits 1.
 *
 * A ida e facil de ver: com um bit e so dobrar, e com dois bits basta dobrar ate
 * o bit alto, guardar, e seguir dobrando ate somar o bit baixo no fim. A volta e
 * que e o teorema. Aqui ela nao e assumida: a varredura confere numero a numero.
 */
export function deveAtingirLimiteInferior(n) {
  return bitsUm(n) <= 2;
}

/** O limite inferior refinado de Schonhage, que usa tambem o numero de bits 1. */
export function limiteDeSchonhage(n) {
  if (n < 1) return 0;
  let uns = 0;
  for (let x = n; x > 0; x >>= 1) uns += x & 1;
  return Math.ceil(Math.log2(n) + Math.log2(uns) - 2.13);
}
