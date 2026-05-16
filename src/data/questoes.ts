export interface Alternativa {
  letra: 'A' | 'B' | 'C' | 'D';
  texto: string;
}

export interface Questao {
  id: number;
  numero: number;
  materia: 'Matemática' | 'Português';
  enunciado: string;
  alternativas: Alternativa[];
  gabarito: 'A' | 'B' | 'C' | 'D';
}

export interface SimuladoData {
  id: string;
  titulo: string;
  subtitulo: string;
  duracaoSegundos: number;
  questoes: Questao[];
}

const SIMULADOS_DATA: Record<string, SimuladoData> = {
  '1': {
    id: '1',
    titulo: 'Simulado IFMA - Edição 1',
    subtitulo: 'Integrado - 2024',
    duracaoSegundos: 7200,
    questoes: [
      {
        id: 1, numero: 1, materia: 'Matemática',
        enunciado: 'Questão 1: Calcule o valor de x na equação:\n\n2x + 10 = 50\n\nQual é o valor de x?',
        alternativas: [
          { letra: 'A', texto: '10' },
          { letra: 'B', texto: '40' },
          { letra: 'C', texto: '20' },
          { letra: 'D', texto: '80' },
        ],
        gabarito: 'C',
      },
      {
        id: 2, numero: 2, materia: 'Matemática',
        enunciado: 'Questão 2: Uma turma tem 30 alunos. Se 60% são meninas, quantos meninos há na turma?',
        alternativas: [
          { letra: 'A', texto: '12' },
          { letra: 'B', texto: '18' },
          { letra: 'C', texto: '15' },
          { letra: 'D', texto: '20' },
        ],
        gabarito: 'A',
      },
      {
        id: 3, numero: 3, materia: 'Português',
        enunciado: 'Questão 3: Identifique a alternativa em que todas as palavras estão grafadas corretamente:',
        alternativas: [
          { letra: 'A', texto: 'Excessão, exceção, excessivo' },
          { letra: 'B', texto: 'Exceção, excesso, excessivo' },
          { letra: 'C', texto: 'Excessão, excesso, excessivo' },
          { letra: 'D', texto: 'Exceção, excessão, excesso' },
        ],
        gabarito: 'B',
      },
      {
        id: 4, numero: 4, materia: 'Matemática',
        enunciado: 'Questão 4: Qual é a área de um retângulo com base 8 cm e altura 5 cm?',
        alternativas: [
          { letra: 'A', texto: '13 cm²' },
          { letra: 'B', texto: '26 cm²' },
          { letra: 'C', texto: '40 cm²' },
          { letra: 'D', texto: '35 cm²' },
        ],
        gabarito: 'C',
      },
      {
        id: 5, numero: 5, materia: 'Português',
        enunciado: 'Questão 5: Em qual das frases abaixo o uso da vírgula está correto?',
        alternativas: [
          { letra: 'A', texto: 'João, foi ao mercado, e comprou pão.' },
          { letra: 'B', texto: 'João foi ao mercado, e comprou pão.' },
          { letra: 'C', texto: 'João foi ao mercado e, comprou pão.' },
          { letra: 'D', texto: 'Ontem, João foi ao mercado e comprou pão.' },
        ],
        gabarito: 'D',
      },
      {
        id: 6, numero: 6, materia: 'Matemática',
        enunciado: 'Questão 6: Um carro percorre 120 km em 2 horas. Qual é a velocidade média do carro?',
        alternativas: [
          { letra: 'A', texto: '50 km/h' },
          { letra: 'B', texto: '60 km/h' },
          { letra: 'C', texto: '70 km/h' },
          { letra: 'D', texto: '80 km/h' },
        ],
        gabarito: 'B',
      },
      {
        id: 7, numero: 7, materia: 'Português',
        enunciado: 'Questão 7: Assinale a alternativa que apresenta um substantivo coletivo:\n\nUm ___ de músicos tocava na praça.',
        alternativas: [
          { letra: 'A', texto: 'grupo' },
          { letra: 'B', texto: 'banda' },
          { letra: 'C', texto: 'orquestra' },
          { letra: 'D', texto: 'Todas as alternativas estão corretas' },
        ],
        gabarito: 'D',
      },
      {
        id: 8, numero: 8, materia: 'Matemática',
        enunciado: 'Questão 8: Qual é o resultado de 3² + 4²?',
        alternativas: [
          { letra: 'A', texto: '49' },
          { letra: 'B', texto: '25' },
          { letra: 'C', texto: '14' },
          { letra: 'D', texto: '35' },
        ],
        gabarito: 'B',
      },
      {
        id: 9, numero: 9, materia: 'Português',
        enunciado: 'Questão 9: Qual das opções abaixo é um exemplo de linguagem denotativa?',
        alternativas: [
          { letra: 'A', texto: 'Ela tem um coração de pedra.' },
          { letra: 'B', texto: 'O céu estava de brigadeiro.' },
          { letra: 'C', texto: 'A pedra é um mineral sólido.' },
          { letra: 'D', texto: 'Ele engoliu o sapo sem reclamar.' },
        ],
        gabarito: 'C',
      },
      {
        id: 10, numero: 10, materia: 'Matemática',
        enunciado: 'Questão 10: Em uma sequência aritmética, o primeiro termo é 3 e a razão é 4. Qual é o quinto termo?',
        alternativas: [
          { letra: 'A', texto: '15' },
          { letra: 'B', texto: '17' },
          { letra: 'C', texto: '19' },
          { letra: 'D', texto: '23' },
        ],
        gabarito: 'C',
      },
    ],
  },
  '2': {
    id: '2',
    titulo: 'Simulado IFMA - Edição 2',
    subtitulo: 'Integrado - 2024',
    duracaoSegundos: 7200,
    questoes: [
      {
        id: 1, numero: 1, materia: 'Matemática',
        enunciado: 'Questão 1: Resolva a equação: 5x - 15 = 0\n\nQual é o valor de x?',
        alternativas: [
          { letra: 'A', texto: '1' },
          { letra: 'B', texto: '3' },
          { letra: 'C', texto: '5' },
          { letra: 'D', texto: '15' },
        ],
        gabarito: 'B',
      },
      {
        id: 2, numero: 2, materia: 'Português',
        enunciado: 'Questão 2: Qual é o plural correto de "cidadão"?',
        alternativas: [
          { letra: 'A', texto: 'Cidadãos' },
          { letra: 'B', texto: 'Cidadães' },
          { letra: 'C', texto: 'Cidadãos ou cidadães' },
          { letra: 'D', texto: 'Cidadões' },
        ],
        gabarito: 'A',
      },
    ],
  },
};

export function getSimulado(id: string): SimuladoData | null {
  return SIMULADOS_DATA[id] ?? null;
}

export function getTotalQuestoes(id: string): number {
  return SIMULADOS_DATA[id]?.questoes.length ?? 40;
}
