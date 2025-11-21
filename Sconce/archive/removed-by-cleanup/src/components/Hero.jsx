import useFadeInOnScroll from '../hooks/useFadeInOnScroll';
import BounceButton from './ui/BounceButton';

const Hero = () => {
  useFadeInOnScroll();
  return (
    <section id="home" className="pt-32 pb-20 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-mint/40 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 bg-coral/30 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative">
        <div className="fade-in">
          <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">Master Arabic, connect with your roots <span className="text-coral">…</span></h1>
          <p className="text-slate-600 text-lg mb-8 max-w-lg">A playful, structured path for children abroad to read, speak and love Arabic. Gamified levels keep motivation high while parents and instructors track progress.</p>
          <div className="flex flex-wrap gap-4">
            <BounceButton href="#register" kind="primary">Register Now</BounceButton>
            <BounceButton href="#levels" kind="accent">Explore Levels</BounceButton>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-turquoise rounded-full animate-pulse" />Live Progress Tracking</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-coral rounded-full animate-pulse" />Placement Exam</div>
          </div>
        </div>
        <div className="relative fade-in md:pl-6">
          <div className="relative mx-auto w-72 h-72 md:w-80 md:h-80">
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-mint via-desert to-white shadow-soft" />
            <div className="absolute inset-0 rounded-[3rem] p-6 flex flex-col items-center justify-center gap-4 overflow-visible">
              <div className="font-display tracking-wide bg-gradient-to-br from-turquoise to-coral bg-clip-text text-transparent text-6xl md:text-7xl leading-[1.28] pt-5 pb-1">أ ب ت</div>
              <p className="text-center text-slate-600 text-sm leading-relaxed">Interactive letters & sound recognition mini‑games build confidence quickly.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
