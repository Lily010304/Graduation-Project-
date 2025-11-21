import { useEffect, useState, useRef, useCallback } from 'react';
import '../index.css';
import { GlowingEffectDemo } from '@/components/ui/glowing-effect-demo';
import { Mail, Phone, Youtube, Instagram, Facebook, Linkedin } from 'lucide-react';


// Slides definition updated per provided design spec.
const buildSlides = () => ([
  {
    id: 'hero',
    sectionClass: 'py-0 h-screen',
    label: 'Home',
    render: () => (
      <div className="h-full w-full flex items-center justify-center relative">
        <div className="w-full relative">
          {/* Inner hero slider (two slides) */}
          <InnerHeroSlider />
        </div>
      </div>
    )
  },
  // ...existing code...
{
  id: 'features',
  label: 'Features',
  sectionClass: 'pt-16 pb-8 md:pb-12 bg-[#034141]',
  render: () => (
    <div className="w-full h-full px-6">
      <GlowingEffectDemo />
    </div>
  )
},
// ...existing code...
  {
    id: 'courses',
    label: 'Courses',
    sectionClass: 'py-0 bg-white',
    render: () => (
      <div className="w-full bg-white text-[#0f5a56] px-6 py-16 md:py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Our Courses</h2>
          <p className="max-w-3xl mx-auto italic font-semibold mb-12">
            Our Arabic program is designed in three main levels: A, B, and C. Each level is divided into three stages, helping
            you gradually build your skills. As you progress, you’ll gain confidence and fluency step by step.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                lvl: 'A',
                title: 'Level A - Beginner',
                text:
                  'After this level the student will be able to read and write basic Arabic, introduce themselves, and hold simple conversations.\n\nThe student in this level will have to go through three stages; A1, A2 & A3.'
              },
              {
                lvl: 'B',
                title: 'Level B - Intermediate',
                text:
                  'After this level the student will be able to communicate in daily situations, understand simple written materials, and express themselves with confidence.\n\nThe student in this level will have to go through three stages; B1, B2 & B3.'
              },
              {
                lvl: 'C',
                title: 'Level C - Advanced',
                text:
                  'After this level the student will be able to use Arabic confidently in academic, professional, and social settings; reaching full fluency and cultural connection.\n\nThe student in this level will have to go through three stages; C1, C2 & C3.'
              }
            ].map((card) => (
              <div key={card.lvl} className="relative bg-white rounded-[28px] border-2 border-[#0f5a56] p-8 shadow-sm">
                {/* Orange level pill */}
                <div className="absolute left-1/2 -top-6 -translate-x-1/2">
                  <div className="px-6 py-2 rounded-full bg-[#F2A33B] text-white text-sm font-semibold shadow-[0_3px_0_0_rgba(0,0,0,0.25)] border-2 border-[#0f5a56]/60">
                    {card.title}
                  </div>
                </div>

                <div className="pt-4 whitespace-pre-line text-sm leading-relaxed font-semibold text-[#0f5a56] text-center">
                  {card.text}
                </div>

                <div className="mt-8 flex justify-center">
                  <button className="px-5 py-2 rounded-full border-2 border-[#0f5a56] text-[#0f5a56] font-semibold hover:bg-[#0f5a56]/5 transition">
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <button onClick={() => { window.location.hash = '#/register/student'; }} className="mx-auto inline-flex items-center px-8 md:px-10 py-3 md:py-4 rounded-full border-2 border-[#F2A33B] text-[#0f5a56] font-semibold bg-white hover:bg-[#F2A33B]/10 transition">
              Take Proficiency Exam
            </button>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'instructor',
    label: 'Instructor',
    sectionClass: 'pt-0 pb-16 bg-white text-[#0f5a56]',
    render: () => (
      <div className="w-full">
        {(() => { try { return localStorage.getItem('recruitmentOpen') === 'true'; } catch { return false; } })() ? null : (
          <div className="sr-only" aria-hidden="true" />
        )}
        {/* Full-width gap bar between Courses and Instructor */}
        <div className="w-full h-6 bg-[#034141]" />
        {/* White spacer below the green bar to separate from the section */}
        <div className="w-full h-12 md:h-16 bg-white" />
        <div className="px-6 md:px-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left text */}
          <div className="text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">Your Knowledge, Their Light</h2>
            <p className="text-[#0f5a56]/90 md:text-lg italic font-semibold leading-relaxed mb-10 max-w-2xl">
              Teaching with Sconce is more than a job — it’s a chance to share your passion for Arabic, empower students in non-Arabic-speaking
              countries, and keep the language alive for future generations.
            </p>
            {(() => { try { return localStorage.getItem('recruitmentOpen') === 'true'; } catch { return false; } })() && (
              <button onClick={() => { window.location.hash = '#/register/instructor'; }} className="inline-flex items-center px-8 md:px-10 py-3 md:py-4 rounded-full bg-[#F2A33B] text-white font-semibold shadow-[0_6px_0_0_#0f5a56] hover:brightness-95 transition">
                Apply for instructor
              </button>
            )}
          </div>

          {/* Right illustration */}
          <div className="relative">
            {/* decorative bubbles top-left */}
            <div className="absolute -top-8 -left-6 w-20 h-20 rounded-full bg-[#F2A33B] border-4 border-[#0f5a56] z-10" />
            <div className="absolute -top-2 left-14 w-8 h-8 rounded-full bg-[#F2A33B] border-4 border-[#0f5a56] z-10" />

            {/* tilted frame */}
            <div className="relative rotate-2 bg-[#c8f2ed] rounded-[32px] border-[4px] border-[#0f5a56] shadow-[10px_10px_0_0_#0f5a56] p-4">
              <img
                alt="Online teaching"
                className="rounded-[24px] w-full h-[320px] object-cover"
                src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=1400&auto=format&fit=crop"
              />
            </div>

            {/* decorative bubbles bottom-right */}
            <div className="absolute -bottom-8 -right-2 w-16 h-16 rounded-full bg-[#F2A33B] border-4 border-[#0f5a56]" />
            <div className="absolute -bottom-2 right-16 w-5 h-5 rounded-full bg-[#F2A33B] border-4 border-[#0f5a56]" />
            <div className="absolute bottom-2 right-6 w-6 h-6 rounded-full bg-[#F2A33B] border-4 border-[#0f5a56]" />
          </div>
        </div>
        </div>
      </div>
    )
  },
  {
    id: 'contact',
    label: 'Contact',
    sectionClass: 'py-16 bg-[#034141]',
    render: () => (
      <div className="w-full min-h-screen px-6 md:px-10 py-16 md:py-20 flex items-center justify-center" id="contact">

        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left copy + socials */}
          <div className="text-left text-white flex flex-col justify-between h-full min-h-[560px]">
            <div>
              <h2 className="text-white text-3xl md:text-5xl font-display font-bold mb-8">Request Information</h2>
              <p className="text-white/90 md:text-base leading-relaxed max-w-xl">
                Want to know more about our Arabic courses? Fill out the form and our team will be happy to provide details
                about levels, schedules, and how to get started on your learning journey.
              </p>
            </div>
            <div className="mt-16">
              <div className="text-white/90 text-sm mb-3">Connect with us on social media:</div>
              <div className="flex items-center gap-6 text-white/90">
                <a aria-label="YouTube" href="#" className="hover:text-white"><Youtube /></a>
                <a aria-label="Instagram" href="#" className="hover:text-white"><Instagram /></a>
                <a aria-label="Facebook" href="#" className="hover:text-white"><Facebook /></a>
                <a aria-label="LinkedIn" href="#" className="hover:text-white"><Linkedin /></a>
              </div>
            </div>
          </div>

          {/* Right form card */}
          <div className="bg-white rounded-[24px] p-6 md:p-8 lg:p-10 shadow-sm text-[#0f5a56]">
            <form onSubmit={(e)=>{e.preventDefault();}} className="space-y-5">
              {/* I am a */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">I am a</label>
                <select defaultValue="" required className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2">
                  <option value="" disabled>Choose...</option>
                  <option>Student</option>
                  <option>Parent</option>
                  <option>Instructor</option>
                </select>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">First Name</label>
                  <input required className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Last Name</label>
                  <input required className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2" />
                </div>
              </div>

              {/* My student is */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">My student is</label>
                <select defaultValue="" required className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2">
                  <option value="" disabled>Choose...</option>
                  <option>Beginner (A)</option>
                  <option>Intermediate (B)</option>
                  <option>Advanced (C)</option>
                </select>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Country</label>
                <input className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2" />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email</label>
                <div className="flex items-center gap-2 border-b border-gray-300 focus-within:border-[#0f5a56] py-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <input type="email" required className="flex-1 bg-transparent outline-none" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
                <div className="flex items-center gap-2 border-b border-gray-300 focus-within:border-[#0f5a56] py-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <input className="flex-1 bg-transparent outline-none" />
                </div>
              </div>

              {/* Question */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Have a question?</label>
                <textarea rows={4} className="w-full resize-none rounded-md border border-gray-300 focus:border-[#0f5a56] outline-none p-3" placeholder="" />
              </div>

              {/* Hear about us */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">How did you hear about us?</label>
                <select defaultValue="" required className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2">
                  <option value="" disabled>Choose...</option>
                  <option>Search</option>
                  <option>Friend</option>
                  <option>Social Media</option>
                </select>
              </div>

              <div className="pt-2">
                <button type="submit" className="inline-flex items-center px-5 py-3 rounded-full bg-[#58ACA9] text-white font-semibold hover:brightness-95 transition">Get more information</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'footer',
    label: 'Footer',
    sectionClass: 'py-0 bg-white text-[#0f5a56] ',
    render: () => (
      <div className="w-full text-left">
        {/* Upper white area with link columns */}
        <div className="w-full max-w-7xl mx-auto px-8 md:px-10 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 text-sm">
            <div>
              <h3 className="font-semibold text-lg mb-4">Courses</h3>
              <ul className="space-y-3 text-[#0f5a56]/90">
                <li><a href="#" className="hover:underline">Level A</a></li>
                <li><a href="#" className="hover:underline">Level B</a></li>
                <li><a href="#" className="hover:underline">Level C</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Features</h3>
              <ul className="space-y-3 text-[#0f5a56]/90">
                <li><a href="#" className="hover:underline">Payment via proficiency exam</a></li>
                <li><a href="#" className="hover:underline">Parental oversight support</a></li>
                <li><a href="#" className="hover:underline">Integrated payment system</a></li>
                <li><a href="#" className="hover:underline">Program-Based course structure</a></li>
                <li><a href="#" className="hover:underline">Student communities</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Register</h3>
              <ul className="space-y-3 text-[#0f5a56]/90">
                <li><a href="#/register/student" className="hover:underline">Sign Up as Student</a></li>
                {(() => { try { return localStorage.getItem('recruitmentOpen') === 'true'; } catch { return false; } })() && (
                  <li><a href="#/register/instructor" className="hover:underline">Sign Up as Instructor</a></li>
                )}
                <li><a href="#/register/parent" className="hover:underline">Sign Up as Parent</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Enrollment</h3>
              <ul className="space-y-3 text-[#0f5a56]/90">
                <li><a href="#" className="hover:underline">What to Expect</a></li>
                <li><a href="#" className="hover:underline">Admissions & Requirements</a></li>
                <li><a href="#" className="hover:underline">Info Sessions</a></li>
                <li><a href="#" className="hover:underline">Pricing & Scholarships</a></li>
                <li><a href="#" className="hover:underline">Placement Exams</a></li>
                <li><a href="#" className="hover:underline">Manage Account</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Explore Sconce</h3>
              <ul className="space-y-3 text-[#0f5a56]/90">
                <li><a href="#" className="hover:underline">The Sconce Experience</a></li>
                <li><a href="#" className="hover:underline">News & Resources</a></li>
                <li><a href="#" className="hover:underline">Student Success</a></li>
                <li><a href="#" className="hover:underline">Staff</a></li>
                <li><a href="#" className="hover:underline">FAQs</a></li>
                <li><a href="#" className="hover:underline">Contact Us</a></li>
                <li><a href="#" className="hover:underline">Store</a></li>
              </ul>
            </div>
          </div>

          {/* bottom row inside white area */}
          <div className="mt-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/sconceLogo-removebg-preview.svg" alt="Sconce LMS" className="w-10 h-10" />
              <span className="text-xs tracking-wider">SCONCE LMS</span>
            </div>
            <div className="flex items-center gap-4">
              <a aria-label="YouTube" href="#" className="w-10 h-10 rounded-full bg-[#0f5a56] text-white flex items-center justify-center"><Youtube className="w-5 h-5"/></a>
              <a aria-label="Instagram" href="#" className="w-10 h-10 rounded-full bg-[#0f5a56] text-white flex items-center justify-center"><Instagram className="w-5 h-5"/></a>
              <a aria-label="Facebook" href="#" className="w-10 h-10 rounded-full bg-[#0f5a56] text-white flex items-center justify-center"><Facebook className="w-5 h-5"/></a>
              <a aria-label="LinkedIn" href="#" className="w-10 h-10 rounded-full bg-[#0f5a56] text-white flex items-center justify-center"><Linkedin className="w-5 h-5"/></a>
            </div>
          </div>
        </div>

        {/* Bottom dark teal bar */}
        <div className="w-full bg-[#034141] py-5">
          <div className="max-w-7xl mx-auto px-8 md:px-10">
            <ul className="flex flex-wrap gap-x-12 gap-y-2 text-white/90 text-xs">
              {['IP Policy','Privacy Policy','Terms of Use','Accessibility','Careers','Your Privacy Choices'].map(item => (
                <li key={item}><a href="#" className="hover:underline">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }
]);

// Single unified background gradient (#034242 -> white)
const unifiedBackground = 'linear-gradient(to bottom right, #034242 0%, #ffffff 100%)';

// Number of automatic slides to advance before pausing (can tweak)
const AUTO_SLIDE_LIMIT = 3; // initial auto run count
const AUTO_INTERVAL = 3000; // ms between automatic advances
const INACTIVITY_RESUME_MS = 30000; // resume auto after 15s idle

const FullPageSlider = ({ reducedMotion = false }) => {
  const slides = useRef(buildSlides());
  const [index, setIndex] = useState(0);
  const [autoMode, setAutoMode] = useState(true); // currently auto advancing?
  const autoCount = useRef(0);
  const autoTimer = useRef(null);
  const resumeTimer = useRef(null);
  const isAnimating = useRef(false);
  const lastInteraction = useRef(Date.now());
  
  // No gated scroll state needed when pinning the section; slides are static
  useEffect(() => {
    slides.current = buildSlides();
  }, []);

  const goTo = useCallback((n) => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setIndex(() => {
      const total = slides.current.length;
      return (n + total) % total;
    });
    setTimeout(() => { isAnimating.current = false; }, 750); // match transition duration
  }, []);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  // const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // No IntersectionObserver needed with pinned section

  // Body scroll lock
  useEffect(() => {
    // previously we disabled body scroll for slide-only UX; enable normal scrolling now
    return () => {};
  }, []);

  // Initial + active auto sliding logic
  useEffect(() => {
    if (reducedMotion || !autoMode) return;
    autoTimer.current && clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      autoCount.current += 1;
      if (autoCount.current >= AUTO_SLIDE_LIMIT) {
        setAutoMode(false); // stop auto after initial cycle; resume logic handled separately
        return;
      }
      next();
    }, AUTO_INTERVAL);
    return () => clearTimeout(autoTimer.current);
  }, [index, autoMode, reducedMotion, next]);

  // Resume auto after extended inactivity (only if reducedMotion not requested)
  useEffect(() => {
    if (reducedMotion) return;
    resumeTimer.current && clearTimeout(resumeTimer.current);
    const idleFor = Date.now() - lastInteraction.current;
    const remaining = INACTIVITY_RESUME_MS - idleFor;
    if (remaining <= 0) {
      // Already idle long enough: restart autoMode and reset counter so it cycles again
      autoCount.current = 0;
      setAutoMode(true);
      return;
    }
    resumeTimer.current = setTimeout(() => {
      autoCount.current = 0;
      setAutoMode(true);
    }, remaining);
    return () => clearTimeout(resumeTimer.current);
  }, [index, autoMode, reducedMotion]);

  // Navigation via keyboard/wheel/touch removed so page scrolls normally.

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-white font-body select-none" style={{ backgroundImage: unifiedBackground, backgroundColor: '#034242' }}
      onMouseMove={() => { lastInteraction.current = Date.now(); }}
      onKeyDown={() => { lastInteraction.current = Date.now(); }}
      onTouchStart={() => { lastInteraction.current = Date.now(); }}
    >
      
      {/* Unified background gradient. Auto mode runs first {AUTO_SLIDE_LIMIT} slides then waits for wheel/gesture. */}

      {/* Utility top bar */}
      <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-end px-6 text-[11px] tracking-wide bg-dark/50 backdrop-blur z-50 gap-4 text-white/70">
        <select className="bg-transparent focus:outline-none">
          <option>USD</option>
        </select>
        <select className="bg-transparent focus:outline-none">
          <option>English</option>
        </select>
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
        <ul className="hidden lg:flex items-center gap-8 text-sm font-medium">
          {['Courses','About Us','Pricing','Contact Us'].map(item => (
            <li key={item}><button onClick={()=>{ lastInteraction.current = Date.now(); setIndex(slides.current.findIndex(s=>s.id==='courses')); }} className="text-white/70 hover:text-white transition-colors">{item}</button></li>
          ))}
          <li><button onClick={()=>{ lastInteraction.current = Date.now(); setIndex(slides.current.findIndex(s=>s.id==='contact')); }} className="text-white/70 hover:text-white transition-colors">Contact</button></li>
        </ul>
        <div className="hidden md:flex items-center gap-4 text-xs">
          <button className="px-5 py-2 rounded-full bg-accent text-dark font-semibold tracking-wide transition-all duration-300 hover:bg-[#034242] hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#034242]/60 active:scale-95" onClick={()=>{ window.location.hash = '#/register'; }}>Register</button>
          <button className="text-white/70 hover:text-white tracking-wide" onClick={() => { window.location.hash = '#/login'; }}>Log In</button>
        </div>
      </div>

      {/* Slides container */}
      <main className="w-full">
        {slides.current.map((s) => (
          <section key={s.id} id={s.id} className={`${s.sectionClass ? s.sectionClass : 'min-h-screen py-16'} w-full flex items-center justify-center relative`}>
            <div className="w-full h-full flex items-center justify-center">
              {s.render()}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};

export default FullPageSlider;

// Footer column helper component
const FooterCol = ({ title, links, color }) => {
  const isTeal = color === 'teal';
  return (
    <div>
      <div className={`${isTeal ? 'text-[#034242]' : 'text-white/90'} font-semibold mb-3 tracking-wide`}>{title}</div>
      <ul className="space-y-2">
        {links.map(l => (
          <li key={l}>
            <a
              href="#"
              className={`${isTeal ? 'text-[#034242]/80 hover:text-[#034242]' : 'text-white/55 hover:text-white'} text-xs tracking-wide transition-colors`}
            >
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Inner hero slider component used only on the first slide

function InnerHeroSlider() {
  const [slide, setSlide] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    if (userInteracted) return; // stop automation after user interaction
    const t = setInterval(() => setSlide(s => (s + 1) % 2), 5000);
    return () => clearInterval(t);
  }, [userInteracted]);

  const bg1 = `url('${import.meta.env.BASE_URL}assets/backgroundSlide1.png')`;
  const bg2 = `url('${import.meta.env.BASE_URL}assets/backgroundSlide2.png')`;

  return (
  <div className="relative w-full overflow-hidden bg-white/5 border-t border-white/10 backdrop-blur shadow-lg" style={{ height: 'calc(100vh - 6rem)', marginTop: '6rem', boxSizing: 'border-box' }}>
      {/* sliding track */}
      <div className="relative w-full h-full overflow-hidden">
        <div className="flex h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${slide * 100}%)` }}>
          <div className="w-full flex-shrink-0 h-full bg-cover bg-center relative" style={{ backgroundImage: bg1 }}>
            {/* Contrast overlay for readability */}
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 p-10 md:p-16 flex items-center justify-center h-full">
              <div className="text-center text-white">
                <div className="text-7xl md:text-15xl lg:text-[6rem] font-display font-extrabold leading-tight mb-2">SCONCE</div>
                <div className="text-xl md:text-4xl font-semibold mb-4">Master Arabic, connect with your roots, and open new doors.</div>
                <p className="mb-6 max-w-2xl mx-auto text-sm md:text-base text-white/80">Interactive lessons designed for non-Arabic speaking countries.</p>
                <a href="#/register" className="inline-flex items-center rounded-full bg-accent text-dark font-semibold px-8 py-3 text-sm tracking-wide shadow-soft transition-all duration-300 hover:bg-[#034242] hover:text-white">Register</a>
              </div>
            </div>
          </div>
          <div className="w-full flex-shrink-0 h-full bg-cover bg-center relative" style={{ backgroundImage: bg2 }}>
            <div className="relative w-full h-full">
              {/* Contrast overlay for readability */}
              <div className="absolute inset-0 bg-black/30" />
              {/* Absolutely positioned content for precise placement */}
              <div className="absolute z-10 left-6 md:left-20 w-full md:w-1/2 text-left text-white" style={{ top: '11rem' }}>
                <h2 className="text-white text-4xl md:text-5xl font-display font-bold mb-4">About SCONCE</h2>
                <p className="text-white mb-4 text-lg md:text-lg">SCONE is an AI-powered learning platform built to revolutionize Arabic language education for the digital generation.</p>
                <p className="text-white mb-4 text-lg md:text-lg font-semibold">Arabic isn’t just a language; it’s a connection to land, family, and identity.</p>
                <p className="text-white mb-4 text-lg md:text-lg">SCONE offers comprehensive parental oversight dashboards, integrated multi-currency payment systems, and smart progress analytics.</p>
                <a href="#/register" className="inline-flex items-center rounded-full bg-accent text-dark font-semibold px-8 py-3 text-sm tracking-wide shadow-soft transition-all duration-300 hover:bg-[#034242] hover:text-white">Register Now</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* arrow controls (bottom center). clicking stops automation */}
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-6 flex gap-4">
        <button
          aria-label="Previous slide"
          onClick={() => { setSlide(s => (s - 1 + 2) % 2); setUserInteracted(true); }}
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white/90 shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
        <button
          aria-label="Next slide"
          onClick={() => { setSlide(s => (s + 1) % 2); setUserInteracted(true); }}
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white/90 shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
    </div>
  );
}
