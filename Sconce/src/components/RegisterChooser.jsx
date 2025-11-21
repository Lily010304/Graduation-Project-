import '../index.css';
import { useEffect, useState } from 'react';

const unifiedBackground = 'linear-gradient(to bottom right, #034242 0%, #ffffff 100%)';

export default function RegisterChooser() {
  const [recruitmentOpen, setRecruitmentOpen] = useState(false);
  useEffect(() => {
    try { setRecruitmentOpen(localStorage.getItem('recruitmentOpen') === 'true'); } catch (e) { void e }
  }, []);
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-white" style={{ backgroundImage: unifiedBackground, backgroundColor: '#034242' }}>
      {/* Utility top bar */}
      <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-end px-6 text-[11px] tracking-wide bg-black/30 backdrop-blur z-50 gap-4 text-white/80">
        <select className="bg-transparent focus:outline-none"><option>USD</option></select>
        <select className="bg-transparent focus:outline-none"><option>English</option></select>
        <div className="hidden md:flex gap-3">
          <a href="mailto:info@sconcelms.com" className="hover:text-white">info@sconce.com</a>
          <span className="text-white/40">|</span>
          <a href="tel:+972597111111" className="hover:text-white">+972 597 111 111</a>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="absolute top-8 left-0 right-0 z-40 flex items-center justify-between px-10 h-16 bg-white/5 backdrop-blur border-b border-white/10">
        <div className="flex items-center gap-4">
          <img src="/sconceLogo-removebg-preview.svg" alt="logo" className="w-12 h-12 drop-shadow" />
          <span className="font-display font-semibold tracking-[0.4rem] text-sm md:text-base">S C O N C E</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs">
          <button className="px-5 py-2 rounded-full bg-[#58ACA9] text-dark font-semibold tracking-wide transition-all duration-300 hover:bg-[#034242] hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#034242]/60 active:scale-95" onClick={() => (window.location.hash = '#/')}>Home</button>
        </div>
      </div>

      <div className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-center mb-10">Create your account</h1>
          <p className="text-center text-white/85 max-w-2xl mx-auto mb-10">Choose the type of account you want to create. You can always connect with support if you're unsure which is right for you.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { key: 'student', title: 'Student', desc: 'Learn Arabic with structured programs and live instructors.', action: () => (window.location.hash = '#/register/student') },
              ...(recruitmentOpen ? [{ key: 'instructor', title: 'Instructor', desc: 'Teach Arabic online and empower learners worldwide.', action: () => (window.location.hash = '#/register/instructor') }] : []),
              { key: 'parent', title: 'Parent', desc: 'Manage your child’s learning and track their progress.', action: () => (window.location.hash = '#/register/parent') },
            ].map((card) => (
              <button key={card.key} onClick={card.action} className="group text-left bg-white text-[#0f5a56] rounded-3xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all">
                <div className="text-xl font-bold mb-2">Register as {card.title}</div>
                <div className="text-sm text-[#0f5a56]/80 mb-6">{card.desc}</div>
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#58ACA9] text-white font-semibold group-hover:brightness-95">Continue
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7'/></svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
