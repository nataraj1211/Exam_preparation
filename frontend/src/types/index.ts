export interface User {
  id: string;
  name: string;
  email: string;
  target_exam?: string;
  college_name?: string;
  department?: string;
  phone?: string;
  login_count?: number;
  last_login_at?: string;
  created_at?: string;
}

export interface DocumentItem {
  id: string;
  user_id: string;
  file_name: string;
  file_type: 'pdf' | 'docx' | 'pptx' | 'txt' | string;
  file_size: number;
  file_url: string;
  subject: string;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  has_summary?: boolean;
  quick_summary?: string;
  topics_count?: number;
  flashcard_count?: number;
  quiz_count?: number;
}

export interface DefinitionItem {
  term: string;
  definition: string;
}

export interface FormulaItem {
  name: string;
  formula: string;
}

export interface ExamFocus {
  two_marks: string[];
  five_marks: string[];
  ten_sixteen_marks: string[];
}

export interface Summary {
  id: string;
  document_id: string;
  quick_summary: string;
  detailed_summary: string;
  important_topics: string[];
  keywords: string[];
  definitions: DefinitionItem[];
  formulas: FormulaItem[];
  exam_focus: ExamFocus;
  created_at: string;
}

export interface Flashcard {
  id: string;
  document_id: string;
  front: string;
  back: string;
  topic?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface ExamQuestion {
  id: string;
  document_id: string;
  mark_category: '2_marks' | '5_marks' | '10_marks' | '16_marks';
  question: string;
  answer_outline: string;
  key_points: string[];
}

export interface ChatMessage {
  id: string;
  document_id: string;
  role: 'user' | 'assistant';
  message: string;
  citations?: string[];
  created_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface QuizAnswer {
  id?: string;
  quiz_id: string;
  question_id: string;
  selected_answer: 'A' | 'B' | 'C' | 'D' | null;
  is_correct: boolean;
  is_marked_for_review: boolean;
}

export interface Quiz {
  id: string;
  user_id: string;
  document_id: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  question_count: number;
  score: number;
  percentage: number;
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  time_taken_seconds: number;
  status: 'in_progress' | 'completed';
  created_at: string;
  document_name?: string;
}

export interface QuestionReviewItem {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  user_answer: string | null;
  is_correct: boolean;
  is_skipped: boolean;
  explanation: string;
}

export interface DashboardMetrics {
  total_study_materials: number;
  mcqs_attempted: number;
  average_score: number;
  doubts_asked: number;
  study_streak_days: number;
}

export interface ProgressAnalytics {
  total_documents: number;
  total_quizzes: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  skipped_answers: number;
  average_percentage: number;
  topic_performance: Array<{
    subject: string;
    percentage: number;
    quizzes: number;
    accuracy: string;
  }>;
}
