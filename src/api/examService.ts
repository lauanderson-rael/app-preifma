import apiClient from './client';
import type { Exam, Question } from '../types/api';

export const examService = {
  /** Listar todas as provas */
  async listExams(): Promise<Exam[]> {
    const { data } = await apiClient.get<Exam[]>('/exams/');
    return data;
  },

  /** Detalhe de uma prova */
  async getExam(id: number): Promise<Exam> {
    const { data } = await apiClient.get<Exam>(`/exams/${id}/`);
    return data;
  },

  /** Questões de uma prova específica */
  async getExamQuestions(examId: number): Promise<Question[]> {
    const { data } = await apiClient.get<Question[]>(`/exams/${examId}/questions/`);
    return data;
  },

  /** Questão individual */
  async getQuestion(id: number): Promise<Question> {
    const { data } = await apiClient.get<Question>(`/questions/${id}/`);
    return data;
  },

  /** Questões aleatórias com filtros opcionais */
  async getRandomQuestions(params: {
    count?: number;
    subject?: 'portugues' | 'matematica';
    exam_type?: string;
  }): Promise<Question[]> {
    const { data } = await apiClient.get<Question[]>('/questions/random/', {
      params,
    });
    return data;
  },
};
