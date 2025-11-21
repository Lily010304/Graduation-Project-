import { useEffect, useMemo, useState } from 'react';
import { Clock, ImageIcon, PlayCircle, Save, Trash2, Copy, Eye } from 'lucide-react';

// Local storage helpers
const EXAMS_KEY = 'sconce.instructor.exams.v1';
const uid = (p='id') => `${p}_${Math.random().toString(36).slice(2,8)}${Date.now().toString(36).slice(-4)}`;

function loadExams() {
  try {
    const raw = localStorage.getItem(EXAMS_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch (e) { void e; return []; }
}
function saveExams(exams) { try { localStorage.setItem(EXAMS_KEY, JSON.stringify(exams)); } catch (e) { void e } }

// Default question options in Kahoot colors
const DEFAULT_ANSWERS = () => ([
  { id: uid('ans'), text: '', correct: false, color: 'red',   shape: 'triangle' },
  { id: uid('ans'), text: '', correct: false, color: 'blue',  shape: 'diamond' },
  { id: uid('ans'), text: '', correct: false, color: 'yellow',shape: 'circle' },
  { id: uid('ans'), text: '', correct: false, color: 'green', shape: 'square' },
]);

const TIME_OPTIONS = [5,10,20,30,60,90,120];
const POINTS_OPTIONS = [ { key: 'std', label: 'Standard' }, { key: 'double', label: 'Double' }, { key: 'none', label: 'No points' } ];

export default function ExamsBuilder() {
  const [exams, setExams] = useState(loadExams);
  const [activeExamId, setActiveExamId] = useState(() => exams[0]?.id);
  const [activeQuestionId, setActiveQuestionId] = useState(null);

  // Active models
  const activeExam = useMemo(() => exams.find(e => e.id === activeExamId) || null, [exams, activeExamId]);
  const activeQuestion = useMemo(() => activeExam?.questions?.find(q => q.id === activeQuestionId) || null, [activeExam, activeQuestionId]);

  useEffect(() => { saveExams(exams); }, [exams]);
  useEffect(() => { if (activeExam && !activeQuestionId && activeExam.questions[0]) setActiveQuestionId(activeExam.questions[0].id); }, [activeExam, activeQuestionId]);

  // CRUD Exam
  const onNewExam = () => {
    const exam = { id: uid('exam'), title: `New Quiz`, questions: [ newQuestion() ] };
    setExams(prev => [exam, ...prev]);
    setActiveExamId(exam.id);
    setActiveQuestionId(exam.questions[0].id);
  };
  const onRenameExam = (title) => { if (!activeExam) return; setExams(prev => prev.map(e => e.id===activeExam.id? { ...e, title }: e)); };
  const onDeleteExam = () => {
    if (!activeExam) return;
    if (!confirm(`Delete exam "${activeExam.title}"?`)) return;
    setExams(prev => prev.filter(e => e.id !== activeExam.id));
    setActiveExamId(exams.filter(e=>e.id!==activeExam.id)[0]?.id || null);
    setActiveQuestionId(null);
  };
  const onDuplicateExam = () => {
    if (!activeExam) return;
    const dup = { ...activeExam, id: uid('exam'), title: activeExam.title + ' (Copy)', questions: activeExam.questions.map(q => ({ ...q, id: uid('q'), answers: q.answers.map(a=>({ ...a, id: uid('ans') })) })) };
    setExams(prev => [dup, ...prev]);
    setActiveExamId(dup.id);
    setActiveQuestionId(dup.questions[0]?.id || null);
  };

  // Questions
  function newQuestion() {
    return {
      id: uid('q'),
      title: '',
      // Timing settings
      timed: true,            // whether a countdown is shown to students
      time: 20,               // seconds, only applies when timed=true
      trackTime: true,        // hidden stopwatch for analysis (always on, hidden from students)
      // Grading settings
      autoGrade: true,        // if true, instructor must select the correct answer
      points: 'std',
      difficulty: 5,          // 1-10
      // Media and options
      mediaUrl: '',
      answers: DEFAULT_ANSWERS()
    };
  }
  const addQuestion = () => { if (!activeExam) return; const q = newQuestion(); setExams(prev => prev.map(e => e.id===activeExam.id? { ...e, questions: [...e.questions, q] }: e)); setActiveQuestionId(q.id); };
  const removeQuestion = (qid) => { if (!activeExam) return; setExams(prev => prev.map(e => e.id===activeExam.id? { ...e, questions: e.questions.filter(q=>q.id!==qid) }: e)); if (activeQuestionId===qid) setActiveQuestionId(activeExam.questions.filter(q=>q.id!==qid)[0]?.id || null); };
  const updateQuestion = (qid, patch) => {
    if (!activeExam) return;
    setExams(prev => prev.map(e => e.id===activeExam.id? {
      ...e,
      questions: e.questions.map(q => q.id===qid? { ...q, ...patch }: q)
    } : e));
  };

  // Answers
  const updateAnswer = (qid, aid, patch) => {
    if (!activeExam) return;
    setExams(prev => prev.map(e => e.id===activeExam.id? {
      ...e,
      questions: e.questions.map(q => q.id===qid? {
        ...q,
        answers: q.answers.map(a => a.id===aid? { ...a, ...patch }: a)
      } : q)
    } : e));
  };
  const toggleCorrect = (qid, aid) => {
    if (!activeExam) return;
    setExams(prev => prev.map(e => e.id===activeExam.id? {
      ...e,
      questions: e.questions.map(q => q.id===qid? {
        ...q,
        answers: q.answers.map(a => ({ ...a, correct: a.id===aid }))
      } : q)
    } : e));
  };

  const shapeIcon = (shape) => {
    switch(shape){
      case 'triangle': return '▲';
      case 'diamond': return '◆';
      case 'circle': return '●';
      case 'square': return '■';
      default: return '●';
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid lg:grid-cols-[280px_1fr_280px] gap-4">
      {/* Left: Exams + Questions list */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">Exams</div>
          <button className="px-2 py-1 rounded-full bg-[#58ACA9] text-white text-xs" onClick={onNewExam}>+ New</button>
        </div>
        <div className="space-y-1">
          {exams.map(ex => (
            <button key={ex.id} className={`w-full text-left px-3 py-2 rounded-xl border ${ex.id===activeExamId? 'border-[#58ACA9] bg-[#58ACA9]/10' : 'border-black/10 hover:bg-black/5'}`} onClick={()=>{ setActiveExamId(ex.id); setActiveQuestionId(ex.questions[0]?.id || null); }}>
              <div className="text-sm font-medium truncate">{ex.title}</div>
              <div className="text-xs text-slate-500">{ex.questions.length} question{ex.questions.length!==1?'s':''}</div>
            </button>
          ))}
          {exams.length===0 && <div className="text-xs text-slate-500">No exams yet.</div>}
        </div>

        <div className="mt-4 pt-3 border-t border-black/5">
          <div className="text-xs font-semibold mb-1">Questions</div>
          <div className="space-y-1 max-h-[45vh] overflow-auto pr-1">
            {activeExam?.questions?.map((q, idx) => (
              <div key={q.id} className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border ${q.id===activeQuestionId? 'border-[#58ACA9] bg-[#58ACA9]/10' : 'border-black/10'}`}>
                <button className="flex-1 text-left text-sm truncate" onClick={()=> setActiveQuestionId(q.id)}>{idx+1}. {q.title || 'Untitled question'}</button>
                <button title="Remove" className="text-slate-500 hover:text-red-600" onClick={()=> removeQuestion(q.id)}><Trash2 size={16}/></button>
              </div>
            ))}
            {!activeExam && <div className="text-xs text-slate-500">Select or create an exam.</div>}
          </div>
          <button className="mt-2 w-full px-3 py-2 rounded-xl bg-[#58ACA9] text-white text-sm" onClick={addQuestion}>+ Add question</button>
        </div>
      </div>

      {/* Center: Question editor */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-4">
        {!activeExam ? (
          <div className="text-sm text-slate-600">Create or select an exam to start.</div>
        ) : (
        <>
          {/* Top bar */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <input className="text-xl font-bold bg-transparent outline-none flex-1" placeholder="Exam title" value={activeExam.title} onChange={e=> onRenameExam(e.target.value)} />
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 rounded-xl border border-black/10 flex items-center gap-2 text-sm" onClick={onDuplicateExam}><Copy size={16}/> Duplicate</button>
              <button className="px-3 py-2 rounded-xl border border-black/10 flex items-center gap-2 text-sm" onClick={()=> saveExams(exams)}><Save size={16}/> Save</button>
              <button className="px-3 py-2 rounded-xl bg-[#58ACA9] text-white flex items-center gap-2 text-sm"><PlayCircle size={16}/> Publish</button>
              <button className="px-3 py-2 rounded-xl border border-black/10 text-red-600 flex items-center gap-2 text-sm" onClick={onDeleteExam}><Trash2 size={16}/> Delete</button>
            </div>
          </div>

          {!!activeQuestion && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <input className="w-full text-lg font-semibold bg-transparent outline-none" placeholder="Type your question" value={activeQuestion.title} onChange={e=> updateQuestion(activeQuestion.id, { title: e.target.value })} />
                {/* Media URL */}
                <div className="mt-2 flex items-center gap-2">
                  <ImageIcon size={16} className="text-slate-500"/>
                  <input className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-black/10 outline-none" placeholder="Image or YouTube URL (optional)" value={activeQuestion.mediaUrl} onChange={e=> updateQuestion(activeQuestion.id, { mediaUrl: e.target.value })} />
                </div>
                {activeQuestion.mediaUrl ? (
                  <div className="mt-3 overflow-hidden rounded-xl border border-black/10">
                    {/* naive media preview */}
                    <img src={activeQuestion.mediaUrl} alt="media" className="w-full object-cover max-h-60" onError={(e)=>{ e.currentTarget.style.display='none'; }}/>
                  </div>
                ) : null}
              </div>

              {/* Settings */}
              <div className="rounded-2xl border border-black/10 p-3">
                <div className="font-semibold mb-3">Settings</div>
                {/* Timing toggle */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-slate-700">Timed question</span>
                  <input type="checkbox" className="ml-auto h-4 w-4" checked={activeQuestion.timed ?? true} onChange={e=> updateQuestion(activeQuestion.id, { timed: e.target.checked })} />
                </div>
                <div className="flex items-center gap-2 mb-2 opacity-100">
                  <Clock size={16} className="text-slate-500"/>
                  <span className="text-sm text-slate-600">Time limit</span>
                  <select className="ml-auto px-3 py-2 rounded-xl bg-slate-50 border border-black/10 disabled:opacity-50" disabled={! (activeQuestion.timed ?? true)} value={activeQuestion.time ?? 20} onChange={e=> updateQuestion(activeQuestion.id, { time: Number(e.target.value) })}>
                    {TIME_OPTIONS.map(s => <option key={s} value={s}>{s}s</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-slate-700">Hidden stopwatch (for analysis)</span>
                  <span className="ml-auto text-xs text-slate-500">Always on</span>
                </div>
                {/* Difficulty */}
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Difficulty</span>
                    <span className="text-xs text-slate-500">{activeQuestion.difficulty ?? 5}/10</span>
                  </div>
                  <input type="range" min={1} max={10} value={activeQuestion.difficulty ?? 5} onChange={e=> updateQuestion(activeQuestion.id, { difficulty: Number(e.target.value) })} className="w-full"/>
                </div>
                {/* Auto Grade */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-slate-700">Automatic evaluation</span>
                  <input type="checkbox" className="ml-auto h-4 w-4" checked={activeQuestion.autoGrade ?? true} onChange={e=> updateQuestion(activeQuestion.id, { autoGrade: e.target.checked })} />
                </div>
                <div className="text-[11px] text-slate-500 mb-3">
                  {activeQuestion.autoGrade ?? true ? 'Select the correct answer below.' : 'This question will be manually evaluated; correct answer selection is disabled.'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Points</span>
                  <select className="ml-auto px-3 py-2 rounded-xl bg-slate-50 border border-black/10" value={activeQuestion.points ?? 'std'} onChange={e=> updateQuestion(activeQuestion.id, { points: e.target.value })}>
                    {POINTS_OPTIONS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {!!activeQuestion && (
            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {activeQuestion.answers.map((a, i) => (
                <div key={a.id} className="rounded-2xl border border-amber-200/70 overflow-hidden backdrop-blur-sm" style={{ background: 'rgba(255, 244, 163, 0.55)' }}>
                  <div className="px-3 py-2 flex items-center gap-2">
                    <button
                      className={`h-6 w-6 rounded grid place-items-center text-[12px] font-bold ${a.correct? 'bg-white/90' : 'bg-white/70'} text-[#0b1f1d]`}
                      title={a.correct? 'Correct answer' : 'Mark as correct'}
                      onClick={()=> (activeQuestion.autoGrade ?? true) && toggleCorrect(activeQuestion.id, a.id)}
                      disabled={!(activeQuestion.autoGrade ?? true)}
                    >
                      {shapeIcon(a.shape)}
                    </button>
                    <input className="flex-1 px-2 py-1 rounded-md bg-white/80 outline-none text-sm" placeholder={`Answer ${i+1}`} value={a.text} onChange={e=> updateAnswer(activeQuestion.id, a.id, { text: e.target.value })} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
        )}
      </div>

      {/* Right: Tips/preview */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-3">
        <div className="font-semibold mb-2 flex items-center gap-2"><Eye size={16}/> Preview</div>
        <div className="text-xs text-slate-600">A compact preview will appear here in the future. For now, use Publish to finalize and save.</div>
      </div>
    </div>
  );
}
