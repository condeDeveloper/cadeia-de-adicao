# Cadeias de adição: quantas multiplicações custa uma potência

Para calcular `x¹⁵` ninguém multiplica catorze vezes. Eleva ao quadrado, guarda,
multiplica — e a pergunta é qual a **menor** sequência de somas que chega a 15
partindo de 1, somando sempre dois números já obtidos:

```
1, 2, 4, 5, 10, 15     cinco somas
```

O método que todo mundo conhece é o binário ("quadrado e multiplica"), e ele gasta
**seis**. Este repositório acha a menor cadeia por busca, sem tabela nenhuma, e
mede o tamanho do desperdício do método binário. Node puro, sem dependência.

## Os quatro achados

1. **O método binário não é ótimo em 227 dos 400 primeiros números — 56,8%.** E
   piora conforme o número cresce: erra em 20,0% da faixa de 1 a 50, e em 68,0% da
   faixa de 201 a 400. O primeiro número em que ele falha é o **15**.
2. **O comprimento mínimo não cresce com o número.** São 84 quedas até 400: 66 de
   um degrau, 15 de dois e 3 de três. A maior é `l(127) = 10` caindo para
   `l(128) = 7`. Toda queda grande perde pelo menos dois bits 1.
3. **O limite inferior `⌈log₂ n⌉` é atingido exatamente pelos números com no
   máximo dois bits 1.** São 45 até 400 — nove potências de dois e 36 com dois
   bits — e a regra acerta os 400 sem errar um.
4. **Dois números vizinhos em tamanho podem ter números de soluções ótimas
   completamente diferentes.** O 31 tem 80 cadeias mínimas; o 33, maior, tem
   **duas**. O 127 tem 2.904.

## As tabelas

Tudo abaixo sai de `node ferramentas/medidor.js`, e está preso em
`testes/medidas.test.js`. A busca varre **400 números** e gasta 18.933.997 nós.

### A busca contra a sequência conhecida

Os 40 primeiros valores conferidos contra a **A003313** da OEIS, que não saiu
deste programa: **zero divergências**.

| n | a busca acha | a OEIS diz |
|---|---|---|
| 7 | 4 | 4 |
| 8 | 3 | 3 |
| 15 | 5 | 5 |
| 23 | 6 | 6 |
| 31 | 7 | 7 |
| 33 | 6 | 6 |

### O método binário é ótimo?

| faixa | números | binário é ótimo | binário gasta mais | fatia que erra |
|---|---|---|---|---|
| 1-50 | 50 | 40 | 10 | 20,0% |
| 51-100 | 50 | 27 | 23 | 46,0% |
| 101-200 | 100 | 42 | 58 | 58,0% |
| 201-400 | 200 | 64 | 136 | 68,0% |
| **1-400** | **400** | **173** | **227** | **56,8%** |

### Onde o binário mais desperdiça

| n | binário | ótimo | desperdício | n em binário |
|---|---|---|---|---|
| 255 | 14 | 10 | **4** | 11111111 |
| 319 | 14 | 11 | 3 | 100111111 |
| 383 | 15 | 12 | 3 | 101111111 |

O inimigo do método binário é o bit 1: cada um custa uma soma a mais, e ele não
sabe aproveitar pedaços já construídos.

### O mínimo cresce sempre? Não.

| queda | de | para |
|---|---|---|
| l(8) | 4 | **3** |
| l(12) | 5 | **4** |
| l(16) | 5 | **4** |
| l(128) | 10 | **7** |

São 84 quedas até 400, e a de 127 para 128 derruba três somas de uma vez.

### Quem atinge o limite inferior

O limite é `⌈log₂ n⌉`, porque cada soma no máximo dobra. A previsão — **atinge
quem tem no máximo dois bits 1** — foi conferida número a número:

| | |
|---|---|
| atingem de fato | 45 |
| previstos pela regra dos bits | 45 |
| previsão errada em | **0 números** |
| destes, potências de dois | 9 |
| com exatamente dois bits 1 | 36 |

### Quantas cadeias mínimas existem

| n | mínimo | cadeias mínimas | uma delas |
|---|---|---|---|
| 7 | 4 | 6 | 1 2 4 6 7 |
| 15 | 5 | 4 | 1 2 4 5 10 15 |
| 31 | 7 | 80 | 1 2 4 8 10 20 30 31 |
| 33 | 6 | **2** | 1 2 4 8 16 32 33 |
| 63 | 8 | 94 | 1 2 4 8 16 20 21 42 63 |
| 127 | 10 | 2.904 | 1 2 4 8 16 32 40 42 84 126 127 |

## O que as medidas me corrigiram

- **Escrevi num teste que toda queda do mínimo é de um degrau. Não é.** A
  varredura achou 15 quedas de dois degraus e 3 de três, sendo a maior `l(127)=10`
  para `l(128)=7`. Eu tinha olhado as cinco primeiras quedas da tabela, todas de um
  degrau, e generalizado — que é exatamente o erro que varrer tudo existe para
  impedir.
- **Depois errei de novo tentando explicar as quedas grandes.** Escrevi que o
  número anterior sempre tem cinco bits 1 ou mais. O 263, que vem antes do 264,
  tem quatro. O que vale de verdade, medido, é mais fraco e mais honesto: a queda
  grande **perde pelo menos dois bits 1**, e o destino nunca tem mais de quatro.
- **Esperava que só as potências de dois atingissem o limite inferior.** O 33
  atinge, e não é potência de nada. Fui ver quem mais: são 45 números, e o padrão é
  ter **no máximo dois bits 1**. Isso virou uma função que prevê o resultado sem
  busca nenhuma, e que a varredura confere nos 400.

## Como está organizado

```
src/cadeia.js   o que é uma cadeia válida, o método binário e os limites
src/busca.js    a menor cadeia por aprofundamento iterativo, e a contagem de ótimas
ferramentas/medidor.js  roda a varredura e imprime as tabelas acima
testes/         61 testes
```

A busca não conhece a resposta: ela tenta com uma soma, com duas, com três, e para
na primeira profundidade que resolve — então a primeira cadeia achada já é mínima.
A poda é simples e correta: dobrando a cada passo, de um valor `v` com `k` somas
restantes não se passa de `v · 2ᵏ`.

## Rodar

```bash
node --test testes/*.test.js   # a bateria inteira
node ferramentas/medidor.js    # recalcula todas as tabelas deste README
```

Sem `npm install`: não há dependência. Precisa de Node 18 ou mais novo.

## Licença

MIT.
