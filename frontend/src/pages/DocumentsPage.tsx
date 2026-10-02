import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  UploadCloud, 
  FileText, 
  MessageSquareText, 
  HelpCircle, 
  Trash2, 
  Layers, 
  Clock, 
  Sparkles,
  Filter,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem } from '../types';

interface DocumentsPageProps {
  onOpenUpload: () => void;
  onSelectDocument: (docId: string, initialTab?: string) => void;
  onStartQuiz: (docId: string) => void;
  onBack?: () => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ 
  onOpenUpload, 
  onSelectDocument, 
  onStartQuiz,
  onBack
}) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    loadDocuments();
  }, [searchQuery, selectedSubject]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.getDocuments({
        q: searchQuery,
        subject: selectedSubject !== 'all' ? selectedSubject : undefined
      });
      setDocuments(res.documents || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: string, docName: string) => {
    if (!confirm(`Are you sure you want to delete "${docName}" and all associated study materials, quizzes, and chats?`)) {
      return;
    }
    try {
      await api.deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      alert('Failed to delete document.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Unique subjects for filtering
  const subjects = ['all', ...Array.from(new Set(documents.map(d => d.subject).filter(Boolean)))];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Back Navigation */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer w-fit"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-indigo-500" />
          <span>Back to Dashboard</span>
        </button>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <span>📚 My Study Materials</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access your uploaded notes, AI summaries, RAG doubts, and practice questions
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Material</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search study materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {sub === 'all' ? 'All Subjects' : sub}
            </button>
          ))}
        </div>

      </div>

      {/* Document Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Study Materials Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upload your syllabus units, slides, or chapter PDFs to start AI preparation.
            </p>
          </div>
          <button
            onClick={onOpenUpload}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            Upload Study Material
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
            >
              {/* Card Top */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm uppercase shadow-inner">
                    {doc.file_type || 'PDF'}
                  </div>

                  <button
                    onClick={() => handleDelete(doc.id, doc.file_name)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete Material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {doc.subject || 'Computer Science'}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 mt-0.5" title={doc.file_name}>
                    {doc.file_name}
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center space-x-1.5">
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>•</span>
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </p>
                </div>

                {doc.quick_summary && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {doc.quick_summary}
                  </p>
                )}
              </div>

              {/* Card Bottom: Summary, Ask Doubt, Generate MCQ Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectDocument(doc.id, 'summary')}
                    className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Summary</span>
                  </button>

                  <button
                    onClick={() => onSelectDocument(doc.id, 'chat')}
                    className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-slate-700 dark:text-slate-200 hover:text-purple-600 transition-colors cursor-pointer"
                  >
                    <MessageSquareText className="w-3.5 h-3.5" />
                    <span>Ask Doubt</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectDocument(doc.id, 'flashcards')}
                    className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Flashcards</span>
                  </button>

                  <button
                    onClick={() => onStartQuiz(doc.id)}
                    className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Generate MCQ</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
