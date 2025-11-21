import { useState, useEffect, useRef } from 'react';
import useFadeInOnScroll from '../hooks/useFadeInOnScroll';

const TESTIMONIALS = [
  { name: 'Layla (Parent)', text: 'My daughter now reads Arabic stories to her grandparents. The progress is beautiful!' },
  { name: 'Omar (Student)', text: 'Gamified stages kept me motivated. Unlocking C2 felt amazing!' },
  { name: 'Sara (Instructor)', text: 'Creating lessons is smooth and kids stay engaged the whole session.' }
];

const Testimonials = () => {
  useFadeInOnScroll();
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);
  useEffect(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIndex(i => (i + 1) % TESTIMONIALS.length), 4500);
    return () => clearTimeout(timeoutRef.current);
  }, [index]);
  return (
    <section id="testimonials" className="py-24 relative">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-3xl font-display font-bold mb-3">What Our Community Says</h2>
          <p className="text-slate-600">Parents, learners and instructors growing together.</p>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur shadow-soft p-10 md:p-14">
          <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="basis-full shrink-0 px-2">
                <div className="max-w-2xl mx-auto text-center">
                  <div className="mx-auto w-fit mb-6 relative">
                    <div className="absolute -top-4 -left-4 text-5xl text-coral/40">“</div>
                    <div className="absolute -bottom-10 -right-4 text-5xl text-turquoise/40">”</div>
                  </div>
                  <p className="text-lg md:text-xl font-medium text-slate-700 leading-relaxed mb-8">{t.text}</p>
                  <div className="font-semibold text-coral">{t.name}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-10">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} className={`w-3 h-3 rounded-full ${i === index ? 'bg-coral' : 'bg-slate-300'} transition-colors`} aria-label={`Go to slide ${i + 1}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
