
import useFadeInOnScroll from '../hooks/useFadeInOnScroll';
import BounceButton from './ui/BounceButton';

const LEVELS = [
  { code: 'A', title: 'Level A', color: 'bg-mint', stages: ['A1','A2','A3'], desc: 'Foundations of Arabic letters, sounds & basic vocabulary.' },
  { code: 'B', title: 'Level B', color: 'bg-turquoise', stages: ['B1','B2','B3'], desc: 'Sentence structure, reading short texts and simple grammar.' },
  { code: 'C', title: 'Level C', color: 'bg-coral', stages: ['C1','C2','C3'], desc: 'Fluency building, comprehension, and cultural expression.' }
];

const Levels = () => {
  useFadeInOnScroll();
  return (
    <section id="levels" className="py-20 bg-white/60 backdrop-blur-sm relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="fade-in text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Level Pathway</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Three progressive stages inside each level. Complete a stage to unlock the next and earn playful badges.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {LEVELS.map(l => <LevelCard key={l.code} level={l} />)}
        </div>
      </div>
    </section>
  );
};

const LevelCard = ({ level }) => {
  const unlockedCount = 1;
  return (
    <div className="card-level fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-semibold text-slate-800 ${level.color} bg-opacity-90 shadow-inner`}>{level.code}</div>
        <h3 className="font-semibold text-lg">{level.title}</h3>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">{level.desc}</p>
      <div className="progress-track">
        {level.stages.map((s,i) => {
          const locked = i >= unlockedCount;
          return <div key={s} className={`progress-node ${locked ? 'locked' : ''}`}>{s.replace(/\D/g,'')}</div>;
        })}
      </div>
      <div className="mt-5 flex gap-3">
        <BounceButton href="#" kind="primary" className="!px-4 !py-2 text-xs">Preview</BounceButton>
        <BounceButton href="#register" kind="accent" className="!px-4 !py-2 text-xs">Enroll</BounceButton>
      </div>
    </div>
  );
};

export default Levels;
