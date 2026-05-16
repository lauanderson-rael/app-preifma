import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
} from 'react';
import { sessionService } from '../api/sessionService';
import type {
  AnswerResult,
  Question,
  SessionResult,
  SessionType,
} from '../types/api';

// ── State ─────────────────────────────────────────────────────
interface QuestionAnswer {
  questionId: number;
  alternativeId: number;
  isCorrect: boolean;
  correctLetter: string;
  responseTime: number;
}

interface SessionState {
  sessionId: number | null;
  type: SessionType | null;
  questions: Question[];
  currentIndex: number;
  answers: QuestionAnswer[];
  lastAnswerResult: AnswerResult | null;
  result: SessionResult | null;
  isLoading: boolean;
  error: string | null;
  startedAt: number | null; // timestamp ms
}

type SessionAction =
  | { type: 'START_SESSION'; payload: { sessionId: number; type: SessionType; questions: Question[] } }
  | { type: 'ANSWER_SUBMITTED'; payload: { answer: QuestionAnswer; result: AnswerResult } }
  | { type: 'NEXT_QUESTION' }
  | { type: 'SESSION_FINISHED'; payload: SessionResult }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };

const initialState: SessionState = {
  sessionId: null,
  type: null,
  questions: [],
  currentIndex: 0,
  answers: [],
  lastAnswerResult: null,
  result: null,
  isLoading: false,
  error: null,
  startedAt: null,
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...initialState,
        sessionId: action.payload.sessionId,
        type: action.payload.type,
        questions: action.payload.questions,
        startedAt: Date.now(),
        isLoading: false,
      };
    case 'ANSWER_SUBMITTED':
      return {
        ...state,
        answers: [...state.answers, action.payload.answer],
        lastAnswerResult: action.payload.result,
        isLoading: false,
      };
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        lastAnswerResult: null,
      };
    case 'SESSION_FINISHED':
      return { ...state, result: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────
interface SessionContextValue extends SessionState {
  currentQuestion: Question | null;
  isLastQuestion: boolean;
  elapsedSeconds: () => number;
  submitAnswer: (alternativeId: number, responseTime: number) => Promise<AnswerResult | null>;
  nextQuestion: () => void;
  finishSession: () => Promise<SessionResult | null>;
  resetSession: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const currentQuestion = state.questions[state.currentIndex] ?? null;
  const isLastQuestion = state.currentIndex >= state.questions.length - 1;

  const elapsedSeconds = useCallback((): number => {
    if (!state.startedAt) return 0;
    return Math.floor((Date.now() - state.startedAt) / 1000);
  }, [state.startedAt]);

  const submitAnswer = useCallback(
    async (alternativeId: number, responseTime: number): Promise<AnswerResult | null> => {
      if (!state.sessionId || !currentQuestion) return null;
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const result = await sessionService.submitAnswer(state.sessionId, {
          question_id: currentQuestion.id,
          alternative_id: alternativeId,
          response_time: responseTime,
        });
        const answer: QuestionAnswer = {
          questionId: currentQuestion.id,
          alternativeId,
          isCorrect: result.is_correct,
          correctLetter: result.correct_letter,
          responseTime,
        };
        dispatch({ type: 'ANSWER_SUBMITTED', payload: { answer, result } });
        return result;
      } catch (err: any) {
        dispatch({ type: 'SET_ERROR', payload: err?.message ?? 'Erro ao enviar resposta' });
        return null;
      }
    },
    [state.sessionId, currentQuestion],
  );

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  const finishSession = useCallback(async (): Promise<SessionResult | null> => {
    if (!state.sessionId) return null;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const duration = elapsedSeconds();
      const result = await sessionService.finishSession(state.sessionId, {
        duration_seconds: duration,
      });
      dispatch({ type: 'SESSION_FINISHED', payload: result });
      return result;
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message ?? 'Erro ao finalizar sessão' });
      return null;
    }
  }, [state.sessionId, elapsedSeconds]);

  const resetSession = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <SessionContext.Provider
      value={{
        ...state,
        currentQuestion,
        isLastQuestion,
        elapsedSeconds,
        submitAnswer,
        nextQuestion,
        finishSession,
        resetSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────
export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
