import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  FileText, 
  BookOpen, 
  Tag, 
  HelpCircle, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument: (docId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectDocument 
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    documents: any[];
    topics: any[];
    keywords: any[];
    questions: any[];
  }>({
    documents: [],
    topics: [],
    keywords: [],
    questions: []
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ documents: [], topics: [], keywords: [], questions: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ documents: [], topics: [], keywords: [], questions: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.globalSearch(query.trim());
        setResults(res);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const hasResults = 
    results.documents.length > 0 || 
    results.topics.length > 0 || 
    results.keywords.length > 0 || 
    results.questions.length > 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-indigo-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search documents, syllabus topics, keywords, or exam questions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
          {loading ? (
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin shrink-0" />
          ) : query ? (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <p>Type keywords like <span className="font-semibold text-indigo-500">"Deadlock"</span>, <span className="font-semibold text-indigo-500">"Scheduling"</span>, or <span className="font-semibold text-indigo-500">"Relational Algebra"</span></p>
            </div>
          ) : !hasResults && !loading ? (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No matching documents, topics or questions found for "{query}".
            </div>
          ) : (
            <>
              {/* Documents */}
              {results.documents.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Study Materials ({results.documents.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => {
                          onSelectDocument(doc.id);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group cursor-pointer"
                      >
                        <div className="flex items-center space-x-3 truncate">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                            {doc.file_type?.toUpperCase()}
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                              {doc.title}
                            </p>
                            <p className="text-xs text-slate-400">
                              Subject: {doc.subject}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics */}
              {results.topics.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Key Topics ({results.topics.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.topics.map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSelectDocument(t.document_id);
                          onClose();
                        }}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-100 dark:border-slate-800 text-left transition-colors group cursor-pointer"
                      >
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {t.topic}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-1">
                          In: {t.document_name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {results.keywords.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Matching Keywords</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-2">
                    {results.keywords.map((k, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSelectDocument(k.document_id);
                          onClose();
                        }}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 hover:scale-105 transition-all cursor-pointer"
                      >
                        #{k.keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions */}
              {results.questions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>MCQ Questions ({results.questions.length})</span>
                  </div>
                  <div className="space-y-2">
                    {results.questions.map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                      >
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {q.question}
                        </p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                          Correct Option: {q.correct_answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
