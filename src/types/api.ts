// ── Auth ──────────────────────────────────────────────────────
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

// ── Profile / Stats ───────────────────────────────────────────
export interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  progress_pct: number;
  xp_to_next_level: number;
}

export interface UserStats {
  total_questions: number;
  total_correct: number;
  accuracy_pct: number;
  level: number;
  xp: number;
  progress_pct: number;
  xp_to_next_level: number;
}


// ── Exams & Questions ─────────────────────────────────────────
export interface Exam {
  id: number;
  name: string;
  year: number;
  exam_type: string;
  questions_count: number;
}

export interface Alternative {
  id: number;
  letter: string;
  text: string;
}

export interface Question {
  id: number;
  exam?: number;
  exam_id?: number;
  exam_name?: string;
  subject: string;
  number: number;
  statement: string;
  alternatives: Alternative[];
  attachments?: Attachment[];
}

export interface Attachment {
  id: number;
  type: 'text' | 'image';
  label?: string;
  content: string;
  order: number;
  file?: string;
}

// ── Sessions ──────────────────────────────────────────────────
export type SessionType = 'quick' | 'simulated' | 'practice';

export interface StartSessionPayload {
  type: SessionType;
  question_ids: number[];
}

export interface Session {
  id: number;
  type: SessionType;
  status: 'in_progress' | 'finished';
  question_ids: number[];
  started_at: string;
  finished_at?: string;
  duration_seconds?: number;
  total_questions: number;
  correct_answers: number;
  accuracy_pct: number;
  xp_earned: number;
}

export interface AnswerPayload {
  question_id: number;
  alternative_id: number;
  response_time: number;
}

export interface AnswerResult {
  is_correct: boolean;
  correct_letter: string;
  correct_alternative_id: number;
  xp_earned: number;
}

export interface FinishSessionPayload {
  duration_seconds: number;
}

export interface SessionResult {
  id: number;
  type: SessionType;
  total_questions: number;
  correct_answers: number;
  accuracy_pct: number;
  xp_earned: number;
  duration_seconds: number;
  missions_updated: MissionProgress[];
}

export interface SessionHistoryItem {
  id: number;
  type: SessionType;
  total_questions: number;
  correct_answers: number;
  accuracy_pct: number;
  xp_earned: number;
  duration_seconds: number;
  finished_at: string;
}

// ── Missions ──────────────────────────────────────────────────
export interface Mission {
  id: number;
  title: string;
  description: string;
  xp_reward: number;
  target: number;
}

export interface MissionProgress {
  id: number;
  mission?: Mission;
  title?: string;
  target?: number;
  progress: number;
  completed: boolean;
  xp_claimed: boolean;
}



// ── Progress ──────────────────────────────────────────────────
export interface SubjectProgress {
  subject: string;
  questions_answered: number;
  correct_answers: number;
  accuracy: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AIUsage {
  used: number;
  limit: number;
  remaining: number;
}

// ── Dashboard ─────────────────────────────────────────────────
export interface Dashboard {
  level: number;
  xp: number;
  progress_pct: number;
  xp_to_next_level: number;
  ai_usage: AIUsage;
  daily_missions: MissionProgress[];
  recent_sessions: SessionHistoryItem[];
  subject_progress: SubjectProgress[];
}
