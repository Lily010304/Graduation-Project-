import { useState, useEffect } from 'react';
import { getUserNotebooks, generateQuiz, generateSummary } from '../lib/insightsLM';
import Chat from './instructor/Chat';
import { BookOpen, MessageSquare, FileText, HelpCircle, Loader } from 'lucide-react';

/**
 * Student's Limited InsightsLM Interface
 * Can only: View summaries and take quizzes
 */
export default function StudentNotebooks() {
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [view, setView] = useState('list'); // 'list' | 'chat' | 'summary' | 'quiz'
  const [loading, setLoading] = useState(true);
  
  // Mock student - replace with actual auth
  const userId = 'student-123';

  useEffect(() => {
    loadNotebooks();
  }, []);

  const loadNotebooks = async () => {
    try {
      setLoading(true);
      // TODO: Filter to show only instructor's published notebooks
      const data = await getUserNotebooks(userId);
      setNotebooks(data);
    } catch (error) {
      console.error('Failed to load notebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto bg-[#58ACA9] text-white p-6 rounded-3xl border border-white/30">
        <div className="flex items-center justify-center gap-3">
          <Loader className="w-5 h-5 animate-spin" />
          <span>Loading learning materials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#58ACA9] text-white p-6 rounded-3xl border border-white/30">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Learning Materials</h1>
            <p className="text-sm text-white/80">Study resources by week</p>
          </div>
        </div>
      </div>

      {/* View Router */}
      {view === 'list' && (
        <NotebookList 
          notebooks={notebooks} 
          onSelect={(notebook, viewType) => {
            setSelectedNotebook(notebook);
            setView(viewType);
          }}
        />
      )}

      {view === 'chat' && selectedNotebook && (
        <div className="space-y-4">
          <BackButton onClick={() => setView('list')} />
          <div className="bg-white p-6 rounded-3xl border border-[#0f5a56]/20">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-[#0f5a56]">
                {selectedNotebook.icon} {selectedNotebook.title}
              </h2>
              <p className="text-sm text-[#0f5a56]/60">Week {selectedNotebook.week_number}</p>
            </div>
            <Chat 
              notebookId={selectedNotebook.id} 
              userId={userId}
              userRole="student"
            />
          </div>
        </div>
      )}

      {view === 'summary' && selectedNotebook && (
        <SummaryView 
          notebook={selectedNotebook}
          onBack={() => setView('list')}
        />
      )}

      {view === 'quiz' && selectedNotebook && (
        <QuizView 
          notebook={selectedNotebook}
          onBack={() => setView('list')}
        />
      )}
    </div>
  );
}

/**
 * Notebook List for Students
 */
function NotebookList({ notebooks, onSelect }) {
  if (notebooks.length === 0) {
    return (
      <div className="bg-white text-[#0f5a56] p-12 rounded-3xl border border-[#0f5a56]/20 text-center">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-[#58ACA9]" />
        <h3 className="text-xl font-semibold mb-2">No materials available yet</h3>
        <p className="text-[#0f5a56]/70">Your instructor will add learning materials soon</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {notebooks.map((notebook) => (
        <div
          key={notebook.id}
          className="bg-white text-[#0f5a56] p-6 rounded-3xl border border-[#0f5a56]/20"
        >
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="text-5xl">{notebook.icon || '📚'}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold">{notebook.title}</h3>
                <span className="text-xs bg-[#58ACA9]/10 text-[#58ACA9] px-2 py-1 rounded-full">
                  Week {notebook.week_number}
                </span>
              </div>
              <p className="text-sm text-[#0f5a56]/70 line-clamp-2">
                {notebook.description || 'Learning materials for this week'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onSelect(notebook, 'chat')}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#0f5a56]/10 hover:border-[#58ACA9] hover:bg-[#58ACA9]/5 transition group"
            >
              <MessageSquare className="w-6 h-6 text-[#58ACA9] group-hover:scale-110 transition" />
              <span className="text-xs font-semibold text-[#0f5a56]">Ask AI</span>
            </button>

            <button
              onClick={() => onSelect(notebook, 'summary')}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#0f5a56]/10 hover:border-[#58ACA9] hover:bg-[#58ACA9]/5 transition group"
            >
              <FileText className="w-6 h-6 text-[#58ACA9] group-hover:scale-110 transition" />
              <span className="text-xs font-semibold text-[#0f5a56]">Summary</span>
            </button>

            <button
              onClick={() => onSelect(notebook, 'quiz')}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#0f5a56]/10 hover:border-[#58ACA9] hover:bg-[#58ACA9]/5 transition group"
            >
              <HelpCircle className="w-6 h-6 text-[#58ACA9] group-hover:scale-110 transition" />
              <span className="text-xs font-semibold text-[#0f5a56]">Quiz</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Summary View
 */
function SummaryView({ notebook, onBack }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [notebook.id]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const result = await generateSummary(notebook.id);
      setSummary(result);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />
      <div className="bg-white text-[#0f5a56] p-8 rounded-3xl border border-[#0f5a56]/20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {notebook.icon} {notebook.title} - Summary
          </h2>
          <p className="text-sm text-[#0f5a56]/60">Week {notebook.week_number}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-[#58ACA9]" />
          </div>
        ) : summary ? (
          <div className="prose prose-sm max-w-none">
            <div className="bg-[#58ACA9]/5 p-6 rounded-2xl">
              {summary.content || 'Summary will appear here'}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-[#0f5a56]/60">
            <FileText className="w-12 h-12 mx-auto mb-3 text-[#58ACA9]/30" />
            <p>No summary available yet</p>
            <p className="text-sm mt-2">
              Summary generation is still being implemented
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Quiz View
 */
function QuizView({ notebook, onBack }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [notebook.id]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const result = await generateQuiz(notebook.id, {
        questionCount: 10,
        difficulty: 'medium'
      });
      setQuiz(result);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />
      <div className="bg-white text-[#0f5a56] p-8 rounded-3xl border border-[#0f5a56]/20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {notebook.icon} {notebook.title} - Quiz
          </h2>
          <p className="text-sm text-[#0f5a56]/60">Week {notebook.week_number}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-[#58ACA9]" />
          </div>
        ) : quiz ? (
          <div>
            {/* Quiz content will go here */}
            <div className="text-center py-12 text-[#0f5a56]/60">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-[#58ACA9]/30" />
              <p>Quiz interface coming soon</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-[#0f5a56]/60">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 text-[#58ACA9]/30" />
            <p>Quiz generation is still being implemented</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Back Button Component
 */
function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-sm text-[#58ACA9] hover:underline"
    >
      ← Back to materials
    </button>
  );
}
