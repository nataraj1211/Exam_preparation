import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  Target, 
  MessageSquareText, 
  UploadCloud, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Flame,
  Award,
  Play,
  RotateCw,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardMetrics, DocumentItem } from '../types';

interface DashboardPageProps {
  onOpenUpload: () => void;
  onSelectDocument: (docId: string) => void;
  onNavigateTab: (tab: string) => void;
  onStartQuiz: (docId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onOpenUpload, 
  onSelectDocument, 
  onNavigateTab,
  onStartQuiz 
}) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_study_materials: 2,
    mcqs_attempted: 24,
    average_score: 84,
    doubts_asked: 6,
    study_streak_days: 4
  });
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardMetrics();
      if (res.metrics) setMetrics(res.metrics);
      if (res.recent_documents) setRecentDocs(res.recent_documents);
      if (res.recent_quizzes) setRecentQuizzes(res.recent_quizzes);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white shadow-xl shadow-indigo-500/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-indigo-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exam Mode Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.name || 'Student'}! 🎓
            </h2>
            <p className="text-sm text-indigo-100/90 leading-relaxed">
              Target: <span className="font-semibold">{user?.target_exam || 'MCA / Semester Exams'}</span>. Review your uploaded study notes, resolve doubts, and practice interactive MCQs!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl text-sm font-bold bg-white text-indigo-700 hover:bg-indigo-50 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-indigo-600" />
              <span>Upload Material</span>
            </button>
            <button
              onClick={() => onNavigateTab('materials')}
              className="flex items-center space-x-1.5 px-4 py-3 rounded-2xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs transition-colors cursor-pointer"
            >
              <span>View Library</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 4 Main Dashboard Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Study Materials */}
        <div 
          onClick={() => onNavigateTab('materials')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">📚</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Library</span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {metrics.total_study_materials}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Study Materials Uploaded
            </p>
          </div>
        </div>

        {/* Card 2: MCQs Attempted */}
        <div 
          onClick={() => onNavigateTab('progress')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">📝</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Practice</span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {metrics.mcqs_attempted}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              MCQs Attempted
            </p>
          </div>
        </div>

        {/* Card 3: Average Score */}
        <div 
          onClick={() => onNavigateTab('progress')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">🎯</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Mastery</span>
          </div>
          <div className="mt-4 flex items-baseline space-x-1">
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {metrics.average_score}%
            </p>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">High Grade</span>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Average Score
          </p>
        </div>

        {/* Card 4: Doubts Asked */}
        <div 
          onClick={() => onNavigateTab('doubts')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-pink-400 dark:hover:border-pink-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">💬</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">AI Tutor</span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {metrics.doubts_asked}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Doubts Asked & Solved
            </p>
          </div>
        </div>

      </div>

      {/* Two Column Layout: Recent Files & Recent Quiz Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Recent Uploaded Files */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Recent Uploaded Files
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('materials')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
            >
              <span>View All Files</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentDocs.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm text-slate-500">No study materials uploaded yet.</p>
              <button
                onClick={onOpenUpload}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
              >
                Upload First Material
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-3.5 truncate">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                      {doc.file_type || 'PDF'}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {doc.file_name}
                        </h4>
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                          ✓ Processing completed
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        Subject: <span className="font-medium text-slate-700 dark:text-slate-300">{doc.subject}</span> • Added {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                      {doc.quick_summary && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-1">
                          {doc.quick_summary}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions for Document */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onSelectDocument(doc.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                    >
                      Study Hub
                    </button>
                    <button
                      onClick={() => onStartQuiz(doc.id)}
                      className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Take MCQ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Launch & Quiz History */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Quiz Scores
            </h3>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            {recentQuizzes.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No quizzes attempted yet. Generate an MCQ test to begin!
              </p>
            ) : (
              <div className="space-y-3">
                {recentQuizzes.map((quiz) => (
                  <div 
                    key={quiz.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                        {quiz.document_name}
                      </p>
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                        quiz.percentage >= 80 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}>
                        {quiz.percentage}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Score: {quiz.score} / {quiz.question_count}</span>
                      <span>{quiz.difficulty} Difficulty</span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          quiz.percentage >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${quiz.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => onNavigateTab('mcqs')}
              className="w-full py-2.5 rounded-2xl text-xs font-bold text-center text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors cursor-pointer"
            >
              Start New MCQ Practice Test
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
