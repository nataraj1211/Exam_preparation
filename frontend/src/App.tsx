import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { UploadModal } from './components/UploadModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AuthModal } from './components/AuthModal';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentHubPage } from './pages/DocumentHubPage';
import { MCQQuizPage } from './pages/MCQQuizPage';
import { QuizResultPage } from './pages/QuizResultPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';
import { Loader2 } from 'lucide-react';

interface NavState {
  tab: string;
  docId?: string | null;
  docHubInitialTab?: string;
  quizId?: string | null;
  quizResultData?: any;
}

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, loginDemo } = useAuth();

  // Navigation & Page State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docHubInitialTab, setDocHubInitialTab] = useState<string>('summary');
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [quizResultData, setQuizResultData] = useState<any>(null);
  const [navStack, setNavStack] = useState<NavState[]>([]);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Helper to push to history stack before navigation
  const pushNav = () => {
    setNavStack(prev => [
      ...prev,
      {
        tab: activeTab,
        docId: selectedDocId,
        docHubInitialTab: docHubInitialTab,
        quizId: activeQuizId,
        quizResultData: quizResultData
      }
    ]);
  };

  const handleGoBack = () => {
    if (navStack.length > 0) {
      const lastState = navStack[navStack.length - 1];
      setNavStack(prev => prev.slice(0, -1));
      setActiveTab(lastState.tab);
      if (lastState.docId !== undefined) setSelectedDocId(lastState.docId);
      if (lastState.docHubInitialTab !== undefined) setDocHubInitialTab(lastState.docHubInitialTab);
      if (lastState.quizId !== undefined) setActiveQuizId(lastState.quizId);
      if (lastState.quizResultData !== undefined) setQuizResultData(lastState.quizResultData);
    } else {
      setActiveTab('dashboard');
    }
  };

  // Keyboard shortcut for search (Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm font-semibold tracking-wide">Starting StudyMate AI Platform...</p>
      </div>
    );
  }

  // If not logged in, show Landing Page
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage
          onGetStarted={() => {
            setAuthModalMode('register');
            setShowAuthModal(true);
          }}
          onDemoLogin={async () => {
            await loginDemo();
            setActiveTab('dashboard');
          }}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode={authModalMode}
        />
      </>
    );
  }

  // Navigation handlers
  const handleSelectDocument = (docId: string, initialTab: string = 'summary') => {
    pushNav();
    setSelectedDocId(docId);
    setDocHubInitialTab(initialTab);
    setActiveTab('dochub');
  };

  const handleStartQuizFromDoc = async (docId?: string) => {
    let targetDocId = docId;
    if (!targetDocId) {
      try {
        const res = await api.getDocuments();
        if (res.documents && res.documents.length > 0) {
          targetDocId = res.documents[0].id;
        } else {
          setShowUploadModal(true);
          return;
        }
      } catch (e) {
        setShowUploadModal(true);
        return;
      }
    }

    if (!targetDocId) return;

    try {
      const res = await api.generateQuiz({
        document_id: targetDocId,
        count: 10,
        difficulty: 'Medium',
        topic: 'Entire document'
      });
      pushNav();
      setActiveQuizId(res.quiz.id);
      setActiveTab('mcq_active');
    } catch (err: any) {
      alert(err.message || 'Failed to start quiz');
    }
  };

  const handleLaunchConfiguredQuiz = async (docId: string, count: number, difficulty: string, topic: string) => {
    try {
      const res = await api.generateQuiz({
        document_id: docId,
        count,
        difficulty,
        topic
      });
      pushNav();
      setActiveQuizId(res.quiz.id);
      setActiveTab('mcq_active');
    } catch (err: any) {
      alert(err.message || 'Failed to generate quiz');
    }
  };

  const handleFinishQuiz = (result: any) => {
    pushNav();
    setQuizResultData(result);
    setActiveTab('quiz_result');
  };

  const handleRetryQuiz = async (quizId: string) => {
    try {
      const res = await api.retryQuiz(quizId);
      pushNav();
      setActiveQuizId(res.quiz.id);
      setActiveTab('mcq_active');
    } catch (err) {
      alert('Failed to retry quiz.');
    }
  };

  const handleTabSelection = (tab: string) => {
    if (tab === 'doubts') {
      if (selectedDocId) {
        pushNav();
        setDocHubInitialTab('chat');
        setActiveTab('dochub');
      } else {
        api.getDocuments().then(res => {
          if (res.documents?.[0]) {
            pushNav();
            setSelectedDocId(res.documents[0].id);
            setDocHubInitialTab('chat');
            setActiveTab('dochub');
          } else {
            setShowUploadModal(true);
          }
        });
      }
      return;
    }

    if (tab === 'mcqs') {
      if (selectedDocId) {
        pushNav();
        setDocHubInitialTab('mcq_generator');
        setActiveTab('dochub');
      } else {
        api.getDocuments().then(res => {
          if (res.documents?.[0]) {
            pushNav();
            setSelectedDocId(res.documents[0].id);
            setDocHubInitialTab('mcq_generator');
            setActiveTab('dochub');
          } else {
            setShowUploadModal(true);
          }
        });
      }
      return;
    }

    if (tab !== activeTab) {
      pushNav();
      setActiveTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      
      {/* Top Navbar */}
      <Navbar
        onOpenUpload={() => setShowUploadModal(true)}
        onOpenSearch={() => setShowSearchModal(true)}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        activePage={activeTab}
        onGoBack={handleGoBack}
        canGoBack={activeTab !== 'dashboard' || navStack.length > 0}
      />

      {/* Main Body with Sidebar & Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleTabSelection}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-w-0">
          
          {activeTab === 'dashboard' && (
            <DashboardPage
              onOpenUpload={() => setShowUploadModal(true)}
              onSelectDocument={(id) => handleSelectDocument(id, 'summary')}
              onNavigateTab={handleTabSelection}
              onStartQuiz={(id) => handleStartQuizFromDoc(id)}
            />
          )}

          {activeTab === 'materials' && (
            <DocumentsPage
              onOpenUpload={() => setShowUploadModal(true)}
              onSelectDocument={handleSelectDocument}
              onStartQuiz={(id) => handleStartQuizFromDoc(id)}
              onBack={handleGoBack}
            />
          )}

          {activeTab === 'dochub' && selectedDocId && (
            <DocumentHubPage
              documentId={selectedDocId}
              initialTab={docHubInitialTab}
              onBack={handleGoBack}
              onLaunchQuiz={handleLaunchConfiguredQuiz}
            />
          )}

          {activeTab === 'mcq_active' && activeQuizId && (
            <MCQQuizPage
              quizId={activeQuizId}
              onFinishQuiz={handleFinishQuiz}
              onExit={handleGoBack}
            />
          )}

          {activeTab === 'quiz_result' && quizResultData && (
            <QuizResultPage
              quizResult={quizResultData}
              onRetryQuiz={handleRetryQuiz}
              onGenerateNew={(docId) => handleSelectDocument(docId, 'mcq_generator')}
              onBackToSummary={(docId) => handleSelectDocument(docId, 'summary')}
              onBack={handleGoBack}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressPage
              onStartQuiz={() => handleStartQuizFromDoc()}
              onBack={handleGoBack}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage onBack={handleGoBack} />
          )}

        </main>
      </div>

      {/* Global Modals */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={(uploadedDoc) => {
          handleSelectDocument(uploadedDoc.id, 'summary');
        }}
      />

      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectDocument={(docId) => handleSelectDocument(docId, 'summary')}
      />

    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
