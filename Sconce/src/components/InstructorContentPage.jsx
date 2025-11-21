import { useState } from 'react';
import * as store from '../lib/instructorStore';

export default function InstructorContentPage() {
  const [courses] = useState(() => (store.listCourses ? store.listCourses() : []));
  const [open, setOpen] = useState({});

  const toggle = (id) => setOpen(s => ({ ...s, [id]: !s[id] }));

  return (
    <div className="max-w-6xl mx-auto bg-white text-[#0f5a56] p-6 rounded-3xl border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Teaching Content</h1>
          <p className="text-sm text-[#0f5a56]/70">Browse courses and modules. Upload or edit content per day.</p>
        </div>
      </div>

      <div className="space-y-3">
        {courses.map(c => (
          <div key={c.id} className="rounded-2xl border border-[#0f5a56]/20">
            <button className="w-full flex items-center justify-between px-4 py-3" onClick={()=>toggle(c.id)}>
              <div>
                <div className="text-xs text-[#0f5a56]/60">{c.level}</div>
                <div className="font-semibold">{c.title}</div>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-sm underline" onClick={(e)=> { e.stopPropagation(); window.location.hash = `#/dashboard/instructor/course/${c.id}`; }}>Open in Editor</button>
                <span className="text-xl">{open[c.id] ? '▾' : '▸'}</span>
              </div>
            </button>
            {open[c.id] && (
              <div className="px-4 pb-4">
                {c.weeks?.length ? c.weeks.map(w => (
                  <div key={w.id} className="mt-2 rounded-xl border border-[#0f5a56]/15">
                    <div className="px-3 py-2 font-semibold flex items-center gap-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#58ACA9]/10">Week {w.number}</span>
                      <span>{w.title}</span>
                      <span className="ml-auto text-xs text-[#0f5a56]/70">{w.startDate ? `Start: ${w.startDate}` : 'Start: —'}</span>
                    </div>
                    <div className="px-3 py-2 space-y-2">
                      {w.days?.length ? w.days.map(d => (
                        <div key={d.id} className="rounded-lg border border-[#0f5a56]/10 p-3">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">Day {d.number}: {d.title}</div>
                            <button className="text-xs underline" onClick={()=> (window.location.hash = `#/dashboard/instructor/course/${c.id}`)}>Upload Content</button>
                          </div>
                          <ul className="mt-2 text-sm list-disc list-inside text-[#0f5a56]/80">
                            {d.items?.length ? d.items.map(it => (
                              <li key={it.id}><span className="capitalize">{it.type}:</span> {it.title}</li>
                            )) : <li>No items yet.</li>}
                          </ul>
                        </div>
                      )) : (
                        <div className="text-sm text-[#0f5a56]/70 px-1">No days in this week.</div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-[#0f5a56]/70 px-1 pb-3">No weeks yet. Use the editor to add weeks and days.</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
