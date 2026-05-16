import type { Exam, Question } from '../types/api';
import apiClient from './client';

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
    const { data } = await apiClient.get<any>('/questions/random/', { params });
    const questions = Array.isArray(data) ? data : (data.results || []);
    return questions;
  },

  /** Gerar simulado dinâmico (15 Português + 15 Matemática) */
  async getSimuladoQuestions(examType: string): Promise<Question[]> {
    const { data } = await apiClient.get<any>('/questions/simulated/', {
      params: { exam_type: examType.toLowerCase() },
    });
    const questions = Array.isArray(data) ? data : (data.results || []);
    return questions;
  },


  /** Solicitar explicação por IA */
  async explainQuestion(id: number): Promise<any> {
    const { data } = await apiClient.get<any>(`/questions/${id}/explain/`);
    return data;
  },
};
