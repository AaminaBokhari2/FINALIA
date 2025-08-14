import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './contexts/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { StudyTabs } from './components/StudyTabs';
import { SummaryTab } from './components/SummaryTab';
import { FlashcardTab } from './components/FlashcardTab';
import { QuizTab } from './components/QuizTab';
import { QATab } from './components/QATab';
import { ResearchTab } from './components/ResearchTab';
import { VideosTab } from './components/VideosTab';
import { ResourcesTab } from './components/ResourcesTab';
import { StudyNotesTab } from './components/StudyNotesTab';
import { StudyPlannerTab } from './components/StudyPlannerTab';
import { FocusTimerTab } from './components/FocusTimerTab';
import { CitationsTab } from './components/CitationsTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { BookmarksTab } from './components/BookmarksTab';
import { PresentationTab } from './components/PresentationTab';
import { MindMapTab } from './components/MindMapTab';
import { FullPageLoader } from './components/LoadingSpinner';
import { InteractiveBackground, FloatingShapes } from './components/InteractiveBackground';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
  const { state } = useApp();

  // Apply theme to document
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const renderTabContent = () => {
    switch (state.currentTab) {
      case 'summary':
        return <SummaryTab />;
      case 'flashcards':
        return <FlashcardTab />;
      case 'quiz':
        return <QuizTab />;
      case 'qa':
        return <QATab />;
      case 'notes':
        return <StudyNotesTab />;
      case 'planner':
        return <StudyPlannerTab />;
      case 'timer':
        return <FocusTimerTab />;
      case 'research':
        return <ResearchTab />;
      case 'videos':
        return <VideosTab />;
      case 'resources':
        return <ResourcesTab />;
      case 'citations':
        return <CitationsTab />;
      case 'mindmap':
        return <MindMapTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'bookmarks':
        return <BookmarksTab />;
      case 'presentation':
        return <PresentationTab />;
      default:
        return <SummaryTab />;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-500 relative overflow-hidden particle-bg">
      {/* Interactive Background */}
      <InteractiveBackground />
      <FloatingShapes />
      
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {!state.session.active ? (
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <FileUpload />
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              className="space-y-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
            <StudyTabs />
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <AnimatePresence>
        {state.isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FullPageLoader text="Processing your document with AI" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: state.theme === 'dark' ? '#374151' : '#ffffff',
            color: state.theme === 'dark' ? '#f9fafb' : '#111827',
            border: `1px solid ${state.theme === 'dark' ? '#4b5563' : '#e5e7eb'}`,
            borderRadius: '16px',
            padding: '20px',
            fontSize: '15px',
            fontWeight: '600',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;