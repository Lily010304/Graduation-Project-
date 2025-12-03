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

      {/* Main layout: Courses on left, Timetable on right */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* LEFT SIDE: My Courses */}
        <div className="rounded-2xl bg-white p-5 border border-[#58ACA9]/30 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0f5a56]">My Courses</h2>
            <button 
              className="text-sm text-[#58ACA9] hover:underline font-medium"
              onClick={()=> (window.location.hash = '#/dashboard/instructor/courses')}
            >
              View All →
            </button>
          </div>
          
          {courseOverview.length === 0 ? (
            <div className="text-sm text-[#0f5a56]/70">No courses assigned yet.</div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {courseOverview.slice(0, 6).map(co => (
                <div 
                  key={co.id} 
                  className="rounded-xl border border-[#58ACA9]/20 p-4 bg-gradient-to-br from-[#58ACA9]/5 to-[#58ACA9]/10 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={()=> (window.location.hash = `#/dashboard/instructor/course/${co.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#0f5a56] text-base mb-1">{co.title}</h3>
                      <p className="text-xs text-[#0f5a56]/70">{co.level}</p>
                    </div>
                    <div className="text-xs bg-[#58ACA9] text-white px-3 py-1 rounded-full">
                      {co.students}/30
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#58ACA9]/20">
                    <div className="text-xs text-[#0f5a56]/70">
                      Avg. Grade: <span className="font-semibold text-[#0f5a56]">{co.avg}%</span>
                    </div>
                    <button className="text-xs text-[#58ACA9] hover:underline font-medium">
                      Manage →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Timetable (Half width) */}
        <div className="rounded-2xl bg-[#58ACA9] text-white p-4 border border-white/30">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-lg font-semibold">Timetable</div>
              <div className="text-xs text-white/90">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
            <div className="text-[11px] px-2 py-1 rounded-full bg-white/20 border border-white/30 flex items-center gap-1">
              <span>{new Date().toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              <span role="img" aria-label="calendar">📅</span>
            </div>
          </div>

          {/* Hour rows - Compact version */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {['08:00','09:00','10:00','11:00','12:00'].map((hour, idx) => (
              <div key={hour} className="">
                <div className="text-[11px] mb-1 font-medium">{hour.replace(':00','')}.0 a.m</div>
                <div className="relative pl-2">
                  <div className="border-t border-dashed border-white/30 absolute left-0 right-0 top-2" />
                  <div className="relative space-y-1">
                    {timetable.filter(ev => (ev.start||'').slice(0,2) === hour.slice(0,2)).map((ev, i) => (
                      <div key={i} className="flex items-start">
                        {/* Event pill - Compact */}
                        <div className="flex-1 rounded-lg shadow-sm border border-white/20 overflow-hidden" style={{ background: (
                          ev.color==='green' ? '#E8F8E6' :
                          ev.color==='pink' ? '#FCE1EA' :
                          ev.color==='yellow' ? '#FFF4C2' :
                          ev.color==='purple' ? '#E8DDFB' :
                          ev.color==='red' ? '#FFD9D9' :
                          '#E3F0FF'
                        ) }}>
                          <div className="flex items-center gap-2 px-2 py-1.5">
                            <div className="w-6 h-6 rounded-full grid place-items-center text-[12px]" style={{ background: 'rgba(255,255,255,0.8)' }}>
                              <span>{ev.icon || '📘'}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-semibold text-slate-700 truncate">{ev.title}</div>
                              <div className="text-[10px] text-slate-600">{ev.start} - {ev.end}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Spacer if no event at this hour */}
                    {timetable.filter(ev => (ev.start||'').slice(0,2) === hour.slice(0,2)).length === 0 && (
                      <div className="text-[10px] text-white/70">—</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-3 text-xs underline hover:no-underline" onClick={()=> (window.location.hash = '#/dashboard/instructor/schedule')}>View Full Calendar</button>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="rounded-2xl bg-[#58ACA9] text-white p-4 border border-white/30 max-w-2xl">
        <div className="font-semibold mb-2">Recent Student Submissions</div>
        <ul className="text-sm space-y-1">
          {submissions.map(s => <li key={s.id}>{s.label}</li>)}
        </ul>
        <button className="mt-3 text-sm underline" onClick={()=> (window.location.hash = '#/dashboard/instructor/grading')}>View All Submissions</button>
      </div>
    </div>
  );
}
