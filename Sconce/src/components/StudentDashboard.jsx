import '../index.css';
import { useState } from 'react';
import StudentNotebooks from './StudentNotebooks';

const unifiedBackground = 'linear-gradient(to bottom right, #034242 0%, #ffffff 100%)';

export default function StudentDashboard() {
  const [view, setView] = useState('overview'); // 'overview' | 'notebooks'

  if (view === 'notebooks') {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden text-white" style={{ backgroundImage: unifiedBackground, backgroundColor: '#034242' }}>
        {/* Utility top bar */}
        <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-end px-6 text-[11px] tracking-wide bg-black/30 backdrop-blur z-50 gap-4 text-white/80">
          <select className="bg-transparent focus:outline-none"><option>USD</option></select>
          <select className="bg-transparent focus:outline-none"><option>English</option></select>
        </div>

        {/* Main navigation bar */}
        <div className="absolute top-8 left-0 right-0 z-40 flex items-center justify-between px-10 h-16 bg-white/5 backdrop-blur border-b border-white/10">
          <div className="flex items-center gap-4">
            <img src="/sconceLogo-removebg-preview.svg" alt="logo" className="w-12 h-12 drop-shadow" />
            <span className="font-display font-semibold tracking-[0.4rem] text-sm md:text-base">S C O N C E</span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs">
            <button className="px-4 py-2 rounded-full bg-[#58ACA9] text-dark font-semibold hover:bg-[#034242] hover:text-white transition" onClick={() => setView('overview')}>Dashboard</button>
            <button className="text-white/80 hover:text-white" onClick={() => (window.location.hash = '#/login')}>Log out</button>
          </div>
        </div>

        {/* Content */}
        <div className="pt-32 pb-16 px-6">
          <StudentNotebooks />
        </div>
      </div>
    );
  }

  // Original overview content
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
        <div className="hidden md:flex items-center gap-3 text-xs">
          <button className="px-4 py-2 rounded-full bg-[#58ACA9] text-dark font-semibold hover:bg-[#034242] hover:text-white transition" onClick={()=> (window.location.hash = '#/')}>Home</button>
          <button className="text-white/80 hover:text-white" onClick={()=> (window.location.hash = '#/login')}>Log out</button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left: Welcome/overview */}
          <div className="md:col-span-2 bg-white text-[#0f5a56] rounded-3xl shadow-xl p-6 md:p-8 border border-white/20">
            <h1 className="text-2xl font-bold mb-2">Welcome to your dashboard</h1>
            <p className="text-sm text-[#0f5a56]/80 mb-6">Start with the Proficiency Exam to place you in the right level. You can retake it later if needed.</p>
            <div className="grid gap-4">
              <div className="rounded-2xl border border-[#0f5a56]/20 bg-[#c8f2ed]/30 p-4">
                <h2 className="font-semibold mb-1">About the Proficiency Exam</h2>
                <ul className="list-disc list-inside text-sm text-[#0f5a56]/90">
                  <li>Measures listening, reading, vocabulary, and basic grammar.</li>
                  <li>Places you into A (Beginner), B (Intermediate), or C (Advanced).</li>
                  <li>Adaptive format—questions adjust to your performance.</li>
                  <li>Average time: 20–30 minutes. You can pause and resume.</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-[#0f5a56]/20 bg-white p-4">
                <h3 className="font-semibold mb-1">Tips before you begin</h3>
                <ul className="list-disc list-inside text-sm text-[#0f5a56]/90">
                  <li>Use a quiet place and a stable internet connection.</li>
                  <li>Enable audio for listening questions.</li>
                  <li>Answer honestly—this is to help you learn at the right pace.</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => alert('Proficiency exam starting soon…')} className="inline-flex items-center px-6 py-3 rounded-full bg-[#F2A33B] text-white font-semibold shadow-[0_4px_0_0_#0f5a56] hover:brightness-95 transition">
                Take Proficiency Exam
              </button>
              <button onClick={() => setView('notebooks')} className="inline-flex items-center px-6 py-3 rounded-full bg-[#58ACA9] text-white font-semibold shadow-[0_4px_0_0_#0f5a56] hover:brightness-95 transition">
                View Learning Materials
              </button>
            </div>
          </div>

          {/* Right: Quick links / status */}
          <div className="space-y-6">
            <div className="bg-white text-[#0f5a56] rounded-3xl shadow-xl p-6 border border-white/20">
              <h3 className="font-semibold mb-2">Your status</h3>
              <div className="text-sm text-[#0f5a56]/80">Exam not started</div>
            </div>
            <div className="bg-white text-[#0f5a56] rounded-3xl shadow-xl p-6 border border-white/20">
              <h3 className="font-semibold mb-2">Quick actions</h3>
              <ul className="text-sm text-[#0f5a56]/80 space-y-2">
                <li><button className="underline hover:no-underline" onClick={()=> alert('Exam guide coming soon')}>Read Exam Guide</button></li>
                <li><button className="underline hover:no-underline" onClick={()=> (window.location.hash = '#/')}>Explore Courses</button></li>
                <li><button className="underline hover:no-underline" onClick={()=> (window.location.hash = '#/contact')}>Contact Support</button></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
