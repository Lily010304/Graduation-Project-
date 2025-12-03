import '../index.css';

// Match the main page gradient background
const unifiedBackground = 'linear-gradient(to bottom right, #034242 0%, #ffffff 100%)';

export default function InstructorLayout({ children, active, isNotebookView = false }) {
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: '📊', hash: '#/dashboard/instructor' },
    { id: 'courses', label: 'My Courses', icon: '📚', hash: '#/dashboard/instructor/courses' },
    { id: 'notebooks', label: 'AI Notebooks', icon: '🧠', hash: '#/dashboard/instructor/notebooks' },
    { id: 'messages', label: 'Messages', icon: '💬', hash: '#/dashboard/instructor/messages' },
    { id: 'schedule', label: 'Schedule', icon: '📅', hash: '#/dashboard/instructor/schedule' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundImage: unifiedBackground, backgroundColor: '#034242' }}>
      {/* Header: replicate main page utility bar and navigation bar */}
      <div className="sticky top-0 left-0 right-0 z-40">
        {/* Utility top bar */}
        <div className="h-8 flex items-center justify-end px-6 text-[11px] tracking-wide bg-dark/50 backdrop-blur gap-4 text-white/70">
          <select className="bg-transparent focus:outline-none"><option>USD</option></select>
          <select className="bg-transparent focus:outline-none"><option>English</option></select>
          <div className="hidden md:flex gap-3">
            <a href="mailto:info@sconcelms.com" className="hover:text-white">info@sconce.com</a>
            <span className="text-white/40">|</span>
            <a href="tel:+972597111111" className="hover:text-white">+972 597 111 111</a>
          </div>
        </div>
        {/* Main navigation bar */}
        <div className="flex items-center justify-between px-10 h-16 bg-white/5 backdrop-blur border-b border-white/10">
          <div className="flex items-center gap-4">
            <img src="/sconceLogo-removebg-preview.svg" alt="logo" className="w-12 h-12 drop-shadow" />
            <span className="font-display font-semibold tracking-[0.4rem] text-sm md:text-base">S C O N C E</span>
          </div>
          {/* Right actions: Home and Log out only */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            <button
              className="px-5 py-2 rounded-full bg-accent text-dark font-semibold tracking-wide transition-all duration-300 hover:bg-[#034242] hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#034242]/60 active:scale-95"
              onClick={()=>{ window.location.hash = '#/'; }}
            >Home</button>
            <button
              className="px-5 py-2 rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={() => { window.location.hash = '#/login'; }}
            >Log out</button>
          </div>
        </div>
      </div>

      {/* Action Buttons Row with Welcome Message */}
      <div className="px-10 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome Back, Instructor!</h1>
          <p className="text-white/70 text-sm">Here's what's on your plate today.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => (window.location.hash = '#/dashboard/instructor')}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#F29F05] text-white font-semibold text-base shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-300 active:scale-95"
          >
            <span className="text-2xl">🏠</span>
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => (window.location.hash = '#/dashboard/instructor/notebooks')}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#58ACA9] text-white font-semibold text-base shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-300 active:scale-95"
          >
            <span className="text-2xl">🧠</span>
            <span>AI Notebooks</span>
          </button>
          
          <button
            onClick={() => (window.location.hash = '#/dashboard/instructor/messages')}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#58ACA9] text-white font-semibold text-base shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-300 active:scale-95"
          >
            <span className="text-2xl">💬</span>
            <span>Messages</span>
          </button>
        </div>
      </div>

      {/* Main content area */}
      <main className={`text-[#0f5a56] ${isNotebookView ? 'p-0 overflow-hidden h-[calc(100vh-14rem)]' : 'px-10 pb-6 overflow-y-auto'}`} style={{ backgroundColor: isNotebookView ? '#ffffff' : '#F2F2F2' }}>
        {children}
      </main>
    </div>
  );
}
