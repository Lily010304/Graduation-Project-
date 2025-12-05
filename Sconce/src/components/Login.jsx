import { useEffect, useState } from 'react';
import '../index.css';
import { login } from '../lib/api';

const unifiedBackground = 'linear-gradient(to bottom right, #034242 0%, #ffffff 100%)';

export default function Login() {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // reset fields when role changes if needed
    setEmail('');
    setPassword('');
    setError('');
  }, [role]);

  useEffect(() => {
    const supported = ['instructor','student','parent','manager'];
    const applyRoleFromHash = () => {
      const hash = window.location.hash || '';
      // pattern: #/login?role=student
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const params = new URLSearchParams(hash.substring(qIndex + 1));
        const r = params.get('role');
        if (r && supported.includes(r)) setRole(r);
        return;
      }
      // fallback pattern: #/login/student
      const m = hash.match(/^#\/login\/(\w+)/);
      if (m && supported.includes(m[1])) setRole(m[1]);
    };
    applyRoleFromHash();
    window.addEventListener('hashchange', applyRoleFromHash);
    return () => window.removeEventListener('hashchange', applyRoleFromHash);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    // DEV MODE: Skip authentication for testing (remove in production!)
    if (email === 'dev@example.com' && password === 'dev') {
      console.log('🚀 DEV MODE: Bypassing authentication');
      localStorage.setItem('userRole', role);
      localStorage.setItem('authToken', 'dev-token-bypass');
      localStorage.setItem('userData', JSON.stringify({ 
        email: 'dev@sconce.com', 
        fullName: 'Dev User',
        role: role 
      }));
      
      // Redirect based on role
      if (role === 'manager') {
        window.location.hash = '#/manager';
      } else if (role === 'student') {
        window.location.hash = '#/dashboard/student';
      } else if (role === 'instructor') {
        window.location.hash = '#/dashboard/instructor';
      } else if (role === 'parent') {
        window.location.hash = '#/dashboard/parent';
      }
      return;
    }

    setIsLoading(true);

    try {
      // Call backend API
      const response = await login(email, password);
      
      // Success - API stores token in localStorage
      console.log('Login successful:', response);
      
      // Store role in localStorage for routing
      localStorage.setItem('userRole', role);
      
      // Redirect based on role
      if (role === 'manager') {
        window.location.hash = '#/manager';
      } else if (role === 'student') {
        window.location.hash = '#/dashboard/student';
      } else if (role === 'instructor') {
        window.location.hash = '#/dashboard/instructor';
      } else if (role === 'parent') {
        window.location.hash = '#/dashboard/parent';
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Parse error message from various formats
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.message) {
        if (typeof err.message === 'string') {
          errorMessage = err.message;
        } else if (err.message.message) {
          errorMessage = err.message.message;
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && err.error) {
        errorMessage = err.error;
      }
      
      // Check if it's an email verification error
      if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('confirm')) {
        errorMessage = 'Please verify your email address first. Check your inbox for the verification link.';
      } else if (errorMessage.toLowerCase().includes('not confirmed') || errorMessage.toLowerCase().includes('confirm')) {
        errorMessage = 'Please verify your email address first. Check your inbox for the verification link.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Login card */}
      <div className="pt-32 pb-16 px-6 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white text-[#0f5a56] rounded-3xl shadow-xl p-6 md:p-8 border border-white/20">
          <h1 className="text-2xl font-bold mb-6 text-center">Sign in</h1>

          {/* Role selector */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {(role === 'manager' ? ['manager'] : ['instructor','student','parent']).map((r) => (
              <button key={r} onClick={() => setRole(r)} className={`px-4 py-2 rounded-full text-sm font-semibold border ${role===r ? 'bg-[#58ACA9] text-white border-[#58ACA9]' : 'bg-white text-[#0f5a56] border-[#0f5a56]/30'} transition`}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {role === 'manager' || role === 'student' || role === 'instructor' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2" placeholder={role==='student' ? 'student@example.com' : role==='instructor' ? 'instructor@example.com' : 'manager@example.com'} required disabled={isLoading} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Password</label>
                <div className="flex items-center gap-2 border-b border-gray-300 focus-within:border-[#0f5a56] py-2">
                  <input type={showPwd? 'text':'password'} value={password} onChange={(e)=>setPassword(e.target.value)} className="flex-1 bg-transparent outline-none" required disabled={isLoading} />
                  <button type="button" className="text-xs text-[#0f5a56]/80" onClick={()=>setShowPwd(s=>!s)} disabled={isLoading}>{showPwd ? 'Hide' : 'Show'}</button>
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#58ACA9] text-white font-semibold hover:brightness-95 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : (role==='student' ? 'Log in as Student' : role==='instructor' ? 'Log in as Instructor' : 'Log in as Manager')}
                </button>
              </div>
              {role !== 'manager' && (() => { try { return localStorage.getItem('recruitmentOpen') === 'true' || role !== 'instructor'; } catch { return role !== 'instructor'; } })() && (
                 <div className="text-center text-xs text-[#0f5a56]/70 mt-3">
                   Don’t have an account?
                   <button type="button" onClick={()=> (window.location.hash = '#/register')} className="ml-2 underline hover:no-underline text-[#0f5a56]">Register</button>
                 </div>
               )}
            </form>
          ) : (
            <div className="text-center text-sm text-[#0f5a56]/80">
              <div className="space-y-3">
                <div>Don’t have an account?</div>
                <button onClick={()=> (window.location.hash = '#/register')} className="inline-flex items-center px-5 py-3 rounded-full bg-[#58ACA9] text-white font-semibold hover:brightness-95 transition">Register</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
