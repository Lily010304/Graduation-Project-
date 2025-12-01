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
function InstructorAssessmentsPage() { return <div className="max-w-6xl mx-auto bg-[#58ACA9] text-white p-6 rounded-3xl border border-white/30">Assessments management coming soon.</div>; }
function InstructorGradingPage() { return <div className="max-w-6xl mx-auto bg-[#58ACA9] text-white p-6 rounded-3xl border border-white/30">Grading workspace coming soon.</div>; }
function InstructorMessagesPage() { return <div className="max-w-6xl mx-auto bg-[#58ACA9] text-white p-6 rounded-3xl border border-white/30">Messages coming soon.</div>; }
function InstructorPerformancePage() { return <div className="max-w-6xl mx-auto bg-[#58ACA9] text-white p-6 rounded-3xl border border-white/30">Performance analytics coming soon.</div>; }
function InstructorPaymentsPage() { return <div className="max-w-6xl mx-auto bg-[#58ACA9] text-white p-6 rounded-3xl border border-white/30">Payment log coming soon.</div>; }
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
    if (route.view === 'courses' || route.view === 'course') return 'courses';
    if (route.view === 'notebooks' || route.view === 'notebook') return 'notebooks';
    return route.view;
  }, [route]);

  return (
    <InstructorLayout active={active}>
      {route.view === 'home' && <InstructorHomeDashboard />}
      {route.view === 'courses' && <InstructorCourseList />}
      {route.view === 'course' && <InstructorCourseEditor courseId={route.courseId} />}
      {route.view === 'assessments' && <ExamsBuilder />}
      {route.view === 'notebooks' && <InstructorNotebooks />}
      {route.view === 'notebook' && <div className="h-full overflow-hidden bg-white"><NotebookPage notebookId={route.notebookId} /></div>}
      {route.view === 'grading' && <InstructorGradingPage />}
      {route.view === 'messages' && <InstructorMessagesPage />}
      {route.view === 'performance' && <InstructorPerformancePage />}
      {route.view === 'payments' && <InstructorPaymentsPage />}
      {route.view === 'schedule' && <InstructorSchedulePage />}
    </InstructorLayout>
  );
}
