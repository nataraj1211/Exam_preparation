import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  MessageSquareText, 
  HelpCircle, 
  Layers, 
  Award, 
  ArrowLeft, 
  FileText, 
  Send, 
  Trash2, 
  Sparkles, 
  Copy, 
  Check, 
  FileDown, 
  RotateCw,
  Lightbulb,
  ExternalLink,
  Loader2,
  ChevronRight,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem, Summary, Flashcard, ExamQuestion, ChatMessage } from '../types';
import { FlashcardViewer } from '../components/FlashcardViewer';
import { PDFExportButton } from '../components/PDFExportButton';

interface DocumentHubPageProps {
  documentId: string;
  initialTab?: string;
  onBack: () => void;
  onLaunchQuiz: (docId: string, count: number, difficulty: string, topic: string) => void;
}

export const DocumentHubPage: React.FC<DocumentHubPageProps> = ({ 
  documentId, 
  initialTab = 'summary', 
  onBack, 
  onLaunchQuiz 
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'Explain this topic simply',
    'Give an example',
    'Explain for 2 marks',
    'Explain for 16 marks',
    'What are the important points for exams?'
  ]);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // MCQ Configurator states
  const [quizCount, setQuizCount] = useState<number>(10);
  const [quizDifficulty, setQuizDifficulty] = useState<string>('Medium');
  const [quizTopic, setQuizTopic] = useState<string>('Entire document');
  const [generatingQuiz, setGeneratingQuiz] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDocumentDetails();
    loadChatHistory();
  }, [documentId]);

  useEffect(() => {
    if (activeTab === 'chat') {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, activeTab]);

  const loadDocumentDetails = async () => {
    try {
      setLoading(true);
      const res = await api.getDocument(documentId);
      setDoc(res.document);
      setSummary(res.summary);
      setFlashcards(res.flashcards || []);
      setExamQuestions(res.exam_questions || []);
    } catch (err) {
      console.error('Failed to load document details:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      const res = await api.getChatHistory(documentId);
      setMessages(res.messages || []);
      if (res.suggested_questions) {
        setSuggestedQuestions(res.suggested_questions);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const handleSendChat = async (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text || chatLoading) return;

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      document_id: documentId,
      role: 'user',
      message: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await api.sendDoubt(documentId, text);
      setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), res.user_message, res.ai_message]);
    } catch (err: any) {
      alert(err.message || 'Failed to get answer from AI tutor.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!confirm('Clear all doubt questions and answers for this document?')) return;
    try {
      await api.clearChat(documentId);
      setMessages([]);
    } catch (err) {
      alert('Failed to clear chat.');
    }
  };

  const handleCopyAnswer = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleStartMCQ = async () => {
    setGeneratingQuiz(true);
    try {
      onLaunchQuiz(documentId, quizCount, quizDifficulty, quizTopic);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
        <p className="text-sm text-slate-500">Loading study material dossier...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sm text-slate-500">Document not found.</p>
        <button onClick={onBack} className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white">
          Back to Study Materials
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Document Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 truncate">
            <button
              onClick={onBack}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0 border border-slate-200/80 dark:border-slate-700/80 active:scale-95 shadow-2xs"
              title="Back to previous page"
              aria-label="Back to previous page"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Back</span>
            </button>

            <div className="truncate">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 uppercase">
                  {doc.subject}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>AI Processed</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate mt-0.5">
                {doc.file_name}
              </h2>
            </div>
          </div>

          {/* Export & Actions */}
          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
            {summary && (
              <PDFExportButton
                type="summary"
                data={summary}
                title={doc.file_name}
              />
            )}
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center space-x-2 overflow-x-auto border-t border-slate-100 dark:border-slate-800 pt-3">
          {[
            { id: 'summary', label: 'Summary & Concepts', icon: BookOpen },
            { id: 'exam_questions', label: 'Important Questions (2/5/16M)', icon: Award },
            { id: 'flashcards', label: 'Revision Flashcards', icon: Layers },
            { id: 'chat', label: 'Ask Doubts (AI Chat)', icon: MessageSquareText },
            { id: 'mcq_generator', label: 'MCQ Practice Quiz', icon: HelpCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* TAB CONTENT 1: SUMMARY & CONCEPTS */}
      {activeTab === 'summary' && summary && (
        <div className="space-y-6">
          
          {/* Quick Summary Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-purple-50/70 to-pink-50/70 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-pink-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold uppercase tracking-wider">
                Quick Summary
              </h3>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {summary.quick_summary}
            </p>
          </div>

          {/* Important Topics & Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Topics */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-base font-bold">Important Topics</h3>
              </div>
              <ul className="space-y-2.5">
                {(summary.important_topics || []).map((topic, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Keywords */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                <Lightbulb className="w-5 h-5" />
                <h3 className="text-base font-bold">Important Keywords</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {(summary.keywords || []).map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Detailed Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Detailed Study Notes
            </h3>
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-4 font-normal">
              {summary.detailed_summary}
            </div>
          </div>

          {/* Key Definitions & Formulas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Definitions */}
            {summary.definitions && summary.definitions.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Important Definitions
                </h3>
                <div className="space-y-3">
                  {summary.definitions.map((def, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                        {def.term}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {def.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Formulas */}
            {summary.formulas && summary.formulas.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Mathematical Formulas & Conditions
                </h3>
                <div className="space-y-3">
                  {summary.formulas.map((form, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 font-mono">
                      <p className="text-xs font-bold text-purple-600 dark:text-purple-400 font-sans">
                        {form.name}
                      </p>
                      <p className="text-xs bg-white dark:bg-slate-900 p-2 rounded-xl text-slate-900 dark:text-emerald-400 border border-slate-200 dark:border-slate-800">
                        {form.formula}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Exam Focus Strip (2 Marks, 5 Marks, 10/16 Marks) */}
          {summary.exam_focus && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    🎯 Exam Focus
                  </h3>
                  <p className="text-xs text-slate-500">
                    Targeted concepts frequently tested in 2-mark, 5-mark, and 10/16-mark university questions
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('exam_questions')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                >
                  <span>View Full Question Bank</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 2-Marks */}
                <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                  <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    2 Marks Questions
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {(summary.exam_focus.two_marks || []).slice(0, 3).map((q, i) => (
                      <li key={i}>• {q}</li>
                    ))}
                  </ul>
                </div>

                {/* 5-Marks */}
                <div className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 space-y-2">
                  <span className="text-xs font-extrabold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                    5 Marks Questions
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {(summary.exam_focus.five_marks || []).slice(0, 3).map((q, i) => (
                      <li key={i}>• {q}</li>
                    ))}
                  </ul>
                </div>

                {/* 10/16-Marks */}
                <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-2">
                  <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                    10 / 16 Marks Questions
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {(summary.exam_focus.ten_sixteen_marks || []).slice(0, 2).map((q, i) => (
                      <li key={i}>• {q}</li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT 2: IMPORTANT EXAM QUESTIONS */}
      {activeTab === 'exam_questions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                University Exam Question Bank
              </h3>
              <p className="text-xs text-slate-500">
                High-probability questions categorized by mark weightage with scoring keys
              </p>
            </div>
            {examQuestions.length > 0 && (
              <PDFExportButton
                type="questions"
                data={examQuestions}
                title={`${doc.file_name} - Exam Questions`}
              />
            )}
          </div>

          <div className="space-y-4">
            {examQuestions.map((q, idx) => (
              <div 
                key={q.id || idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                    q.mark_category === '2_marks'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                      : q.mark_category === '5_marks'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400'
                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400'
                  }`}>
                    {q.mark_category.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">Exam Priority: High</span>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Q{idx + 1}: {q.question}
                </h4>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                  <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                    Suggested Answer Outline:
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {q.answer_outline}
                  </p>
                  {q.key_points && q.key_points.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 space-y-1">
                      <p className="font-semibold text-slate-600 dark:text-slate-400 text-[11px] uppercase tracking-wider">
                        Key Points for Full Marks:
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                        {q.key_points.map((pt, pIdx) => (
                          <li key={pIdx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: REVISION FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="py-4">
          <FlashcardViewer flashcards={flashcards} title={doc.file_name} />
        </div>
      )}

      {/* TAB CONTENT 4: ASK DOUBTS (AI CHATBOT) */}
      {activeTab === 'chat' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[650px] overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center">
                <MessageSquareText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ask Doubts – AI Document Tutor
                </h3>
                <p className="text-[11px] text-slate-400">
                  Scoped strictly to: <span className="font-medium text-slate-600 dark:text-slate-300">{doc.file_name}</span>
                </p>
              </div>
            </div>

            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Chat</span>
              </button>
            )}
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Ask any doubt about this document
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    I will answer using the verified text from your uploaded syllabus material with citations.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 mb-1 text-[11px] text-slate-400 px-1">
                    <span>{m.role === 'user' ? 'You' : 'StudyMate AI'}</span>
                    <span>•</span>
                    <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed whitespace-pre-line relative group ${
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-md shadow-indigo-500/10'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {m.message}

                    {/* Citations badge */}
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-wrap gap-1">
                        {m.citations.map((cite, cIdx) => (
                          <span
                            key={cIdx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                          >
                            📖 {cite}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Copy button for assistant answers */}
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => handleCopyAnswer(m.id, m.message)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-white/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-opacity"
                        title="Copy Answer"
                      >
                        {copiedMsgId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {chatLoading && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span>AI Tutor is researching document context...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Questions Pills */}
          <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 overflow-x-auto flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Suggestions:
            </span>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChat(q)}
                disabled={chatLoading}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                "{q}"
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Ask doubt: e.g. What is deadlock? Or explain scheduling for 5 marks..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
                className="flex-1 px-4 py-3 rounded-2xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="flex items-center space-x-1.5 px-5 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>Ask Doubt</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* TAB CONTENT 5: MCQ GENERATOR & LAUNCHER */}
      {activeTab === 'mcq_generator' && (
        <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center font-bold text-lg">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              AI Multiple Choice Question Generator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize question count, difficulty, and topics to generate a personalized practice test
            </p>
          </div>

          <div className="space-y-5 pt-2">
            
            {/* Number of Questions: 5, 10, 15, 20 */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Number of Questions
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuizCount(num)}
                    className={`py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                      quizCount === num
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                    }`}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty: Easy, Medium, Hard, Mixed */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-4 gap-3">
                {['Easy', 'Medium', 'Hard', 'Mixed'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setQuizDifficulty(diff)}
                    className={`py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                      quizDifficulty === diff
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic: Entire document or Specific topic */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Target Topic
              </label>
              <select
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Entire document">Entire Document ({doc.file_name})</option>
                {(summary?.important_topics || []).map((t, idx) => (
                  <option key={idx} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Generate & Launch Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleStartMCQ}
                disabled={generatingQuiz}
                className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:opacity-95 shadow-xl shadow-indigo-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {generatingQuiz ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Synthesizing MCQs from Study Material...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate & Start MCQs ({quizCount} Questions)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
