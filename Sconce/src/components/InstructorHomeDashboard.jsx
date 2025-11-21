import { useMemo } from 'react';
import * as store from '../lib/instructorStore';

export default function InstructorHomeDashboard() {
  const courses = (store.listCoursesAssignedToCurrentInstructor ? store.listCoursesAssignedToCurrentInstructor() : (store.listCourses ? store.listCourses() : []));
  // Timetable: load today's events from localStorage, fallback to sample set
  const loadTodayTimetable = () => {
    const fmt = (d) => d.toISOString().slice(0,10);
    const todayKey = fmt(new Date());
    try {
      const raw = localStorage.getItem('sconce.instructor.events.v1');
      if (raw) {
        const events = JSON.parse(raw);
        if (Array.isArray(events)) {
          return events.filter(e => e?.date === todayKey).sort((a,b) => (a.start||'').localeCompare(b.start||''));
        }
      }
    } catch (e) { void e }
    // Fallback sample mirroring the reference image
    return [
      { start: '08:00', end: '08:50', title: 'Human Resource Management', color: 'green', icon: '🧑\u200d💼' },
      { start: '08:50', end: '09:40', title: 'Customer Relationship Management', color: 'pink', icon: '🎧' },
      { start: '09:40', end: '10:30', title: 'Marketing Management', color: 'yellow', icon: '📊' },
      { start: '10:30', end: '11:00', title: 'Recess', color: 'purple', icon: '☕' },
      { start: '11:00', end: '11:50', title: 'Financial Accounting', color: 'red', icon: '💰' },
      { start: '11:50', end: '12:40', title: 'Business Communication', color: 'blue', icon: '🗣️' },
    ].map(e => ({ date: todayKey, ...e }));
  };
  const timetable = loadTodayTimetable();
  const todos = [
    { id: 1, text: 'Grade 5 submissions for "Quiz 1"' },
    { id: 2, text: 'Create Exam for "Level 2"' },
    { id: 3, text: 'Reply to message from Parent Y' },
  ];
  const submissions = [
    { id: 's1', label: 'Student 1: Assignment 1 (Late)' },
    { id: 's2', label: 'Student 2: Quiz 2 (Graded)' },
  ];
  const messages = [
    { id: 'm1', from: 'Parent X', text: 'Question about...' },
    { id: 'm2', from: 'Student Z', text: 'I need help with...' },
  ];

  const courseOverview = useMemo(() => courses.map(c => ({
    id: c.id,
    title: c.title,
    level: c.level,
    students: c.studentsCount || 0,
    avg: c.avgGrade || 0,
  })), [courses]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome Back, Instructor!</h1>
        <p className="text-[#0f5a56]/70 text-sm">Here’s what’s on your plate today.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Timetable card */}
        <div className="rounded-2xl bg-[#58ACA9] text-white p-4 border border-white/30">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-lg font-semibold">Timetable</div>
              <div className="text-xs text-white/90">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
            <div className="text-[12px] px-3 py-1 rounded-full bg-white/20 border border-white/30 flex items-center gap-1">
              <span>{new Date().toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              <span role="img" aria-label="calendar">📅</span>
            </div>
          </div>

          {/* Hour rows */}
          <div className="space-y-3">
            {['08:00','09:00','10:00','11:00','12:00'].map((hour, idx) => (
              <div key={hour} className="">
                <div className="text-xs mb-1">{hour.replace(':00','')}.0 a.m</div>
                <div className="relative pl-2">
                  <div className="border-t border-dashed border-white/30 absolute left-0 right-0 top-2" />
                  <div className="relative space-y-2">
                    {timetable.filter(ev => (ev.start||'').slice(0,2) === hour.slice(0,2)).map((ev, i) => (
                      <div key={i} className="flex items-start">
                        {/* Event pill */}
                        <div className="flex-1 rounded-xl shadow-sm border border-white/20 overflow-hidden" style={{ background: (
                          ev.color==='green' ? '#E8F8E6' :
                          ev.color==='pink' ? '#FCE1EA' :
                          ev.color==='yellow' ? '#FFF4C2' :
                          ev.color==='purple' ? '#E8DDFB' :
                          ev.color==='red' ? '#FFD9D9' :
                          '#E3F0FF'
                        ) }}>
                          <div className="flex items-center gap-2 px-3 py-2">
                            <div className="w-7 h-7 rounded-full grid place-items-center text-[13px]" style={{ background: 'rgba(255,255,255,0.8)' }}>
                              <span>{ev.icon || '📘'}</span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-[13px] font-semibold text-slate-700 truncate">{ev.title}</div>
                              <div className="text-[11px] text-slate-600">{ev.start} - {ev.end} a.m</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Spacer if no event at this hour */}
                    {timetable.filter(ev => (ev.start||'').slice(0,2) === hour.slice(0,2)).length === 0 && (
                      <div className="text-[11px] text-white/70">—</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-4 text-sm underline" onClick={()=> (window.location.hash = '#/dashboard/instructor/schedule')}>View Full Calendar</button>
        </div>

        <div className="rounded-2xl bg-[#58ACA9] text-white p-4 border border-white/30">
          <div className="font-semibold mb-2">To-Do List</div>
          <ul className="text-sm space-y-1">
            {todos.map(t => (
              <li key={t.id} className="flex items-center gap-2">
                <input type="checkbox" />
                <span>{t.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-[#58ACA9] text-white p-4 border border-white/30">
          <div className="font-semibold mb-2">Recent Student Submissions</div>
          <ul className="text-sm space-y-1">
            {submissions.map(s => <li key={s.id}>{s.label}</li>)}
          </ul>
          <button className="mt-3 text-sm underline" onClick={()=> (window.location.hash = '#/dashboard/instructor/grading')}>View All Submissions</button>
        </div>

        <div className="rounded-2xl bg-[#58ACA9] text-white p-4 border border-white/30">
          <div className="font-semibold mb-2">Unread Messages (2)</div>
          <ul className="text-sm space-y-1">
            {messages.map(m => <li key={m.id}>- {m.from}: "{m.text}"</li>)}
          </ul>
          <button className="mt-3 text-sm underline" onClick={()=> (window.location.hash = '#/dashboard/instructor/messages')}>View All Messages</button>
        </div>
      </div>

      <div className="rounded-2xl bg-[#58ACA9] text-white p-4 border border-white/30">
        <div className="font-semibold mb-2">Course Overview</div>
        <div className="space-y-1 text-sm">
          {courseOverview.map(co => (
            <div key={co.id} className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{co.title}</div>
                <div className="text-xs text-white/90">{co.level} • {co.students}/30 Students</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-white/90">Avg. Grade: {co.avg}%</div>
                <button className="text-sm underline" onClick={()=> (window.location.hash = `#/dashboard/instructor/course/${co.id}`)}>Manage Course</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
