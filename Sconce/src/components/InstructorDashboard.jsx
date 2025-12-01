import '../index.css';
import { useEffect, useMemo, useState } from 'react';
import InstructorLayout from './InstructorLayout';
import InstructorHomeDashboard from './InstructorHomeDashboard';
import InstructorCourseList from './InstructorCourseList';
import InstructorCourseEditor from './InstructorCourseEditor';
import * as store from '../lib/instructorStore';
import ExamsBuilder from './instructor/ExamsBuilder';
import InstructorNotebooks from './instructor/Notebooks';
import NotebookPage from './notebook/NotebookPage';

// Placeholder pages to be fleshed out
function InstructorMessagesPage() { return <div className="max-w-6xl mx-auto bg-[#58ACA9] text-white p-6 rounded-3xl border border-white/30">Messages coming soon.</div>; }
function InstructorSchedulePage() { return <div className="max-w-6xl mx-auto bg-[#58ACA9] text-white p-6 rounded-3xl border border-white/30">Schedule calendar coming soon.</div>; }

export default function InstructorDashboard() {
  const [route, setRoute] = useState(() => (store.parseInstructorHash ? store.parseInstructorHash(window.location.hash) : { view: 'home' }));
  useEffect(() => {
    const onChange = () => setRoute(store.parseInstructorHash ? store.parseInstructorHash(window.location.hash) : { view: 'home' });
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const active = useMemo(() => {
    if (route.view === 'home') return 'home';
    if (route.view === 'courses' || route.view === 'course' || route.view === 'quiz') return 'courses';
    if (route.view === 'notebooks' || route.view === 'notebook') return 'notebooks';
    return route.view;
  }, [route]);

  return (
    <InstructorLayout active={active} isNotebookView={route.view === 'notebook'}>
      {route.view === 'home' && <InstructorHomeDashboard />}
      {route.view === 'courses' && <InstructorCourseList />}
      {route.view === 'course' && <InstructorCourseEditor courseId={route.courseId} />}
      {route.view === 'quiz' && <ExamsBuilder quizId={route.quizId} courseId={route.courseId} weekId={route.weekId} />}
      {route.view === 'notebooks' && <InstructorNotebooks />}
      {route.view === 'notebook' && <NotebookPage notebookId={route.notebookId} />}
      {route.view === 'messages' && <InstructorMessagesPage />}
      {route.view === 'schedule' && <InstructorSchedulePage />}
    </InstructorLayout>
  );
}
