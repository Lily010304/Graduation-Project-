import { useEffect, useMemo, useState } from 'react';
import * as store from '../lib/instructorStore';

const ITEM_TYPES = [
  { value: 'lecture', label: 'Lecture' },
  { value: 'reading', label: 'Reading' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'resource', label: 'Resource' },
];

export default function InstructorCourseEditor({ courseId }) {
  const [course, setCourse] = useState(() => (store.getCourse ? store.getCourse(courseId) : null));
  const [selected, setSelected] = useState({ weekId: course?.weeks?.[0]?.id });
  const [addingItem, setAddingItem] = useState(false);
  const [itemType, setItemType] = useState('lecture');
  const [itemTitle, setItemTitle] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemUrl, setItemUrl] = useState('');
  const [itemDur, setItemDur] = useState('');

  useEffect(() => {
  setCourse(store.getCourse ? store.getCourse(courseId) : null);
  }, [courseId]);

  const currentWeek = useMemo(() => course?.weeks?.find(w => w.id === selected.weekId), [course, selected.weekId]);

  const refresh = () => setCourse(store.getCourse ? store.getCourse(courseId) : null);

  // No days; content lives at the week level.

  const onSaveMeta = (patch) => {
    if (store.updateCourse) store.updateCourse(courseId, patch);
    refresh();
  };

  const onAddItem = (e) => {
    e.preventDefault();
    if (!currentWeek) return;
    const payload = { type: itemType, title: itemTitle.trim() };
    if (!payload.title) return;
    if (itemDesc.trim()) payload.description = itemDesc.trim();
    if (itemUrl.trim()) payload.url = itemUrl.trim();
    if (itemDur) payload.durationMins = Number(itemDur);
    if (store.addContentItem) store.addContentItem(courseId, currentWeek.id, undefined, payload);
    setAddingItem(false); setItemTitle(''); setItemDesc(''); setItemUrl(''); setItemDur(''); setItemType('lecture');
    refresh();
  };

  const onRenameWeek = (weekId, title) => { if (store.updateWeek) store.updateWeek(courseId, weekId, { title }); refresh(); };
  // Day operations removed.

  const onUpdateItem = (item, patch) => { if (store.updateItem) store.updateItem(courseId, currentWeek.id, undefined, item.id, patch); refresh(); };
  const onRemoveItem = (item) => { if (confirm('Remove this item?')) { if (store.removeItem) store.removeItem(courseId, currentWeek.id, undefined, item.id); refresh(); } };

  if (!course) return (
    <div className="max-w-6xl mx-auto bg-white text-[#0f5a56] rounded-3xl shadow-xl p-6 md:p-8 border border-white/20">
      <div className="text-sm">Course not found.</div>
      <button className="mt-4 px-4 py-2 rounded-full bg-[#58ACA9] text-white" onClick={()=> (window.location.hash = '#/dashboard/instructor')}>Back to courses</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto grid md:grid-cols-[280px_1fr] gap-6">
      {/* Sidebar outline */}
      <div className="bg-[#58ACA9] text-white rounded-2xl border border-white/30 p-4">
        <div className="mb-4">
          <div className="text-xs text-white/90">{course.level}</div>
          <div className="font-semibold">{course.title}</div>
          <div className="text-xs text-white/90">{course.published ? 'Published' : 'Draft'}</div>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 rounded-full border border-white/30 text-xs" onClick={()=> (window.location.hash = '#/dashboard/instructor')}>Back</button>
          </div>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
          {course.weeks?.map((w) => (
            <div key={w.id} className={`rounded-xl border ${selected.weekId===w.id ? 'border-white' : 'border-white/30'} p-2 cursor-pointer`} onClick={()=> setSelected({ weekId: w.id })}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="text-xs px-2 py-0.5 rounded-full bg-white/20">Week {w.number}</div>
                  <input className="font-semibold flex-1 bg-transparent outline-none text-white placeholder-white/80" value={w.title} onChange={e=>onRenameWeek(w.id, e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-white/90">Start date</label>
                  <input type="date" className="text-xs border border-white/30 bg-white/10 text-white rounded px-2 py-1" value={w.startDate || ''} onChange={e=> store.updateWeek && (store.updateWeek(courseId, w.id, { startDate: e.target.value }), refresh())} />
                </div>
              </div>
              {/* No days UI */}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="bg-[#58ACA9] text-white rounded-2xl border border-white/30 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <input className="text-xl font-bold bg-transparent outline-none text-white placeholder-white/80" value={course.title} onChange={e=>onSaveMeta({ title: e.target.value })} />
            <div className="text-xs text-white/90">Edit course title and outline.</div>
          </div>
          {/* Level selection removed for instructors; managers control level. */}
        </div>

        {!currentWeek ? (
          <div className="mt-6 text-sm text-[#0f5a56]/70">Select a week in the outline to start adding content.</div>
        ) : (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{currentWeek.title}</div>
              <button className="px-4 py-2 rounded-full bg-white/20 text-white text-sm" onClick={()=> setAddingItem(true)}>+ Add Content</button>
            </div>

            {/* Items list */}
            <div className="mt-3 space-y-2">
              {(currentWeek.items?.length ? currentWeek.items : []).map(item => (
                <div key={item.id} className="rounded-xl border border-white/30 p-3 bg-[#58ACA9]">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`text-xs px-2 py-1 rounded-full ${item.hidden ? 'bg-white/10 text-white' : 'bg-white/20 text-white'} capitalize`}>{item.type}</div>
                    <div className="flex items-center gap-2">
                      <button title="Rename" className="text-xs underline" onClick={()=> onUpdateItem(item, { title: prompt('Edit title', item.title) || item.title })}>Rename</button>
                      <button title="Edit description" className="text-xs underline" onClick={()=> onUpdateItem(item, { description: prompt('Edit description', item.description || '') || item.description })}>Description</button>
                      {item.url !== undefined && <button title="Edit URL" className="text-xs underline" onClick={()=> onUpdateItem(item, { url: prompt('Edit URL', item.url || '') || item.url })}>Link</button>}
                      <button title={item.hidden ? 'Show item' : 'Hide item'} className="text-xs" onClick={()=> onUpdateItem(item, { hidden: !item.hidden })}>{item.hidden ? '👁️‍🗨️' : '👁️'}</button>
                      <button title="Delete item" className="text-xs" onClick={()=> onRemoveItem(item)}>🗑️</button>
                    </div>
                  </div>
                  <div className={`mt-1 font-semibold ${item.hidden ? 'line-through text-white/70' : ''}`}>{item.title}</div>
                  {item.description && <div className={`text-sm ${item.hidden ? 'text-white/70 line-through' : 'text-white'}`}>{item.description}</div>}
                  <div className="text-[11px] text-white/90">
                    {item.durationMins ? `${item.durationMins} mins` : null}
                    {item.url ? ` • ${item.url}` : null}
                  </div>
                </div>
              ))}
              {(currentWeek.items?.length || 0) === 0 && (
                <div className="text-sm text-white/90">No content yet. Add lectures, readings, assignments, quizzes, or resources.</div>
              )}
            </div>

            {/* Add item form */}
            {addingItem && (
              <form onSubmit={onAddItem} className="mt-4 rounded-2xl border border-white/30 p-4 bg-white/10">
                <div className="grid md:grid-cols-2 gap-3">
                  <select className="px-3 py-2 rounded-xl border border-white/30 bg-white/10 text-white" value={itemType} onChange={e=>setItemType(e.target.value)}>
                    {ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <input className="px-3 py-2 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/80" placeholder="Title" value={itemTitle} onChange={e=>setItemTitle(e.target.value)} />
                  <input className="px-3 py-2 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/80" placeholder="Link (optional)" value={itemUrl} onChange={e=>setItemUrl(e.target.value)} />
                  <input className="px-3 py-2 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/80" placeholder="Duration mins (optional)" value={itemDur} onChange={e=>setItemDur(e.target.value)} />
                  <textarea className="md:col-span-2 px-3 py-2 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/80" placeholder="Description (optional)" value={itemDesc} onChange={e=>setItemDesc(e.target.value)} />
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="submit" className="px-4 py-2 rounded-full bg-white/20 text-white">Add</button>
                  <button type="button" className="px-4 py-2 rounded-full border border-white/30" onClick={()=> setAddingItem(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
