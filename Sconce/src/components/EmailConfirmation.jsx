import { useState, useEffect } from 'react';
import '../index.css';

const unifiedBackground = 'linear-gradient(to bottom right, #034242 0%, #ffffff 100%)';

export default function EmailConfirmation() {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      // Get token and userID from URL query params
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userID = urlParams.get('userID');

      if (!token || !userID) {
        setStatus('error');
        setMessage('Invalid confirmation link. Missing required parameters.');
        return;
      }

      try {
        const response = await fetch(
          `https://sconce.runasp.net/api/Identity/Account/ConfirmEmail?token=${encodeURIComponent(token)}&userID=${encodeURIComponent(userID)}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'text/plain',
            },
          }
        );

        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been successfully verified! You can now log in to your account.');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            window.location.hash = '#/login?role=student';
          }, 3000);
        } else {
          const errorText = await response.text();
          setStatus('error');
          setMessage(errorText || 'Email confirmation failed. The link may have expired or already been used.');
        }
      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage('Network error. Please check your connection and try again.');
      }
    };

    confirmEmail();
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-white flex items-center justify-center" style={{ backgroundImage: unifiedBackground, backgroundColor: '#034242' }}>
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

      {/* Confirmation card */}
      <div className="w-full max-w-md mx-6">
        <div className="bg-white text-[#0f5a56] rounded-3xl shadow-xl p-8 border border-white/20 text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#58ACA9] border-t-transparent rounded-full animate-spin"></div>
              <h1 className="text-2xl font-bold mb-2">Verifying Email...</h1>
              <p className="text-sm text-[#0f5a56]/80">Please wait while we confirm your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2 text-green-700">Email Verified!</h1>
              <p className="text-sm text-[#0f5a56]/80 mb-4">{message}</p>
              <p className="text-xs text-gray-500">Redirecting to login page...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2 text-red-700">Verification Failed</h1>
              <p className="text-sm text-red-600 mb-6">{message}</p>
              <button 
                onClick={() => (window.location.hash = '#/register/student')}
                className="px-6 py-2 rounded-full bg-[#58ACA9] text-white font-semibold hover:brightness-95 transition"
              >
                Back to Registration
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
